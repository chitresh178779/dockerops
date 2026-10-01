const STEPS = [
  {
    part: "PART 1",
    action: "INVESTIGATE",
    description: "Explore the current environment and identify the issue.",
  },
  {
    part: "PART 2",
    action: "FIX",
    description: "Use Docker commands to configure volumes and persist data.",
  },
  {
    part: "PART 3",
    action: "VERIFY",
    description: "Restart services and confirm data is retained.",
  },
];

export function LevelStructurePanel() {
  return (
    <div className="border border-line bg-surface p-4 font-mono">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white">
        LEVEL STRUCTURE (2-3 PARTS)
      </div>

      <div className="space-y-2">
        {STEPS.map((s, idx) => (
          <div key={s.part}>
            <div className="flex items-center justify-between border border-line bg-[#f5f0e6] p-3 text-black">
              <div className="pr-2">
                <div className="text-xs font-black uppercase tracking-wide text-black">
                  <span className="mr-2 font-black">{s.part}</span> {s.action}
                </div>
                <div className="mt-1 text-[10px] leading-snug text-[#444444]">
                  {s.description}
                </div>
              </div>
              <div className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-black text-black">
                <span className="text-sm font-black text-emerald-700">✓</span>
              </div>
            </div>

            {idx < STEPS.length - 1 && (
              <div className="flex justify-center py-1 text-xs text-paperDim">
                ↓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
