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
} from "lucide-react";

type Member = {
  id: number;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "Active" | "Invited" | "Inactive";
  initials: string;
  color: string;
  projects: number;
  lastActive: string;
};

const members: Member[] = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.j@worklyn.io",
    role: "Owner",
    status: "Active",
    initials: "AJ",
    color: "bg-indigo-500",
    projects: 6,
    lastActive: "Just now",
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    email: "sarah.m@worklyn.io",
    role: "Admin",
    status: "Active",
    initials: "SM",
    color: "bg-rose-500",
    projects: 4,
    lastActive: "2 mins ago",
  },
  {
    id: 3,
    name: "Jordan Lee",
    email: "jordan.l@worklyn.io",
    role: "Member",
    status: "Active",
    initials: "JL",
    color: "bg-amber-500",
    projects: 3,
    lastActive: "1 hour ago",
  },
  {
    id: 4,
    name: "Taylor Brooks",
    email: "taylor.b@worklyn.io",
    role: "Member",
    status: "Active",
    initials: "TB",
    color: "bg-green-500",
    projects: 5,
    lastActive: "3 hours ago",
  },
  {
    id: 5,
    name: "Riley Chen",
    email: "riley.c@worklyn.io",
    role: "Member",
    status: "Invited",
    initials: "RC",
    color: "bg-cyan-500",
    projects: 0,
    lastActive: "Pending",
  },
  {
    id: 6,
    name: "Morgan Davis",
    email: "morgan.d@worklyn.io",
    role: "Viewer",
    status: "Active",
    initials: "MD",
    color: "bg-purple-500",
    projects: 2,
    lastActive: "Yesterday",
  },
  {
    id: 7,
    name: "Casey Nguyen",
    email: "casey.n@worklyn.io",
    role: "Member",
    status: "Inactive",
    initials: "CN",
    color: "bg-gray-400",
    projects: 1,
    lastActive: "2 weeks ago",
  },
  {
    id: 8,
    name: "Drew Palmer",
    email: "drew.p@worklyn.io",
    role: "Member",
    status: "Active",
    initials: "DP",
    color: "bg-orange-500",
    projects: 3,
    lastActive: "5 hours ago",
  },
];

const roleIcon: Record<string, React.ReactNode> = {
  Owner: <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />,
  Admin: <Shield className="h-3.5 w-3.5 text-amber-600" />,
  Member: null,
  Viewer: null,
};

const statusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Invited: "bg-blue-100 text-blue-700",
  Inactive: "bg-gray-100 text-gray-500",
};

const MembersTable = () => {
  const [search, setSearch] = useState("");

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
            Manage your team members and their roles.
          </p>
        </div>
        <button className="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex items-center gap-3">
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
                Status
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Projects
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Last Active
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
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${m.color}`}
                    >
                      {m.initials}
                    </div>
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
                    {m.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[m.status]}`}
                  >
                    {m.status}
                  </span>
                </td>

                {/* Projects */}
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {m.projects}
                </td>

                {/* Last Active */}
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {m.lastActive}
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 text-right">
                  <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
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
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
          <span className="font-medium text-foreground">{members.length}</span> members
        </p>
      </div>
    </div>
  );
};

export default MembersTable;
