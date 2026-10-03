"use client";

import { useState } from "react";
import type { PublicPart } from "@/lib/api";
import { HintModal } from "./HintModal";
import { DocsModal } from "./DocsModal";

export function ObjectiveBar({ sessionId, part }: { sessionId: string; part: PublicPart }) {
  const [hintOpen, setHintOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-black px-4 py-2 font-mono">
      <div className="flex items-center gap-2.5">
        <span className="border border-volt bg-black px-2 py-0.5 text-[9px] font-bold uppercase text-volt">
          {part.kind}
        </span>
        <span className="text-xs font-bold text-white">{part.title}</span>
        <span className="hidden text-xs text-[#8e8e93] md:inline">— {part.objective}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setDocsOpen(true)}
          className="border border-line bg-surfaceRaised px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:border-lineLight hover:bg-surfaceHover"
        >
          DOCS
        </button>
        {part.hints && part.hints.length > 0 && (
          <button
            onClick={() => setHintOpen(true)}
            className="border border-acid/50 bg-acid/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-acid transition-colors hover:bg-acid/20"
          >
            HINT
          </button>
        )}
      </div>

      <HintModal
        key={part.id}
        open={hintOpen}
        onOpenChange={setHintOpen}
        sessionId={sessionId}
        part={part}
      />
      <DocsModal open={docsOpen} onOpenChange={setDocsOpen} initialSlug={part.docRefs?.[0]} />
    </div>
  );
}
