"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, type DocPage } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

export default function ManualDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [doc, setDoc] = useState<DocPage | null | "error">(null);

  useEffect(() => {
    api
      .getDoc(slug)
      .then(setDoc)
      .catch(() => setDoc("error"));
  }, [slug]);

  if (doc === "error") {
    return <div className="p-10 text-sm text-incident">Doc page not found.</div>;
  }
  if (!doc) {
    return <div className="p-10 text-sm text-paper/40">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/manual" className="mb-6 inline-block text-xs text-paper/40 hover:text-acid">
        ← Field manual
      </Link>
      <div className="mb-2">
        <Badge tone="info">{doc.concept}</Badge>
      </div>
      <h1 className="mb-2 font-display text-3xl font-bold text-paper">{doc.title}</h1>
      <p className="mb-6 text-sm text-paper/60">{doc.shortExplanation}</p>
      <p className="mb-6 text-sm leading-relaxed text-paper/80">{doc.body}</p>

      {doc.syntax.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-paper/40">Syntax</div>
          <div className="space-y-1 rounded-lg border border-line bg-surface p-3">
            {doc.syntax.map((s, i) => (
              <div key={i} className="text-xs text-acid">
                $ {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {doc.commonFlags.length > 0 && (
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-paper/40">Common flags</div>
          <div className="divide-y divide-line rounded-lg border border-line">
            {doc.commonFlags.map((f) => (
              <div key={f.flag} className="flex gap-4 bg-surface p-2 text-xs">
                <span className="w-40 shrink-0 font-bold text-paper">{f.flag}</span>
                <span className="text-paper/60">{f.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
