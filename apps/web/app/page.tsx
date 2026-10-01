"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DockerLogo } from "@/components/ui/DockerLogo";
import { DockerStoryModal } from "@/components/story/DockerStoryModal";
import { GameWalkthroughModal } from "@/components/walkthrough/GameWalkthroughModal";

export default function LandingPage() {
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between bg-black px-4 py-6 sm:px-8 sm:py-8 lg:px-14">

      <div className="mx-auto my-auto grid w-full max-w-7xl grid-cols-1 items-stretch gap-6 sm:gap-10 lg:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col justify-between py-2 sm:py-4">
          <div>
            {/* Title with Docker Whale Icon */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <DockerLogo className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white shrink-0" />
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                DOCKER OPS
              </h1>
            </div>

            <div className="mt-3 sm:mt-4 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#8e8e93]">
              LEARN PRACTICE DEPLOY
            </div>

            <p className="mt-1.5 sm:mt-2 font-mono text-xs uppercase tracking-wider text-[#a1a1aa]">
              A HANDS-ON DOCKER LEARNING GAME
            </p>

            {/* Buttons list */}
            <div className="mt-6 sm:mt-8 flex w-full max-w-md flex-col gap-2.5 font-mono">
              <Link href="/levels" className="w-full">
                <button className="flex w-full items-center justify-start gap-3 rounded-none bg-incident px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-incidentDim hover:brightness-110 active:translate-y-px shadow-[0_0_15px_rgba(0,255,102,0.25)]">
                  <span className="text-sm font-black">&gt;</span> START GAME
                </button>
              </Link>

              {/* Walkthrough Button */}
              <button
                onClick={() => setIsWalkthroughOpen(true)}
                className="flex w-full items-center justify-start gap-3 rounded-none border border-acid/80 bg-acid/10 px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-acid transition-all hover:bg-acid/20 hover:border-acid"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-acid text-[10px] font-black">
                  ?
                </span>
                HOW TO PLAY // WALKTHROUGH
              </button>

              {/* Story Playback Button */}
              <button
                onClick={() => setIsStoryOpen(true)}
                className="flex w-full items-center justify-start gap-3 rounded-none border border-line bg-surfaceRaised px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:border-volt hover:text-volt hover:bg-volt/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5 text-volt"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                THE DOCKER STORY // WHY DOCKER?
              </button>

              <Link href="/levels" className="w-full">
                <button className="flex w-full items-center justify-start gap-3 rounded-none border border-line bg-surfaceRaised px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-lineLight hover:bg-surfaceHover">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-3.5 w-3.5 text-paperDim"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  CONTINUE
                </button>
              </Link>

              <Link href="/history" className="w-full">
                <button className="flex w-full items-center justify-start gap-3 rounded-none border border-line bg-surfaceRaised px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-lineLight hover:bg-surfaceHover">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5 text-paperDim"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  MY HISTORY
                </button>
              </Link>

              <Link href="/manual" className="w-full">
                <button className="flex w-full items-center justify-start gap-3 rounded-none border border-line bg-surfaceRaised px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-lineLight hover:bg-surfaceHover">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5 text-paperDim"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                  HOW IT WORKS &amp; MANUAL
                </button>
              </Link>
            </div>
          </div>

          {/* Footer tagline strip */}
          <div className="mt-8 sm:mt-12 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#71717a]">
            REAL INCIDENTS. &nbsp; REAL COMMANDS. &nbsp; REAL SKILLS.
          </div>
        </div>

        {/* Right Column: Hero Graphic with Text Overlay & Interactive Story Showcase */}
        <div className="flex flex-col gap-4">
          <div className="relative min-h-[260px] sm:min-h-[340px] lg:min-h-[380px] overflow-hidden border border-line bg-surface">
            <Image
              src="/images/landing_hero.jpg"
              alt="Docker Ops Cargo Port"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Subtle gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Quick Play Story Pill */}
            <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
              <button
                onClick={() => setIsStoryOpen(true)}
                className="group flex items-center gap-2 rounded-none border border-volt bg-black/80 backdrop-blur-md px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-volt transition-all hover:bg-volt hover:text-black shadow-[0_0_12px_rgba(250,204,21,0.25)]"
              >
                <span className="flex h-2 w-2 rounded-full bg-volt group-hover:bg-black animate-pulse" />
                <span>▶ WATCH THE DOCKER STORY</span>
              </button>
            </div>

            {/* Overlay words in bottom right */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col text-right font-display text-xs sm:text-sm font-extrabold uppercase leading-tight tracking-[0.2em] sm:tracking-[0.25em] text-white/90 drop-shadow-md">
              <span>CONTAIN</span>
              <span>BUILD</span>
              <span>RUN</span>
              <span>DEBUG</span>
              <span>DEPLOY</span>
            </div>
          </div>

          {/* Interactive Feature Teaser Card */}
          <div className="border border-line bg-surface p-4 font-mono">
            <div className="flex items-center justify-between border-b border-line/60 pb-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-acid flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                NEW RECRUIT ORIENTATION
              </span>
              <span className="text-[10px] text-[#71717a] uppercase font-bold">
                NO PRIOR EXPERIENCE REQUIRED
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Never used Docker or Linux before? Our interactive walkthrough covers the terminal layout, command syntax, topology inspection, and hint engine step-by-step.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => setIsWalkthroughOpen(true)}
                className="text-xs font-bold uppercase tracking-wider text-acid hover:underline"
              >
                &gt; Open Walkthrough Guide
              </button>
              <span className="text-[#444]">•</span>
              <button
                onClick={() => setIsStoryOpen(true)}
                className="text-xs font-bold uppercase tracking-wider text-volt hover:underline"
              >
                ▶ Why Was Docker Created?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Story Player Modal */}
      <DockerStoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
      />

      {/* Interactive Walkthrough Modal */}
      <GameWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
    </div>
  );
}
