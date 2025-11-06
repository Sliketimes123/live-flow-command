import { Button } from "@/components/ui/button";
import { Play, Square, Settings } from "lucide-react";

interface DashboardHeaderProps {
  isLive: boolean;
  eventTitle: string;
  elapsedTime: string;
  onStart: () => void;
  onStop: () => void;
  onSettings: () => void;
}

export function DashboardHeader({
  isLive,
  eventTitle,
  elapsedTime,
  onStart,
  onStop,
  onSettings,
}: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-foreground">{eventTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isLive ? "bg-status-live animate-pulse-glow glow-live" : "bg-status-offline"
            }`}
          />
          <span className="text-sm font-semibold uppercase tracking-wide">
            {isLive ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        <div className="text-sm font-mono text-muted-foreground px-3 py-1 surface-elevated rounded-lg">
          {elapsedTime}
        </div>

        <div className="flex items-center gap-2">
          {!isLive ? (
            <Button onClick={onStart} size="sm" className="gap-2">
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <Button onClick={onStop} size="sm" variant="destructive" className="gap-2">
              <Square className="w-4 h-4" />
              Stop
            </Button>
          )}
          <Button onClick={onSettings} size="sm" variant="secondary">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
