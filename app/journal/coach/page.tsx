"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { COACH_DAYS, HISTORY_MAX, QUESTION_MAX, STARTERS, coachContext, type CoachMessage } from "@/lib/coach";
import { addDays, dayKey } from "@/lib/dates";
import { useJournal } from "@/lib/journal";
import { store } from "@/lib/store";
import type { Entry } from "@/lib/types";

const KEEP = 40;

function load(key: string): CoachMessage[] {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(saved) ? saved.filter((m) => m && typeof m.text === "string").slice(-KEEP) : [];
  } catch {
    return [];
  }
}

export default function CoachPage() {
  const { getToken } = useAuth();
  const { user, profile, weights, currentKg, target } = useJournal();
  const today = dayKey();
  const from = addDays(today, -(COACH_DAYS - 1));
  const [entries, setEntries] = useState<Entry[] | null>(null);
  useEffect(() => store.watchEntries(user.uid, from, today, setEntries), [user.uid, from, today]);

  const key = `wlj:coach:${user.uid}`;
  const [messages, setMessages] = useState<CoachMessage[]>(() => load(key));
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(messages.slice(-KEEP)));
    } catch {
      // The chat still works when the browser will not store it.
    }
    end.current?.scrollIntoView({ block: "end" });
  }, [messages, busy, key]);

  const journal = useMemo(
    () => (profile && entries ? coachContext({ profile, weights, entries, currentKg, target, today }) : ""),
    [profile, weights, entries, currentKg, target, today],
  );

  async function ask(question: string) {
    const text = question.trim().slice(0, QUESTION_MAX);
    if (!text || busy || !journal) return;
    const next: CoachMessage[] = [...messages, { role: "user", text }];
    setMessages(next);
    setDraft("");
    setError("");
    setBusy(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ messages: next.slice(-(HISTORY_MAX + 1)), journal }),
      });
      const data = await res.json().catch(() => ({}));
      if (typeof data.left === "number") setLeft(data.left);
      if (!res.ok || typeof data.reply !== "string") throw new Error(data.error || "Something went wrong. Please try again.");
      setMessages([...next, { role: "assistant", text: data.reply }]);
    } catch (err) {
      // The question goes back in the box so it can be sent again.
      setMessages(messages);
      setDraft(text);
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "The answer didn't come back. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void ask(draft);
  }

  return (
    <>
      <Link href="/journal" className="text-sm font-semibold text-leaf">‹ Today</Link>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">Coach</h1>
        {messages.length ? (
          <button
            type="button"
            className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-ink"
            onClick={() => {
              setMessages([]);
              setError("");
            }}
          >
            Clear chat
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-muted">Ask about your food, activity, weight or habits. The answers use what you have logged.</p>

      <div className="mt-4 flex flex-1 flex-col gap-3" aria-live="polite">
        {messages.length === 0 ? (
          <section className="card p-5" aria-label="Ideas to start with">
            <h2 className="font-semibold text-ink">Not sure what to ask?</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {STARTERS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-line bg-card px-3.5 py-3 text-left text-ink transition hover:border-leaf disabled:opacity-50"
                    disabled={busy || !journal}
                    onClick={() => void ask(s)}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-10 self-end whitespace-pre-wrap rounded-2xl rounded-br-md bg-leaf px-4 py-2.5 text-white">
              <span className="sr-only">You asked: </span>
              {m.text}
            </div>
          ) : (
            <div key={i} className="mr-10 self-start whitespace-pre-wrap rounded-2xl rounded-bl-md border border-line bg-card px-4 py-2.5 text-ink">
              <span className="sr-only">Coach: </span>
              {m.text}
            </div>
          ),
        )}
        {busy ? (
          <div className="mr-10 self-start rounded-2xl rounded-bl-md border border-line bg-card px-4 py-2.5 text-muted" role="status">
            Looking at your journal…
          </div>
        ) : null}
        <div ref={end} />
      </div>

      {error ? (
        <p className="mt-3 rounded-xl bg-clay-soft px-3.5 py-2.5 text-sm text-clay" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-4">
        <label htmlFor="coach-question" className="sr-only">Your question</label>
        <div className="flex items-end gap-2">
          <textarea
            id="coach-question"
            className="field min-h-12 flex-1 resize-none"
            rows={2}
            maxLength={QUESTION_MAX}
            placeholder="Ask your coach…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void ask(draft);
              }
            }}
          />
          <button type="submit" className="btn" disabled={busy || !draft.trim() || !journal}>
            Send
          </button>
        </div>
        {left !== null ? (
          <p className="mt-2 text-xs text-muted">
            {left === 0 ? "That was your last question for today." : `${left} ${left === 1 ? "question" : "questions"} left today.`}
          </p>
        ) : null}
      </form>

      <p className="mt-4 text-xs text-muted">
        The coach is an AI assistant, not a doctor, and it can make mistakes. It does not replace advice from your GP, pharmacist or
        prescriber. In an emergency call 999. Your question and a summary of your journal are sent to Anthropic to write the answer,
        without your name or email address. This chat is kept on this device only.{" "}
        <Link href="/privacy" className="underline underline-offset-2">Privacy</Link>
      </p>
    </>
  );
}
