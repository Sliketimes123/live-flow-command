import { Card } from "@/components/ui/card";
import { Eye, MessageSquare, Users, TrendingUp } from "lucide-react";

export function EventSummary() {
  const metrics = [
    {
      label: "Total Views",
      value: "2,547",
      icon: Eye,
      change: "+12%",
      positive: true,
    },
    {
      label: "Chat Messages",
      value: "1,234",
      icon: MessageSquare,
      change: "+8%",
      positive: true,
    },
    {
      label: "Active Viewers",
      value: "432",
      icon: Users,
      change: "+5%",
      positive: true,
    },
    {
      label: "Engagement Rate",
      value: "68%",
      icon: TrendingUp,
      change: "+3%",
      positive: true,
    },
  ];

  const moderationStats = [
    { label: "Messages Deleted", value: "23" },
    { label: "Users Timed Out", value: "5" },
    { label: "Users Banned", value: "2" },
    { label: "Questions Approved", value: "18" },
    { label: "Highlights Marked", value: "7" },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-4 surface-elevated border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    metric.positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Moderation Activity */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Moderation Activity
        </h3>
        <Card className="p-4 surface-elevated border-border">
          <div className="grid grid-cols-2 gap-4">
            {moderationStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Active Moderators */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Active Moderators
        </h3>
        <Card className="p-4 surface-elevated border-border">
          <div className="space-y-3">
            {["Moderator_Alpha", "Moderator_Beta", "Moderator_Gamma"].map((mod, index) => (
              <div key={mod} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {mod.charAt(mod.indexOf("_") + 1)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{mod}</p>
                  <p className="text-xs text-muted-foreground">
                    {15 + index * 5} actions today
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
