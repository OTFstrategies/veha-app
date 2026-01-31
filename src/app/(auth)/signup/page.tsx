"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface FormState {
  error: string | null;
  success: string | null;
  isLoading: boolean;
}

export default function SignupPage() {
  const router = useRouter();
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
      return;
    }

    setFormState({
      error: null,
      success: "Check your email for a confirmation link",
      isLoading: false,
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Create an account
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Enter your details to get started
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            required
            disabled={formState.isLoading}
          />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Must be at least 8 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
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
          {formState.isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="text-center text-sm text-stone-600 dark:text-stone-400">
        Already have an account?{" "}
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
