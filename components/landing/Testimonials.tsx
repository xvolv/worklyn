import React from "react";

const Testimonials = () => {
  return (
    <div className="max-w-xl pt-8">
      <div className="rounded-none bg-card p-6 shadow-sm ring-1 ring-border">
        <p className="text-sm leading-6 text-foreground/80">
          “Worklyn replaced four of our fragmented tools. It's the first
          workspace that feels like it was actually designed for the way we
          work, not just another database.”
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="leading-tight">
            <div className="text-sm font-medium">Sarah Jenkins</div>
            <div className="text-xs text-muted-foreground">
              Design Director at LinearFlow
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
