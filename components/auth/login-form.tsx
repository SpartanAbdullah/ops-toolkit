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
import { Input } from "@/components/ui/input";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

const errorMessages: Record<string, string> = {
  auth_not_configured: "Supabase environment variables are missing. Add them before using the private app.",
  callback_failed: "The Google login callback could not be completed. Please try again.",
};

function getSafeNext(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/app";
  }

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
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      router.replace(nextPath);
    }
  }, [nextPath, router, user]);

  useEffect(() => {
    const errorKey = searchParams.get("error");
    setFormError(errorKey ? errorMessages[errorKey] ?? "Authentication could not be completed." : null);
  }, [searchParams]);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setFormError("Supabase is not configured yet. Add your project keys to enable login.");
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
    <div className="space-y-5">
      <form className="space-y-5" onSubmit={onSubmit}>
        <FormField label="Work email" htmlFor="login-email" error={errors.email?.message}>
          <Input id="login-email" type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="login-password" hint="Use the password tied to your Supabase account." error={errors.password?.message}>
          <Input id="login-password" type="password" placeholder="Enter your password" autoComplete="current-password" {...register("password")} />
        </FormField>
        {formError ? <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
        {!isConfigured ? <div className="rounded-[1.2rem] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">Add your Supabase URL and anon key to enable real login and Google auth.</div> : null}
        <Button type="submit" className="w-full" size="lg" disabled={isPending || !isConfigured}>
          {isPending ? "Logging in" : "Log in"}
        </Button>
      </form>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="h-px w-full bg-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="rounded-full bg-white px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">or</span>
        </div>
      </div>
      <GoogleAuthButton nextPath={nextPath} label="Continue with Google" />
      <p className="text-sm text-slate-500">
        Need an account?{" "}
        <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-slate-900 hover:text-sky-700">
          Create one
        </Link>
      </p>
    </div>
  );
}