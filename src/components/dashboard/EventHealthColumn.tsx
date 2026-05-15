import { Play } from "lucide-react";
import { LiveLogTable } from "./LiveLogTable";
import { LogPreviewDialog } from "./LogPreviewDialog";
import inputStreamIcon from "@/assets/input-stream-icon.png";

export function EventHealthColumn() {
  const inputData = {
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

  const statusBadgeClass =
    "inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold leading-none select-none";

  const inputMetadataLine = `${inputData.inputMode} · ${inputData.dimension} · ${inputData.frameRate} FPS · ${inputData.bitrateCurrent}/${inputData.bitrateAverage}k`;

  const inputLogs = [
    {
      id: 1,
      time: "03:14 PM",
      level: "Info" as const,
      source: "Ingest",
      message: "Handshake OK · H.264",
      previewMessage: "Ingest handshake OK · H.264",
    },
    {
      id: 2,
      time: "03:14 PM",
      level: "Info" as const,
      source: "Control",
      message: "Responded 200 GET",
      previewMessage: "Control plane responded 200 GET",
    },
    {
      id: 3,
      time: "03:15 PM",
      level: "Warn" as const,
      source: "Bitrate",
      message: "1420k · Buffer 74%",
      previewMessage: "Bitrate 1420k · Buffer 74%",
    },
    {
      id: 4,
      time: "03:15 PM",
      level: "Error" as const,
      source: "Network",
      message: "Packet loss 3.4% · Jitter 29ms",
      previewMessage: "Packet loss 3.4% · Jitter 29ms",
    },
    {
      id: 5,
      time: "03:16 PM",
      level: "Info" as const,
      source: "Reconnect",
      message: "OK · ap-south-1",
      previewMessage: "Reconnect OK · ap-south-1",
    },
    {
      id: 6,
      time: "03:16 PM",
      level: "Warn" as const,
      source: "Queue",
      message: "Depth 12 · Decode 18ms",
      previewMessage: "Queue depth 12 · Decode 18ms",
    },
  ];

  return (
    <div className="h-full min-h-0 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex h-full min-h-0 min-w-0 flex-col gap-3">
        {/* Header: icon + metadata on one row; Healthy on the right */}
        <div className="flex w-full min-w-0 shrink-0 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <img
              src={inputStreamIcon}
              alt=""
              aria-label="Input stream"
              title="Input stream"
              className="h-[18px] w-[18px] shrink-0 object-contain opacity-90 dark:brightness-0 dark:invert dark:opacity-95"
            />
            <p
              className="min-w-0 truncate text-xs font-medium leading-snug text-slate-700 dark:text-slate-200"
              title={inputMetadataLine}
            >
              {inputMetadataLine}
            </p>
          </div>
          <span className={`${statusBadgeClass} shrink-0 ${healthTextColor[inputData.streamHealth]}`}>
            Healthy
          </span>
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
              Logs · {inputLogs.length} events
            </span>
            <LogPreviewDialog
              title="Logs"
              description="Input stream — expanded log view."
              logs={inputLogs}
              emptyMessage="No input logs available"
              iconOnly
              triggerClassName="bg-background/90"
            />
          </div>
          <LiveLogTable
            logs={inputLogs}
            emptyMessage="No input logs available"
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
