"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

/**
 * Reads a barcode with the phone camera. The picture never leaves the device:
 * only the number under the bars is looked up. Typing the number works too,
 * for when the camera is refused or the light is poor.
 */
export default function BarcodeScanner({ onCode, onCancel }: { onCode: (code: string) => void; onCancel: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"starting" | "scanning" | "blocked">("starting");
  const [typed, setTyped] = useState("");
  // Kept in a ref so a new callback from the parent does not restart the camera.
  const found = useRef(onCode);
  useEffect(() => {
    found.current = onCode;
  }, [onCode]);

  useEffect(() => {
    let stop: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      try {
        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
          import("@zxing/browser"),
          import("@zxing/library"),
        ]);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E]);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 150 });
        if (cancelled || !video.current) return;
        let done = false;
        const controls = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } } },
          video.current,
          // The first reading can arrive before this call returns, so the
          // camera is stopped through the controls handed to the callback.
          (result, _error, scan) => {
            const code = result?.getText().replace(/\D/g, "") ?? "";
            if (done || code.length < 8) return;
            done = true;
            scan.stop();
            found.current(code);
          },
        );
        stop = () => controls.stop();
        if (cancelled) stop();
        else setState("scanning");
      } catch {
        if (!cancelled) setState("blocked");
      }
    })();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    const code = typed.replace(/\D/g, "");
    if (code.length >= 8) onCode(code);
  }

  return (
    <div className="space-y-4">
      {state === "blocked" ? (
        <p className="rounded-xl bg-clay-soft px-3.5 py-3 text-sm text-clay">
          The camera could not be opened. Allow camera access for this site in your browser settings, or type the
          number under the barcode below.
        </p>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-ink">
          <video ref={video} className="aspect-[4/3] w-full object-cover" muted playsInline aria-label="Camera view" />
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-xl border-2 border-white/90" />
          <p className="absolute inset-x-0 bottom-0 bg-ink/60 px-3 py-2 text-center text-sm text-white" role="status">
            {state === "starting" ? "Opening the camera…" : "Hold the barcode inside the box"}
          </p>
        </div>
      )}
      <form onSubmit={submit}>
        <label className="label" htmlFor="barcode-number">Or type the number under the barcode</label>
        <div className="flex gap-2">
          <input
            id="barcode-number"
            className="field flex-1"
            inputMode="numeric"
            autoComplete="off"
            placeholder="13 digits"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <button type="submit" className="btn shrink-0" disabled={typed.replace(/\D/g, "").length < 8}>
            Look up
          </button>
        </div>
      </form>
      <button type="button" className="btn-quiet w-full" onClick={onCancel}>
        Back to search
      </button>
    </div>
  );
}
