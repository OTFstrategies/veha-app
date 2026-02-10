"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Boxes,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { SidebarUserMenu } from "./SidebarUserMenu";
import { SidebarThemeToggle } from "./SidebarThemeToggle";
import { useUIStore } from "@/stores/ui-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Resources", href: "/resources", icon: Boxes },
];

interface SidebarProps {
  userEmail: string | null;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    sidebarHovered,
    sidebarPinned,
    setSidebarHovered,
    toggleSidebarPinned,
  } = useUIStore();

  // Determine if sidebar should be expanded
  // Expanded when: pinned OR (not collapsed) OR (collapsed but hovered)
  const isExpanded = sidebarPinned || !sidebarCollapsed || (sidebarCollapsed && sidebarHovered);

  function handleMouseEnter() {
    if (sidebarCollapsed && !sidebarPinned) {
      setSidebarHovered(true);
    }
  }

  function handleMouseLeave() {
    if (sidebarCollapsed && !sidebarPinned) {
      setSidebarHovered(false);
    }
  }

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "glass-strong flex h-full flex-col border-r border-zinc-200 transition-all duration-300 ease-in-out dark:border-zinc-800",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Header with logo and pin button */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-zinc-200 px-4 dark:border-zinc-800",
          isExpanded ? "justify-between" : "justify-center"
        )}
      >
        {isExpanded && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              VEHA
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarPinned}
          className="h-8 w-8 shrink-0"
          aria-label={sidebarPinned ? "Sidebar losmaken" : "Sidebar vastzetten"}
          title={sidebarPinned ? "Sidebar losmaken" : "Sidebar vastzetten"}
        >
          {sidebarPinned ? (
            <PinOff className="h-4 w-4" />
          ) : (
            <Pin className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Workspace selector */}
      <div className="border-b border-zinc-200 py-2 dark:border-zinc-800">
        <WorkspaceSelector collapsed={!isExpanded} />
      </div>

      {/* Navigation */}
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
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                !isExpanded && "justify-center px-2"
              )}
              title={!isExpanded ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 rounded-md bg-zinc-100 dark:bg-zinc-800"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" />
                {isExpanded && <span>{item.label}</span>}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer section */}
      <div className="border-t border-zinc-200 p-2 space-y-1 dark:border-zinc-800">
        {/* Theme toggle */}
        <SidebarThemeToggle collapsed={!isExpanded} />

        {/* User menu */}
        <SidebarUserMenu collapsed={!isExpanded} userEmail={userEmail} />

        {/* Version info - only visible when expanded */}
        {isExpanded && (
          <p className="rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" aria-label="Applicatie versie">
            VEHA Dashboard v1.0
          </p>
        )}
      </div>
    </aside>
  );
}
