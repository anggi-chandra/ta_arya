"use client";

import { ReactNode, useRef, useEffect, createElement } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPWrapperProps {
  children: ReactNode;
  animation?: "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn" | "none";
  duration?: number;
  delay?: number;
  stagger?: number;
  scrollTrigger?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function GSAPWrapper({
  children,
  animation = "fadeInUp",
  duration = 0.8,
  delay = 0,
  stagger,
  scrollTrigger = true,
  className = "",
  as: Component = "div",
}: GSAPWrapperProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || animation === "none") return;

    const animations: Record<string, () => void> = {
      fadeInUp: () => {
        gsap.set(element, { opacity: 0, y: 50 });
        const anim = gsap.to(element, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
        });
        if (scrollTrigger) {
          ScrollTrigger.create({
            trigger: element,
            start: "top 80%",
            animation: anim,
            toggleActions: "play none none none",
          });
        }
      },
      fadeInDown: () => {
        gsap.set(element, { opacity: 0, y: -50 });
        const anim = gsap.to(element, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
        });
        if (scrollTrigger) {
          ScrollTrigger.create({
            trigger: element,
            start: "top 80%",
            animation: anim,
            toggleActions: "play none none none",
          });
        }
      },
      fadeInLeft: () => {
        gsap.set(element, { opacity: 0, x: -50 });
        const anim = gsap.to(element, {
          opacity: 1,
          x: 0,
          duration,
          delay,
          ease: "power2.out",
        });
        if (scrollTrigger) {
          ScrollTrigger.create({
            trigger: element,
            start: "top 80%",
            animation: anim,
            toggleActions: "play none none none",
          });
        }
      },
      fadeInRight: () => {
        gsap.set(element, { opacity: 0, x: 50 });
        const anim = gsap.to(element, {
          opacity: 1,
          x: 0,
          duration,
          delay,
          ease: "power2.out",
        });
        if (scrollTrigger) {
          ScrollTrigger.create({
            trigger: element,
            start: "top 80%",
            animation: anim,
            toggleActions: "play none none none",
          });
        }
      },
      scaleIn: () => {
        gsap.set(element, { opacity: 0, scale: 0.8 });
        const anim = gsap.to(element, {
          opacity: 1,
          scale: 1,
          duration,
          delay,
          ease: "back.out(1.7)",
        });
        if (scrollTrigger) {
          ScrollTrigger.create({
            trigger: element,
            start: "top 80%",
            animation: anim,
            toggleActions: "play none none none",
          });
        }
      },
    };

    if (stagger && element.children.length > 0) {
      gsap.set(element.children, { opacity: 0, y: 30 });
      const anim = gsap.to(element.children, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: "power2.out",
        stagger,
      });
      if (scrollTrigger) {
        ScrollTrigger.create({
          trigger: element,
          start: "top 80%",
          animation: anim,
          toggleActions: "play none none none",
        });
      }
    } else {
      animations[animation]?.();
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [animation, duration, delay, stagger, scrollTrigger]);

  return createElement(
    Component,
    { ref, className },
    children
  );
}

