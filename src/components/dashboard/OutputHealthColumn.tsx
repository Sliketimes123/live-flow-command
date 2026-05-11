import { Play, Settings, Lock, Layers } from "lucide-react";
import { LiveLogTable } from "./LiveLogTable";
import { LogPreviewDialog } from "./LogPreviewDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OutputHealthColumnProps {
  publishingHealth: "stable" | "warning" | "poor";
}

export function OutputHealthColumn({
  publishingHealth,
}: OutputHealthColumnProps) {
  const outputData = {
    status: "Healthy",
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
      id: 54,
      level: "Info" as const,
      time: "4m ago",
      source: "testdata/output.log",
      message: "INFO time:2024-01-25 19:00:00 host:128.0.0.1 status:200 method:GET",
    },
    {
      id: 53,
      level: "Debug" as const,
      time: "4m ago",
      source: "testdata/output.log",
      message: "DEBUG time:2024-01-25 19:00:00 host:128.0.0.1 status:200 method:GET",
    },
    {
      id: 52,
      level: "Error" as const,
      time: "5m ago",
      source: "testdata/output.log",
      message: "ERROR time:2024-01-25 18:59:00 host:128.0.0.1 reconnect:true dropped-frames:22",
    },
    {
      id: 51,
      level: "Danger" as const,
      time: "6m ago",
      source: "testdata/output.log",
      message: "CRITICAL time:2024-01-25 18:58:00 host:128.0.0.1 stream-health:degraded",
    },
  ];
  const destinationHealthLogs = [
    {
      id: "yt-live",
      destination: "YouTube",
      status: "Healthy",
      latency: "2.1s",
      detail: "No dropped segments",
      checkedAt: "10s ago",
    },
    {
      id: "fb-live",
      destination: "Facebook",
      status: "Warning",
      latency: "4.8s",
      detail: "2 segment retries",
      checkedAt: "14s ago",
    },
    {
      id: "cdn-backup",
      destination: "Backup CDN",
      status: "Healthy",
      latency: "1.7s",
      detail: "Stable ingest",
      checkedAt: "9s ago",
    },
  ];
  const destinationHealthMicroLogs = (
    <div className="mt-2 rounded-lg border border-border/50 bg-background/40 p-2">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Publishing Destination Health
      </p>
      <div className="space-y-1">
        {destinationHealthLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-card/60 px-2 py-1"
          >
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-foreground">{log.destination}</p>
              <p className="truncate text-[10px] text-muted-foreground">{log.detail}</p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`text-[10px] font-semibold ${
                  log.status === "Healthy" ? "text-success" : "text-warning"
                }`}
              >
                {log.status}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {log.latency} | {log.checkedAt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full min-h-0 rounded-2xl border border-border/70 bg-card p-4">
      <div className="h-full min-h-0 flex flex-col">
        <div className="mb-2 flex items-center justify-between gap-2 min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">Output</h2>
          <span className={`shrink-0 whitespace-nowrap px-3 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border/50 group">
            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
              <Play className="w-8 h-8 text-white/50 group-hover:text-white/80 transition-colors" fill="currentColor" />
            </div>
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-600/90 rounded flex items-center gap-1 border border-red-500/50">
              <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold uppercase tracking-wider leading-none">LIVE</span>
            </div>
          </div>

        </div>

        <div className="pr-2 min-h-0 flex-1">
          <div className="h-full min-h-0 rounded-xl border border-border/60 bg-card p-3 flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 whitespace-nowrap overflow-x-auto custom-scrollbar hover-scrollbar min-w-0">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium">
                      <Settings className="w-2.5 h-2.5 text-muted-foreground" />
                      {outputData.streamType}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p>Output type: {outputData.streamType}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium">
                      <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                      {outputData.encryption}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p>Encryption enabled: {outputData.encryption}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium">
                      <Layers className="w-2.5 h-2.5 text-muted-foreground" />
                      {outputData.quality} Quality
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p>Output quality: {outputData.quality}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              </div>
              <div className="shrink-0">
                <LogPreviewDialog
                  title="Output Logs"
                  description="Expanded view for output stream logs."
                  logs={outputLogs}
                  emptyMessage="No output logs available"
                  extraContent={destinationHealthMicroLogs}
                  iconOnly
                  triggerClassName="h-6 w-6 bg-background/90"
                />
              </div>
            </div>
            <LiveLogTable
              logs={outputLogs}
              emptyMessage="No output logs available"
              tableHeight="h-full"
              showTitle={false}
              bordered={false}
              className="min-h-0 flex-1 flex flex-col"
              tableContainerClassName="mt-2 min-h-0 flex-1"
              extraContent={destinationHealthMicroLogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
