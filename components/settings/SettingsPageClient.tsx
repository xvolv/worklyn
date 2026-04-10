"use client";

import { signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

const SettingsPageClient = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-sm font-bold text-foreground">Log out</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign out of your account on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageClient;
