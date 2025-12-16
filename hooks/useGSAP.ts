"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface GSAPAnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
  scrollTrigger?: boolean;
  repeat?: number;
  yoyo?: boolean;
}

/**
 * Custom hook untuk animasi GSAP dengan fade in up
 */
export function useFadeInUp(
  options: GSAPAnimationOptions = {}
) {
  const ref = useRef<HTMLElement>(null);
  const {
    duration = 0.8,
    delay = 0,
    ease = "power2.out",
    scrollTrigger = true,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.set(element, { opacity: 0, y: 50 });

    const animation = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
    });

    if (scrollTrigger) {
      ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        animation,
        toggleActions: "play none none none",
      });
    } else {
      animation.play();
    }

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [duration, delay, ease, scrollTrigger]);

  return ref;
}

/**
 * Custom hook untuk animasi GSAP dengan fade in down
 */
export function useFadeInDown(
  options: GSAPAnimationOptions = {}
) {
  const ref = useRef<HTMLElement>(null);
  const {
    duration = 0.8,
    delay = 0,
    ease = "power2.out",
    scrollTrigger = true,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.set(element, { opacity: 0, y: -50 });

    const animation = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
    });

    if (scrollTrigger) {
      ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        animation,
        toggleActions: "play none none none",
      });
    } else {
      animation.play();
    }

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [duration, delay, ease, scrollTrigger]);

  return ref;
}

/**
 * Custom hook untuk animasi stagger (multiple elements)
 */
export function useStagger(
  options: GSAPAnimationOptions = {}
) {
  const ref = useRef<HTMLElement>(null);
  const {
    duration = 0.6,
    delay = 0,
    ease = "power2.out",
    stagger = 0.1,
    scrollTrigger = true,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const children = element.children;
    if (children.length === 0) return;

    gsap.set(children, { opacity: 0, y: 30 });

    const animation = gsap.to(children, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
      stagger,
    });

    if (scrollTrigger) {
      ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        animation,
        toggleActions: "play none none none",
      });
    } else {
      animation.play();
    }

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [duration, delay, ease, stagger, scrollTrigger]);

  return ref;
}

/**
 * Custom hook untuk animasi scale in
 */
export function useScaleIn(
  options: GSAPAnimationOptions = {}
) {
  const ref = useRef<HTMLElement>(null);
  const {
    duration = 0.5,
    delay = 0,
    ease = "back.out(1.7)",
    scrollTrigger = true,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.set(element, { opacity: 0, scale: 0.8 });

    const animation = gsap.to(element, {
      opacity: 1,
      scale: 1,
      duration,
      delay,
      ease,
    });

    if (scrollTrigger) {
      ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        animation,
        toggleActions: "play none none none",
      });
    } else {
      animation.play();
    }

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [duration, delay, ease, scrollTrigger]);

  return ref;
}

/**
 * Custom hook untuk animasi on mount (tanpa scroll trigger)
 */
export function useGSAPAnimation(
  animationFn: (element: HTMLElement) => gsap.core.Tween,
  deps: any[] = []
) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animation = animationFn(element);

    return () => {
      animation.kill();
    };
  }, deps);

  return ref;
}

/**
 * Utility function untuk hover animations
 */
export function setupHoverAnimation(
  element: HTMLElement | null,
  hoverProps: gsap.TweenVars,
  normalProps: gsap.TweenVars = {}
) {
  if (!element) return;

  const handleMouseEnter = () => {
    gsap.to(element, hoverProps);
  };

  const handleMouseLeave = () => {
    gsap.to(element, normalProps);
  };

  element.addEventListener("mouseenter", handleMouseEnter);
  element.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    element.removeEventListener("mouseenter", handleMouseEnter);
    element.removeEventListener("mouseleave", handleMouseLeave);
  };
}

