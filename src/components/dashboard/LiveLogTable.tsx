import { type ReactNode } from "react";

export interface LiveLog {
  id: number;
  level: "Debug" | "Info" | "Warn" | "Error" | "Danger";
  time: string;
  source: string;
  message: string;
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
}

const levelBadgeClasses: Record<LiveLog["level"], string> = {
  Debug: "text-slate-200 bg-slate-600/60 border-slate-500/60",
  Info: "text-blue-100 bg-blue-600/70 border-blue-500/60",
  Warn: "text-yellow-900 bg-yellow-400 border-yellow-300",
  Error: "text-red-100 bg-red-600/80 border-red-500/70",
  Danger: "text-red-100 bg-red-700/85 border-red-600/80",
};

export function LiveLogTable({
  title,
  logs,
  tableHeight = "h-[180px]",
  emptyMessage,
  showTitle = true,
  bordered = true,
  tableContainerClassName = "",
  className = "",
  extraContent,
}: LiveLogTableProps) {
  return (
    <div className={`${bordered ? "rounded-xl border border-border/60 bg-card p-3" : ""} ${className}`}>
      {showTitle ? (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">{title}</h3>
      ) : null}

      {logs.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-background/40 px-3 py-6 text-center text-xs text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div
          className={`w-full rounded-lg border border-border/50 bg-background/45 ${tableHeight} overflow-hidden ${tableContainerClassName}`}
        >
          <div className="h-full w-full overflow-x-auto overflow-y-scroll custom-scrollbar force-vertical-scrollbar scrollbar-gutter-stable">
            <table className="w-max min-w-[980px] border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="px-2 py-2 text-left font-semibold w-9">#</th>
                  <th className="px-2 py-2 text-left font-semibold w-20">LEVEL</th>
                  <th className="px-2 py-2 text-left font-semibold w-16">TIME</th>
                  <th className="px-2 py-2 text-left font-semibold w-28">SOURCE</th>
                  <th className="px-2 py-2 text-left font-semibold">MESSAGE</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/30 last:border-b-0 align-top">
                    <td className="px-2 py-2 text-muted-foreground font-mono">{log.id}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${levelBadgeClasses[log.level]}`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">{log.time}</td>
                    <td className="px-2 py-2 text-foreground/90 font-mono whitespace-nowrap">
                      {log.source}
                    </td>
                    <td className="px-2 py-2 text-foreground/90 font-mono whitespace-nowrap">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {extraContent ? <div className="px-2 pb-2">{extraContent}</div> : null}
          </div>
        </div>
      )}
    </div>
  );
}
