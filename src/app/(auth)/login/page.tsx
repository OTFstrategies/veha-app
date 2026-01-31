"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

interface FormState {
  error: string | null;
  isLoading: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [formState, setFormState] = React.useState<FormState>({
    error: null,
    isLoading: false,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState({ error: null, isLoading: true });

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setFormState({ error: "Please fill in all fields", isLoading: false });
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setFormState({ error: error.message, isLoading: false });
      if (error.message.includes("Invalid login credentials")) {
        addToast({ type: "error", title: "Ongeldige inloggegevens" });
      } else {
        addToast({ type: "error", title: "Fout bij inloggen" });
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Sign in
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Enter your credentials to access your account
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
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

        <Button
          type="submit"
          className="w-full"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-center text-sm text-stone-600 dark:text-stone-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-stone-900 hover:underline dark:text-stone-50"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
