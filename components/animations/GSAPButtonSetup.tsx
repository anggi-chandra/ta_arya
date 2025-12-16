"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

interface GSAPButtonSetupProps {
  buttonId: string;
  hoverScale?: number;
  glowColor?: string;
}

export function GSAPButtonSetup({ buttonId, hoverScale = 1.05, glowColor = "rgba(220, 38, 38, 0.8)" }: GSAPButtonSetupProps) {
  useEffect(() => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const originalShadow = button.style.boxShadow || "0 0 30px rgba(220,38,38,0.5)";

    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: hoverScale,
        boxShadow: `0 0 50px ${glowColor}`,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        boxShadow: originalShadow,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    button.addEventListener("mouseenter", handleMouseEnter);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [buttonId, hoverScale, glowColor]);

  return null;
}

