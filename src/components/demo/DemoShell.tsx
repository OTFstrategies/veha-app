"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { DemoHeader } from "./DemoHeader";
import { DemoBanner } from "./DemoBanner";
import { GuidedTour } from "./GuidedTour";
import { ToastProvider } from "@/components/ui/toast";

const TOUR_SHOWN_KEY = "veha-demo-tour-shown";

interface DemoShellProps {
  children: React.ReactNode;
}

export function DemoShell({ children }: DemoShellProps) {
  const [showTour, setShowTour] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    // Only auto-start on /demo/portal (not on landing page)
    // Only once per browser session (sessionStorage resets when tab closes)
    if (pathname !== "/demo/portal") return;
    if (sessionStorage.getItem(TOUR_SHOWN_KEY)) return;

    const timer = setTimeout(() => {
      setShowTour(true);
      sessionStorage.setItem(TOUR_SHOWN_KEY, "1");
    }, 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  function handleStartTour() {
    setShowTour(true);
  }

  function handleEndTour() {
    setShowTour(false);
  }

  return (
    <ToastProvider>
      <div className="relative flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
        {/* Background mesh for glassmorphism depth */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-zinc-300/40 blur-[120px] dark:bg-zinc-700/20" />
          <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-zinc-200/50 blur-[100px] dark:bg-zinc-800/20" />
          <div className="absolute -bottom-32 left-1/3 h-[450px] w-[450px] rounded-full bg-zinc-300/30 blur-[120px] dark:bg-zinc-700/15" />
        </div>
        <DemoBanner />
        <DemoHeader onStartTour={handleStartTour} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
            {children}
          </div>
        </main>
        <footer className="border-t border-zinc-200 glass-strong px-3 py-3 sm:px-4 sm:py-4">
          <div className="mx-auto max-w-6xl text-center text-xs text-muted-foreground">
            <p>VEHA Klantportaal - Demo omgeving</p>
          </div>
        </footer>
        {showTour && <GuidedTour onClose={handleEndTour} />}
      </div>
    </ToastProvider>
  );
}
