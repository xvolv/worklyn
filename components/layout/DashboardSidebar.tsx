import Link from "next/link";
import Image from "next/image";
import {
  LayoutGrid,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  Plus,
  HelpCircle,
  LifeBuoy,
} from "lucide-react";

const DashboardSidebar = () => {
  return (
    <aside className="flex h-dvh w-[260px] flex-col border-r border-border bg-background px-4 py-5">
      <div className="flex items-center gap-3 px-1">
        <div className="flex items-center justify-center ">
          <Image
            src="/logos/logo.svg"
            alt="Worklyn"
            width={100}
            height={100}
         
          />
        </div>
        <div className="leading-tight">

        </div>
      </div>

      <div className="pt-5">
        <Link
          href="/projects/new"
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-600/90"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        <Link
          href="/dashboard"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          Dashboard
        </Link>
        <Link
          href="/projects"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
          Projects
        </Link>
        <Link
          href="/tasks"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          Tasks
        </Link>
        <Link
          href="/members"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Users className="h-4 w-4 text-muted-foreground" />
          Members
        </Link>
        <Link
          href="/settings"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          Settings
        </Link>
      </nav>

      <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
        <Link
          href="#"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          Help
        </Link>
        <Link
          href="#"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <LifeBuoy className="h-4 w-4 text-muted-foreground" />
          Support
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
