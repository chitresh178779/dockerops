"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { AVATAR_PRESETS, AvatarPreset } from "./AvatarPresets";
import { useAvatar } from "@/lib/useAvatar";

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarSelectorModal({ isOpen, onClose }: AvatarSelectorModalProps) {
  const { presetId, customDataUrl, setAvatar } = useAvatar();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(presetId);
  const [selectedCustomUrl, setSelectedCustomUrl] = useState<string | null>(customDataUrl);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"presets" | "upload">(
    customDataUrl ? "upload" : "presets"
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentPreset =
    AVATAR_PRESETS.find((p) => p.id === selectedPresetId) || AVATAR_PRESETS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    // 2MB size limit to safely store in localStorage
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image is too large (max 2MB). Please choose a smaller image.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Invalid file format. Please upload a PNG, JPG, SVG, or WEBP image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedCustomUrl(result);
    };
    reader.onerror = () => {
      setUploadError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    if (activeTab === "upload" && selectedCustomUrl) {
      setAvatar(selectedPresetId, selectedCustomUrl);
    } else {
      setAvatar(selectedPresetId, null);
    }
    onClose();
  };

  const handleClearCustom = () => {
    setSelectedCustomUrl(null);
    setActiveTab("presets");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 font-mono backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col border border-line bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-ink px-4 sm:px-6 py-3 sm:py-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-acid">
              OPERATOR CUSTOMIZATION
            </div>
            <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white">
              SELECT YOUR AVATAR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-line bg-black text-sm text-[#8e8e93] transition-colors hover:border-white hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Live Active Preview Banner */}
        <div className="flex items-center gap-3 sm:gap-4 border-b border-line/60 bg-black/50 px-4 sm:px-6 py-2.5 sm:py-3.5">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden border border-acid/80 bg-black shadow-[0_0_12px_rgba(0,255,102,0.15)]">
            {activeTab === "upload" && selectedCustomUrl ? (
              <img
                src={selectedCustomUrl}
                alt="Selected Custom"
                className="h-full w-full object-cover"
              />
            ) : (
              currentPreset.renderSvg("h-full w-full")
            )}
            <span className="absolute bottom-1 right-1 h-2 w-2 border border-black bg-acid" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-xs font-bold uppercase tracking-wider text-white">
                {activeTab === "upload" && selectedCustomUrl
                  ? "CUSTOM OPERATOR IMAGE"
                  : currentPreset.name}
              </span>
              <span className="rounded-sm border border-acid/50 bg-acid/10 px-1.5 py-0.2 text-[9px] font-bold text-acid">
                {activeTab === "upload" && selectedCustomUrl
                  ? "USER UPLOAD"
                  : currentPreset.callsign}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-[11px] text-[#8e8e93] line-clamp-2">
              {activeTab === "upload" && selectedCustomUrl
                ? "Your custom profile image is loaded and ready to deploy."
                : currentPreset.description}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-line bg-black px-4 sm:px-6 pt-2.5 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("presets")}
            className={cn(
              "border-b-2 px-3 sm:px-4 py-2 text-[11px] sm:text-xs transition-colors",
              activeTab === "presets"
                ? "border-acid text-acid"
                : "border-transparent text-[#8e8e93] hover:text-white"
            )}
          >
            PRESETS ({AVATAR_PRESETS.length})
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={cn(
              "border-b-2 px-3 sm:px-4 py-2 text-[11px] sm:text-xs transition-colors",
              activeTab === "upload"
                ? "border-acid text-acid"
                : "border-transparent text-[#8e8e93] hover:text-white"
            )}
          >
            UPLOAD IMAGE {selectedCustomUrl && "✓"}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
          {activeTab === "presets" && (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {AVATAR_PRESETS.map((preset: AvatarPreset) => {
                const isSelected =
                  selectedPresetId === preset.id &&
                  (!selectedCustomUrl || activeTab === "presets");
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setSelectedCustomUrl(null);
                    }}
                    className={cn(
                      "group flex flex-col items-center border p-2.5 sm:p-3 text-center transition-all",
                      isSelected
                        ? "border-acid bg-surfaceRaised shadow-[0_0_12px_rgba(0,255,102,0.2)]"
                        : "border-line bg-black/60 hover:border-lineLight hover:bg-black"
                    )}
                  >
                    <div className="relative mb-1.5 sm:mb-2 h-14 w-14 sm:h-16 sm:w-16 overflow-hidden border border-line group-hover:border-white/50">
                      {preset.renderSvg("h-full w-full")}
                      {isSelected && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-acid text-[10px] font-black text-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-acid truncate w-full">
                      {preset.name}
                    </div>
                    <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#8e8e93] truncate w-full">
                      {preset.role}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-4">
              <div className="border border-dashed border-line p-4 sm:p-6 text-center hover:border-acid transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatar-file-input"
                />
                <label
                  htmlFor="avatar-file-input"
                  className="flex flex-col items-center justify-center cursor-pointer space-y-2.5 sm:space-y-3"
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border border-line bg-black text-acid">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 sm:h-6 sm:w-6">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white">
                      Click to choose an image file
                    </div>
                    <div className="mt-1 text-[10px] text-[#8e8e93]">
                      Supports PNG, JPG, WEBP, or SVG (Max 2MB)
                    </div>
                  </div>
                </label>
              </div>

              {uploadError && (
                <div className="border border-red-500/50 bg-red-950/30 p-2.5 text-xs text-red-400">
                  {uploadError}
                </div>
              )}

              {selectedCustomUrl && (
                <div className="flex items-center justify-between border border-line bg-surfaceRaised p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCustomUrl}
                      alt="Uploaded Avatar"
                      className="h-12 w-12 border border-line object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Custom Image Ready
                      </div>
                      <div className="text-[10px] text-acid">
                        Active in preview above
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClearCustom}
                    className="border border-line bg-black px-2.5 py-1 text-[10px] font-bold uppercase text-red-400 hover:border-red-500 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-line bg-ink px-4 sm:px-6 py-3 sm:py-4">
          <div className="text-[10px] text-[#8e8e93] text-center sm:text-left">
            {activeTab === "upload" && selectedCustomUrl
              ? "Custom image stored locally in your browser"
              : `Selected Preset: ${currentPreset.name}`}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="border border-line bg-black px-3.5 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#8e8e93] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="border border-acid bg-acid px-4 sm:px-5 py-2 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-110 active:translate-y-px"
            >
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
