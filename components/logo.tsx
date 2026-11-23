/**
 * The brand logo: the journal icon (a page with a gently falling trend line)
 * beside the name, with "My" picked out in orange.
 */
export function LogoIcon({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#17568f" />
      <rect x="17" y="11" width="31" height="42" rx="4" fill="#ffffff" />
      <rect x="17" y="11" width="7" height="42" rx="3" fill="#c8501f" />
      <path d="M29 20C33 20 33 28 36.5 28C40 28 40 34 43 35" fill="none" stroke="#17568f" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="43" cy="35" r="3.3" fill="#c8501f" />
      <path d="M29 41h14M29 46h9" stroke="#17568f" strokeWidth="3" strokeLinecap="round" opacity=".35" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display text-lg text-ink ${className}`}>
      <LogoIcon />
      <span>
        <span className="text-clay">My</span> Weight Loss Journal
      </span>
    </span>
  );
}
