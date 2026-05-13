"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

const errorMessages: Record<string, string> = {
  auth_not_configured: "Supabase environment variables are missing.",
  callback_failed: "Google sign-in could not be completed. Try again.",
};

function getSafeNext(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/app";
  return next;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isConfigured } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nextPath = useMemo(() => getSafeNext(searchParams.get("next")), [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (user) router.replace(nextPath);
  }, [nextPath, router, user]);

  useEffect(() => {
    const errorKey = searchParams.get("error");
    setFormError(errorKey ? errorMessages[errorKey] ?? "Authentication failed." : null);
  }, [searchParams]);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setFormError("Supabase is not configured.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setFormError(error.message);
        return;
      }
      router.push(nextPath);
      router.refresh();
    });
  });

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField label="Email" htmlFor="login-email" error={errors.email?.message}>
          <Input id="login-email" type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="login-password" error={errors.password?.message}>
          <Input id="login-password" type="password" placeholder="Your password" autoComplete="current-password" {...register("password")} />
        </FormField>
        {formError ? <InlineMessage tone="error">{formError}</InlineMessage> : null}
        {!isConfigured ? <InlineMessage tone="warning">Supabase keys are not set yet.</InlineMessage> : null}
        <Button type="submit" className="w-full" size="lg" disabled={isPending || !isConfigured}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="h-px w-full bg-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-2xs uppercase tracking-wide text-text-muted">or</span>
        </div>
      </div>

      <GoogleAuthButton nextPath={nextPath} label="Continue with Google" />

      <p className="pt-2 text-center text-sm text-text-secondary">
        New here?{" "}
        <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-primary-700 hover:text-primary-600">
          Create an account
        </Link>
      </p>
    </div>
  );
}
