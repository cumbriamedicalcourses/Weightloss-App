/**
 * Simple line icons drawn on a 24 x 24 grid. They take the current text colour,
 * so the same icon works in the menu, on cards and on coloured backgrounds.
 */
import type { SVGProps } from "react";

export type IconName =
  | "today"
  | "plans"
  | "progress"
  | "learn"
  | "profile"
  | "flame"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "exercise"
  | "water"
  | "coach"
  | "camera"
  | "barcode"
  | "video"
  | "report"
  | "clock"
  | "check";

const PATHS: Record<IconName, string[]> = {
  today: ["M4 10.5 12 4l8 6.5", "M6 9v10h12V9", "M10 19v-5h4v5"],
  plans: ["M7 3v8", "M5 3v5a2 2 0 0 0 4 0V3", "M7 11v10", "M16 3c-1.7 1.2-2.5 3.5-2.5 6.5V13H17V3Z", "M17 13v8"],
  progress: ["M4 19h16", "M5 15l4-4 3.5 3L19 7.5", "M15 7.5h4v4"],
  learn: ["M4 5.5A2 2 0 0 1 6 4h5v15H6a2 2 0 0 0-2 2Z", "M20 5.5A2 2 0 0 0 18 4h-5v15h5a2 2 0 0 1 2 2Z"],
  profile: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4.5 20a7.5 7.5 0 0 1 15 0"],
  flame: [
    "M12 21c-3.9 0-6.5-2.7-6.5-6.2 0-3.3 2.3-5.4 3.7-7.6.4 1.6 1.2 2.7 2.3 3.2.2-2.9 1.6-5.4 3.7-7.4.3 2.8 1.6 4.4 2.6 6 .8 1.3 1.2 2.6 1.2 4 0 4.5-3.2 8-7 8Z",
    "M12 21c-1.6 0-2.8-1.2-2.8-2.9 0-1.6 1.2-2.6 2.1-3.8.4 1 1 1.6 1.7 1.8.4-.8 1-1.4 1.6-1.8.4 1 .9 1.9.9 3 0 2.2-1.6 3.7-3.5 3.7Z",
  ],
  breakfast: ["M12 4v2", "M5.6 6.6 7 8", "M18.4 6.6 17 8", "M3 13h2", "M19 13h2", "M7 13a5 5 0 0 1 10 0", "M3 17h18", "M7 20h10"],
  lunch: ["M3 11h18", "M4 11a8 8 0 0 0 16 0", "M9 7c0-1.5 1-1.5 1-3", "M13 7c0-1.5 1-1.5 1-3"],
  dinner: ["M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"],
  snack: [
    "M12 7.5c-1-1.2-2.5-1.8-4-1.5C5 6.6 4 9.8 4.8 13c.9 3.6 3.2 7 5.4 7 .7 0 1.2-.4 1.8-.4s1.1.4 1.8.4c2.2 0 4.5-3.4 5.4-7 .8-3.2-.2-6.4-3.2-7-1.5-.3-3 .3-4 1.5Z",
    "M12 7.5c0-2 .8-3.5 2.5-4.5",
  ],
  exercise: ["M6.5 7v10", "M3.5 9.5v5", "M17.5 7v10", "M20.5 9.5v5", "M6.5 12h11"],
  water: ["M12 3.5s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11Z"],
  coach: ["M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5Z", "M8.5 9.5h7", "M8.5 12.5h4"],
  camera: ["M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2.5h6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z", "M12 16a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"],
  barcode: ["M4 6v12", "M7 6v12", "M10.5 6v12", "M13 6v12", "M16.5 6v12", "M20 6v12"],
  video: ["M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z", "M10 9v6l5-3Z"],
  report: ["M7 3.5h7l4 4v13H7Z", "M14 3.5v4h4", "M10 12h5", "M10 15h5", "M10 18h3"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"],
  check: ["M5 12.5 10 17l9-10"],
};

export function Icon({ name, className = "size-5", ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...rest}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
