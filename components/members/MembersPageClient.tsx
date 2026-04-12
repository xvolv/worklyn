"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Mail,
  Shield,
  ShieldCheck,
  UserPlus,
  Filter,
  Copy,
  Check,
  Link2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/components/layout/WorkspaceContext";
import ConfirmDeleteModal from "@/components/dashboard/ConfirmDeleteModal";
import AddMemberModal from "@/components/members/AddMemberModal";

type MemberItem = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  joinedAt: string;
  taskCount: number;
};

interface MembersPageClientProps {
  members: MemberItem[];
}

const roleIcon: Record<string, React.ReactNode> = {
  OWNER: <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />,
  MEMBER: null,
};

const roleLabel: Record<string, string> = {
  OWNER: "Owner",
  MEMBER: "Member",
};

const avatarColors = [
  "bg-indigo-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-orange-500",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const MembersPageClient = ({ members: initialMembers }: MembersPageClientProps) => {
  const workspace = useWorkspace();
  const isOwner = workspace.role === "OWNER";
  const [members, setMembers] = useState(initialMembers);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workspace/${workspace.slug}/members/${memberToDelete.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Failed to remove member. They might be the last owner.");
    } catch (e) {
      alert("Error removing member.");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${workspace.inviteCode}`
      : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Team Members
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your workspace members and invite new teammates.
          </p>
        </div>
        {workspace.role === "OWNER" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Invite Link Card */}
      {workspace.role === "OWNER" && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
          <Link2 className="h-4 w-4 shrink-0 text-indigo-600" />
          <p className="flex-1 truncate text-sm text-indigo-700">
            <span className="font-medium">Invite link:</span>{" "}
            <span className="font-mono text-xs">{inviteLink || "Loading..."}</span>
          </p>
          <button
            onClick={handleCopyLink}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mt-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Member
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Role
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tasks
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Joined
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((m) => (
              <tr
                key={m.id}
                className="group transition-colors hover:bg-muted/20"
              >
                {/* Member */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={m.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.email || m.name}`} 
                      alt={m.name} 
                      className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm bg-indigo-50" 
                      loading="lazy"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {m.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {m.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {roleIcon[m.role]}
                    {roleLabel[m.role] ?? m.role}
                  </span>
                </td>

                {/* Tasks */}
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {m.taskCount}
                </td>

                {/* Joined */}
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {timeAgo(m.joinedAt)}
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 text-right">
                  {isOwner && m.role !== "OWNER" ? (
                    <button 
                      onClick={() => setMemberToDelete({ id: m.id, name: m.name })}
                      className="rounded-lg p-1.5 text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Remove Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No members found matching your search.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing{" "}
          <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          of{" "}
          <span className="font-medium text-foreground">{members.length}</span>{" "}
          members
        </p>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!memberToDelete}
        onClose={() => !isDeleting && setMemberToDelete(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        itemName={memberToDelete?.name}
        description="Are you sure you want to remove this member from the workspace? They will lose access to all projects and tasks."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MembersPageClient;
