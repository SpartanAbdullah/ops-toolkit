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
import { signupSchema, type SignupValues } from "@/lib/validation/auth";

function getSafeNext(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/app";
  return next;
}

export function SignupForm({ publicSignupEnabled }: { publicSignupEnabled: boolean }) {
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
      acceptedTerms: false,
    },
  });

  useEffect(() => {
    if (user) router.replace(nextPath);
  }, [nextPath, router, user]);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setFormError("Supabase is not configured.");
        return;
      }
      if (!publicSignupEnabled) {
        setFormError("Public signup is disabled. Ask an owner or admin for access.");
        return;
      }
      setFormError(null);
      setSuccessMessage(null);

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          data: { full_name: values.fullName },
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
      setSuccessMessage("Account created. Check your email to confirm.");
    });
  });

  return (
    <div className="space-y-4">
      {!publicSignupEnabled ? (
        <InlineMessage tone="warning">
          Public signup is disabled for production. Ask an owner or admin to create access through the approved onboarding process.
        </InlineMessage>
      ) : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField label="Your name" htmlFor="signup-name" error={errors.fullName?.message}>
          <Input id="signup-name" type="text" placeholder="Aisha Khan" autoComplete="name" {...register("fullName")} />
        </FormField>
        <FormField label="Email" htmlFor="signup-email" error={errors.email?.message}>
          <Input id="signup-email" type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="signup-password" error={errors.password?.message}>
          <Input id="signup-password" type="password" placeholder="At least 8 characters" autoComplete="new-password" {...register("password")} />
        </FormField>
        <FormField label="Confirm password" htmlFor="signup-confirm" error={errors.confirmPassword?.message}>
          <Input id="signup-confirm" type="password" placeholder="Repeat password" autoComplete="new-password" {...register("confirmPassword")} />
        </FormField>

        <div className="space-y-1.5">
          <label htmlFor="signup-terms" className="flex items-start gap-2.5 text-sm leading-5 text-text-secondary">
            <input
              id="signup-terms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary-600 focus-visible:outline-none focus-visible:shadow-focus"
              {...register("acceptedTerms")}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-primary-700 underline-offset-2 hover:underline">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-primary-700 underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.acceptedTerms?.message ? (
            <p className="text-2xs leading-4 text-danger-600">{errors.acceptedTerms.message}</p>
          ) : null}
        </div>

        {formError ? <InlineMessage tone="error">{formError}</InlineMessage> : null}
        {successMessage ? <InlineMessage tone="success">{successMessage}</InlineMessage> : null}
        {!isConfigured ? <InlineMessage tone="warning">Supabase keys are not set yet.</InlineMessage> : null}
        <Button type="submit" className="w-full" size="lg" disabled={isPending || !isConfigured || !publicSignupEnabled}>
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      {publicSignupEnabled ? (
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="h-px w-full bg-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-2xs uppercase tracking-wide text-text-muted">or</span>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {publicSignupEnabled ? (
          <>
            <GoogleAuthButton nextPath={nextPath} label="Sign up with Google" />
            <p className="px-1 text-2xs leading-4 text-text-muted">
              By continuing with Google you also agree to the{" "}
              <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-text-primary">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-text-primary">Privacy Policy</Link>.
            </p>
          </>
        ) : null}
      </div>

      <p className="pt-2 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-primary-700 hover:text-primary-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
