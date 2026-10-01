"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { api, type DocPage } from "@/lib/api";
import { cn } from "@/lib/cn";

export function DocsModal({
  open,
  onOpenChange,
  initialSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSlug?: string;
}) {
  const [docs, setDocs] = useState<DocPage[] | null>(null);
  const [slug, setSlug] = useState<string | undefined>(initialSlug);

  useEffect(() => {
    if (open) {
      setSlug(initialSlug);
      api.getDocs().then(setDocs).catch(() => setDocs([]));
    }
  }, [open, initialSlug]);

  const active = docs?.find((d) => d.slug === slug) ?? docs?.[0];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 border border-line bg-black p-6 shadow-2xl focus:outline-none font-mono">
          {/* Header matching wireframe 08 */}
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <Dialog.Title className="font-display text-base font-bold uppercase tracking-wider text-white">
              DOCS
            </Dialog.Title>
            <Dialog.Close className="text-white/60 hover:text-white" aria-label="Close">
              ✕
            </Dialog.Close>
          </div>

          <div className="grid h-[460px] grid-cols-[180px_1fr] gap-6">
            {/* Left Nav matching wireframe 08 */}
            <div className="space-y-1 overflow-y-auto border-r border-line pr-3">
              {docs?.map((d) => {
                const isSelected = active?.slug === d.slug;
                return (
                  <button
                    key={d.slug}
                    onClick={() => setSlug(d.slug)}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-xs font-bold transition-colors",
                      isSelected
                        ? "bg-white text-black font-extrabold"
                        : "text-[#8e8e93] hover:text-white hover:bg-surfaceRaised",
                    )}
                  >
                    {d.title}
                  </button>
                );
              })}
            </div>

            {/* Right content matching wireframe 08 */}
            <div className="overflow-y-auto pr-2">
              {!active && <p className="text-xs text-paperDim">Loading documentation…</p>}
              {active && (
                <div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white">
                    DOCKER {active.title.toUpperCase()}
                  </h3>
                  <p className="mt-1 text-xs text-[#a1a1aa] leading-relaxed">
                    {active.shortExplanation}
                  </p>

                  {/* Common commands */}
                  <div className="mt-6">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white">
                      COMMON COMMANDS
                    </div>
                    <div className="divide-y divide-line/40 border border-line bg-[#090a0d] p-3 text-[11px]">
                      {active.syntax.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 font-mono"
                        >
                          <span className="font-bold text-volt">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {active.commonFlags.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white">
                        OPTIONS &amp; FLAGS
                      </div>
                      <div className="divide-y divide-line/50 border border-line bg-surfaceRaised">
                        {active.commonFlags.map((f) => (
                          <div key={f.flag} className="flex gap-4 p-2.5 text-[11px]">
                            <span className="w-32 shrink-0 font-bold text-white">{f.flag}</span>
                            <span className="text-[#a1a1aa]">{f.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-[#8e8e93]">
                    {active.body}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
