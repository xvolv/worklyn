import React from "react";
import { Sparkles, Diamond } from "lucide-react";

const Features = () => {
  return (
    <div className="grid max-w-xl grid-cols-1 gap-4 pt-5 sm:grid-cols-2 ">
      <div className="flex items-center gap-3 rounded-none bg-muted/60 px-5 py-6 ">

        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 ">
          <Sparkles />
        </span>
        <div className="text-sm font-medium">AI Orchestration</div>
      </div>

      <div className="flex items-center gap-3 rounded-none bg-muted/60 px-5 py-6">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl  text-gray-600  ">
          <Diamond />
        </span>
        <div className="text-sm font-medium">Unified Workspace</div>
      </div>
    </div>
  );
};

export default Features;
