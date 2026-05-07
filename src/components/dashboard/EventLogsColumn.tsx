import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface EventLog {
  id: string;
  timestamp: string;
  category: "Event" | "Live Status" | "Stream";
  description: string;
}

const EVENT_LOGS: EventLog[] = [
  { id: "1", timestamp: "10:57 AM", category: "Event", description: "Event initializing started" },
  { id: "2", timestamp: "10:57 AM", category: "Event", description: "Event has been started" },
  { id: "3", timestamp: "10:59 AM", category: "Live Status", description: "Event is live for audience" },
  { id: "4", timestamp: "10:59 AM", category: "Stream", description: "Stream connection established" },
  { id: "5", timestamp: "10:59 AM", category: "Stream", description: "Live streaming is running" },
  { id: "6", timestamp: "11:02 AM", category: "Stream", description: "Bitrate stable at 3500 kbps" },
  { id: "7", timestamp: "11:15 AM", category: "Event", description: "Audience engagement increased" },
  { id: "8", timestamp: "11:30 AM", category: "Stream", description: "Health check passed" },
  { id: "9", timestamp: "11:45 AM", category: "Live Status", description: "Viewer count updated: 1.2k" },
  { id: "10", timestamp: "12:00 PM", category: "Event", description: "Q&A session started" },
];

export function EventLogsColumn() {
  return (
    <div className="h-full rounded-2xl border border-border/70 bg-card p-4">
      <div className="h-full flex flex-col">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">Logs</h2>
        </div>

        <ScrollArea className="flex-1 -mr-2 pr-2">
          <div className="space-y-3">
            {EVENT_LOGS.map((log) => (
              <div
                key={log.id}
                className="group flex w-full min-w-0 flex-col items-start gap-1.5 rounded-lg border border-transparent p-2.5 transition-colors hover:border-border/30 hover:bg-muted/50"
              >
                <span className="shrink-0 text-[11px] font-medium leading-none text-muted-foreground whitespace-nowrap rounded border border-border/20 bg-background px-1.5 py-1">
                  {log.timestamp}
                </span>
                <span className="w-full text-left text-[11px] font-bold uppercase tracking-wider text-primary">
                  {log.category}
                </span>
                <p className="m-0 w-full min-w-0 text-left text-[12px] font-mono font-normal leading-relaxed tracking-normal text-foreground/90 break-words">
                  {log.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
