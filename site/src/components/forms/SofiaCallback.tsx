"use client";

import { useState } from "react";
import { Phone, CheckCircle2, AlertCircle, Clock, Sunrise } from "lucide-react";
import { Button } from "../ui/Button";
import { TurnstileBox } from "./TurnstileBox";

type Status = "idle" | "submitting" | "success" | "error";
type ScheduledFor = "asap" | "next-business-day";

export function SofiaCallback() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [scheduledFor, setScheduledFor] = useState<ScheduledFor>("asap");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    if (turnstileRequired && !turnstileToken) {
      setStatus("error");
      setError("Bekræft venligst at du ikke er en robot.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload = {
      navn: String(fd.get("navn") ?? ""),
      telefon: String(fd.get("telefon") ?? ""),
      email: String(fd.get("email") ?? ""),
      // Optional — Sofia receives these as dynamic variables and can
      // confirm rather than ask. Empty strings are fine; the API
      // schema makes them optional.
      adresse: String(fd.get("adresse") ?? ""),
      postnummer: String(fd.get("postnummer") ?? ""),
      by: String(fd.get("by") ?? ""),
      samtykke: fd.get("samtykke") === "on",
      kilde: "sofia-callback",
      turnstileToken,
      website: String(fd.get("website") ?? ""), // honeypot
    };
    try {
      const r = await fetch("/api/sofia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error ?? "Kunne ikke sende. Prøv igen.");
      }
      const data = (await r.json().catch(() => ({}))) as { scheduledFor?: ScheduledFor };
      setScheduledFor(data.scheduledFor === "next-business-day" ? "next-business-day" : "asap");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Ukendt fejl.");
    }
  }

  if (status === "success") {
    const asap = scheduledFor === "asap";
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 text-brand-400 mx-auto mb-4" aria-hidden />
        <h3 className="font-serif text-xl mb-3">Tak — vi er på sagen</h3>

        <div className={`mx-auto max-w-sm rounded-xl border p-5 ${
          asap
            ? "bg-brand-50 border-brand-200"
            : "bg-cream-200 border-warm-light"
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {asap ? (
              <Clock className="h-5 w-5 text-brand-500" aria-hidden />
            ) : (
              <Sunrise className="h-5 w-5 text-brand-500" aria-hidden />
            )}
            <p className="font-serif text-lg text-charcoal-dark">
              {asap
                ? "Du bliver ringet op inden for 5 minutter"
                : "Du bliver ringet op næste hverdag morgen"}
            </p>
          </div>
          <p className="text-charcoal/70 text-sm leading-relaxed">
            {asap
              ? "Sofia ringer dig op fra +45 91 30 95 35 nu. Sørg for at have din mobil i nærheden."
              : "Sofia ringer dig fra +45 91 30 95 35 så snart Adams arbejdsdag starter (man–fre fra kl. 06:00). Vi sender også en bekræftelses-email."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="hidden" aria-hidden="true">
        <label>Lad dette felt være tomt<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div>
        <label htmlFor="sofia-navn" className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
          Dit navn <span className="text-brand-500">*</span>
        </label>
        <input
          id="sofia-navn"
          name="navn"
          required
          autoComplete="name"
          className="w-full rounded-lg border border-warm-light bg-cream-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
          placeholder="Fulde navn"
        />
      </div>
      <div>
        <label htmlFor="sofia-telefon" className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
          Telefonnummer <span className="text-brand-500">*</span>
        </label>
        <input
          id="sofia-telefon"
          name="telefon"
          required
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          pattern="[0-9 +]{8,}"
          className="w-full rounded-lg border border-warm-light bg-cream-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
          placeholder="Dit telefonnummer"
        />
      </div>
      <div>
        <label htmlFor="sofia-email" className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
          E-mail <span className="text-brand-500">*</span>
        </label>
        <input
          id="sofia-email"
          name="email"
          required
          type="email"
          autoComplete="email"
          className="w-full rounded-lg border border-warm-light bg-cream-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
          placeholder="din@email.dk"
        />
      </div>

      {/* Optional address — pre-fills Sofia's address-confirmation step so
          she can confirm rather than ask. Postnummer + by share a row
          (grid-cols-3, postnummer = 1 col, by = 2 cols) so the section
          doesn't dominate the form when it's not strictly needed. */}
      <div>
        <label htmlFor="sofia-adresse" className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
          Adresse <span className="text-charcoal/40 normal-case tracking-normal">(valgfri — gør samtalen hurtigere)</span>
        </label>
        <input
          id="sofia-adresse"
          name="adresse"
          type="text"
          autoComplete="street-address"
          className="w-full rounded-lg border border-warm-light bg-cream-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
          placeholder="Vejnavn og husnummer"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="sofia-postnummer" className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
            Postnr.
          </label>
          <input
            id="sofia-postnummer"
            name="postnummer"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            autoComplete="postal-code"
            className="w-full rounded-lg border border-warm-light bg-cream-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
            placeholder="2860"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="sofia-by" className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
            By
          </label>
          <input
            id="sofia-by"
            name="by"
            type="text"
            autoComplete="address-level2"
            className="w-full rounded-lg border border-warm-light bg-cream-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
            placeholder="Søborg"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-xs text-charcoal/65 leading-relaxed">
        <input
          type="checkbox"
          name="samtykke"
          required
          className="mt-0.5 h-4 w-4 rounded border-warm-light text-brand-400 focus:ring-brand-400 cursor-pointer"
        />
        <span>
          Jeg accepterer at <strong>Sofia (AI-agent)</strong> ringer mig op fra <strong>+45 91 30 95 35</strong>,
          og at samtalen kan optages for kvalitetssikring. Jeg har læst{" "}
          <a href="/privatlivspolitik" className="underline hover:text-brand-500">privatlivspolitikken</a>.
        </span>
      </label>

      <TurnstileBox onSuccess={setTurnstileToken} onError={() => setTurnstileToken("")} />

      {status === "error" && (
        <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-md px-3 py-2.5">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full justify-center" disabled={status === "submitting"}>
        <Phone className="h-4 w-4" aria-hidden />
        {status === "submitting" ? "Sender…" : "Ring mig op inden for 5 min"}
      </Button>
      <p className="text-[11px] text-charcoal/45 text-center">
        Henvendelser uden for åbningstid (man–fre 06:00–17:00) besvares næste hverdag morgen.
      </p>
    </form>
  );
}
