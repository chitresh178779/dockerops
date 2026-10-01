export function UnlocksPanel() {
  return (
    <div className="border border-line bg-surface p-4 font-mono">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white">
        WHAT A LEVEL UNLOCKS
      </div>

      <div className="space-y-2">
        {/* Item 1 */}
        <div className="flex items-center gap-3 border border-line bg-surfaceRaised/50 px-3 py-2 text-xs text-white">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-black text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" />
            </svg>
          </div>
          <span className="text-[11px] font-medium text-white/90">New Docker concepts</span>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-3 border border-line bg-surfaceRaised/50 px-3 py-2 text-xs text-white">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-black text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <rect x="9" y="3" width="6" height="4" />
              <rect x="3" y="17" width="6" height="4" />
              <rect x="15" y="17" width="6" height="4" />
              <path d="M12 7v5" />
              <path d="M6 17v-3h12v3" />
            </svg>
          </div>
          <span className="text-[11px] font-medium text-white/90">More objects in environment tree</span>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-3 border border-line bg-surfaceRaised/50 px-3 py-2 text-xs text-white">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-black text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <span className="text-[11px] font-medium text-white/90">New commands available</span>
        </div>

        {/* Item 4 */}
        <div className="flex items-center gap-3 border border-line bg-surfaceRaised/50 px-3 py-2 text-xs text-white">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-black text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <span className="text-[11px] font-medium text-white/90">More complex infrastructure</span>
        </div>

        {/* Item 5 */}
        <div className="flex items-center gap-3 border border-line bg-surfaceRaised/50 px-3 py-2 text-xs text-white">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-black text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <rect x="5" y="11" width="14" height="10" rx="1" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <span className="text-[11px] font-medium text-white/90">Access to next level</span>
        </div>
      </div>
    </div>
  );
}
