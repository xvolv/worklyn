"use client";
import { useSession } from "@/lib/auth/auth-client";
import { signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Search, Bell, MessageSquare, LogOut, User, Settings, Menu, PanelLeftClose } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "./SidebarContext";

const DashboardHeader = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { isOpen, toggle } = useSidebar();
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email;
  const avatarUrl = userEmail
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`
    : "";

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-white px-8">
      {/* Left: Toggle + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks, projects, or team..."
            className="h-10 w-full rounded-lg border border-border bg-muted/40 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <MessageSquare className="h-5 w-5" />
        </button>
        <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          Feedback
        </button>

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-indigo-100 transition-all hover:ring-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Account menu"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600 text-xs font-bold text-white">
                  {userName[0]?.toUpperCase() || "-"}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-none">{userName}</p>
                {userEmail && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex cursor-pointer items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex cursor-pointer items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
