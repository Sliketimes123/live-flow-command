import { Play } from "lucide-react";
import { LiveLogTable } from "./LiveLogTable";
import { LogPreviewDialog } from "./LogPreviewDialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import outputStreamIcon from "@/assets/output-stream-icon.png";

interface OutputHealthColumnProps {
  publishingHealth: "stable" | "warning" | "poor";
  socialDestinations: Array<{
    id: string;
    channelName: string;
    status: "ONLINE" | "OFFLINE";
    platform: "YouTube" | "Facebook";
    isPublished: boolean;
  }>;
}

export function OutputHealthColumn({
  publishingHealth,
  socialDestinations,
}: OutputHealthColumnProps) {
  const outputData = {
    streamType: "HLS",
    quality: "HD",
    encryption: "No",
  };

  const statusMeta = {
    stable: { label: "Healthy", cls: "text-success bg-success/10 border-success/20" },
    warning: { label: "Warning", cls: "text-warning bg-warning/10 border-warning/20" },
    poor: { label: "Error", cls: "text-destructive bg-destructive/10 border-destructive/20" },
  } as const;

  const statusLabel = statusMeta[publishingHealth].label;
  const statusClass = statusMeta[publishingHealth].cls;

  const outputLogs = [
    {
      id: 1,
      time: "03:14 PM",
      level: "Info" as const,
      source: "Manifest",
      message: "Request 200",
      previewMessage: "Manifest request 200",
    },
    {
      id: 2,
      time: "03:15 PM",
      level: "Warn" as const,
      source: "Segment",
      message: "Latency elevated",
      previewMessage: "Segment latency elevated",
    },
    {
      id: 3,
      time: "03:15 PM",
      level: "Error" as const,
      source: "Reconnect",
      message: "22 dropped frames",
      previewMessage: "Reconnecting · 22 dropped frames",
    },
    {
      id: 4,
      time: "03:16 PM",
      level: "Error" as const,
      source: "Health",
      message: "Stream health degraded",
      previewMessage: "Stream health degraded",
    },
  ];

  const publishedDestinations = socialDestinations.filter((d) => d.isPublished);

  const statusBadgeClass =
    "inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold leading-none select-none outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const outputMetadataLine = `${outputData.streamType} · ${outputData.encryption} Enc · ${outputData.quality} Quality`;

  return (
    <div className="h-full min-h-0 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex h-full min-h-0 min-w-0 flex-col gap-3">
        {/* Header: icon + metadata on one row; Healthy on the right */}
        <div className="flex w-full min-w-0 shrink-0 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <img
              src={outputStreamIcon}
              alt=""
              aria-label="Output stream"
              title="Output stream"
              className="h-[18px] w-[18px] shrink-0 object-contain opacity-90 dark:brightness-0 dark:invert dark:opacity-95"
            />
            <p
              className="min-w-0 truncate text-xs font-medium leading-snug text-slate-700 dark:text-slate-200"
              title={outputMetadataLine}
            >
              {outputMetadataLine}
            </p>
          </div>
          <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <button type="button" className={`${statusBadgeClass} shrink-0 cursor-default ${statusClass}`}>
                {statusLabel}
              </button>
            </HoverCardTrigger>
            <HoverCardContent side="bottom" align="end" className="w-72 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Publishing destination health
              </p>
              {publishedDestinations.length > 0 ? (
                <div className="space-y-1.5">
                  {publishedDestinations.map((d, index) => {
                    const isHealthy = d.status === "ONLINE";
                    const latency = `${(2.1 + index * 0.4).toFixed(1)}s`;
                    return (
                      <div key={d.id} className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <div
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-yellow-400"}`}
                          />
                          <span className="truncate text-[11px] text-foreground/90">{d.channelName}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className={`text-[10px] font-semibold ${isHealthy ? "text-success" : "text-warning"}`}>
                            {isHealthy ? "Healthy" : "Warning"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{latency}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">No published destinations.</p>
              )}
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Player — 16:9 scales with column width */}
        <div className="relative aspect-video w-full min-w-0 shrink-0 overflow-hidden rounded-[14px] border border-border/50 bg-[#050608] group [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:object-cover [&_video]:absolute [&_video]:inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover">
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
            <Play className="h-8 w-8 text-white/50 transition-colors group-hover:text-white/80" fill="currentColor" />
          </div>
        </div>

        {/* Logs section */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold tracking-[0.5px] text-slate-700 dark:text-slate-300">
              Logs · {outputLogs.length} events
            </span>
            <LogPreviewDialog
              title="Logs"
              description="Output stream — expanded log view."
              logs={outputLogs}
              emptyMessage="No output logs available"
              iconOnly
              triggerClassName="bg-background/90"
            />
          </div>
          <LiveLogTable
            logs={outputLogs}
            emptyMessage="No output logs available"
            compact
            tableHeight="h-full"
            showTitle={false}
            bordered={false}
            className="min-h-0 flex-1"
          />
        </div>
      </div>
    </div>
  );
}
