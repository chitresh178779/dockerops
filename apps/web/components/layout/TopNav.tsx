"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import type { PlayerProfile } from "@dockerops/shared";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { DockerLogo } from "@/components/ui/DockerLogo";
import { GameWalkthroughModal } from "@/components/walkthrough/GameWalkthroughModal";
import { DockerStoryModal } from "@/components/story/DockerStoryModal";

const LINKS = [
  { href: "/", label: "HOME" },
  { href: "/levels", label: "LEVELS" },
  { href: "/profile", label: "PROFILE" },
  { href: "/history", label: "HISTORY" },
  { href: "/manual", label: "MANUAL" },
];

export function TopNav() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => undefined);
  }, [pathname]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // The gameplay screen has its own single header (title + XP/LV)
  if (pathname?.startsWith("/level/")) return null;

  const isLevelsPage = pathname?.startsWith("/levels");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-ink">
        <div className="flex h-12 sm:h-13 items-center justify-between px-3 sm:px-6">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-sm sm:text-base font-bold tracking-tight text-white transition-opacity hover:opacity-90"
            >
              <DockerLogo className="h-5 w-5 sm:h-6 sm:w-6 text-white shrink-0" />
              <span className="whitespace-nowrap">DOCKER OPS</span>
            </Link>
            {isLevelsPage && (
              <span className="hidden sm:inline-block rounded-sm border border-acid/50 bg-acid/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-acid">
                LEVELS
              </span>
            )}
          </div>

          {/* Right Section: Desktop Links + Stats + Mobile Hamburger Button */}
          <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-6">
            {/* Desktop Navigation Links (Hidden on mobile < md) */}
            <nav className="hidden md:flex items-center gap-3 lg:gap-5">
              {LINKS.map((l) => {
                const active =
                  l.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "relative py-1 text-xs font-bold uppercase tracking-widest transition-colors",
                      active ? "text-acid" : "text-[#777777] hover:text-white",
                    )}
                  >
                    {l.label}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-[15px] h-[2px] bg-acid" />
                    )}
                  </Link>
                );
              })}

              {/* How To Play Button in Desktop Nav */}
              <button
                onClick={() => setIsWalkthroughOpen(true)}
                className="flex items-center gap-1.5 border border-acid/60 bg-acid/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-acid hover:border-acid hover:bg-acid hover:text-black transition-all"
                title="Field Orientation Walkthrough"
              >
                <span className="font-mono font-black">?</span>
                <span>HOW TO PLAY</span>
              </button>
            </nav>

            {/* Player Quick Stats & Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
              <span className="text-[11px] sm:text-xs font-bold text-acid whitespace-nowrap">
                XP {profile?.totalXp ?? 1200}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
                LV {profile?.level ?? 4}
              </span>
              <Link
                href="/profile"
                className="flex items-center transition-opacity hover:opacity-80 shrink-0"
                title="View Operator Profile"
              >
                <UserAvatar
                  className="h-7 w-7 border-line/80 hover:border-acid"
                  indicator={false}
                />
              </Link>
            </div>

            {/* Mobile Hamburger Toggle Button (Hidden on md and up) */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="flex h-8 w-8 items-center justify-center border border-line bg-black text-white hover:border-acid hover:text-acid md:hidden transition-colors shrink-0"
            >
              {isMobileMenuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Tactical Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="border-t border-line bg-surface/98 backdrop-blur-md px-3 py-3 md:hidden font-mono shadow-2xl">
            <nav className="flex flex-col space-y-1">
              {LINKS.map((l) => {
                const active =
                  l.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between border px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all",
                      active
                        ? "border-acid bg-acid/10 text-acid font-black shadow-[0_0_10px_rgba(0,255,102,0.1)]"
                        : "border-transparent text-white/80 hover:border-line hover:bg-black/60 hover:text-white"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={active ? "text-acid" : "text-[#555]"}>&gt;</span>
                      {l.label}
                    </span>
                    {active && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-acid">
                        ACTIVE
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Action Buttons in Drawer */}
            <div className="mt-2.5 pt-2.5 border-t border-line/60 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsWalkthroughOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 border border-acid/80 bg-acid/10 px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-acid hover:bg-acid hover:text-black transition-colors"
              >
                <span>?</span> HOW TO PLAY
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsStoryOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 border border-volt/80 bg-volt/10 px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-volt hover:bg-volt hover:text-black transition-colors"
              >
                <span>▶</span> DOCKER STORY
              </button>
            </div>

            {/* Quick Operator Status in Drawer */}
            <div className="mt-3 border-t border-line/60 pt-2.5 flex items-center justify-between text-[10px] text-[#8e8e93] px-1">
              <span>OPERATOR: <strong className="text-white">{profile?.displayName || "PLAYER ONE"}</strong></span>
              <span className="text-acid font-bold">ONLINE</span>
            </div>
          </div>
        )}
      </header>

      {/* Global Walkthrough Modal */}
      <GameWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />

      {/* Global Story Player Modal */}
      <DockerStoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
      />
    </>
  );
}
