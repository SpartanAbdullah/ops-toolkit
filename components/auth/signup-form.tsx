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
import { signupSchema, type SignupValues } from "@/lib/validation/auth";

function getSafeNext(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/app";
  }

  return next;
}

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isConfigured } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nextPath = useMemo(() => getSafeNext(searchParams.get("next")), [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      router.replace(nextPath);
    }
  }, [nextPath, router, user]);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setFormError("Supabase is not configured yet. Add your project keys to enable sign up.");
        return;
      }

      setFormError(null);
      setSuccessMessage(null);

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data.session) {
        router.push(nextPath);
        router.refresh();
        return;
      }

      setSuccessMessage("Account created. Check your email to confirm the address before opening the app.");
    });
  });

  return (
    <div className="space-y-5">
      <form className="space-y-5" onSubmit={onSubmit}>
        <FormField label="Your name" htmlFor="signup-name" error={errors.fullName?.message}>
          <Input id="signup-name" type="text" placeholder="Aisha Khan" autoComplete="name" {...register("fullName")} />
        </FormField>
        <FormField label="Work email" htmlFor="signup-email" error={errors.email?.message}>
          <Input id="signup-email" type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Password" htmlFor="signup-password" error={errors.password?.message}>
            <Input id="signup-password" type="password" placeholder="At least 8 characters" autoComplete="new-password" {...register("password")} />
          </FormField>
          <FormField label="Confirm password" htmlFor="signup-confirm-password" error={errors.confirmPassword?.message}>
            <Input id="signup-confirm-password" type="password" placeholder="Repeat your password" autoComplete="new-password" {...register("confirmPassword")} />
          </FormField>
        </div>
        {formError ? <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
        {successMessage ? <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
        {!isConfigured ? <div className="rounded-[1.2rem] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">Add your Supabase URL and anon key to enable account creation and Google auth.</div> : null}
        <Button type="submit" className="w-full" size="lg" disabled={isPending || !isConfigured}>
          {isPending ? "Creating account" : "Create account"}
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
      <GoogleAuthButton nextPath={nextPath} label="Sign up with Google" />
      <p className="text-sm text-slate-500">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-slate-900 hover:text-sky-700">
          Log in
        </Link>
      </p>
    </div>
  );
}