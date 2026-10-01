import React from "react";
import { cn } from "@/lib/cn";

export interface AvatarPreset {
  id: string;
  name: string;
  callsign: string;
  role: string;
  description: string;
  accent: string;
  renderSvg: (className?: string) => React.ReactNode;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "cyber-moby",
    name: "Moby Core",
    callsign: "MOBY-01",
    role: "System Engine",
    description: "Cybernetic Docker flagship with reactor-powered container racks.",
    accent: "#00ff66",
    renderSvg: (className) => (
      <svg viewBox="0 0 80 80" fill="none" className={cn("h-full w-full", className)}>
        {/* Background */}
        <rect width="80" height="80" fill="#080c10" />
        {/* Grid lines */}
        <path d="M0 20h80M0 40h80M0 60h80M20 0v80M40 0v80M60 0v80" stroke="#16222f" strokeWidth="0.8" />
        
        {/* Container stacks on whale back */}
        <g fill="#00ff66" opacity="0.9">
          <rect x="22" y="27" width="7" height="6" rx="0.5" stroke="#000" strokeWidth="0.8" />
          <rect x="31" y="27" width="7" height="6" rx="0.5" stroke="#000" strokeWidth="0.8" />
          <rect x="40" y="27" width="7" height="6" rx="0.5" stroke="#000" strokeWidth="0.8" />
          <rect x="31" y="19" width="7" height="6" rx="0.5" stroke="#000" strokeWidth="0.8" />
          <rect x="40" y="19" width="7" height="6" rx="0.5" stroke="#000" strokeWidth="0.8" />
          <rect x="40" y="11" width="7" height="6" rx="0.5" stroke="#000" strokeWidth="0.8" />
        </g>
        
        {/* Whale Body */}
        <path
          d="M14 36c4-1 10-1 42 0 4 .1 10 1.2 13 4 2 2 3 5 1 7-2 2-6 2-7 1 0 3-2 7-6 10-7 5-18 8-30 8-10 0-16-4-19-10-2-4-2-12 9-20z"
          fill="#0e2338"
          stroke="#00ff66"
          strokeWidth="1.5"
        />
        {/* Whale Tail Fluke */}
        <path
          d="M69 40c3-3 7-5 9-4 1 2-1 6-4 8 2 2 3 5 1 6-2 1-5-1-6-4"
          fill="#00ff66"
          opacity="0.85"
        />
        {/* Cyber Optic Eye */}
        <circle cx="25" cy="46" r="3" fill="#00ff66" />
        <circle cx="25" cy="46" r="1.2" fill="#fff" />
        <line x1="22" y1="46" x2="16" y2="46" stroke="#00ff66" strokeWidth="1" />
        {/* Circuit accent */}
        <path d="M35 52h14l4 4h8" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "root-ghost",
    name: "Root Ghost",
    callsign: "GHOST-UID0",
    role: "Terminal Hacker",
    description: "Stealth security researcher specialized in privilege escalation forensics.",
    accent: "#38bdf8",
    renderSvg: (className) => (
      <svg viewBox="0 0 80 80" fill="none" className={cn("h-full w-full", className)}>
        <rect width="80" height="80" fill="#07090e" />
        {/* Hood Shadow */}
        <path d="M40 10c-15 0-25 12-26 26 0 16 6 34 26 36 20-2 26-20 26-36 0-14-11-26-26-26z" fill="#111622" stroke="#25334d" strokeWidth="1.5" />
        {/* Inner Dark Mask */}
        <path d="M40 22c-9 0-16 8-17 18 0 11 5 21 17 22 12-1 17-11 17-22 0-10-8-18-17-18z" fill="#040508" />
        {/* Cyber Neon Visor */}
        <path d="M26 38h28v6H26z" fill="#0284c7" />
        <line x1="25" y1="41" x2="55" y2="41" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="41" x2="52" y2="41" stroke="#fff" strokeWidth="1" />
        {/* Terminal glyphs on collar */}
        <path d="M33 66l4-4-4-4M41 66h7" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "sre-sentry",
    name: "SRE Sentry",
    callsign: "OPS-911",
    role: "Site Reliability",
    description: "Always-on 24/7 on-call guardian with dual night-vision telemetry goggles.",
    accent: "#facc15",
    renderSvg: (className) => (
      <svg viewBox="0 0 80 80" fill="none" className={cn("h-full w-full", className)}>
        <rect width="80" height="80" fill="#0a0a06" />
        {/* Head/Helmet silhouette */}
        <rect x="22" y="16" width="36" height="46" rx="8" fill="#1a1c12" stroke="#3e4324" strokeWidth="1.5" />
        {/* Dual Night Vision Optics */}
        <circle cx="33" cy="38" r="8" fill="#000" stroke="#facc15" strokeWidth="2" />
        <circle cx="33" cy="38" r="4.5" fill="#facc15" opacity="0.9" />
        <circle cx="33" cy="38" r="2" fill="#fff" />
        <circle cx="47" cy="38" r="8" fill="#000" stroke="#facc15" strokeWidth="2" />
        <circle cx="47" cy="38" r="4.5" fill="#facc15" opacity="0.9" />
        <circle cx="47" cy="38" r="2" fill="#fff" />
        {/* NVG Bridge */}
        <rect x="37" y="36" width="6" height="4" fill="#facc15" />
        {/* Tactical Headset & Comms */}
        <rect x="18" y="32" width="5" height="14" rx="2" fill="#3e4324" />
        <rect x="57" y="32" width="5" height="14" rx="2" fill="#3e4324" />
        <path d="M21 44c0 10 12 14 18 14" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="40" cy="58" r="2.5" fill="#facc15" />
        {/* Status Led */}
        <circle cx="51" cy="24" r="1.5" fill="#00ff66" />
      </svg>
    ),
  },
  {
    id: "kernel-daemon",
    name: "Daemon X",
    callsign: "PID-001",
    role: "Kernel Specialist",
    description: "Low-level system watchdog with high-frequency antenna and cgroup isolation.",
    accent: "#ef4444",
    renderSvg: (className) => (
      <svg viewBox="0 0 80 80" fill="none" className={cn("h-full w-full", className)}>
        <rect width="80" height="80" fill="#0d0707" />
        {/* Cyber Horn Antennae */}
        <path d="M24 22L16 10l12 6M56 22l8-12-12 6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        {/* Cyber Skull Faceplate */}
        <polygon points="40,16 60,26 56,54 48,66 32,66 24,54 20,26" fill="#1a0f0f" stroke="#ef4444" strokeWidth="1.5" />
        {/* Angular Red Eye Slits */}
        <polygon points="28,34 37,36 34,40 27,37" fill="#ef4444" />
        <polygon points="52,34 43,36 46,40 53,37" fill="#ef4444" />
        {/* Forehead Reticle */}
        <circle cx="40" cy="27" r="3" stroke="#ef4444" strokeWidth="1" />
        <circle cx="40" cy="27" r="1" fill="#fff" />
        {/* Cyber Ventilation Grill */}
        <line x1="34" y1="52" x2="46" y2="52" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="36" y1="56" x2="44" y2="56" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="38" y1="60" x2="42" y2="60" stroke="#ef4444" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "cargo-captain",
    name: "Fleet Captain",
    callsign: "NAVI-CAP",
    role: "Cluster Admiral",
    description: "Veteran sea dog commanding container armadas through multi-cloud storms.",
    accent: "#38bdf8",
    renderSvg: (className) => (
      <svg viewBox="0 0 80 80" fill="none" className={cn("h-full w-full", className)}>
        <rect width="80" height="80" fill="#080e14" />
        {/* Captain Hat Crown */}
        <path d="M18 24c0-7 10-12 22-12s22 5 22 12l2 6H16l2-6z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
        {/* Hat Visor / Peak */}
        <path d="M14 30h52c-4 6-18 8-26 8s-22-2-26-8z" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
        {/* Gold Hat Badge (Docker Whale Anchor) */}
        <circle cx="40" cy="22" r="5" fill="#facc15" />
        <path d="M38 22h4M40 20v5M38 24a2 2 0 004 0" stroke="#000" strokeWidth="1" />
        {/* Face */}
        <path d="M26 36h28v18c0 7-6 12-14 12s-14-5-14-12V36z" fill="#151d28" stroke="#334155" strokeWidth="1.2" />
        {/* Cyber Eyepatch (Right eye) */}
        <polygon points="43,40 51,40 49,48 44,47" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="46.5" cy="43.5" r="1.5" fill="#fff" />
        <line x1="38" y1="36" x2="54" y2="50" stroke="#38bdf8" strokeWidth="0.8" />
        {/* Normal Eye (Left) */}
        <rect x="30" y="42" width="6" height="2" fill="#fff" />
        {/* Beard / Stern Jaw */}
        <path d="M30 52c3 4 17 4 20 0" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        {/* Uniform Collar */}
        <path d="M20 68l10-10h20l10 10v12H20V68z" fill="#0f172a" stroke="#0284c7" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "packet-phantom",
    name: "Packet Phantom",
    callsign: "NET-TRACE",
    role: "Network Architect",
    description: "Spectral engineer monitoring packet flow across overlay bridges.",
    accent: "#a855f7",
    renderSvg: (className) => (
      <svg viewBox="0 0 80 80" fill="none" className={cn("h-full w-full", className)}>
        <rect width="80" height="80" fill="#0d0714" />
        {/* Helmet Base */}
        <circle cx="40" cy="40" r="26" fill="#170e24" stroke="#a855f7" strokeWidth="1.5" />
        {/* Concentric Radar HUD */}
        <circle cx="40" cy="40" r="18" stroke="#c084fc" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="40" cy="40" r="10" stroke="#c084fc" strokeWidth="0.8" opacity="0.8" />
        <line x1="14" y1="40" x2="66" y2="40" stroke="#a855f7" strokeWidth="1" opacity="0.4" />
        <line x1="40" y1="14" x2="40" y2="66" stroke="#a855f7" strokeWidth="1" opacity="0.4" />
        {/* Radar Sweep Ray */}
        <line x1="40" y1="40" x2="56" y2="24" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round" />
        {/* Network Packet Blips */}
        <circle cx="48" cy="32" r="2.5" fill="#a855f7" />
        <circle cx="32" cy="46" r="2" fill="#c084fc" />
        <circle cx="45" cy="50" r="1.5" fill="#e9d5ff" />
      </svg>
    ),
  },
  {
    id: "mech-builder",
    name: "Mech Builder",
    callsign: "DOCKERFILE",
    role: "Build Master",
    description: "Heavy multi-stage compiler equipped with industrial layer caching armor.",
    accent: "#f97316",
    renderSvg: (className) => (
      <svg viewBox="0 0 80 80" fill="none" className={cn("h-full w-full", className)}>
        <rect width="80" height="80" fill="#0d0905" />
        {/* Heavy Welder Helmet */}
        <path d="M22 18h36v46H22z" fill="#1c140d" stroke="#f97316" strokeWidth="1.5" />
        <polygon points="22,18 40,12 58,18" fill="#2b1e13" stroke="#f97316" strokeWidth="1.5" />
        {/* Welder Visor Mask */}
        <rect x="28" y="28" width="24" height="12" rx="2" fill="#000" stroke="#f97316" strokeWidth="1.8" />
        <rect x="30" y="31" width="20" height="6" fill="#fb923c" />
        <line x1="32" y1="34" x2="48" y2="34" stroke="#fff" strokeWidth="1.2" />
        {/* Hazard Stripes Base */}
        <g stroke="#f97316" strokeWidth="3">
          <line x1="24" y1="52" x2="30" y2="58" />
          <line x1="32" y1="52" x2="38" y2="58" />
          <line x1="40" y1="52" x2="46" y2="58" />
          <line x1="48" y1="52" x2="54" y2="58" />
        </g>
      </svg>
    ),
  },
  {
    id: "terminal-core",
    name: "Terminal Core",
    callsign: "TTY-ZERO",
    role: "Console AI",
    description: "Phosphor-green retro terminal consciousness monitoring system logs.",
    accent: "#22c55e",
    renderSvg: (className) => (
      <svg viewBox="0 0 80 80" fill="none" className={cn("h-full w-full", className)}>
        <rect width="80" height="80" fill="#060d08" />
        {/* CRT Monitor Frame */}
        <rect x="14" y="14" width="52" height="46" rx="6" fill="#101f14" stroke="#22c55e" strokeWidth="1.8" />
        {/* Inner Curved Phosphor Screen */}
        <rect x="20" y="20" width="40" height="34" rx="3" fill="#041208" stroke="#15803d" strokeWidth="1" />
        {/* Terminal Text Lines */}
        <path d="M24 28h12M24 34h20M24 40h8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        {/* Glowing Prompt Cursor */}
        <rect x="34" y="38" width="4" height="4" fill="#22c55e" />
        {/* Power LED & Controls */}
        <circle cx="56" cy="54" r="1.5" fill="#22c55e" />
        <rect x="42" y="53" width="8" height="2" rx="1" fill="#15803d" />
        {/* Monitor Base Stand */}
        <path d="M32 60h16v6l6 4H26l6-4v-6z" fill="#0a150e" stroke="#22c55e" strokeWidth="1.2" />
      </svg>
    ),
  },
];
