// Force dynamic rendering for all pages in the (app) segment
// This prevents pre-rendering which would fail without Supabase credentials
export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/AppShell";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
