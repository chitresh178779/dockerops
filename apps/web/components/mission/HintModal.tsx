"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { api, type PublicPart } from "@/lib/api";

const TIER_ORDER = ["concept", "direction", "command", "explanation"];

export function HintModal({
  open,
  onOpenChange,
  sessionId,
  part,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  part: PublicPart;
}) {
  const sortedHints = [...(part?.hints ?? [])].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  );
  const [index, setIndex] = useState(0);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, part?.id]);

  const safeIndex = sortedHints.length > 0 ? Math.min(Math.max(0, index), sortedHints.length - 1) : 0;
  const current = sortedHints[safeIndex];
  const isLast = safeIndex >= sortedHints.length - 1;

  useEffect(() => {
    if (!open || !current) return;
    setLoading(true);
    setText(null);
    api
      .requestHint(sessionId, part.id, current.id)
      .then((h) => setText(h.text))
      .catch(() => setText("Could not load this hint."))
      .finally(() => setLoading(false));
  }, [open, safeIndex, current?.id, part?.id, sessionId]);

  if (!current || sortedHints.length === 0) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border border-line bg-black p-6 shadow-2xl focus:outline-none font-mono">
          {/* Header matching wireframe 07 */}
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <Dialog.Title className="font-display text-sm font-bold uppercase tracking-wider text-white">
              HINT
            </Dialog.Title>
            <span className="text-xs font-mono font-bold text-white/70">
              {safeIndex + 1}/{sortedHints.length}
            </span>
          </div>

          {/* Body */}
          <div className="min-h-[80px] text-xs leading-relaxed text-white/90">
            {loading ? (
              <span className="text-paperDim animate-pulse">Consulting field manual…</span>
            ) : (
              text || "Think about data persistence. Where are the uploaded files stored? Are you using a volume?"
            )}
            {current && current.xpCost > 0 && (
              <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-volt">
                -{current.xpCost} XP
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-3">
            {!isLast && (
              <button
                onClick={() => setIndex((i) => Math.min(i + 1, sortedHints.length - 1))}
                className="flex-1 border border-line bg-surfaceRaised px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-lineLight hover:bg-surfaceHover"
              >
                SHOW ANOTHER HINT
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 border border-acid bg-acid px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-105 active:translate-y-px"
            >
              GOT IT
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
