"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { AVATAR_PRESETS } from "./AvatarPresets";
import { DEFAULT_AVATAR_PRESET, useAvatar } from "@/lib/useAvatar";

interface UserAvatarProps {
  presetId?: string;
  customDataUrl?: string | null;
  className?: string;
  indicator?: boolean;
}

export function UserAvatar({
  presetId,
  customDataUrl,
  className,
  indicator = true,
}: UserAvatarProps) {
  const current = useAvatar();

  const effectivePreset = presetId ?? current.presetId;
  const effectiveCustom = customDataUrl !== undefined ? customDataUrl : current.customDataUrl;

  const preset =
    AVATAR_PRESETS.find((p) => p.id === effectivePreset) ||
    AVATAR_PRESETS.find((p) => p.id === DEFAULT_AVATAR_PRESET) ||
    AVATAR_PRESETS[0];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-line bg-black",
        className
      )}
    >
      {effectiveCustom ? (
        <img
          src={effectiveCustom}
          alt="Custom Player Avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        preset.renderSvg("h-full w-full")
      )}

      {indicator && (
        <span
          className="absolute bottom-1 right-1 h-2.5 w-2.5 border border-black bg-acid shadow-[0_0_6px_#00ff66]"
          title="Operator Status: ONLINE"
        />
      )}
    </div>
  );
}
