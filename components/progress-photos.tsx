"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useJournal } from "@/lib/journal";
import { formatWeight } from "@/lib/calc";
import { dayKey, parseDay } from "@/lib/dates";
import { deletePhoto, listPhotos, savePhoto, shrinkPhoto, type ProgressPhoto } from "@/lib/photos";

const longDate = (d: string) => parseDay(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** Progress photos on the Progress page. They stay on this device. */
export default function ProgressPhotos() {
  const { user, profile, weights, currentKg } = useJournal();
  const [photos, setPhotos] = useState<ProgressPhoto[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(
    () =>
      listPhotos(user.uid)
        .then(setPhotos)
        .catch(() => {
          setPhotos([]);
          setError("Photos cannot be kept in this browser. Private browsing can cause this.");
        }),
    [user.uid],
  );
  useEffect(() => {
    void load();
  }, [load]);

  // Each photo gets an address the page can show, released again when the list changes.
  const urls = useMemo(() => new Map((photos ?? []).map((p) => [p.key, URL.createObjectURL(p.blob)])), [photos]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  if (!profile) return null;
  const unit = profile.weightUnit;
  const today = dayKey();

  async function add(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const blob = await shrinkPhoto(file);
      const todays = weights.find((w) => w.date === today)?.kg ?? currentKg;
      await savePhoto(user.uid, today, blob, todays);
      await load();
    } catch {
      setError("That photo could not be saved. Try again, or try a different photo.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(date: string) {
    setConfirming(null);
    await deletePhoto(user.uid, date);
    await load();
  }

  const list = photos ?? [];
  const first = list[0];
  const latest = list.length > 1 ? list[list.length - 1] : null;
  const figure = (p: ProgressPhoto, label: string) => (
    <figure className="min-w-0 flex-1">
      {/* The picture is a local blob, so the image optimiser has nothing to fetch. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={urls.get(p.key)} alt={`${label} photo, ${longDate(p.date)}`} className="aspect-[3/4] w-full rounded-xl object-cover" />
      <figcaption className="mt-1.5 text-center text-sm">
        <span className="block font-semibold text-ink">{label}</span>
        <span className="text-muted">
          {longDate(p.date)}
          {p.weightKg ? ` · ${formatWeight(p.weightKg, unit)}` : ""}
        </span>
      </figcaption>
    </figure>
  );

  return (
    <section className="card mt-4 p-5" aria-label="Progress photos">
      <h2 className="font-semibold text-ink">Progress photos</h2>
      <p className="mt-1 text-sm text-muted">
        Photos stay on this device only. They are never uploaded, so they will not appear on your other devices.
      </p>

      {first && latest ? (
        <div className="mt-4 flex gap-3">
          {figure(first, "Start")}
          {figure(latest, "Latest")}
        </div>
      ) : first ? (
        <div className="mt-4 flex gap-3">
          {figure(first, "Start")}
          <div className="flex aspect-[3/4] flex-1 items-center justify-center self-start rounded-xl border border-dashed border-line px-3 text-center text-sm text-muted">
            Your next photo will appear here to compare
          </div>
        </div>
      ) : photos ? (
        <p className="mt-3 text-ink">
          Take one every two to four weeks, in the same place, light and clothes. Side by side they show changes the
          mirror hides.
        </p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-clay" role="alert">{error}</p> : null}

      <input ref={input} type="file" accept="image/*" className="sr-only" id="progress-photo" onChange={(e) => void add(e.target.files?.[0])} />
      <label htmlFor="progress-photo" className={`btn-quiet mt-4 w-full cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? "Saving…" : list.some((p) => p.date === today) ? "Replace today's photo" : "Add a photo"}
      </label>

      {list.length > 2 || (list.length && !latest) ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-leaf">All photos ({list.length})</summary>
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {[...list].reverse().map((p) => (
              <li key={p.key} className="min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={urls.get(p.key)} alt={`Photo from ${longDate(p.date)}`} className="aspect-[3/4] w-full rounded-lg object-cover" />
                <p className="mt-1 truncate text-center text-xs text-muted">{longDate(p.date)}</p>
                {confirming === p.date ? (
                  <button type="button" className="min-h-11 w-full text-sm font-semibold text-clay" onClick={() => void remove(p.date)}>
                    Confirm delete
                  </button>
                ) : (
                  <button type="button" className="min-h-11 w-full text-sm text-muted hover:text-clay" onClick={() => setConfirming(p.date)}>
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </details>
      ) : list.length === 2 ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-leaf">Manage photos</summary>
          <ul className="mt-2 divide-y divide-line text-sm">
            {[...list].reverse().map((p) => (
              <li key={p.key} className="flex items-center justify-between py-1">
                <span className="text-ink">{longDate(p.date)}</span>
                <button type="button" className="min-h-11 px-2 text-sm text-muted hover:text-clay" onClick={() => void remove(p.date)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
