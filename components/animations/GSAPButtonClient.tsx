"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Button, ButtonProps } from "@/components/ui/button";

interface GSAPButtonClientProps extends ButtonProps {
  hoverScale?: number;
  hoverGlow?: boolean;
  glowColor?: string;
}

export function GSAPButtonClient({
  children,
  className = "",
  hoverScale = 1.05,
  hoverGlow = false,
  glowColor = "rgba(220, 38, 38, 0.8)",
  ...props
}: GSAPButtonClientProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: hoverScale,
        duration: 0.3,
        ease: "power2.out",
      });
      if (hoverGlow) {
        gsap.to(button, {
          boxShadow: `0 0 50px ${glowColor}`,
          duration: 0.3,
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      if (hoverGlow) {
        const currentShadow = button.style.boxShadow || "";
        const originalShadow = currentShadow.includes("rgba(220,38,38,0.5)")
          ? "0 0 30px rgba(220,38,38,0.5)"
          : "";
        gsap.to(button, {
          boxShadow: originalShadow,
          duration: 0.3,
        });
      }
    };

    button.addEventListener("mouseenter", handleMouseEnter);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hoverScale, hoverGlow, glowColor]);

  return (
    <Button ref={buttonRef} className={className} {...props}>
      {children}
    </Button>
  );
}

