"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { sfx } from "@/lib/audio";
import Link from "next/link";

interface Chapter {
  id: number;
  epoch: string;
  title: string;
  tagline: string;
  narrative: string[];
  takeaway: string;
  accent: string;
  renderIllustration: () => React.ReactNode;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    epoch: "THE DARK AGES // CIRCA 2000s",
    title: "THE 'IT WORKS ON MY MACHINE' CURSE",
    tagline: "Before containers, deploying software was a multi-day gamble.",
    narrative: [
      "In the early days of software engineering, development and production lived in separate dimensions. A developer wrote code on their laptop with Ubuntu and Python 2.7, tested it, and it worked flawlessly.",
      "The moment that code was pushed to production on a RedHat server with Python 2.6 and a slightly different glibc version, the application crashed immediately. Missing system libraries, conflicting path variables, and mismatched database drivers turned every deployment into a chaotic firefighting drill.",
      "Engineers coined the universal excuse: 'Well, it worked on my machine!' To which operations teams responded: 'Then we'll have to ship your laptop to the datacenter.'",
    ],
    takeaway: "Core Problem: Code ran differently on every computer because operating system environments were never identical.",
    accent: "#ef4444",
    renderIllustration: () => (
      <svg viewBox="0 0 400 240" fill="none" className="w-full h-full">
        {/* Background Grid */}
        <rect width="400" height="240" fill="#080a0f" />
        <path d="M0 40h400M0 80h400M0 120h400M0 160h400M0 200h400M50 0v240M100 0v240M150 0v240M200 0v240M250 0v240M300 0v240M350 0v240" stroke="#131c26" strokeWidth="0.8" />
        
        {/* Left Laptop: Dev Machine */}
        <g transform="translate(40, 60)">
          <rect x="0" y="0" width="120" height="80" rx="3" fill="#0e1722" stroke="#22c55e" strokeWidth="1.5" />
          <rect x="10" y="10" width="100" height="60" fill="#050a0f" />
          <path d="M20 25h40M20 35h60M20 45h30" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
          <text x="20" y="60" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">PASS ✓ 100%</text>
          {/* Laptop Base */}
          <path d="M-15 80h150l-10 12H-5z" fill="#182333" stroke="#22c55e" strokeWidth="1.2" />
          <text x="25" y="105" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">DEV LAPTOP</text>
        </g>

        {/* Broken Bridge / Conflict in Center */}
        <g transform="translate(185, 80)">
          <path d="M0 20h30" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="15" cy="20" r="14" fill="#1f1010" stroke="#ef4444" strokeWidth="1.5" />
          <text x="11" y="24" fill="#ef4444" fontSize="13" fontFamily="monospace" fontWeight="black">✕</text>
          <text x="-10" y="48" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">MISMATCH!</text>
        </g>

        {/* Right Server: Production Crash */}
        <g transform="translate(240, 45)">
          <rect x="0" y="0" width="110" height="110" rx="2" fill="#1a0c0c" stroke="#ef4444" strokeWidth="1.8" />
          <rect x="10" y="15" width="90" height="18" fill="#0a0505" stroke="#3d1414" />
          <circle cx="20" cy="24" r="3" fill="#ef4444" />
          <rect x="10" y="45" width="90" height="18" fill="#0a0505" stroke="#3d1414" />
          <circle cx="20" cy="54" r="3" fill="#ef4444" />
          <rect x="10" y="75" width="90" height="18" fill="#0a0505" stroke="#3d1414" />
          <circle cx="20" cy="84" r="3" fill="#facc15" />
          {/* Smoke / Alarm icon */}
          <path d="M70 18l5-8M75 18l5-8M80 18l5-8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          <text x="18" y="132" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">PROD CRASH</text>
        </g>
      </svg>
    ),
  },
  {
    id: 2,
    epoch: "THE HYPERVISOR ERA // CIRCA 2008",
    title: "THE VIRTUAL MACHINE DILEMMA",
    tagline: "Virtual Machines solved isolation, but at a massive cost.",
    narrative: [
      "To prevent applications from conflicting on the same physical server, engineers turned to Virtual Machines (VMs). A Hypervisor allowed multiple isolated environments to run on a single machine.",
      "However, every single VM required its own entire Guest Operating System—complete with its own kernel, memory management, system binaries, and gigabytes of storage.",
      "Running a lightweight 5MB microservice required spinning up an entire 2GB Linux operating system that took 3 to 5 minutes to boot. 80% of server compute was wasted running duplicate operating system kernels.",
    ],
    takeaway: "Core Problem: Virtual Machines were too heavy, took minutes to boot, and wasted huge amounts of RAM on redundant operating systems.",
    accent: "#facc15",
    renderIllustration: () => (
      <svg viewBox="0 0 400 240" fill="none" className="w-full h-full">
        <rect width="400" height="240" fill="#080a0f" />
        <path d="M0 40h400M0 80h400M0 120h400M0 160h400M0 200h400M50 0v240M100 0v240M150 0v240M200 0v240M250 0v240M300 0v240M350 0v240" stroke="#131c26" strokeWidth="0.8" />
        
        {/* Physical Hardware Base */}
        <rect x="40" y="180" width="320" height="28" fill="#182333" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="110" y="198" fill="#fff" fontSize="10" fontFamily="monospace" fontWeight="bold">HOST PHYSICAL HARDWARE (CPU / RAM / DISK)</text>

        {/* Hypervisor Layer */}
        <rect x="40" y="145" width="320" height="24" fill="#1e1833" stroke="#a855f7" strokeWidth="1.5" />
        <text x="150" y="161" fill="#c084fc" fontSize="10" fontFamily="monospace" fontWeight="bold">HYPERVISOR (TYPE 1 / 2)</text>

        {/* Heavy VM 1 */}
        <g transform="translate(50, 30)">
          <rect x="0" y="0" width="135" height="105" fill="#141006" stroke="#facc15" strokeWidth="1.5" />
          <rect x="8" y="8" width="119" height="22" fill="#292005" stroke="#facc15" />
          <text x="25" y="23" fill="#facc15" fontSize="9" fontFamily="monospace" fontWeight="bold">APP A (5 MB)</text>
          
          <rect x="8" y="34" width="119" height="22" fill="#1a140a" stroke="#ca8a04" />
          <text x="20" y="49" fill="#ca8a04" fontSize="9" fontFamily="monospace">Bins / Libs (150 MB)</text>
          
          <rect x="8" y="60" width="119" height="36" fill="#331c05" stroke="#ca8a04" />
          <text x="15" y="78" fill="#facc15" fontSize="9" fontFamily="monospace" fontWeight="bold">GUEST OS KERNEL</text>
          <text x="32" y="90" fill="#facc15" fontSize="8" fontFamily="monospace">(2.5 GB!)</text>
        </g>

        {/* Heavy VM 2 */}
        <g transform="translate(215, 30)">
          <rect x="0" y="0" width="135" height="105" fill="#141006" stroke="#facc15" strokeWidth="1.5" />
          <rect x="8" y="8" width="119" height="22" fill="#292005" stroke="#facc15" />
          <text x="25" y="23" fill="#facc15" fontSize="9" fontFamily="monospace" fontWeight="bold">APP B (8 MB)</text>
          
          <rect x="8" y="34" width="119" height="22" fill="#1a140a" stroke="#ca8a04" />
          <text x="20" y="49" fill="#ca8a04" fontSize="9" fontFamily="monospace">Bins / Libs (180 MB)</text>
          
          <rect x="8" y="60" width="119" height="36" fill="#331c05" stroke="#ca8a04" />
          <text x="15" y="78" fill="#facc15" fontSize="9" fontFamily="monospace" fontWeight="bold">GUEST OS KERNEL</text>
          <text x="32" y="90" fill="#facc15" fontSize="8" fontFamily="monospace">(2.5 GB!)</text>
        </g>
      </svg>
    ),
  },
  {
    id: 3,
    epoch: "THE 1956 EPIPHANY // GLOBAL COMMERCE",
    title: "THE SHIPPING CONTAINER REVOLUTION",
    tagline: "A real-world shipping breakthrough inspired the future of software.",
    narrative: [
      "Before 1956, oceanic shipping was pure chaos. Stevedores had to manually pack crates of whiskey, sacks of flour, pianos, and barrels of oil into ship hulls by hand. Unloading took weeks, cargo broke constantly, and cargo was stranded between trains and trucks.",
      "An entrepreneur named Malcom McLean revolutionized the world economy by inventing the standardized 20-foot steel intermodal container. It didn't matter what was inside—coffee, cars, or computers.",
      "Every crane, truck chassis, rail car, and cargo ship on Earth was engineered around one universal standard dimension. Loading times dropped from weeks to hours, and international trade exploded.",
    ],
    takeaway: "The Breakthrough: Standardize the shipping box rather than trying to standardize every individual item.",
    accent: "#38bdf8",
    renderIllustration: () => (
      <svg viewBox="0 0 400 240" fill="none" className="w-full h-full">
        <rect width="400" height="240" fill="#080a0f" />
        {/* Ocean Waves */}
        <path d="M0 180c50 8 100-8 150 0s100 8 150 0 100 8 100 0v60H0z" fill="#061a2e" />
        <path d="M0 200c40 5 80-5 120 0s80 5 120 0 80 5 120 0 80 5 40 0v40H0z" fill="#041220" />

        {/* Cargo Vessel Hull */}
        <path d="M50 140h280l-30 40H90z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="270" y="105" width="45" height="35" fill="#334155" stroke="#38bdf8" />
        <rect x="285" y="90" width="15" height="15" fill="#475569" stroke="#38bdf8" />
        <line x1="292" y1="80" x2="292" y2="90" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Stacked Standardized Cargo Containers */}
        <g stroke="#000" strokeWidth="0.8">
          {/* Row 1 */}
          <rect x="90" y="122" width="34" height="18" fill="#ef4444" />
          <rect x="128" y="122" width="34" height="18" fill="#3b82f6" />
          <rect x="166" y="122" width="34" height="18" fill="#facc15" />
          <rect x="204" y="122" width="34" height="18" fill="#22c55e" />
          {/* Row 2 */}
          <rect x="105" y="102" width="34" height="18" fill="#38bdf8" />
          <rect x="143" y="102" width="34" height="18" fill="#a855f7" />
          <rect x="181" y="102" width="34" height="18" fill="#f97316" />
          {/* Row 3 */}
          <rect x="124" y="82" width="34" height="18" fill="#22c55e" />
          <rect x="162" y="82" width="34" height="18" fill="#ef4444" />
        </g>

        {/* Crane Hook Lowering a Container */}
        <line x1="210" y1="10" x2="210" y2="55" stroke="#facc15" strokeWidth="1.8" />
        <path d="M205 55l5 7 5-7" stroke="#facc15" strokeWidth="1.8" fill="none" />
        <rect x="193" y="62" width="34" height="18" fill="#00ff66" stroke="#000" strokeWidth="0.8" />
        
        <text x="65" y="225" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">MALCOM MCLEAN'S 1956 INTERMODAL CONTAINER REVOLUTION</text>
      </svg>
    ),
  },
  {
    id: 4,
    epoch: "THE REVOLUTION // 2013",
    title: "SOLOMON HYKES & THE BIRTH OF DOCKER",
    tagline: "Software finally got its standardized shipping container.",
    narrative: [
      "In 2013, Solomon Hykes and the team at dotCloud in Paris realized code needed the exact same breakthrough. Linux already had powerful low-level kernel isolation features—namespaces (for process isolation) and cgroups (for CPU/memory limits)—but they were brutally complex to configure.",
      "Docker wrapped these kernel primitives into an elegant, standardized format: the Dockerfile and the Docker Container Image. An image packages your code, runtime, system libraries, and configs into a single immutable artifact.",
      "Unlike a Virtual Machine, containers share the host Linux kernel. They require NO guest OS, take megabytes instead of gigabytes, and boot in fractions of a second.",
    ],
    takeaway: "The Docker Miracle: Fast (milliseconds), lightweight (shares kernel), and 100% reproducible anywhere Docker runs.",
    accent: "#00ff66",
    renderIllustration: () => (
      <svg viewBox="0 0 400 240" fill="none" className="w-full h-full">
        <rect width="400" height="240" fill="#080a0f" />
        <path d="M0 40h400M0 80h400M0 120h400M0 160h400M0 200h400M50 0v240M100 0v240M150 0v240M200 0v240M250 0v240M300 0v240M350 0v240" stroke="#131c26" strokeWidth="0.8" />

        {/* Moby Dock Whale */}
        <g transform="translate(60, 60)">
          {/* Stacks on Whale Back */}
          <g fill="#00ff66" stroke="#000" strokeWidth="1">
            <rect x="100" y="40" width="22" height="15" rx="1" />
            <rect x="126" y="40" width="22" height="15" rx="1" />
            <rect x="152" y="40" width="22" height="15" rx="1" />
            <rect x="126" y="22" width="22" height="15" rx="1" />
            <rect x="152" y="22" width="22" height="15" rx="1" />
            <rect x="152" y="4" width="22" height="15" rx="1" />
          </g>

          {/* Whale Body */}
          <path
            d="M60 65c15-4 40-4 140 0 15 .5 35 4 45 12 8 7 10 16 4 24-8 8-20 8-24 4 0 10-8 24-22 34-24 18-62 26-105 26-35 0-55-14-65-34-8-14-8-42 27-66z"
            fill="#0f263e"
            stroke="#00ff66"
            strokeWidth="2.5"
          />
          {/* Whale Tail */}
          <path
            d="M245 78c10-10 24-16 32-14 4 6-4 20-14 26 6 6 10 16 4 20-8 4-18-4-22-14"
            fill="#00ff66"
          />
          {/* Whale Eye */}
          <circle cx="95" cy="100" r="6" fill="#00ff66" />
          <circle cx="95" cy="100" r="2.5" fill="#fff" />
          {/* Smile line */}
          <path d="M78 115c12 10 28 8 36 0" stroke="#00ff66" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* Feature badges */}
        <g transform="translate(40, 195)">
          <rect x="0" y="0" width="95" height="24" fill="#0f2618" stroke="#00ff66" />
          <text x="10" y="16" fill="#00ff66" fontSize="9" fontFamily="monospace" fontWeight="bold">NAMESPACES</text>
        </g>
        <g transform="translate(150, 195)">
          <rect x="0" y="0" width="95" height="24" fill="#0f2618" stroke="#00ff66" />
          <text x="18" y="16" fill="#00ff66" fontSize="9" fontFamily="monospace" fontWeight="bold">CGROUPS</text>
        </g>
        <g transform="translate(260, 195)">
          <rect x="0" y="0" width="105" height="24" fill="#0f2618" stroke="#00ff66" />
          <text x="12" y="16" fill="#00ff66" fontSize="9" fontFamily="monospace" fontWeight="bold">SHARED KERNEL</text>
        </g>
      </svg>
    ),
  },
  {
    id: 5,
    epoch: "THE DOCKEROPS REALITY // PRESENT DAY",
    title: "YOUR MISSION: MASTER THE ENGINE",
    tagline: "Containers run the world. Skilled operators keep them running.",
    narrative: [
      "Today, over 90% of global cloud infrastructure runs on Docker and OCI containers. From Netflix streaming movies to banking transaction engines, containers power modern civilization.",
      "But containers are not magic. In production, things go wrong: ports get mismapped, volumes unmount and lose customer data, bridge networks isolate services, and bad Dockerfile layers bloat images.",
      "That is why DockerOps exists. You aren't playing a multiple-choice quiz—you are commanding a real Docker Engine in an isolated sandbox. You will troubleshoot real incidents, write real commands, and earn your stripes as a certified Site Reliability Engineer.",
    ],
    takeaway: "Your Turn, Operator: Master commands, fix broken topologies, and command the container fleet.",
    accent: "#facc15",
    renderIllustration: () => (
      <svg viewBox="0 0 400 240" fill="none" className="w-full h-full">
        <rect width="400" height="240" fill="#080a0f" />
        <path d="M0 40h400M0 80h400M0 120h400M0 160h400M0 200h400M50 0v240M100 0v240M150 0v240M200 0v240M250 0v240M300 0v240M350 0v240" stroke="#131c26" strokeWidth="0.8" />

        {/* Cyber Command Console */}
        <rect x="30" y="25" width="340" height="155" rx="4" fill="#0a1018" stroke="#38bdf8" strokeWidth="1.5" />
        
        {/* Terminal Header */}
        <rect x="30" y="25" width="340" height="22" fill="#132030" />
        <circle cx="45" cy="36" r="3.5" fill="#ef4444" />
        <circle cx="58" cy="36" r="3.5" fill="#facc15" />
        <circle cx="71" cy="36" r="3.5" fill="#22c55e" />
        <text x="140" y="39" fill="#94a3b8" fontSize="9" fontFamily="monospace">DOCKEROPS SHELL v1.0</text>

        {/* Real Command Streaming */}
        <text x="45" y="70" fill="#22c55e" fontSize="10" fontFamily="monospace" fontWeight="bold">operator@dockerops:~$</text>
        <text x="195" y="70" fill="#fff" fontSize="10" fontFamily="monospace">docker run -d --name web -p 80:80 nginx</text>
        <text x="45" y="92" fill="#38bdf8" fontSize="9" fontFamily="monospace">4f9a12c8b8201948d38102d...</text>
        
        <text x="45" y="114" fill="#22c55e" fontSize="10" fontFamily="monospace" fontWeight="bold">operator@dockerops:~$</text>
        <text x="195" y="114" fill="#fff" fontSize="10" fontFamily="monospace">docker ps</text>
        
        <text x="45" y="134" fill="#94a3b8" fontSize="8" fontFamily="monospace">CONTAINER ID   IMAGE   COMMAND              STATUS         PORTS</text>
        <text x="45" y="148" fill="#facc15" fontSize="8" fontFamily="monospace">4f9a12c8b820   nginx   &quot;/docker-entryp...&quot;   Up 4 seconds   0.0.0.0:80-&gt;80/tcp</text>

        {/* Cursor */}
        <rect x="45" y="158" width="6" height="10" fill="#00ff66" />
        <text x="56" y="167" fill="#00ff66" fontSize="9" fontFamily="monospace" fontWeight="bold">INCIDENT RESOLVED // XP +150</text>

        {/* Bottom Banner */}
        <rect x="80" y="195" width="240" height="30" fill="#22c55e" rx="1" />
        <text x="110" y="214" fill="#000" fontSize="11" fontFamily="monospace" fontWeight="black">&gt; START YOUR FIRST MISSION &gt;</text>
      </svg>
    ),
  },
];

interface DockerStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DockerStoryModal({ isOpen, onClose }: DockerStoryModalProps) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const chapter = CHAPTERS[currentChapter];

  // Auto-play timer (12 seconds per chapter)
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const timer = setInterval(() => {
      setCurrentChapter((prev) => {
        if (prev < CHAPTERS.length - 1) {
          if (soundEnabled) sfx.playTransition();
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 11000);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentChapter, soundEnabled]);

  // Keyboard navigation (Escape to close, Left/Right arrows)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && currentChapter < CHAPTERS.length - 1) {
        if (soundEnabled) sfx.playClick();
        setCurrentChapter((c) => c + 1);
      }
      if (e.key === "ArrowLeft" && currentChapter > 0) {
        if (soundEnabled) sfx.playClick();
        setCurrentChapter((c) => c - 1);
      }
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentChapter, soundEnabled, onClose]);

  if (!isOpen) return null;

  const goToChapter = (idx: number) => {
    if (soundEnabled) sfx.playClick();
    setCurrentChapter(idx);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 font-mono backdrop-blur-md">
      <div className="relative flex max-h-[96vh] w-full max-w-4xl flex-col border border-line bg-surface shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-line bg-ink px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-acid animate-pulse" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-acid">
                HISTORICAL ARCHIVE // DEPLOYMENT CODEX
              </div>
              <h2 className="font-display text-sm sm:text-base font-black uppercase text-white tracking-wider">
                THE STORY OF DOCKER
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play / Pause Toggle */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="flex items-center gap-1.5 border border-line bg-black px-2.5 py-1 text-[10px] font-bold uppercase text-white hover:border-acid hover:text-acid transition-colors"
              title="Spacebar to toggle Auto-play"
            >
              <span>{isPlaying ? "⏸ PAUSE" : "▶ PLAY"}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                sfx.enabled = !soundEnabled;
                setSoundEnabled(!soundEnabled);
              }}
              className="flex items-center border border-line bg-black px-2 py-1 text-[10px] font-bold text-white hover:border-acid transition-colors"
              title="Toggle Audio FX"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center border border-line bg-black text-sm text-[#8e8e93] hover:border-white hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Chapter Timeline Progress Bar */}
        <div className="grid grid-cols-5 gap-1 bg-black px-4 sm:px-6 py-2 border-b border-line/60">
          {CHAPTERS.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => goToChapter(idx)}
              className="group flex flex-col text-left transition-all"
            >
              <div className="h-1.5 w-full bg-[#18202c] overflow-hidden rounded-xs">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    idx === currentChapter
                      ? "bg-acid shadow-[0_0_8px_#00ff66]"
                      : idx < currentChapter
                      ? "bg-white/60"
                      : "bg-transparent"
                  )}
                />
              </div>
              <span className={cn(
                "mt-1 text-[9px] font-bold uppercase tracking-wider truncate",
                idx === currentChapter ? "text-acid" : "text-[#71717a] group-hover:text-white"
              )}>
                0{ch.id}. {ch.title.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Main Stage: Graphic + Narrative Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
            
            {/* Left: Graphic Stage */}
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-line/80 bg-black shadow-inner">
              {chapter.renderIllustration()}
              <div className="absolute top-2 left-2 rounded-xs border border-line/60 bg-black/80 px-2 py-0.5 text-[9px] font-bold uppercase text-white/70">
                SCENE 0{chapter.id} / 05
              </div>
            </div>

            {/* Right: Narrative Text */}
            <div className="space-y-3">
              <div>
                <span className="rounded-xs border border-line bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#8e8e93]">
                  {chapter.epoch}
                </span>
                <h3 className="mt-2 font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  {chapter.title}
                </h3>
                <p className="mt-1 text-xs font-bold text-acid uppercase tracking-wider">
                  {chapter.tagline}
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[#a1a1aa] leading-relaxed">
                {chapter.narrative.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Takeaway Box */}
              <div className="border-l-2 border-acid bg-black/60 p-3 text-xs text-white">
                <span className="font-black text-acid uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-acid" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18h6M10 21h4" strokeLinecap="round" />
                    <path d="M12 3a6 6 0 0 0-6 6c0 2.2 1.3 4.1 2.5 5.5.5.6.8 1.5.9 2.5h5.2c.1-1 .4-1.9.9-2.5 1.2-1.4 2.5-3.3 2.5-5.5a6 6 0 0 0-6-6z" fill="#00ff66" fillOpacity="0.25" strokeLinejoin="round" />
                    <path d="M12 7v4" strokeLinecap="round" />
                  </svg>
                  <span>KEY LESSON:</span>
                </span>
                {chapter.takeaway}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Footer */}
        <div className="flex items-center justify-between border-t border-line bg-ink px-4 sm:px-6 py-3.5">
          <button
            onClick={() => {
              if (currentChapter > 0) goToChapter(currentChapter - 1);
            }}
            disabled={currentChapter === 0}
            className={cn(
              "border border-line bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
              currentChapter === 0
                ? "opacity-30 cursor-not-allowed text-[#555]"
                : "text-white hover:border-white"
            )}
          >
            ← PREVIOUS
          </button>

          <div className="text-[10px] text-[#8e8e93] hidden sm:block">
            Use <kbd className="border border-line bg-black px-1.5 py-0.5 text-white">←</kbd> <kbd className="border border-line bg-black px-1.5 py-0.5 text-white">→</kbd> or Spacebar
          </div>

          {currentChapter < CHAPTERS.length - 1 ? (
            <button
              onClick={() => goToChapter(currentChapter + 1)}
              className="border border-acid bg-acid px-5 py-2 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-110 active:translate-y-px"
            >
              NEXT CHAPTER →
            </button>
          ) : (
            <Link href="/levels" onClick={onClose}>
              <button className="border border-acid bg-acid px-5 py-2 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-110 active:translate-y-px shadow-[0_0_12px_rgba(0,255,102,0.3)]">
                ENTER MISSIONS NOW &gt;
              </button>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
