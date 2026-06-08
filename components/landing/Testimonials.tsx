"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/components/landing/testimonialsData";

const AUTO_PLAY_MS = 5000;

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, AUTO_PLAY_MS);

    return () => clearInterval(interval);
  }, [paused]);

  const prevIndex =
    (activeIndex - 1 + testimonials.length) % testimonials.length;

  const nextIndex =
    (activeIndex + 1) % testimonials.length;

  const visibleCards = [
    {
      ...testimonials[prevIndex],
      position: "left",
    },
    {
      ...testimonials[activeIndex],
      position: "center",
    },
    {
      ...testimonials[nextIndex],
      position: "right",
    },
  ];

  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className="relative h-107.5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="popLayout">
            {visibleCards.map((testimonial) => {
              const Icon = testimonial.icon;

              const positionStyles = {
                left: {
                  x: -220,
                  scale: 0.92,
                  opacity: 0.45,
                  zIndex: 10,
                },
                center: {
                  x: 0,
                  scale: 1,
                  opacity: 1,
                  zIndex: 30,
                },
                right: {
                  x: 220,
                  scale: 0.92,
                  opacity: 0.45,
                  zIndex: 10,
                },
              };

              const style =
                positionStyles[
                  testimonial.position as keyof typeof positionStyles
                ];

              return (
                <motion.div
                  key={testimonial.name}
                  className="absolute left-1/2 top-0"
                  initial={false}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    opacity: style.opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 22,
                    mass: 1,
                  }}
                  style={{
                    zIndex: style.zIndex,
                  }}
                >
                  <div className="-translate-x-1/2">
                    <div
                      className={`
                        w-90
                        rounded-3xl
                        border
                        border-border/50
                        bg-card
                        p-6
                        shadow-xl
                        backdrop-blur
                      `}
                    >
                      <div className="mb-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <p className="text-base leading-7 text-foreground/80">
                        "{testimonial.quote}"
                      </p>

                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>

                        <div>
                          <div className="font-medium">
                            {testimonial.name}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {testimonial.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-8 bg-foreground"
                    : "w-2 bg-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}