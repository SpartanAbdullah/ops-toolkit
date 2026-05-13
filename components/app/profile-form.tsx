"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { updateProfileAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { profileSchema, type ProfileValues } from "@/lib/validation/profile";

export function ProfileForm({ defaultValues }: { defaultValues: ProfileValues }) {
  const toast = useToast();
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
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            if (message) setError(field as keyof ProfileValues, { message });
          });
        }
        toast({ title: "Couldn't save profile", description: result.message, tone: "error" });
        return;
      }
      toast({ title: "Profile updated", tone: "success" });
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
      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
