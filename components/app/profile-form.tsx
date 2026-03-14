"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { updateProfileAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
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
            if (message) {
              setError(field as keyof ProfileValues, { message });
            }
          });
        }

        setFormMessage({
          tone: "error",
          text: result.message,
        });
        return;
      }

      setFormMessage({
        tone: "success",
        text: result.message,
      });
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <FormField label="Name" htmlFor="profile-full-name" hint="This name appears across the app shell and team views." error={errors.fullName?.message}>
        <Input id="profile-full-name" type="text" placeholder="Aisha Khan" {...register("fullName")} />
      </FormField>
      <FormField label="Phone" htmlFor="profile-phone" hint="Optional, but useful for admin and payroll follow-up." error={errors.phone?.message}>
        <Input id="profile-phone" type="tel" placeholder="+971 50 123 4567" {...register("phone")} />
      </FormField>
      {formMessage ? (
        <div className={formMessage.tone === "success" ? "rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700" : "rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700"}>
          {formMessage.text}
        </div>
      ) : null}
      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? "Saving" : "Save profile"}
      </Button>
    </form>
  );
}