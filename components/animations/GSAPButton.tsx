"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Button, ButtonProps } from "@/components/ui/button";

interface GSAPButtonProps extends ButtonProps {
  hoverScale?: number;
  hoverGlow?: boolean;
}

export function GSAPButton({
  children,
  className = "",
  hoverScale = 1.05,
  hoverGlow = false,
  ...props
}: GSAPButtonProps) {
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
          boxShadow: "0 0 30px rgba(220, 38, 38, 0.6)",
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
        gsap.to(button, {
          boxShadow: "0 0 0px rgba(220, 38, 38, 0)",
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
  }, [hoverScale, hoverGlow]);

  return (
    <Button ref={buttonRef} className={className} {...props}>
      {children}
    </Button>
  );
}

