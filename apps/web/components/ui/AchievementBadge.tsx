import { cn } from "@/lib/cn";

export type AchievementCategory =
  | "container"
  | "volume"
  | "network"
  | "debug"
  | "security"
  | "scale"
  | "compose"
  | "capstone";

export function getAchievementCategory(title: string, description = ""): AchievementCategory {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("volume") || text.includes("upload") || text.includes("persist") || text.includes("data survivor")) {
    return "volume";
  }
  if (text.includes("network") || text.includes("bridge") || text.includes("resolution") || text.includes("islands")) {
    return "network";
  }
  if (text.includes("debug") || text.includes("detective") || text.includes("tag") || text.includes("trouble") || text.includes("health")) {
    return "debug";
  }
  if (text.includes("privilege") || text.includes("security") || text.includes("defender") || text.includes("root")) {
    return "security";
  }
  if (text.includes("scale") || text.includes("fleet") || text.includes("worker") || text.includes("bottleneck")) {
    return "scale";
  }
  if (text.includes("compose") || text.includes("stack") || text.includes("services")) {
    return "compose";
  }
  if (text.includes("capstone") || text.includes("graduate") || text.includes("full stack")) {
    return "capstone";
  }
  return "container";
}

interface AchievementBadgeProps {
  title: string;
  description?: string;
  unlocked?: boolean;
  className?: string;
}

export function AchievementBadge({
  title,
  description = "",
  unlocked = false,
  className,
}: AchievementBadgeProps) {
  const category = getAchievementCategory(title, description);

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center border transition-all",
        unlocked
          ? "border-black/90 bg-[#facc15] text-black shadow-sm"
          : "border-white/20 bg-[#0c0d10] text-white/50",
        className,
      )}
      title={`${title} (${unlocked ? "Unlocked" : "Locked"})`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
        aria-hidden="true"
      >
        {/* Universal Military Crest Shield Frame */}
        <path d="M12 2L4 5.5v5.5c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5.5L12 2zm0 2.2l6 2.6v4.7c0 3.8-2.6 7-6 8.7-3.4-1.7-6-4.9-6-8.7V6.8l6-2.6z" />

        {/* Specialized In-game Trophy Insignia */}
        {category === "volume" && (
          /* Volume / Storage 3-Tier Database Cylinder */
          <path d="M12 7c-2.2 0-4 .6-4 1.3v1.4c0 .7 1.8 1.3 4 1.3s4-.6 4-1.3V8.3c0-.7-1.8-1.3-4-1.3zm-4 4.1v1.4c0 .7 1.8 1.3 4 1.3s4-.6 4-1.3v-1.4c-.8.5-2.3.8-4 .8s-3.2-.3-4-.8zm0 2.7v1.4c0 .7 1.8 1.3 4 1.3s4-.6 4-1.3v-1.4c-.8.5-2.3.8-4 .8s-3.2-.3-4-.8z" />
        )}

        {category === "network" && (
          /* Network Tri-Node Mesh */
          <g>
            <circle cx="12" cy="7.8" r="1.6" />
            <circle cx="8" cy="14" r="1.6" />
            <circle cx="16" cy="14" r="1.6" />
            <path
              d="M11 9.2l-2 3.6m4-3.6l2 3.6m-5.8.6h4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        )}

        {category === "debug" && (
          /* Diagnostic Tools & Scope */
          <g>
            <path d="M14.6 7.5a2.2 2.2 0 00-2.8.5l-.8.8 3.3 3.3.8-.8a2.2 2.2 0 00.5-2.8l-1-1zm-4.3 2.1l-3.2 3.2a1 1 0 000 1.4l.6.6a1 1 0 001.4 0l3.2-3.2-2-2z" />
            <circle cx="12" cy="11.5" r="1" />
          </g>
        )}

        {category === "security" && (
          /* Padlock / Shielded Defense */
          <path d="M10 9V8a2 2 0 014 0v1h.8a.7.7 0 01.7.7v4.6a.7.7 0 01-.7.7H8.5a.7.7 0 01-.7-.7V9.7a.7.7 0 01.7-.7H10zm1.2 0h1.6V8a.8.8 0 00-1.6 0v1zm.8 2.2a.8.8 0 00-.5 1.4v1.1h1v-1.1a.8.8 0 00-.5-1.4z" />
        )}

        {category === "scale" && (
          /* Multi-Worker Cluster Chevrons */
          <g>
            <rect x="7.5" y="7.5" width="9" height="1.8" rx="0.3" />
            <rect x="7.5" y="10.2" width="9" height="1.8" rx="0.3" />
            <rect x="7.5" y="12.9" width="9" height="1.8" rx="0.3" />
          </g>
        )}

        {category === "compose" && (
          /* Microservices Stack */
          <path d="M12 7l4 2-4 2-4-2 4-2zm-4 3.2l4 2 4-2v1.6l-4 2-4-2v-1.6zm0 2.6l4 2 4-2v1.6l-4 2-4-2v-1.6z" />
        )}

        {category === "capstone" && (
          /* Capstone Honor Star */
          <path d="M12 6.8l1.5 3.1 3.5.5-2.5 2.4.6 3.5-3.1-1.6-3.1 1.6.6-3.5-2.5-2.4 3.5-.5L12 6.8z" />
        )}

        {category === "container" && (
          /* Cargo Container with Corrugated Vertical Slots */
          <path d="M7 8h10v7H7V8zm1.5 1.5v4h1.5v-4h-1.5zm2.5 0v4h2v-4h-2zm3 0v4h1.5v-4H14z" />
        )}
      </svg>
    </div>
  );
}
