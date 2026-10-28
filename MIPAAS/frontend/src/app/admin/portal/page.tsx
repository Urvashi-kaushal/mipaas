import type { Metadata } from 'next';
import SiteControlPortal from '@/components/admin/SiteControlPortal';

export const metadata: Metadata = { title: 'Admin portal | MiPAAS' };

export default function AdminPortalPage() {
  return <SiteControlPortal />;
}