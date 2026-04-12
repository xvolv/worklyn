"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { useWorkspace } from "../layout/WorkspaceContext";
import {
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  CreditCard,
  ChevronRight,
  Camera,
  Moon,
  Sun,
  Building2,
  Loader2
} from "lucide-react";

interface SettingsPanelProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  workspaceData: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
  };
}

const SettingsPanel = ({ user, workspaceData }: SettingsPanelProps) => {
  const workspace = useWorkspace();
  
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    ...(workspace.role === "OWNER" ? [{ id: "workspace", label: "Workspace", icon: Building2 }] : []),
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language & Region", icon: Globe },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  
  // Profile State
  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);
  const [profileSaveStatus, setProfileSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Workspace State
  const [wsName, setWsName] = useState(workspaceData.name);
  const [wsSlug, setWsSlug] = useState(workspaceData.slug);
  const [wsDescription, setWsDescription] = useState(workspaceData.description || "");
  const [wsSaveStatus, setWsSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [wsImageFile, setWsImageFile] = useState<File | null>(null);
  const [wsImagePreview, setWsImagePreview] = useState<string | null>(null);
  const wsFileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();

  const handleSaveProfile = async () => {
    setProfileSaveStatus("saving");
    try {
      const formData = new FormData();
      formData.append("name", userName);
      if (profileImageFile) {
        formData.append("image", profileImageFile);
      }

      const res = await fetch("/api/user", {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update profile");
      
      const data = await res.json();
      // Sync better-auth cache immediately for header
      await authClient.updateUser({ name: userName, image: data.user?.image || user.image });

      setProfileSaveStatus("saved");
      router.refresh();

      setTimeout(() => setProfileSaveStatus("idle"), 2500);
    } catch (e) {
      console.error(e);
      setProfileSaveStatus("idle");
    }
  };

  const handleSaveWorkspace = async () => {
    setWsSaveStatus("saving");
    try {
      const formData = new FormData();
      formData.append("name", wsName);
      formData.append("slug", wsSlug);
      formData.append("description", wsDescription);
      if (wsImageFile) {
        formData.append("image", wsImageFile);
      }

      const res = await fetch(`/api/workspace/${workspace.slug}/update`, {
        method: "PUT",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update workspace");
      
      setWsSaveStatus("saved");
      setTimeout(() => {
        setWsSaveStatus("idle");
        if (wsSlug !== workspace.slug) {
          window.location.href = `/w/${wsSlug}/settings`;
        } else {
          router.refresh();
        }
      }, 1000);
    } catch (e: any) {
      console.error(e);
      setWsSaveStatus("idle");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and workspace configuration.
        </p>
      </div>

      {/* Layout */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Tabs Nav */}
        <nav className="space-y-1 rounded-xl border border-border bg-white p-2 shadow-sm h-fit">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon
                  className={`h-4 w-4 ${isActive ? "text-indigo-600" : ""}`}
                />
                {tab.label}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-indigo-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="space-y-6">
          {/* Profile Section */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Photo */}
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground">
                  Profile Photo
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your personal avatar.
                </p>
                <div className="mt-4 flex items-center gap-5">
                  <div className="relative">
                    {profileImagePreview || user.image ? (
                      <img src={profileImagePreview || user.image!} alt="Avatar" className="h-20 w-20 rounded-full object-cover shadow-sm bg-muted" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button 
                      onClick={() => profileFileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input 
                      type="file" 
                      ref={profileFileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProfileImageFile(file);
                          setProfileImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
               
                </div>
              </div>

              {/* Personal Info */}
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground">
                  Personal Information
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your personal details.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
                      title="Email cannot be changed directly"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={profileSaveStatus !== "idle"}
                    className="flex min-w-[120px] items-center justify-center rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700 disabled:opacity-50"
                  >
                    {profileSaveStatus === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : profileSaveStatus === "saved" ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Workspace Section */}
          {activeTab === "workspace" && workspace.role === "OWNER" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground">
                  Workspace Identity
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your workspace image.
                </p>
                <div className="mt-4 flex items-center gap-5">
                  <div className="relative">
                    {wsImagePreview || workspaceData.imageUrl ? (
                      <img src={wsImagePreview || workspaceData.imageUrl!} alt="Workspace Image" className="h-20 w-20 rounded-lg object-cover shadow-sm bg-muted" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-xl font-bold text-white">
                        <Building2 className="h-8 w-8" />
                      </div>
                    )}
                    <button 
                      onClick={() => wsFileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input 
                      type="file" 
                      ref={wsFileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setWsImageFile(file);
                          setWsImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => wsFileInputRef.current?.click()}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                    >
                      Upload Image
                    </button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground">
                  Workspace Details
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your shared workspace identity.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-5 max-w-lg">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={wsName}
                      onChange={(e) => setWsName(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Workspace URL Slug
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">
                        worklyn.com/w/
                      </span>
                      <input
                        type="text"
                        value={wsSlug}
                        onChange={(e) => setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="h-10 flex-1 rounded-none rounded-r-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Workspace Description
                    </label>
                    <textarea
                      value={wsDescription}
                      onChange={(e) => setWsDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none custom-scrollbar"
                      placeholder="Briefly describe the purpose of this workspace..."
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-start">
                  <button 
                    onClick={handleSaveWorkspace}
                    disabled={wsSaveStatus !== "idle"}
                    className="flex min-w-[120px] items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {wsSaveStatus === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : wsSaveStatus === "saved" ? "Saved!" : "Save Workspace"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeTab === "notifications" && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-foreground">
                Notification Preferences
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose how and when you want to be notified.
              </p>
              <div className="mt-5 space-y-5">
                {[
                  {
                    title: "Email Notifications",
                    desc: "Receive email updates for task assignments and mentions.",
                    checked: emailNotif,
                    onChange: setEmailNotif,
                  },
                  {
                    title: "Push Notifications",
                    desc: "Get real-time push notifications in your browser.",
                    checked: pushNotif,
                    onChange: setPushNotif,
                  },
                  {
                    title: "Weekly Digest",
                    desc: "Receive a weekly summary of your workspace activity.",
                    checked: weeklyDigest,
                    onChange: setWeeklyDigest,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => item.onChange(!item.checked)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        item.checked ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          item.checked ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeTab === "appearance" && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-foreground">
                Appearance
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Customize how Worklyn looks for you.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-colors ${
                    !darkMode
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-border hover:border-gray-300"
                  }`}
                >
                  <Sun
                    className={`h-8 w-8 ${!darkMode ? "text-indigo-600" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-sm font-semibold ${!darkMode ? "text-indigo-700" : "text-foreground"}`}
                  >
                    Light Mode
                  </span>
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-colors ${
                    darkMode
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-border hover:border-gray-300"
                  }`}
                >
                  <Moon
                    className={`h-8 w-8 ${darkMode ? "text-indigo-600" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-sm font-semibold ${darkMode ? "text-indigo-700" : "text-foreground"}`}
                  >
                    Dark Mode
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground">
                  Change Password
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your password to keep your account secure.
                </p>
                <div className="mt-5 max-w-md space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <button className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground">
                  Two-Factor Authentication
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add an extra layer of security to your account.
                </p>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Authenticator App
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Use an authenticator app for 2FA codes
                      </p>
                    </div>
                  </div>
                  <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Language Section */}
          {activeTab === "language" && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-foreground">
                Language & Region
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Set your preferred language and regional settings.
              </p>
              <div className="mt-5 max-w-md space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Language
                  </label>
                  <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Timezone
                  </label>
                  <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (London)</option>
                    <option>UTC+3 (East Africa)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date Format
                  </label>
                  <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <button className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Billing Section */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground">
                  Current Plan
                </h3>
                <div className="mt-4 flex items-center justify-between rounded-lg border-2 border-indigo-200 bg-indigo-50 p-5">
                  <div>
                    <p className="text-lg font-bold text-indigo-700">
                      Pro Plan
                    </p>
                    <p className="mt-0.5 text-sm text-indigo-600/70">
                      $12/user/month · 8 team members
                    </p>
                  </div>
                  <button className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground">
                  Payment Method
                </h3>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-foreground">
                      💳
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        •••• •••• •••• 4242
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires 12/2027
                      </p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700">
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
