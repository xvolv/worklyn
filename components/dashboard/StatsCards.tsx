import {
  FolderKanban,
  Zap,
  CheckCircle2,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Total Projects",
    value: "12",
    badge: "+12%",
    badgeColor: "text-indigo-600 bg-indigo-50",
    icon: FolderKanban,
    iconBg: "bg-indigo-100 text-indigo-600",
  },
  {
    label: "Active Tasks",
    value: "48",
    badge: "Steady",
    badgeColor: "text-gray-500 bg-gray-100",
    icon: Zap,
    iconBg: "bg-orange-100 text-orange-500",
  },
  {
    label: "Completed Tasks",
    value: "156",
    badge: "+24%",
    badgeColor: "text-green-600 bg-green-50",
    icon: CheckCircle2,
    iconBg: "bg-green-100 text-green-600",
  },
  {
    label: "Team Members",
    value: "8",
    badge: null,
    badgeColor: "",
    icon: Users,
    iconBg: "bg-indigo-100 text-indigo-600",
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 gap-5 rounded-none sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-3 rounded-none border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            {stat.badge && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${stat.badgeColor}`}
              >
                {stat.badge}
              </span>
            )}
            {!stat.badge && stat.label === "Team Members" && (
              <div className="flex items-center">
                <div className="h-5 w-9 rounded-full bg-gray-800 relative">
                  <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;