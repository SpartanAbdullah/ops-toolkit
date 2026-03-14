"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { emailUpdateSchema, type EmailUpdateValues } from "@/lib/validation/auth";

export function EmailSettingsForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const { isConfigured } = useAuth();
  const [formMessage, setFormMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EmailUpdateValues>({
    resolver: zodResolver(emailUpdateSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormMessage(null);
    startTransition(async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setFormMessage({
          tone: "error",
          text: "Supabase is not configured yet. Add your project keys before changing email settings.",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        email: values.email,
      });

      if (error) {
        setFormMessage({
          tone: "error",
          text: error.message,
        });
        return;
      }

      setFormMessage({
        tone: "success",
        text: "Email update requested. Supabase may require confirmation on the new address before the change is applied.",
      });
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <FormField label="Email" htmlFor="settings-email" hint="This updates the Supabase Auth email for the current account." error={errors.email?.message}>
        <Input id="settings-email" type="email" placeholder="you@company.com" {...register("email")} />
      </FormField>
      {formMessage ? (
        <div className={formMessage.tone === "success" ? "rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700" : "rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700"}>
          {formMessage.text}
        </div>
      ) : null}
      {!isConfigured ? <div className="rounded-[1.2rem] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">Add your Supabase project keys before using account email updates.</div> : null}
      <Button type="submit" disabled={isPending || !isConfigured || !isDirty}>
        {isPending ? "Updating" : "Request email change"}
      </Button>
    </form>
  );
}