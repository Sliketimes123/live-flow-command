import { type ReactNode } from "react";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LiveLog {
  id: number;
  time: string;
  level: "Info" | "Warn" | "Error";
  source: string;
  message: string;
  /** Single-line text for compact card preview only; expanded view still uses `source` + `message`. */
  previewMessage?: string;
}

interface LiveLogTableProps {
  title?: string;
  logs: LiveLog[];
  tableHeight?: string;
  emptyMessage: string;
  showTitle?: boolean;
  bordered?: boolean;
  tableContainerClassName?: string;
  className?: string;
  extraContent?: ReactNode;
  compact?: boolean;
}

const severityClass: Record<LiveLog["level"], string> = {
  Info: "font-semibold text-[#2563eb] dark:text-blue-300",
  Warn: "font-semibold text-[#b45309] dark:text-amber-300",
  Error: "font-semibold text-[#dc2626] dark:text-red-400",
};

const levelLabel: Record<LiveLog["level"], string> = {
  Info: "INFO",
  Warn: "WARN",
  Error: "ERROR",
};

const expandedRowGrid =
  "grid w-full grid-cols-[4.5rem_2.75rem_9rem_minmax(0,1fr)] items-center gap-x-3 px-1.5 py-1 text-[11px] leading-[1.35] tracking-[-0.1px] font-mono";

const expandedSeverityClass =
  "shrink-0 justify-self-center text-center text-[10px] font-bold uppercase tabular-nums";

// All rows are transparent — severity communicated through dot color and ERROR text weight only.
const ROW_BASE = "bg-transparent px-2 gap-[8px] hover:bg-slate-400/[0.06]";
const rowClass: Record<LiveLog["level"], string> = {
  Info: ROW_BASE,
  Warn: ROW_BASE,
  Error: ROW_BASE,
};

const dotColorClass: Record<LiveLog["level"], string> = {
  Info: "bg-[#3b82f6]",
  Warn: "bg-[#f59e0b]",
  Error: "bg-[#ef4444]",
};

const messageWeightClass: Record<LiveLog["level"], string> = {
  Info: "font-[500] text-foreground/85",
  Warn: "font-[500] text-foreground/88",
  Error: "font-[600] text-foreground/95",
};

function compactPreviewText(log: LiveLog): string {
  if (log.previewMessage?.trim()) return log.previewMessage.trim();
  const { source, message } = log;
  if (source === "Network") return message;
  const m = message.trim();
  if (!m) return source;
  const rest = m.charAt(0).toLowerCase() + m.slice(1);
  return `${source} ${rest}`;
}

function MonitoringLogRowsExpanded({ logs }: { logs: LiveLog[] }) {
  return (
    <>
      {logs.map((log) => (
        <div
          key={log.id}
          className={`${expandedRowGrid} rounded-md border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#f8fafc] dark:border-border/30 dark:hover:bg-muted/25`}
        >
          <span className="min-w-0 whitespace-nowrap tabular-nums font-medium text-[#64748b] dark:text-slate-400">
            {log.time}
          </span>
          <span className={`${expandedSeverityClass} justify-self-center ${severityClass[log.level]}`}>
            {levelLabel[log.level]}
          </span>
          <span
            className="min-w-0 truncate font-semibold text-[#1e293b] dark:text-slate-200"
            title={log.source}
          >
            {log.source}
          </span>
          <span
            className="min-w-0 justify-self-stretch truncate font-normal text-[#475569] dark:text-slate-400"
            title={log.message}
          >
            {log.message}
          </span>
        </div>
      ))}
    </>
  );
}

function MonitoringLogRowsCompact({ logs }: { logs: LiveLog[] }) {
  return (
    <div className="flex flex-col">
      {logs.map((log) => {
        const line = compactPreviewText(log);
        return (
          <div
            key={log.id}
            className={cn(
              "group flex h-[26px] items-center transition-colors duration-100",
              rowClass[log.level],
            )}
          >
            <span className="w-[42px] shrink-0 whitespace-nowrap font-mono text-[11px] font-[500] tabular-nums text-[#94a3b8]">
              {log.time}
            </span>
            <span className={cn("h-[6px] w-[6px] shrink-0 rounded-full", dotColorClass[log.level])} />
            <span
              className={cn(
                "min-w-0 flex-1 truncate font-mono text-[12px] leading-[1.2] tracking-[-0.1px]",
                messageWeightClass[log.level],
              )}
              title={line}
            >
              {line}
            </span>
            <button
              type="button"
              className="hidden h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:flex group-hover:opacity-40 hover:!opacity-80"
              title="Copy"
              onClick={() => navigator.clipboard?.writeText(`${log.time}  ${line}`)}
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ColumnHeaderRowExpanded() {
  return (
    <div
      className={`${expandedRowGrid} sticky top-0 z-10 border-b border-border/60 bg-card/95 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 backdrop-blur-sm dark:text-slate-400`}
    >
      <span className="justify-self-start">Time</span>
      <span className="justify-self-center text-center">Lvl</span>
      <span className="justify-self-start">Source</span>
      <span className="justify-self-start">Message</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground font-mono">
      {message}
    </div>
  );
}

export function LiveLogTable({
  title,
  logs,
  /** Expanded view: prefer `max-h-[...]` so the block grows with few rows and scrolls when full. */
  tableHeight = "max-h-[min(75vh,22rem)]",
  emptyMessage,
  showTitle = true,
  bordered = true,
  tableContainerClassName = "",
  className = "",
  extraContent,
  compact = false,
}: LiveLogTableProps) {
  if (compact) {
    const isFlexFill = !tableHeight || tableHeight === "h-full";
    const scrollBoxClass = isFlexFill
      ? "min-h-0 flex-1 overflow-y-scroll custom-scrollbar force-vertical-scrollbar scrollbar-gutter-stable"
      : `${tableHeight} min-h-0 overflow-y-scroll custom-scrollbar force-vertical-scrollbar scrollbar-gutter-stable`;

    return (
      <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${className}`}>
        {logs.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <div className={scrollBoxClass}>
            <MonitoringLogRowsCompact logs={logs} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${bordered ? "rounded-xl border border-border/60 bg-card p-3" : ""} ${className}`}>
      {showTitle && title ? (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">{title}</h3>
      ) : null}

      {logs.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div
          className={`w-full overflow-y-auto overflow-x-hidden rounded-lg border border-border/50 bg-background/40 custom-scrollbar force-vertical-scrollbar scrollbar-gutter-stable ${tableHeight} ${tableContainerClassName}`}
        >
          <ColumnHeaderRowExpanded />
          <MonitoringLogRowsExpanded logs={logs} />
          {extraContent ? <div className="border-t border-border/40 px-2 py-2">{extraContent}</div> : null}
        </div>
      )}
    </div>
  );
}
