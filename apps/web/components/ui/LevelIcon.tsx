import { cn } from "@/lib/cn";

/** One glyph per level, keyed by its order (1-10) — matches the level map
 * reference: box / image / network / db cylinder / document / layers /
 * warning triangle / shield / scale arrows / ship. */
const ICONS: Record<number, JSX.Element> = {
  1: (
    <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.5 3.6L12 11.6 5.5 7.9 12 4.3ZM5 9.6l6 3.4v7.1l-6-3.3V9.6Zm8 10.5v-7.1l6-3.4v7.2l-6 3.3Z" />
  ),
  2: (
    <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v9.5l4.5-4.5 2.5 2.5 3-4L20 15V7H5Zm2.5 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
  ),
  3: (
    <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-1.6 2.65l.9 2.35H14a3 3 0 1 1-2.9 3.8L9.7 15.2a3 3 0 1 1-2.6-4.9c.35 0 .68.07.98.2L9.4 8.1A3 3 0 0 1 9 6.5 3 3 0 0 1 12 2Zm5.4 9.5a3 3 0 1 1-2.6 4.9l-1.4-2.5c.35-.33.62-.74.78-1.2h2.12l.1-.27a3 3 0 0 1 1-.93ZM7.1 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm10.3 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12 3.5A1.5 1.5 0 1 0 12 6.5a1.5 1.5 0 0 0 0-3Z" />
  ),
  4: (
    <path d="M12 2c4.4 0 8 1.34 8 3s-3.6 3-8 3-8-1.34-8-3 3.6-3 8-3Zm-8 5.2c0 1.66 3.6 3 8 3s8-1.34 8-3V10c0 1.66-3.6 3-8 3s-8-1.34-8-3V7.2Zm0 5.6c0 1.66 3.6 3 8 3s8-1.34 8-3v2.6c0 1.66-3.6 3-8 3s-8-1.34-8-3v-2.6Zm0 5.6c0 1.66 3.6 3 8 3s8-1.34 8-3V21c0 1.66-3.6 3-8 3s-8-1.34-8-3v-2.6Z" />
  ),
  5: (
    <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM7 12h10v1.5H7V12Zm0 3.5h10V17H7v-1.5ZM7 9h6v1.5H7V9Z" />
  ),
  6: (
    <path d="m12 2 9 5-9 5-9-5 9-5Zm-9 7.5 9 5 9-5v2L12 16l-9-4.5v-2Zm0 4.5 9 5 9-5v2l-9 4.5-9-4.5v-2Z" />
  ),
  7: (
    <path d="M12 2 1 21h22L12 2Zm0 4.2 6.9 12.3H5.1L12 6.2ZM11 11h2v4h-2v-4Zm0 5h2v2h-2v-2Z" />
  ),
  8: (
    <path d="M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5l8-3Zm0 2.2L6 6.5v4.7c0 3.7 2.3 6.6 6 8.6 3.7-2 6-4.9 6-8.6V6.5l-6-2.3Zm-1 10.1-2.6-2.6 1.4-1.4 1.2 1.2 3.8-3.8 1.4 1.4-5.2 5.2Z" />
  ),
  9: (
    <path d="M7 3 3 7l4 4V8h6V6H7V3Zm10 18 4-4-4-4v3H7v2h10v3ZM4 12.5h6v2H4v-2Zm10 0h6v2h-6v-2Z" />
  ),
  10: (
    <path d="M4 11h1V7a2 2 0 0 1 2-2h2V3h6v2h2a2 2 0 0 1 2 2v4h1a1 1 0 0 1 1 1c0 3-2.5 4.5-2.5 4.5L21 20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1l1.5-3.5S3 15 3 12a1 1 0 0 1 1-1Zm3-4v4h10V7H7Z" />
  ),
};

const FALLBACK = (
  <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.5 3.6L12 11.6 5.5 7.9 12 4.3Z" />
);

export function LevelIcon({ order, className }: { order: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("h-6 w-6", className)} aria-hidden>
      {ICONS[order] ?? FALLBACK}
    </svg>
  );
}
