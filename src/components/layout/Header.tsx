"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Klanten",
  "/projects": "Projecten",
  "/resources": "Resources",
};

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check prefix match for nested routes
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title;
  }

  return "VEHA";
}

export function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="glass flex h-16 items-center justify-between border-b border-zinc-200 px-8 dark:border-zinc-800">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {pageTitle}
      </h1>
      <div className="relative">
        <NotificationBell />
        <NotificationCenter />
      </div>
    </header>
  );
}
