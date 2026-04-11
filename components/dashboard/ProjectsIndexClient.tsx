"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FolderKanban, Plus, Clock, Users } from "lucide-react";
import CreateProjectModal from "./CreateProjectModal";
import { useWorkspace } from "../layout/WorkspaceContext";

type ProjectItem = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  dueDate: string | null;
  taskCount: number;
};

interface ProjectsIndexClientProps {
  projects: ProjectItem[];
}

export default function ProjectsIndexClient({ projects }: ProjectsIndexClientProps) {
  const workspace = useWorkspace();
  const isOwner = workspace.role === "OWNER";
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsProjectModalOpen(true);
      // Clean up URL without triggering a full page reload
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  return (
    <div className="mx-auto w-full max-w-7xl font-sans text-gray-900 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Projects Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of all active initiatives inside this workspace.</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-24 bg-gray-50/50">
          <FolderKanban className="h-14 w-14 text-indigo-300" />
          <h2 className="mt-5 text-xl font-bold text-gray-700">No projects yet</h2>
          <p className="mt-1 text-sm text-gray-500">Create your first project to organize the workspace.</p>
          {isOwner && (
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              New Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/w/${workspace.slug}/projects/${proj.id}`}
              className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  {proj.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {proj.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                {proj.description || "No description provided."}
              </p>
              
              <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4 text-xs font-semibold text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{proj.dueDate ? new Date(proj.dueDate).toLocaleDateString() : "No due date"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-indigo-700">
                    {proj.taskCount} tasks
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </div>
  );
}
