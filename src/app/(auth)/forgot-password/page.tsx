"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Forgot password
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            required
            disabled={formState.isLoading}
          />
        </div>

        {formState.error && (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
            role="alert"
          >
            {formState.error}
          </div>
        )}

        {formState.success && (
          <div
            className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
            role="alert"
          >
            {formState.success}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <div className="text-center text-sm text-stone-600 dark:text-stone-400">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-stone-900 hover:underline dark:text-stone-50"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
