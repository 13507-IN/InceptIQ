import React from "react";
import { cn } from "../../lib/utils";

interface GlowingEffectProps {
  className?: string;
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
}

export const GlowingEffect: React.FC<GlowingEffectProps> = ({
  className,
  spread = 40,
  glow = true,
  disabled = false,
}) => {
  if (disabled) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 -z-10 animate-pulse",
        glow && "bg-gradient-to-r from-yellow-400/20 to-orange-500/20",
        className
      )}
      style={{
        filter: `blur(${spread}px)`,
      }}
    />
  );
};