"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type DocPage } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

const CONCEPT_ORDER = ["containers", "images", "networks", "volumes", "dockerfile", "compose", "troubleshooting", "security"];

export default function ManualIndexPage() {
  const [docs, setDocs] = useState<DocPage[] | null>(null);

  useEffect(() => {
    api.getDocs().then(setDocs).catch(() => setDocs([]));
  }, []);

  const grouped = (docs ?? []).reduce<Record<string, DocPage[]>>((acc, d) => {
    (acc[d.concept] ??= []).push(d);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 font-display text-4xl font-bold text-paper">
        Field <span className="text-acid">Manual</span>
      </h1>
      {CONCEPT_ORDER.filter((c) => grouped[c]?.length).map((concept) => (
        <div key={concept} className="mb-8">
          <h2 className="mb-3 border-b border-line pb-1 text-xs font-bold uppercase tracking-widest text-paper/50">
            {concept}
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {grouped[concept].map((d) => (
              <Link
                key={d.slug}
                href={`/manual/${d.slug}`}
                className="rounded-lg border border-line bg-surface p-3 hover:border-lineLight"
              >
                <div className="mb-1 text-sm font-bold text-paper">{d.title}</div>
                <p className="text-xs text-paper/50">{d.shortExplanation}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
      {docs?.length === 0 && <p className="text-sm text-paper/50">Field manual unavailable — is the API running?</p>}
    </div>
  );
}
