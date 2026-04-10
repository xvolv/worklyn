"use client";

import { useState } from "react";
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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  SETTINGS NAV                                                      */
/* ------------------------------------------------------------------ */

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "billing", label: "Billing", icon: CreditCard },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

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
                  Update your avatar for your workspace.
                </p>
                <div className="mt-4 flex items-center gap-5">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
                      AJ
                    </div>
                    <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
                      Upload Photo
                    </button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
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
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Alex"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Johnson"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="alex.j@worklyn.io"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Job Title
                    </label>
                    <input
                      type="text"
                      defaultValue="Product Manager"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <button className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
                    Save Changes
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
