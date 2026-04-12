"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Plus,
  Users,
  FolderKanban,
  ChevronRight,
  Loader2,
  Shield,
  ShieldCheck,
  X,
  Sparkles,
  ImagePlus,
} from "lucide-react";

type WorkspaceCard = {
  id: string;
  name: string;
  slug: string;
  role: string;
  memberCount: number;
  projectCount: number;
};

interface WorkspacesHomeProps {
  userName: string;
  workspaces: WorkspaceCard[];
}

const roleLabel: Record<string, string> = {
  OWNER: "Owner",
  MEMBER: "Member",
};

const roleIcon: Record<string, React.ReactNode> = {
  OWNER: <ShieldCheck className="h-3 w-3 text-indigo-500" />,
  MEMBER: null,
};

const cardColors = [
  "from-indigo-500 to-indigo-600",
  "from-rose-500 to-rose-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-sky-500 to-sky-600",
  "from-purple-500 to-purple-600",
  "from-teal-500 to-teal-600",
];

function getCardColor(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return cardColors[hash % cardColors.length];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function WorkspacesHome({
  userName,
  workspaces,
}: WorkspacesHomeProps) {
  const router = useRouter();
  const firstName = userName.split(" ")[0];
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const res = await fetch("/api/workspace", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create workspace");
      }

      const { workspace } = await res.json();
      window.location.href = `/w/${workspace.slug}/dashboard`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a workspace or create a new one to get started.
        </p>
      </div>

      {/* Workspace Grid */}
      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/w/${ws.slug}/dashboard`}
              className="group relative overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:shadow-md hover:border-indigo-200"
            >
              <div
                className={`h-2 bg-gradient-to-r from-gray-500 to-gray-600`}
              />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 shadow-sm`}
                    >
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {ws.name}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        {roleIcon[ws.role]}
                        <span>{roleLabel[ws.role] ?? ws.role}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {ws.memberCount} member{ws.memberCount !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="h-3.5 w-3.5" />
                    {ws.projectCount} project{ws.projectCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Create New Card */}
          <button
            onClick={() => setShowModal(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-white/50 p-8 text-muted-foreground transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-dashed border-current">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">New Workspace</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <Building2 className="h-8 w-8 text-indigo-500" />
          </div>
          <h2 className="mt-5 text-lg font-bold text-foreground">
            No workspaces yet
          </h2>
          <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
            Create a workspace to start collaborating with your team on projects
            and tasks.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create Workspace
          </button>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px]"
            onClick={() => !isSubmitting && setShowModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-modal-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                    <Sparkles className="h-[18px] w-[18px] text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      New Workspace
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Create a shared environment for your team
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isSubmitting && setShowModal(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="ws-name"
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
                  >
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Workspace Name
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ws-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    maxLength={50}
                    autoFocus
                    className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    disabled={isSubmitting}
                  />
                  {slug && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      URL:{" "}
                      <span className="font-medium text-indigo-600">
                        /w/{slug}
                      </span>
                    </p>
                  )}
                </div>

                {/* Cover Image */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
                    Cover Image
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <label
                    htmlFor="ws-cover"
                    className="flex h-24 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    )}
                  </label>
                  <input
                    id="ws-cover"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className="h-10 rounded-lg px-4 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="flex h-10 items-center gap-2 rounded-lg bg-gray-800 px-5 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Workspace"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
