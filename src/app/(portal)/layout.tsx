// Force dynamic rendering for all pages in the (portal) segment
// This prevents pre-rendering which would fail without Supabase credentials
export const dynamic = "force-dynamic";

import { PortalShell } from "@/components/portal/PortalShell";

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return <PortalShell>{children}</PortalShell>;
}
