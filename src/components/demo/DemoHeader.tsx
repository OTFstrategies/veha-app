"use client";

import * as React from "react";
import Link from "next/link";
import { Moon, Sun, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DemoHeaderProps {
  onStartTour?: () => void;
}

export function DemoHeader({ onStartTour }: DemoHeaderProps) {
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

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 glass-strong px-3 sm:h-16 sm:px-4 md:px-6">
      {/* Logo and Title */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <Link href="/demo/portal" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="text-lg font-bold text-zinc-900 sm:text-xl dark:text-zinc-50">
            VEHA
          </span>
          <span className="hidden text-sm text-zinc-500 sm:block dark:text-zinc-400">
            Klantportaal
          </span>
        </Link>
        <span className="hidden text-zinc-300 md:block dark:text-zinc-600">|</span>
        <span className="hidden max-w-[200px] truncate text-sm font-medium text-zinc-700 md:block dark:text-zinc-300">
          CSU
        </span>
        <Badge variant="secondary" className="ml-1 text-xs font-semibold">
          DEMO
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {onStartTour && (
          <Button
            variant="outline"
            size="sm"
            onClick={onStartTour}
            className="hidden gap-1.5 sm:inline-flex"
            data-tour="start-tour"
          >
            <Play className="h-3.5 w-3.5" />
            Rondleiding
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Lichte modus" : "Donkere modus"}
          className="h-9 w-9"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-zinc-200 text-sm text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
            MJ
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
