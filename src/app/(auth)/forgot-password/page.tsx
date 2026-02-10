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

export default function ForgotPasswordPage() {
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

    if (!email) {
      setFormState({
        error: "Please enter your email address",
        success: null,
        isLoading: false,
      });
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setFormState({ error: error.message, success: null, isLoading: false });
      addToast({ type: "error", title: "Fout bij verzenden reset link" });
      return;
    }

    setFormState({
      error: null,
      success: "Check your email for a password reset link",
      isLoading: false,
    });
    addToast({ type: "success", title: "Wachtwoord reset link verzonden" });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Forgot password
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Enter your email and we&apos;ll send you a reset link
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
            className="rounded-xl bg-state-success-bg p-4 text-sm text-state-success-text"
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
          {formState.isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-zinc-500 dark:text-zinc-400">
        Remember your password?{" "}
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
