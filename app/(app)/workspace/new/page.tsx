"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ImagePlus, Loader2 } from "lucide-react";

export default function NewWorkspacePage() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    setIsSubmitting(true);
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
    <div className="mx-auto w-full max-w-lg py-12">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <Building2 className="h-7 w-7 text-gray-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Create a Workspace
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A workspace is a shared environment for your team to collaborate.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            disabled={isSubmitting}
          />
          {slug && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              URL: <span className="font-medium text-gray-700">/w/{slug}</span>
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
            Cover Image
            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </label>
          <label
            htmlFor="ws-cover"
            className="flex h-24 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-gray-400 overflow-hidden"
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

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gray-800 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 disabled:opacity-50"
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
  );
}
