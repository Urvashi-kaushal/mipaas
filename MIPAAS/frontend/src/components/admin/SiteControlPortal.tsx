'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminListSettings, adminLogin, adminSetVisible, isUnauthorized, type AdminSetting } from '@/lib/siteSettings';

const TOKEN_KEY = 'mipaas_admin_token';
const ID_KEY = 'mipaas_admin_id';

type TabKey = 'sections' | 'pathways';

const TABS: { key: TabKey; label: string; heading: string; unit: string; group: string; icon: string }[] = [
  { key: 'sections', label: 'Page Sections', heading: 'Home Page Sections', unit: 'sections', group: 'Home page sections', icon: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5' },
  { key: 'pathways', label: 'Pathways', heading: 'Clinical Pathways', unit: 'pathways', group: 'Pathways', icon: 'M3 12h4l3-8 4 16 3-8h4' },
];

const TILES = [
  'from-blue-500 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-500 to-purple-600',
  'from-amber-400 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-cyan-400 to-sky-500',
];

const HOME_ICON = 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z';
const CONTROL_ICON = 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6';

function Icon({ d, className = 'h-5 w-5' }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-bold text-white">M</span>
      <span className="leading-tight">
        <span className="block text-lg font-bold text-white">MiPAAS</span>
        <span className="block text-[11px] text-slate-400">Admin Panel</span>
      </span>
    </span>
  );
}

export default function SiteControlPortal() {
  const [token, setToken] = useState<string | null>(null);
  const [adminId, setAdminId] = useState('');
  const [ready, setReady] = useState(false);

  const [idInput, setIdInput] = useState('');
  const [pwInput, setPwInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('sections');
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    setToken(sessionStorage.getItem(TOKEN_KEY));
    setAdminId(sessionStorage.getItem(ID_KEY) ?? '');
    setReady(true);
  }, []);

  const logout = useCallback((message = '') => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ID_KEY);
    setToken(null);
    setSettings([]);
    setPwInput('');
    setError(message);
  }, []);

  useEffect(() => {
    if (!token) return;
    adminListSettings(token)
      .then((r) => setSettings(r.settings))
      .catch((e) => (isUnauthorized(e) ? logout('Your session has ended. Please sign in again.') : setError((e as Error).message)));
  }, [token, logout]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await adminLogin(idInput.trim(), pwInput);
      sessionStorage.setItem(TOKEN_KEY, r.token);
      sessionStorage.setItem(ID_KEY, r.admin_id);
      setAdminId(r.admin_id);
      setToken(r.token);
      setPwInput('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(s: AdminSetting) {
    if (!token) return;
    setSavingKey(s.key);
    setError('');
    setSettings((prev) => prev.map((x) => (x.key === s.key ? { ...x, visible: !s.visible } : x)));
    try {
      await adminSetVisible(token, s.key, !s.visible);
    } catch (err) {
      setSettings((prev) => prev.map((x) => (x.key === s.key ? { ...x, visible: s.visible } : x)));
      if (isUnauthorized(err)) logout('Your session has ended. Please sign in again.');
      else setError((err as Error).message);
    } finally {
      setSavingKey(null);
    }
  }

  if (!ready) return <div className="min-h-screen bg-[#070D1A]" />;

  const field = 'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-sky-400 focus:outline-none';

  /* ----- sign-in ----- */
  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070D1A] px-4 text-white">
        <form onSubmit={signIn} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-[#0D1830] p-7 shadow-2xl">
          <Logo />
          <div>
            <h1 className="text-2xl font-bold">Admin sign-in</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to control what the MiPAAS website shows.</p>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-300">Admin ID</span>
            <input className={field} value={idInput} onChange={(e) => setIdInput(e.target.value)} autoComplete="username" autoFocus required />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-300">Password</span>
            <input className={field} type="password" value={pwInput} onChange={(e) => setPwInput(e.target.value)} autoComplete="current-password" required />
          </label>
          {error && (
            <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-60">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <Link href="/" className="block text-center text-sm text-slate-400 hover:text-white">Back to the website</Link>
        </form>
      </div>
    );
  }

  /* ----- admin panel ----- */
  const current = TABS.find((t) => t.key === tab) ?? TABS[0];
  const items = settings.filter((s) => s.group === current.group);

  return (
    <div className="min-h-screen bg-[#070D1A] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0A1224]/95 px-4 backdrop-blur sm:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium hover:bg-white/10">
            <Icon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" className="h-4 w-4" />
            <span className="hidden sm:inline">View Website</span>
          </Link>
          <div className="flex items-center gap-2 border-l border-white/10 pl-3 sm:pl-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-500 text-sm font-bold" aria-hidden="true">
              {adminId.charAt(0).toUpperCase() || 'A'}
            </span>
            <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:block">{adminId}</span>
          </div>
          <button onClick={() => logout()} className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20">
            <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Left sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-none flex-col border-r border-white/10 bg-[#0A1224] p-4 lg:flex">
          <nav aria-label="Admin" className="flex flex-col gap-1.5">
            <span aria-current="page" className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-3.5 py-3 text-sm font-semibold shadow-lg shadow-blue-900/40">
              <Icon d={HOME_ICON} />
              Site Control
            </span>
          </nav>
          <div className="mt-auto border-t border-white/10 pt-4">
            <Logo />
            <p className="mt-2 text-xs text-slate-500">Manage your site, your way.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
          {/* Page heading */}
          <div className="mb-6 flex flex-wrap items-start gap-4">
            <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-blue-600/20 text-blue-400">
              <Icon d={CONTROL_ICON} />
            </span>
            <div className="mr-auto min-w-0">
              <h1 className="text-3xl font-bold">Site Control</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-400">Manage what your website shows. Switch an item off to hide it from visitors.</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm">
              <span className="flex items-center gap-2 font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live Site
              </span>
              <span className="h-4 w-px bg-white/15" />
              <span className="text-slate-300">Changes are saved automatically</span>
            </div>
          </div>

          {/* Tabs */}
          <div role="tablist" className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-[#0A1224] p-1.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${tab === t.key ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
              >
                <Icon d={t.icon} className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          {/* List */}
          <div className="mb-4 flex items-center gap-3">
            <Icon d={current.icon} className="h-6 w-6 text-slate-300" />
            <h2 className="text-xl font-bold">{current.heading}</h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {items.length} {current.unit}
            </span>
          </div>

          {settings.length === 0 && !error && <p className="text-slate-400">Loading…</p>}
          {settings.length > 0 && items.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              Nothing here yet. Restart the backend so the new switches are created, then refresh this page.
            </p>
          )}

          <ul className="space-y-3">
            {items.map((s, i) => (
              <li key={s.key} className="rounded-2xl border border-white/10 bg-[#0D1830]">
                <div className="flex items-center gap-3 px-4 py-3.5 sm:gap-4">
                  <span className={`grid h-11 w-11 flex-none place-items-center rounded-xl bg-gradient-to-br text-white ${TILES[i % TILES.length]}`}>
                    <Icon d={current.icon} />
                  </span>
                  <div className="mr-auto min-w-0">
                    <div className="truncate font-semibold">{s.label}</div>
                    <div className="truncate text-xs text-slate-400">{s.description}</div>
                  </div>
                  <span className={`hidden w-14 text-sm sm:block ${s.visible ? 'text-slate-200' : 'text-slate-500'}`}>{s.visible ? 'Visible' : 'Hidden'}</span>
                  <button
                    role="switch"
                    aria-checked={s.visible}
                    aria-label={`${s.visible ? 'Hide' : 'Show'} ${s.label}`}
                    onClick={() => toggle(s)}
                    disabled={savingKey === s.key}
                    className={`relative h-7 w-12 flex-none rounded-full transition-colors disabled:opacity-60 ${s.visible ? 'bg-emerald-500' : 'bg-white/20'}`}
                  >
                    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all ${s.visible ? 'left-[1.375rem]' : 'left-0.5'}`} />
                  </button>
                  <span title="Position in the list" className="hidden h-9 w-9 flex-none place-items-center rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 sm:grid">
                    {i + 1}
                  </span>
                  <button
                    onClick={() => setOpenKey(openKey === s.key ? null : s.key)}
                    aria-expanded={openKey === s.key}
                    aria-label={`Details for ${s.label}`}
                    className="flex-none rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    <Icon d="M6 9l6 6 6-6" className={`h-5 w-5 transition-transform ${openKey === s.key ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {openKey === s.key && (
                  <div className="space-y-1 border-t border-white/10 px-5 py-3 text-sm text-slate-300">
                    <p>
                      Setting key: <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">{s.key}</code>
                    </p>
                    <p>{s.visible ? 'Visitors can see this item.' : 'This item is hidden from visitors.'}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}