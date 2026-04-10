"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  UserPlus,
  Loader2,
  Mail,
  Copy,
  Check,
  Link2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/components/layout/WorkspaceContext";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchResult = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  alreadyMember: boolean;
};

const avatarColors = [
  "bg-indigo-500", "bg-amber-500", "bg-rose-500", "bg-emerald-500",
  "bg-sky-500", "bg-purple-500", "bg-teal-500", "bg-orange-500",
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getColor(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export default function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const router = useRouter();
  const workspace = useWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${workspace.inviteCode}`
      : "";

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setResult(null);
      setNotFound(false);
      setAdded(false);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !adding) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, adding, onClose]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSearching(true);
    setResult(null);
    setNotFound(false);
    setError(null);
    setAdded(false);

    try {
      const res = await fetch(
        `/api/workspace/${workspace.slug}/members/search?email=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();

      if (data.user) {
        setResult(data.user);
      } else {
        setNotFound(true);
      }
    } catch {
      setError("Failed to search. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!result) return;
    setAdding(true);
    setError(null);

    try {
      const res = await fetch(`/api/workspace/${workspace.slug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: result.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invitation");
      }

      setAdded(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px]"
        onClick={() => !adding && onClose()}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <UserPlus className="h-[18px] w-[18px] text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Add Member
                </h2>
                <p className="text-xs text-muted-foreground">
                  Add to{" "}
                  <span className="font-medium text-indigo-600">
                    {workspace.name}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => !adding && onClose()}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Email Search */}
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Search by email
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="h-10 w-full rounded-lg border border-border bg-muted/30 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    disabled={searching || adding}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !email.trim()}
                  className="flex h-10 items-center gap-1.5 rounded-lg bg-gray-800 px-4 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </form>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Search Result — User Found */}
            {result && !added && (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${getColor(result.name)}`}
                    >
                      {getInitials(result.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {result.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.email}
                      </p>
                    </div>
                  </div>

                  {result.alreadyMember ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Already a member
                    </span>
                  ) : (
                    <button
                      onClick={handleAdd}
                      disabled={adding}
                      className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {adding ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      Invite
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Added Success */}
            {added && result && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-700">
                  ✓ Invitation sent to {result.name}
                </p>
                <p className="mt-0.5 text-xs text-emerald-600">
                  They'll see it in their sidebar and can accept or decline.
                </p>
              </div>
            )}

            {/* Not Found — Show Invite Link */}
            {notFound && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      No account found
                    </p>
                    <p className="mt-0.5 text-xs text-amber-700">
                      Share this invite link so they can sign up and join your
                      workspace.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <p className="flex-1 truncate text-xs font-mono text-amber-800">
                    {inviteLink}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="flex h-7 items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            {/* Divider + Invite Link Fallback */}
            {!result && !notFound && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  or share invite link
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="flex-1 truncate text-xs font-mono text-muted-foreground">
                    {inviteLink || "Loading..."}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="flex h-7 items-center gap-1 rounded-md border border-border bg-white px-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
