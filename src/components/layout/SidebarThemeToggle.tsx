"use client";

import { useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";

interface SidebarThemeToggleProps {
  collapsed: boolean;
}

const themeConfig = {
  light: {
    icon: Sun,
    label: "Licht",
    next: "dark" as const,
  },
  dark: {
    icon: Moon,
    label: "Donker",
    next: "system" as const,
  },
  system: {
    icon: Monitor,
    label: "Systeem",
    next: "light" as const,
  },
};

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;

  // Persist theme preference to localStorage
  localStorage.setItem("veha-theme", theme);

  if (theme === "system") {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", systemPrefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

export function SidebarThemeToggle({ collapsed }: SidebarThemeToggleProps) {
  const { theme, setTheme } = useUIStore();
  const config = themeConfig[theme];
  const Icon = config.icon;

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  function handleToggle() {
    setTheme(config.next);
  }

  return (
    <Button
      variant="ghost"
      onClick={handleToggle}
      className={cn(
        "w-full justify-start gap-3 px-3 py-2 h-auto",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? config.label : undefined}
      aria-label={`Wissel naar ${themeConfig[config.next].label} thema`}
    >
      <Icon className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
      {!collapsed && (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {config.label}
        </span>
      )}
    </Button>
  );
}
