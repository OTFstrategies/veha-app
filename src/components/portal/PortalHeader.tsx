"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

// =============================================================================
// Types
// =============================================================================

interface PortalHeaderProps {
  userEmail?: string | null;
  userName?: string | null;
  clientName?: string | null;
  userRole?: "klant_editor" | "klant_viewer" | null;
}

// =============================================================================
// Component
// =============================================================================

export function PortalHeader({ userEmail, userName, clientName, userRole }: PortalHeaderProps) {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  function toggleDarkMode() {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = userName ?? userEmail ?? "Klant";
  const userInitials = displayName
    .split(/[\s@.]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  const isViewer = userRole === "klant_viewer";

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-3 sm:h-16 sm:px-4 md:px-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Logo and Title */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <Link href="/portal" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="text-lg font-bold text-zinc-900 sm:text-xl dark:text-zinc-50">
            VEHA
          </span>
          <span className="hidden text-sm text-zinc-500 sm:block dark:text-zinc-400">
            Klantportaal
          </span>
        </Link>
        {clientName && (
          <>
            <span className="hidden text-zinc-300 md:block dark:text-zinc-600">|</span>
            <span className="hidden max-w-[200px] truncate text-sm font-medium text-zinc-700 md:block dark:text-zinc-300">
              {clientName}
            </span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Lichte modus" : "Donkere modus"}
          className="h-9 w-9"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
              aria-label="Gebruikersmenu"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-zinc-200 text-sm text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium leading-none">{displayName}</p>
                  {isViewer && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      <Eye className="h-2.5 w-2.5" />
                      Viewer
                    </span>
                  )}
                </div>
                {userEmail && userName && (
                  <p className="truncate text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              Profiel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Uitloggen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
