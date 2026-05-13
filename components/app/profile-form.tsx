"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { updateProfileAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { profileSchema, type ProfileValues } from "@/lib/validation/profile";

export function ProfileForm({ defaultValues }: { defaultValues: ProfileValues }) {
  const [formMessage, setFormMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit((values) => {
    setFormMessage(null);
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            if (message) setError(field as keyof ProfileValues, { message });
          });
        }
        setFormMessage({ tone: "error", text: result.message });
        return;
      }
      setFormMessage({ tone: "success", text: result.message });
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormField label="Full name" htmlFor="profile-full-name" error={errors.fullName?.message}>
        <Input id="profile-full-name" type="text" placeholder="Aisha Khan" autoComplete="name" {...register("fullName")} />
      </FormField>
      <FormField label="Phone" htmlFor="profile-phone" optional hint="For payroll and admin follow-up." error={errors.phone?.message}>
        <Input id="profile-phone" type="tel" placeholder="+971 50 123 4567" autoComplete="tel" {...register("phone")} />
      </FormField>
      {formMessage ? <InlineMessage tone={formMessage.tone}>{formMessage.text}</InlineMessage> : null}
      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
