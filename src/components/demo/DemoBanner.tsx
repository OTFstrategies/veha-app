"use client";

import { X } from "lucide-react";
import * as React from "react";

export function DemoBanner() {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-3 bg-zinc-900 px-4 py-2.5 text-sm text-white dark:bg-zinc-50 dark:text-zinc-900">
      <span>
        U bekijkt een <strong>demo</strong> van het VEHA Klantportaal
      </span>
      <span className="hidden sm:inline text-zinc-400 dark:text-zinc-500">|</span>
      <a
        href="mailto:info@veha.nl"
        className="hidden sm:inline font-medium underline underline-offset-2 hover:no-underline"
      >
        Contact opnemen
      </a>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-white/10 dark:hover:bg-black/10"
        aria-label="Sluiten"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
