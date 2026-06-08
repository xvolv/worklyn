"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { testimonials } from "@/components/landing/testimonialsData";

const CYCLE_MS = 4000;
const TRANSITION_MS = 900;

type CardVariant = "left" | "center" | "right";

type AngleConfig = {
  rotate: string;
  scale: string;
  x: string;
  z: number;
};

const variantAngles: Record<CardVariant, AngleConfig> = {
  left: { rotate: "-6deg", scale: "0.92", x: "-18%", z: 20 },
  center: { rotate: "0deg", scale: "1", x: "0%", z: 60 },
  right: { rotate: "6deg", scale: "0.92", x: "18%", z: 20 },
};

const TestimonialCard = ({
  testimonial,
  variant,
  isActive,
}: {
  testimonial: (typeof testimonials)[number];
  variant: CardVariant;
  isActive: boolean;
}) => {
  const angles = variantAngles[variant];

  const baseRing =
    variant === "center"
      ? "ring-2 ring-foreground/10"
      : "ring-1 ring-foreground/5";

  return (
    <div
      className="absolute top-0 left-0 w-full"
      style={{
        transform: `translateX(${angles.x}) rotate(${angles.rotate}) scale(${angles.scale})`,
        zIndex: angles.z,
        transition: isActive
          ? `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.8, 0.25, 1), opacity ${TRANSITION_MS}ms ease`
          : "none",
        opacity: isActive ? 1 : 0.6,
        transformOrigin: "center top",
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      <div
        className={`w-72 rounded-3xl bg-card p-5 shadow-lg ${baseRing}`}
      >
        <div className="mb-3 text-2xl">{testimonial.emoji}</div>
        <p className="text-sm leading-relaxed text-foreground/80">
          "{testimonial.quote}"
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {testimonial.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{testimonial.name}</div>
            <div className="text-xs text-muted-foreground">
              {testimonial.title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);

  const clearIntervalTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const clearAllTimers = () => {
    clearIntervalTimer();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const variants = useMemo<(CardVariant | null)[]>(() => {
    const len = testimonials.length;
    const results: (CardVariant | null)[] = [];
    for (let offset = -1; offset <= 1; offset++) {
      const idx = (activeIndex + offset + len) % len;
      if (offset === -1) results.push("left");
      else if (offset === 0) results.push("center");
      else results.push("right");
    }
    return results;
  }, [activeIndex]);

  const visibleItems = useMemo(() => {
    const len = testimonials.length;
    const indices = [
      (activeIndex - 1 + len) % len,
      activeIndex,
      (activeIndex + 1) % len,
    ];
    return indices.map((idx, i) => ({
      testimonial: testimonials[idx],
      variant: variants[i] as CardVariant,
      isActive: i === 1,
    }));
  }, [activeIndex, variants]);

  const step = (from: number) => {
    if (hovered) return;

    const elapsed = performance.now() - from;
    const duration = Math.min(elapsed, CYCLE_MS);
    const remaining = CYCLE_MS - duration;

    clearIntervalTimer();
    intervalRef.current = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, remaining);
  };

  useEffect(() => {
    if (hovered) {
      clearAllTimers();
      return;
    }

    const start = performance.now();
    startRef.current = start;

    function tick(now: number) {
      if (hovered) return;
      const elapsed = now - start;

      if (elapsed >= CYCLE_MS) {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      clearAllTimers();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hovered, activeIndex]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => () => clearAllTimers(), []);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-3xl">
        <div className="relative h-[420px]">
          {visibleItems.map(({ testimonial, variant, isActive }, idx) => (
            <TestimonialCard
              key={`${testimonial.name}-${variant}`}
              testimonial={testimonial}
              variant={variant}
              isActive={isActive}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
