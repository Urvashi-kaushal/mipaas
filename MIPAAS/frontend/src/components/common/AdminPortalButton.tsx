'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// false: everyone sees the button (the portal still asks for the admin ID and password).
// true: the button only appears while an admin is signed in.
const ONLY_WHEN_SIGNED_IN = false;

const DEFAULT_STYLE =
  'px-3.5 py-1.5 rounded-xl border border-white/25 text-xs font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap';

export default function AdminPortalButton({ className = DEFAULT_STYLE }: { className?: string }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const check = () => setSignedIn(Boolean(sessionStorage.getItem('mipaas_admin_token')));
    check();
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, []);

  if (ONLY_WHEN_SIGNED_IN && !signedIn) return null;

  return (
    <Link href="/admin/portal" className={className} title="Open the admin portal">
      Admin Portal
    </Link>
  );
}