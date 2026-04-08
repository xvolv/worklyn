"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { testimonials } from "@/components/landing/testimonialsData";

const SLIDE_DURATION_MS = 850;
const SLIDE_INTERVAL_MS = 4200;

const START_TRANSFORM = "translateX(0%)";
const END_TRANSFORM = "translateX(-50%)";

const TestimonialCard = ({
  quote,
  name,
  title,
}: {
  quote: string;
  name: string;
  title: string;
}) => {
  return (
    <div className="p-6">
      <p className="text-sm leading-6 text-foreground/80">“{quote}”</p>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="leading-tight">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{title}</div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [trackTransform, setTrackTransform] = useState(START_TRANSFORM);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const animatingRef = useRef(false);

  const startTransform = useMemo(() => START_TRANSFORM, []);
  const endTransform = useMemo(() => END_TRANSFORM, []);

  const active = testimonials[activeIndex % testimonials.length];
  const incoming = testimonials[incomingIndex % testimonials.length];

  const clearIntervalTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const clearAllTimers = () => {
    clearIntervalTimer();
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const step = () => {
    if (animatingRef.current) return;

    const next = (activeIndexRef.current + 1) % testimonials.length;
    setIncomingIndex(next);
    setAnimating(true);
    setTransitionEnabled(true);
    setTrackTransform(endTransform);

    timeoutRef.current = window.setTimeout(() => {
      setActiveIndex(next);
      setIncomingIndex((next + 1) % testimonials.length);
      setAnimating(false);
      setTransitionEnabled(false);
      setTrackTransform(startTransform);
    }, SLIDE_DURATION_MS);
  };

  useEffect(() => {
    setIncomingIndex((activeIndex + 1) % testimonials.length);
  }, [activeIndex]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    animatingRef.current = animating;
  }, [animating]);

  useEffect(() => {
    if (!animating) {
      setTrackTransform(startTransform);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTransform]);

  useEffect(() => {
    if (!hovered) {
      clearAllTimers();
      return;
    }

    clearIntervalTimer();
    intervalRef.current = window.setInterval(step, SLIDE_INTERVAL_MS);
    return clearIntervalTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered, activeIndex]);

  useEffect(() => {
    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-xl pt-8">
      <div
        className="relative overflow-hidden rounded-none bg-card shadow-sm ring-1 ring-border"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <div
          className={
            "pointer-events-none absolute inset-0 flex will-change-transform"
          }
          style={{
            width: "200%",
            height: "100%",
            transform: trackTransform,
            transitionProperty: "transform",
            transitionDuration: transitionEnabled
              ? `${SLIDE_DURATION_MS}ms`
              : "0ms",
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <div className="w-1/2">
            <TestimonialCard
              quote={active.quote}
              name={active.name}
              title={active.title}
            />
          </div>
          <div className="w-1/2">
            <TestimonialCard
              quote={incoming.quote}
              name={incoming.name}
              title={incoming.title}
            />
          </div>
        </div>

        <div className="invisible">
          <TestimonialCard
            quote={active.quote}
            name={active.name}
            title={active.title}
          />
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
