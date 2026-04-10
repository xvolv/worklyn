"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users, CheckCircle2 } from "lucide-react";

interface InviteClientProps {
  workspaceName: string;
  workspaceSlug: string;
  inviteCode: string;
}

export default function InviteClient({
  workspaceName,
  workspaceSlug,
  inviteCode,
}: InviteClientProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setIsJoining(true);
    setError(null);

    try {
      const res = await fetch("/api/workspace/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join");
      }

      setJoined(true);
      setTimeout(() => {
        router.push(`/w/${workspaceSlug}/dashboard`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa] p-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {joined ? (
            <div className="animate-fade-in-up">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="mt-4 text-xl font-bold text-foreground">
                Welcome aboard!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Redirecting to {workspaceName}...
              </p>
            </div>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Users className="h-7 w-7 text-indigo-600" />
              </div>
              <h1 className="mt-5 text-xl font-bold text-foreground">
                You&apos;ve been invited!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Join{" "}
                <span className="font-semibold text-foreground">
                  {workspaceName}
                </span>{" "}
                on Worklyn to start collaborating.
              </p>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Workspace"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
