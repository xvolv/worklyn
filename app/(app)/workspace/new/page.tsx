"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Building2 } from "lucide-react";

export default function NewWorkspacePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create workspace");
      }

      const { workspace } = await res.json();
      router.push(`/w/${workspace.slug}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="-mt-[100px] flex min-h-screen items-center justify-center bg-[#f5f6fa] p-4">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            Create your workspace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Workspaces are shared environments where your team collaborates on projects and tasks.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="workspace-name"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
                maxLength={50}
                autoFocus
                className="h-11 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                disabled={isSubmitting}
              />
              {slug && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Your workspace URL will be:{" "}
                  <span className="font-medium text-indigo-600">
                    /w/{slug}
                  </span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gray-800 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
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
          </form>
        </div>
      </div>
    </div>
  );
}
