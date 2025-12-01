import { Card } from "@/components/ui/card";
import { Eye, MessageSquare, Users, HelpCircle, Heart, Ban, Activity, Shield, UserCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      label: "Avg. Users",
      value: "12",
      icon: Users,
      change: "+5%",
      positive: true,
    },
    {
      label: "Blocked",
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
    <div className="h-full">
      <Accordion type="multiple" defaultValue={["key-metrics", "moderation-activity", "active-users"]} className="w-full space-y-3">

        {/* Key Metrics Accordion */}
        <AccordionItem value="key-metrics" className="border-none bg-card rounded-xl shadow-sm px-3">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Key Metrics</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="p-2 rounded-lg bg-muted/30 border border-border/30 flex flex-col gap-1">
                    <div className="flex items-start justify-between">
                      <div className="p-1 rounded bg-background/50 text-muted-foreground">
                        <Icon className="w-3 h-3" />
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1 py-0.5 rounded ${metric.positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                          }`}
                      >
                        {metric.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none mb-0.5">{metric.value}</p>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase truncate">{metric.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Moderation Activity Accordion */}
        <AccordionItem value="moderation-activity" className="border-none bg-card rounded-xl shadow-sm px-3">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Moderation Activity</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              {moderationStats.map((stat) => (
                <div key={stat.label} className="flex flex-col p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-[9px] font-medium text-muted-foreground uppercase truncate mb-0.5">{stat.label}</span>
                  <span className="text-xs font-bold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Active Users Accordion */}
        <AccordionItem value="active-users" className="border-none bg-card rounded-xl shadow-sm px-3">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Active Moderators</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-1">
            <div className="space-y-2">
              {["Moderator_Alpha", "Moderator_Beta", "Moderator_Gamma"].map((mod, index) => (
                <div key={mod} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-[10px] font-bold text-primary">
                      {mod.charAt(mod.indexOf("_") + 1)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-foreground truncate">{mod}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {15 + index * 5} actions today
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[9px] font-medium text-muted-foreground">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
