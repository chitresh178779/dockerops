"use client";

import { useEffect, useState } from "react";

export interface AvatarState {
  presetId: string;
  customDataUrl: string | null;
}

const STORAGE_KEY_PRESET = "dockerops_avatar_id";
const STORAGE_KEY_CUSTOM = "dockerops_avatar_custom";
export const DEFAULT_AVATAR_PRESET = "cyber-moby";

export function getStoredAvatar(): AvatarState {
  if (typeof window === "undefined") {
    return { presetId: DEFAULT_AVATAR_PRESET, customDataUrl: null };
  }
  const presetId = localStorage.getItem(STORAGE_KEY_PRESET) || DEFAULT_AVATAR_PRESET;
  const customDataUrl = localStorage.getItem(STORAGE_KEY_CUSTOM) || null;
  return { presetId, customDataUrl };
}

export function saveStoredAvatar(presetId: string, customDataUrl: string | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_PRESET, presetId);
  if (customDataUrl) {
    localStorage.setItem(STORAGE_KEY_CUSTOM, customDataUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY_CUSTOM);
  }
  window.dispatchEvent(new Event("dockerops:avatar-changed"));
}

export function useAvatar() {
  const [avatar, setAvatarState] = useState<AvatarState>({
    presetId: DEFAULT_AVATAR_PRESET,
    customDataUrl: null,
  });

  useEffect(() => {
    setAvatarState(getStoredAvatar());

    const handleUpdate = () => {
      setAvatarState(getStoredAvatar());
    };

    window.addEventListener("dockerops:avatar-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("dockerops:avatar-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateAvatar = (presetId: string, customDataUrl: string | null = null) => {
    saveStoredAvatar(presetId, customDataUrl);
    setAvatarState({ presetId, customDataUrl });
  };

  return {
    ...avatar,
    setAvatar: updateAvatar,
  };
}
