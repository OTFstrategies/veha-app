"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

interface FormState {
  error: string | null;
  success: string | null;
  isLoading: boolean;
}

export default function SignupPage() {
  const { addToast } = useToast();
  const [formState, setFormState] = React.useState<FormState>({
    error: null,
    success: null,
    isLoading: false,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState({ error: null, success: null, isLoading: true });

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email || !password || !confirmPassword) {
      setFormState({
        error: "Please fill in all fields",
        success: null,
        isLoading: false,
      });
      return;
    }

    if (password !== confirmPassword) {
      setFormState({
        error: "Passwords do not match",
        success: null,
        isLoading: false,
      });
      return;
    }

    if (password.length < 8) {
      setFormState({
        error: "Password must be at least 8 characters",
        success: null,
        isLoading: false,
      });
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setFormState({ error: error.message, success: null, isLoading: false });
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        addToast({ type: "error", title: "Dit emailadres is al in gebruik" });
      } else {
        addToast({ type: "error", title: "Fout bij registreren" });
      }
      return;
    }

    setFormState({
      error: null,
      success: "Check your email for a confirmation link",
      isLoading: false,
    });
    addToast({ type: "success", title: "Account aangemaakt! Controleer je email." });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create an account
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Enter your details to get started
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={formState.isLoading}
              className="h-12 w-full rounded-xl border-0 bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-50"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
              disabled={formState.isLoading}
              className="h-12 w-full rounded-xl border-0 bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-50"
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
              disabled={formState.isLoading}
              className="h-12 w-full rounded-xl border-0 bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-50"
            />
          </div>
        </div>

        {/* Error Message */}
        {formState.error && (
          <div
            className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400"
            role="alert"
          >
            {formState.error}
          </div>
        )}

        {/* Success Message */}
        {formState.success && (
          <div
            className="rounded-xl bg-green-50 p-4 text-sm text-green-600 dark:bg-green-950/50 dark:text-green-400"
            role="alert"
          >
            {formState.success}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-zinc-900 text-base font-medium text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
