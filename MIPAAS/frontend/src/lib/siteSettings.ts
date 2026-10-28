'use client';

import { useEffect, useState } from 'react';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const BASE = `${API_URL}/api/v1`;

export type SiteFlags = Record<string, boolean>;
export type AdminSetting = { key: string; label: string; description: string; group: string; visible: boolean };

/* ---------- live switches (used by the website) ---------- */

const POLL_MS = 4000; // how often the website checks for changes made in the admin portal

let flags: SiteFlags | undefined; // undefined until the first answer arrives
const listeners = new Set<(f: SiteFlags) => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let channel: BroadcastChannel | null = null;
let inFlight: Promise<SiteFlags | undefined> | null = null;

async function fetchFlags(): Promise<SiteFlags | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`${BASE}/site/settings`, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(t);
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data?.settings ?? null) as SiteFlags | null;
  } catch {
    return null;
  }
}

function publish(next: SiteFlags) {
  if (flags && JSON.stringify(flags) === JSON.stringify(next)) return; // nothing changed
  flags = next;
  listeners.forEach((fn) => fn(next));
}

/** Asks the backend for the latest switches. Keeps the last known answer if the backend can't be reached. */
export function loadSiteFlags(): Promise<SiteFlags | undefined> {
  if (!inFlight) {
    inFlight = fetchFlags()
      .then((f) => {
        if (f) publish(f);
        else if (flags === undefined) publish({}); // backend down on first load: show everything
        return flags;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

function onWake() {
  if (document.visibilityState === 'visible') loadSiteFlags();
}

function start() {
  if (timer) return;
  loadSiteFlags();
  timer = setInterval(onWake, POLL_MS);
  document.addEventListener('visibilitychange', onWake);
  window.addEventListener('focus', onWake);
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel('mipaas-site-flags');
    channel.onmessage = () => {
      loadSiteFlags();
    };
  }
}

function stop() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  document.removeEventListener('visibilitychange', onWake);
  window.removeEventListener('focus', onWake);
  channel?.close();
  channel = null;
}

/** undefined while loading. If the backend is unreachable this returns {} so everything stays visible. */
export function useSiteFlags(): SiteFlags | undefined {
  const [value, setValue] = useState<SiteFlags | undefined>(flags);
  useEffect(() => {
    listeners.add(setValue);
    setValue(flags);
    start();
    return () => {
      listeners.delete(setValue);
      if (listeners.size === 0) stop();
    };
  }, []);
  return value;
}

function announceChange() {
  try {
    const c = new BroadcastChannel('mipaas-site-flags');
    c.postMessage('changed');
    c.close();
  } catch {
    /* not supported: the 4 second check will pick the change up */
  }
}

/* ---------- admin calls (used by the admin portal) ---------- */

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export const isUnauthorized = (e: unknown) => e instanceof ApiError && e.status === 401;

async function call<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
  } catch {
    throw new ApiError('Cannot reach the MiPAAS backend. Check that it is running.', 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json?.error ?? `Request failed (${res.status}).`, res.status);
  return json.data as T;
}

export const adminLogin = (admin_id: string, password: string) =>
  call<{ token: string; admin_id: string; expires_in: number }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ admin_id, password }),
  });

export const adminListSettings = (token: string) => call<{ settings: AdminSetting[] }>('/admin/settings', {}, token);

export async function adminSetVisible(token: string, key: string, visible: boolean) {
  const result = await call<{ setting: AdminSetting }>(
    `/admin/settings/${key}`,
    { method: 'PUT', body: JSON.stringify({ visible }) },
    token
  );
  await loadSiteFlags(); // refresh right away
  announceChange(); // tell other tabs of this browser straight away
  return result;
}

/* ---------- pathway switches (used by the navbar and the Pathways section) ---------- */

/** "lung-cancer" becomes "pathway_lung_cancer" */
export const pathwayFlagKey = (serviceId: string) => `pathway_${serviceId.replace(/-/g, '_')}`;

/** A pathway is shown unless the admin switched it off. While loading, or if the backend is down, it stays visible. */
export const isPathwayVisible = (flags: SiteFlags | undefined, serviceId: string) =>
  flags?.[pathwayFlagKey(serviceId)] !== false;