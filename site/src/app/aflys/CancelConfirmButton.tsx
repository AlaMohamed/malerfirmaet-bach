"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "done" | "error";

export function CancelConfirmButton({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function cancel() {
    setStatus("loading");
    setError("");
    try {
      const r = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error ?? "Kunne ikke aflyse — prøv igen.");
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Ukendt fejl.");
    }
  }

  if (status === "done") {
    return (
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-brand-500 mx-auto mb-3" aria-hidden />
        <h2 className="font-serif text-xl mb-2">Besigtigelsen er aflyst</h2>
        <p className="text-charcoal/65 text-sm leading-relaxed">
          Adam er informeret, og du har modtaget en bekræftelses-e-mail. Tak fordi du gav os besked.
        </p>
        <p className="mt-4 text-sm">
          <a href="/book-besigtigelse" className="text-brand-500 underline">Book en ny tid</a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <Button
        type="button"
        onClick={cancel}
        variant="secondary"
        size="lg"
        className="w-full justify-center"
        disabled={status === "loading"}
      >
        {status === "loading"
          ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Aflyser…</>
          : <><XCircle className="h-4 w-4" aria-hidden /> Ja, aflys besigtigelsen</>}
      </Button>

      {status === "error" && (
        <p className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-md px-3 py-2.5">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
