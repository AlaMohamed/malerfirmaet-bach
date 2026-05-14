"use client";

import { useId, useRef, useState } from "react";
import { Upload, X, FileImage, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB total
const ACCEPTED = [".jpg", ".jpeg", ".png", ".heic", ".heif"];
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/heic", "image/heif"];

function isAccepted(file: File) {
  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  return ACCEPTED.includes(ext) || ACCEPTED_MIME.includes(file.type);
}

function bytesToHuman(n: number) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
  return (n / 1024 / 1024).toFixed(1) + " MB";
}

interface Props {
  files: File[];
  setFiles: (f: File[]) => void;
  label?: string;
}

export function FileUpload({ files, setFiles, label = "Vedhæft billeder (valgfrit)" }: Props) {
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  const remainingBytes = MAX_TOTAL_BYTES - totalBytes;

  function addFiles(newFiles: FileList | File[]) {
    setError("");
    const arr = Array.from(newFiles);
    const valid: File[] = [];
    let runningTotal = totalBytes;

    for (const f of arr) {
      if (files.length + valid.length >= MAX_FILES) {
        setError(`Maks. ${MAX_FILES} filer.`);
        break;
      }
      if (!isAccepted(f)) {
        setError(`"${f.name}" har et ikke-understøttet format. Tilladt: ${ACCEPTED.join(", ")}.`);
        continue;
      }
      if (runningTotal + f.size > MAX_TOTAL_BYTES) {
        setError(`Samlet størrelse må højst være ${bytesToHuman(MAX_TOTAL_BYTES)}. "${f.name}" overskrider grænsen.`);
        continue;
      }
      valid.push(f);
      runningTotal += f.size;
    }
    setFiles([...files, ...valid]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function removeAt(i: number) {
    setError("");
    setFiles(files.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-2">
        {label}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-lg border-2 border-dashed transition-colors p-5 text-center",
          dragOver ? "border-brand-400 bg-brand-50" : "border-warm-light bg-cream-200 hover:border-brand-300",
        )}
      >
        <Upload className="h-7 w-7 text-brand-500 mx-auto mb-2" aria-hidden />
        <p className="text-sm text-charcoal-dark font-medium">
          Træk billeder hertil eller{" "}
          <label htmlFor={inputId} className="text-brand-500 underline cursor-pointer hover:text-brand-600">
            vælg fra computer
          </label>
        </p>
        <p className="text-[11px] text-charcoal/50 mt-1">
          Max {MAX_FILES} filer · {bytesToHuman(MAX_TOTAL_BYTES)} total · {ACCEPTED.map((e) => e.replace(".", "")).join(", ")}
        </p>
        <input
          ref={fileInput}
          id={inputId}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-md border border-warm-light bg-cream-50 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 min-w-0">
                <FileImage className="h-4 w-4 text-brand-500 shrink-0" aria-hidden />
                <span className="truncate text-charcoal-dark">{f.name}</span>
                <span className="text-warm-gray text-xs shrink-0">{bytesToHuman(f.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Fjern ${f.name}`}
                className="text-warm-gray hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
          <li className="text-[11px] text-charcoal/55 pl-1">
            {files.length} af {MAX_FILES} filer · {bytesToHuman(totalBytes)} brugt · {bytesToHuman(Math.max(0, remainingBytes))} tilbage
          </li>
        </ul>
      )}
    </div>
  );
}
