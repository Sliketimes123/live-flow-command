import { Activity, Cpu } from "lucide-react";

interface StatusBarProps {
  publishingHealth: "stable" | "warning" | "poor";
  bitrate: number;
  fps: number;
  cpuUsage: number;
  lastAction: string;
}

export function StatusBar({
  publishingHealth,
  bitrate,
  fps,
  cpuUsage,
  lastAction,
}: StatusBarProps) {
  const healthColor = {
    stable: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    poor: "text-destructive bg-destructive/10 border-destructive/20",
  };

  const healthText = {
    stable: "Stable",
    warning: "Warning",
    poor: "Poor",
  };

  return (
    <footer className="h-12 border-t border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between text-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Publishing:</span>
          <span
            className={`px-2 py-1 rounded border font-medium ${healthColor[publishingHealth]}`}
          >
            {healthText[publishingHealth]}
          </span>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{bitrate}</span> kbps
          </span>
          <span>
            <span className="font-semibold text-foreground">{fps}</span> FPS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">CPU:</span>
          <span className="font-semibold text-foreground">{cpuUsage}%</span>
        </div>
      </div>

      <div className="text-muted-foreground">
        <span className="opacity-70">Last Action:</span>{" "}
        <span className="text-foreground font-medium">{lastAction}</span>
      </div>
    </footer>
  );
}
