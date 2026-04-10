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
} from "lucide-react";

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

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-border bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <Image className="cursor-pointer h-8 w-32  object-cover" src="/logos/logo.svg" alt="Worklyn" width={48} height={48} />
       
      </div>

      {/* New Project Button */}
      <div className="px-4 pb-4">
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-gray-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <item.icon
                className={`h-[18px] w-[18px] ${isActive ? "text-indigo-600" : ""}`}
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
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
