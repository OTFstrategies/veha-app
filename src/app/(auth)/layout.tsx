"use client";

import * as React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-[420px]">
        {/* Logo & Tagline */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            VEHA
          </h1>
          <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
            Project planning and resource management
          </p>
        </div>

        {/* Card - shadow instead of border, more padding, larger radius */}
        <div className="rounded-2xl bg-white p-10 shadow-xl shadow-zinc-200/50 dark:bg-zinc-900 dark:shadow-zinc-950/50">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-zinc-400">
          &copy; {new Date().getFullYear()} VEHA. All rights reserved.
        </p>
      </div>
    </div>
  );
}
