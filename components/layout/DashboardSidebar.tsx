"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  HelpCircle,
  Headphones,
  Plus,
  X,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Members", href: "/members", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

const bottomItems = [
  { label: "Help", href: "#", icon: HelpCircle },
  { label: "Support", href: "#", icon: Headphones },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { isOpen, width, isDragging, close, startDrag } = useSidebar();

  return (
    <>
      {/* Overlay — only visible on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[2px] lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-white ${
          isDragging ? "" : "transition-transform duration-300 ease-in-out"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: `${width}px` }}
      >
        {/* Logo + Close */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <Image
            className="cursor-pointer h-8 w-32 object-cover"
            src="/logos/logo.svg"
            alt="Worklyn"
            width={48}
            height={48}
          />
          <button
            onClick={close}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Project Button */}
        <div className="px-4 pb-4">
          <button className="flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-gray-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-red-50 text-red-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-red-600" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="border-t border-border px-3 py-3 space-y-0.5">
          {bottomItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground whitespace-nowrap"
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Drag Handle — right edge */}
        <div
          className="absolute inset-y-0 -right-[3px] w-[6px] cursor-col-resize group z-40"
          onMouseDown={startDrag}
        >
          <div className="h-full w-[2px] mx-auto transition-colors group-hover:bg-indigo-400 group-active:bg-indigo-500" />
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
