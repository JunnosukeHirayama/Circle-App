"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import type { CircleFormState } from "@/app/actions/circles";
import { Button } from "@/components/ui";
import { CircleFields, type CircleDefaults } from "@/components/CircleFields";

export type { CircleDefaults };

export function CircleForm({
  action,
  defaults,
  submitLabel = "サークルを公開する",
}: {
  action: (prev: CircleFormState, formData: FormData) => Promise<CircleFormState>;
  defaults?: CircleDefaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<CircleFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <CircleFields defaults={defaults} />

      {state.error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{state.error}</p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        <Save className="h-4 w-4" />
        {pending ? "保存中..." : submitLabel}
      </Button>
    </form>
  );
}
