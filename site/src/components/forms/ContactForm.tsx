"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Send } from "lucide-react";
import { Button } from "../ui/Button";
import { FileUpload } from "./FileUpload";
import { TurnstileBox } from "./TurnstileBox";

type Status = "idle" | "submitting" | "error";

// Server error codes → user-facing Danish. When zod fails, the API returns
// `details.fieldErrors` so we can name the exact field instead of dumping
// "validation-failed". Submission ID is appended when present so the user
// can quote it back to support if needed.
const FIELD_LABELS: Record<string, string> = {
  navn: "Navn",
  telefon: "Telefonnummer",
  email: "E-mail",
  besked: "Beskrivelse af opgaven",
  adresse: "Adresse",
  opgavetype: "Opgavetype",
  samtykke: "Accept af privatlivspolitik",
};

function translateContactError(data: {
  error?: string;
  details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
  submission_id?: string;
}): string {
  const base = (() => {
    switch (data.error) {
      case "captcha-failed":
        return "Bekræft venligst at du ikke er en robot — vent et øjeblik og prøv igen.";
      case "validation-failed": {
        const fields = data.details?.fieldErrors ?? {};
        const bad = Object.keys(fields).filter((k) => fields[k]?.length);
        if (bad.length === 1) {
          const label = FIELD_LABELS[bad[0]!] ?? bad[0];
          return `Feltet "${label}" er ikke udfyldt korrekt.`;
        }
        if (bad.length > 1) {
          const labels = bad.map((k) => FIELD_LABELS[k] ?? k).join(", ");
          return `Tjek venligst disse felter: ${labels}.`;
        }
        return "Et eller flere felter er ikke udfyldt korrekt.";
      }
      case "rate-limited":
        return "For mange forsøg på kort tid. Vent et minut og prøv igen.";
      case "too-many-files":
        return "For mange filer — vedhæft højst 5 billeder.";
      case "invalid-file-type":
        return "Filtypen understøttes ikke. Brug JPG, PNG eller HEIC.";
      case "total-size-exceeded":
        return "Billederne er for store — max 20 MB i alt.";
      case "server-error":
        return "Der opstod en intern fejl. Prøv igen om et øjeblik, eller ring til os.";
      default:
        return data.error ?? "Kunne ikke sende forespørgsel. Prøv venligst igen.";
    }
  })();
  // Surface the submission_id so the user (or Adam) can reference it later.
  return data.submission_id ? `${base} (Reference: ${data.submission_id})` : base;
}

export function ContactForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
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

    try {
      const fd = new FormData(e.currentTarget);
      files.forEach((f) => fd.append("billeder", f, f.name));
      if (turnstileToken) fd.set("turnstileToken", turnstileToken);
      // Ensure samtykke is a boolean-like string the API expects
      fd.set("samtykke", fd.get("samtykke") === "on" ? "true" : "false");

      const r = await fetch("/api/contact", { method: "POST", body: fd });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        // Log structured details to the browser console — helpful when Adam
        // is on a support call with a customer who can't get the form to
        // submit. Devtools shows the raw error response.
        console.warn("[contact] submission failed", { status: r.status, data });
        throw new Error(translateContactError(data));
      }
      router.push("/tak");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Ukendt fejl.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-cream-50 rounded-2xl border border-warm-light/70 p-7 lg:p-9 space-y-5"
      encType="multipart/form-data"
    >
      {/* honeypot — bots fill any visible field, real users can't see this one */}
      <div className="hidden" aria-hidden="true">
        <label>
          Lad dette felt være tomt
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field id="navn" label="Navn" required autoComplete="name" placeholder="Dit fulde navn" />
        <Field id="telefon" label="Telefon" required type="tel" autoComplete="tel" placeholder="Telefonnummer" />
      </div>
      <Field id="email" label="E-mail" required type="email" autoComplete="email" placeholder="din@email.dk" />
      <Field id="adresse" label="Adresse for opgaven" autoComplete="street-address" placeholder="Valgfri" />
      <div>
        <label htmlFor="opgavetype" className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
          Type af opgave
        </label>
        <select
          id="opgavetype"
          name="opgavetype"
          className="w-full rounded-lg border border-warm-light bg-cream-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors appearance-none cursor-pointer"
        >
          <option value="">Vælg type</option>
          <option value="indvendig">Indvendig maling</option>
          <option value="udvendig">Udvendig maling</option>
          <option value="erhverv">Erhverv</option>
          <option value="totalrenovering">Totalrenovering</option>
          <option value="andet">Andet</option>
        </select>
      </div>
      <div>
        <label htmlFor="besked" className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
          Beskriv opgaven <span className="text-brand-500">*</span>
        </label>
        <textarea
          id="besked"
          name="besked"
          required
          rows={4}
          className="w-full rounded-lg border border-warm-light bg-cream-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors resize-none"
          placeholder="Størrelse, tidspunkt, særlige ønsker…"
        />
      </div>

      <FileUpload files={files} setFiles={setFiles} />

      <label className="flex items-start gap-3 text-sm text-charcoal/65">
        <input
          type="checkbox"
          name="samtykke"
          required
          className="mt-1 h-4 w-4 rounded border-warm-light text-brand-400 focus:ring-brand-400 cursor-pointer"
        />
        <span>
          Jeg accepterer <a href="/privatlivspolitik" className="underline hover:text-brand-500">privatlivspolitikken</a>{" "}
          <span className="text-brand-500">*</span>
        </span>
      </label>

      <TurnstileBox onSuccess={setTurnstileToken} onError={() => setTurnstileToken("")} />

      {status === "error" && (
        <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-md px-3 py-2.5">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="secondary"
        size="lg"
        className="w-full justify-center"
        disabled={status === "submitting"}
      >
        <Send className="h-4 w-4" aria-hidden />
        {status === "submitting" ? "Sender…" : "Send forespørgsel"}
      </Button>
    </form>
  );
}

function Field({
  id, label, required, type = "text", autoComplete, placeholder,
}: { id: string; label: string; required?: boolean; type?: string; autoComplete?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      <input
        id={id}
        name={id}
        required={required}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-lg border border-warm-light bg-cream-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
      />
    </div>
  );
}
