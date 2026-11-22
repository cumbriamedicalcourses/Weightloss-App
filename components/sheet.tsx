"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** A bottom sheet on phones and a centred dialog on larger screens. */
export default function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="sheet"
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-ink">{title}</h2>
          <button
            type="button"
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-muted hover:text-ink"
            onClick={() => ref.current?.close()}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
