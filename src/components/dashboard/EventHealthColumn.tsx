import { Play } from "lucide-react";
import { LiveLogTable } from "./LiveLogTable";
import { StreamDirectionLabel } from "./StreamDirectionLabel";

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
      time: "15:14",
      level: "Info" as const,
      source: "Ingest",
      message: "Handshake OK · H.264",
      previewMessage: "Ingest handshake OK · H.264",
    },
    {
      id: 2,
      time: "15:14",
      level: "Info" as const,
      source: "Control",
      message: "Responded 200 GET",
      previewMessage: "Control plane responded 200 GET",
    },
    {
      id: 3,
      time: "15:15",
      level: "Warn" as const,
      source: "Bitrate",
      message: "1420k · Buffer 74%",
      previewMessage: "Bitrate 1420k · Buffer 74%",
    },
    {
      id: 4,
      time: "15:15",
      level: "Error" as const,
      source: "Network",
      message: "Packet loss 3.4% · Jitter 29ms",
      previewMessage: "Packet loss 3.4% · Jitter 29ms",
    },
    {
      id: 5,
      time: "15:16",
      level: "Info" as const,
      source: "Reconnect",
      message: "OK · ap-south-1",
      previewMessage: "Reconnect OK · ap-south-1",
    },
    {
      id: 6,
      time: "15:16",
      level: "Warn" as const,
      source: "Queue",
      message: "Depth 12 · Decode 18ms",
      previewMessage: "Queue depth 12 · Decode 18ms",
    },
    {
      id: 7,
      time: "15:17",
      level: "Info" as const,
      source: "Ingest",
      message: "Keyframe received · IDR",
      previewMessage: "Ingest keyframe received · IDR",
    },
    {
      id: 8,
      time: "15:17",
      level: "Error" as const,
      source: "Network",
      message: "Timeout 3001ms · Retrying",
      previewMessage: "Network timeout 3001ms · retrying",
    },
    {
      id: 9,
      time: "15:18",
      level: "Info" as const,
      source: "Control",
      message: "Heartbeat OK",
      previewMessage: "Control plane heartbeat OK",
    },
    {
      id: 10,
      time: "15:18",
      level: "Warn" as const,
      source: "CPU",
      message: "Usage 87% · Throttle risk",
      previewMessage: "CPU usage 87% · throttle risk",
    },
    {
      id: 11,
      time: "15:19",
      level: "Info" as const,
      source: "Ingest",
      message: "Audio sync OK · AAC 48kHz",
      previewMessage: "Ingest audio sync OK · AAC 48kHz",
    },
    {
      id: 12,
      time: "15:19",
      level: "Error" as const,
      source: "Bitrate",
      message: "Drop to 890k · Buffer empty",
      previewMessage: "Bitrate drop to 890k · buffer empty",
    },
    {
      id: 13,
      time: "15:20",
      level: "Info" as const,
      source: "Reconnect",
      message: "Stable · ap-south-1",
      previewMessage: "Reconnect stable · ap-south-1",
    },
    {
      id: 14,
      time: "15:20",
      level: "Warn" as const,
      source: "Memory",
      message: "Heap 78% · GC pressure",
      previewMessage: "Memory heap 78% · GC pressure",
    },
    {
      id: 15,
      time: "15:21",
      level: "Info" as const,
      source: "Ingest",
      message: "Frame rate stable · 25fps",
      previewMessage: "Ingest frame rate stable · 25fps",
    },
  ];

  return (
    <div className="h-full min-h-0 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex h-full min-h-0 min-w-0 flex-col gap-3">
        {/* Header: icon left; metadata centered; Healthy on the right */}
        <div className="grid w-full min-w-0 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[14px]">
          <StreamDirectionLabel direction="in" className="justify-self-start" />
          <p
            className="min-w-0 truncate whitespace-nowrap text-center text-[13px] leading-none"
            title={inputMetadataLine}
          >
            <span className="font-[600] text-foreground">{inputData.inputMode}</span>
            <span className="font-[500] text-muted-foreground/80">{` · ${inputData.dimension} · ${inputData.frameRate} FPS · ${inputData.bitrateCurrent}/${inputData.bitrateAverage}k`}</span>
          </p>
          <span className={`${statusBadgeClass} shrink-0 justify-self-end ${healthTextColor[inputData.streamHealth]}`}>
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
