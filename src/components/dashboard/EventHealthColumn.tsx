import { Activity, Eye, ExternalLink, Play } from "lucide-react";
import { LiveLogTable } from "./LiveLogTable";
import { LogPreviewDialog } from "./LogPreviewDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export function EventHealthColumn() {

  const inputData = {
    primaryInput: "RTMP",
    streamHealth: "stable" as const,
    inputMode: "RTMP",
    bitrateCurrent: 1470,
    bitrateAverage: 1451,
    dimension: "1280×720",
    frameRate: 25,
  };

  const healthTextColor = {
    stable: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    poor: "text-destructive bg-destructive/10 border-destructive/20",
  };
  const inputLogs = [
    {
      id: 54,
      level: "Debug" as const,
      time: "4m ago",
      source: "testdata/input.log",
      message: "DEBUG time:2024-01-25 19:00:00 host:127.0.0.1 status:200 method:GET",
    },
    {
      id: 53,
      level: "Info" as const,
      time: "4m ago",
      source: "testdata/input.log",
      message: "INFO time:2024-01-25 19:00:00 host:127.0.0.1 status:200 method:GET",
    },
    {
      id: 52,
      level: "Warn" as const,
      time: "4m ago",
      source: "testdata/input.log",
      message: "WARN time:2024-01-25 19:00:00 host:127.0.0.1 bitrate:1420k buffer:74%",
    },
    {
      id: 51,
      level: "Error" as const,
      time: "5m ago",
      source: "testdata/input.log",
      message: "ERROR time:2024-01-25 18:59:00 host:127.0.0.1 packet-loss:3.4% jitter:29ms",
    },
    {
      id: 50,
      level: "Info" as const,
      time: "6m ago",
      source: "testdata/input.log",
      message: "INFO time:2024-01-25 18:58:00 host:127.0.0.1 reconnect:ok region:ap-south-1",
    },
    {
      id: 49,
      level: "Debug" as const,
      time: "7m ago",
      source: "testdata/input.log",
      message: "DEBUG time:2024-01-25 18:57:00 host:127.0.0.1 queue-depth:12 processing-ms:18",
    },
  ];

  return (
    <div className="h-full min-h-0 rounded-2xl border border-border/70 bg-card p-4">
      <div className="h-full min-h-0 flex flex-col">
        <div className="mb-2 flex items-center justify-between gap-2 min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">Input</h2>
          <span
            className={`shrink-0 whitespace-nowrap px-3 py-0.5 rounded-full text-xs font-semibold border ${healthTextColor[inputData.streamHealth]}`}
          >
            Healthy
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
                      <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                      {inputData.inputMode}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p>Input mode: {inputData.inputMode}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium">
                      <Eye className="w-2.5 h-2.5 text-muted-foreground" />
                      {inputData.dimension}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p>Resolution: {inputData.dimension}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium">
                      <Play className="w-2.5 h-2.5 text-muted-foreground" />
                      {inputData.frameRate} FPS
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p>Frame rate: {inputData.frameRate} FPS</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium font-mono tabular-nums">
                      <Activity className="w-2.5 h-2.5 text-muted-foreground" />
                      {inputData.bitrateCurrent}/{inputData.bitrateAverage}k
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p>Bitrate current/avg: {inputData.bitrateCurrent}/{inputData.bitrateAverage}k</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              </div>
              <div className="shrink-0">
                <LogPreviewDialog
                  title="Input Logs"
                  description="Expanded view for input stream logs."
                  logs={inputLogs}
                  emptyMessage="No input logs available"
                  iconOnly
                  triggerClassName="h-6 w-6 bg-background/90"
                />
              </div>
            </div>
            <LiveLogTable
              logs={inputLogs}
              emptyMessage="No input logs available"
              tableHeight="h-[220px]"
              showTitle={false}
              bordered={false}
              className="min-h-0 flex-1 flex flex-col"
              tableContainerClassName="mt-2 min-h-0 flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
