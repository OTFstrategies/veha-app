"use client";

import { useRouter } from "next/navigation";
import { ChevronUp, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface SidebarUserMenuProps {
  collapsed: boolean;
  userEmail: string | null;
}

function getUserInitials(email: string | null): string {
  if (!email) return "U";
  const username = email.split("@")[0];
  const parts = username.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

function getUserDisplayName(email: string | null): string {
  if (!email) return "Gebruiker";
  const username = email.split("@")[0];
  // Capitalize first letter of each part
  return username
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function SidebarUserMenu({ collapsed, userEmail }: SidebarUserMenuProps) {
  const router = useRouter();
  const initials = getUserInitials(userEmail);
  const displayName = getUserDisplayName(userEmail);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-3 py-2 h-auto",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? displayName : undefined}
        >
          <Avatar className="h-8 w-8 shrink-0">
            {/* AvatarImage verwijderd - geen user avatar URL beschikbaar */}
            <AvatarFallback className="bg-zinc-200 text-zinc-700 text-xs dark:bg-zinc-700 dark:text-zinc-200">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {displayName}
              </span>
              <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 mb-2 bottom-full top-auto"
      >
        <DropdownMenuItem
          onClick={() => router.push('/settings/profile')}
          aria-label="Ga naar profiel instellingen"
        >
          <User className="mr-2 h-4 w-4" />
          Profiel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          aria-label="Ga naar algemene instellingen"
        >
          <Settings className="mr-2 h-4 w-4" />
          Instellingen
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          aria-label="Uitloggen uit de applicatie"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Uitloggen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
