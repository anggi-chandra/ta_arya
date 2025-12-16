"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

export function setupGSAPButtonHover(buttonId: string) {
  useEffect(() => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: 1.05,
        boxShadow: "0 0 50px rgba(220, 38, 38, 0.8)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        boxShadow: "0 0 30px rgba(220, 38, 38, 0.5)",
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
  }, [buttonId]);
}

