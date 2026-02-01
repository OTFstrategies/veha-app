"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  UserCog,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "./WorkspaceSelector";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Employees", href: "/employees", icon: UserCog },
  { label: "Weekplanning", href: "/weekplanning", icon: CalendarDays },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-zinc-200 px-4 dark:border-zinc-800",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              VEHA
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="border-b border-zinc-200 py-2 dark:border-zinc-800">
        <WorkspaceSelector collapsed={collapsed} />
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-blue-600 dark:bg-zinc-800 dark:text-blue-400"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
        <div
          className={cn(
            "rounded-md bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
            collapsed && "px-2 py-2 text-center"
          )}
        >
          {collapsed ? "v1" : "VEHA Dashboard v1.0"}
        </div>
      </div>
    </aside>
  );
}
