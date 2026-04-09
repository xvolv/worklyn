import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Search } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-background px-6 py-4">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 inline-flex w-10 items-center justify-center text-muted-foreground">
          <Search className="h-4 w-4" />
        </span>
        <input
          className="h-10 w-full rounded-2xl border border-input bg-muted/40 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          placeholder="Search tasks, projects, or team..."
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-muted"
          type="button"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
        </button>

        <Link
          href="#"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          Feedback
        </Link>

        <div className="h-10 w-px bg-border" />

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted"
          type="button"
          aria-label="User menu"
        >
          <Image
            src="/testimonies/test1.png"
            alt="User"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
