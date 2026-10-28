'use client';

import type { ReactNode } from 'react';
import { useSiteFlags } from '@/lib/siteSettings';

/** Shows its children unless the admin has switched this item off in the admin portal. */
export default function Show({ flag, children }: { flag: string; children: ReactNode }) {
  const flags = useSiteFlags();
  if (flags === undefined || flags[flag] === false) return null;
  return <>{children}</>;
}