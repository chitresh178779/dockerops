import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger" | "outline";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-acid text-ink border-acid hover:brightness-110",
  ghost: "bg-transparent text-paper/70 border-transparent hover:text-paper hover:bg-surfaceRaised",
  outline: "bg-transparent text-paper border-line hover:border-lineLight",
  danger: "bg-incident text-ink border-incident hover:brightness-110",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "rounded-md border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
