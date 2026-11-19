"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMeasurement } from "@/lib/actions";
import { Alert, SubmitButton } from "@/components/ui";

export default function MeasurementForm({ clientId, today }: { clientId: number; today: string }) {
  const [state, action] = useActionState(addMeasurement, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="mt-3 space-y-3">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="date" name="date" defaultValue={today} max={today} className="input" required />
      <div className="grid grid-cols-2 gap-3">
        <input name="weight" inputMode="decimal" required placeholder="Kilo (kg)" className="input" />
        <input name="waist" inputMode="decimal" placeholder="Bel (cm)" className="input" />
      </div>
      <input name="note" placeholder="Not (isteğe bağlı)" className="input" />
      <Alert state={state} />
      <SubmitButton className="btn-primary w-full">Ölçümü kaydet</SubmitButton>
    </form>
  );
}
