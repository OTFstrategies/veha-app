"use client";

import * as React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            VEHA
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Project planning and resource management
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          {children}
        </div>
      </div>
    </div>
  );
}
