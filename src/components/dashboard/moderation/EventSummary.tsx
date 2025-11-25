import { Card } from "@/components/ui/card";
import { Eye, MessageSquare, Users, HelpCircle, Heart, Ban } from "lucide-react";

export function EventSummary() {
  const metrics = [
    {
      label: "Total Users",
      value: "47",
      icon: Eye,
      change: "+12%",
      positive: true,
    },
    {
      label: "Chat Messages",
      value: "89",
      icon: MessageSquare,
      change: "+8%",
      positive: true,
    },
    {
      label: "Average Concurrent Users",
      value: "12",
      icon: Users,
      change: "+5%",
      positive: true,
    },
    {
      label: "Blocked Users",
      value: "3",
      icon: Ban,
      change: "+2",
      positive: false,
    },
    {
      label: "Q&A",
      value: "24",
      icon: HelpCircle,
      change: "+8%",
      positive: true,
    },
    {
      label: "Reactions",
      value: "156",
      icon: Heart,
      change: "+15%",
      positive: true,
    },
  ];

  const moderationStats = [
    { label: "Messages Deleted", value: "23" },
    { label: "Selected Chats", value: "5" },
    { label: "Queued Questions", value: "2" },
    { label: "Selected Questions", value: "18" },
    { label: "Skipped Questions", value: "7" },
  ];

  return (
    <div className="space-y-3">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-2 surface-elevated border-border">
              <div className="flex items-start justify-between mb-1.5">
                <div className="p-1.5 rounded bg-primary/10">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    metric.positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <div>
                <p className="text-base font-bold text-foreground mb-0.5">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Moderation Activity */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Moderation Activity
        </h3>
        <Card className="p-2 surface-elevated border-border">
          <div className="grid grid-cols-2 gap-2">
            {moderationStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between py-1">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <span className="text-sm font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Active Users */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Active Users
        </h3>
        <Card className="p-2 surface-elevated border-border">
          <div className="space-y-2">
            {["Moderator_Alpha", "Moderator_Beta", "Moderator_Gamma"].map((mod, index) => (
              <div key={mod} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {mod.charAt(mod.indexOf("_") + 1)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{mod}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {15 + index * 5} actions today
                  </p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
