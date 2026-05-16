"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "done" | "error";

export function CancelConfirmButton({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");

  async function cancel() {
    setStatus("loading");
    setError("");
    try {
      const r = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Trim whitespace and cap at 500 chars client-side so a giant
        // paste doesn't bloat the request body. Server validates again.
        body: JSON.stringify({ token, reason: reason.trim().slice(0, 500) }),
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
      {/* Optional "why" textarea. Strictly opt-in — empty submissions are
          fine — but if the customer types something, the reason flows
          through to Adam's admin email so he can learn what causes
          cancellations over time (price, scheduling, changed mind, etc.). */}
      <div className="mb-5">
        <label
          htmlFor="cancel-reason"
          className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2"
        >
          Hvorfor aflyser du? <span className="normal-case tracking-normal text-charcoal/40">(valgfri — hjælper os blive bedre)</span>
        </label>
        <textarea
          id="cancel-reason"
          name="reason"
          rows={3}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={status === "loading"}
          className="w-full rounded-lg border border-warm-light bg-cream-50 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors resize-none disabled:opacity-60"
          placeholder="Fx ændrede planer, fundet anden løsning, prisen — eller spring feltet over"
        />
        {reason.length > 0 && (
          <p className="mt-1 text-[10px] text-charcoal/50 text-right tabular-nums">
            {reason.length}/500
          </p>
        )}
      </div>

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
