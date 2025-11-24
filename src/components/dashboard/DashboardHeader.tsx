import { Button } from "@/components/ui/button";
import { Play, Square, ShieldOff, Eye, Users, Circle, ChevronLeft } from "lucide-react";

interface DashboardHeaderProps {
  isLive: boolean;
  eventTitle: string;
  elapsedTime: string;
  isModerationStopped: boolean;
  concurrentUsers: number;
  totalUsers: number;
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onSettings: () => void;
  onStopModeration: () => void;
  onStartRecording: () => void;
  onEndEvent: () => void;
  onBack?: () => void;
}

export function DashboardHeader({
  isLive,
  eventTitle,
  elapsedTime,
  isModerationStopped,
  concurrentUsers,
  totalUsers,
  isRecording,
  onStart,
  onStop,
  onSettings,
  onStopModeration,
  onStartRecording,
  onEndEvent,
  onBack,
}: DashboardHeaderProps) {
  return (
    <header className="h-12 border-b border-border bg-card/50 backdrop-blur-sm px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title="Go back"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-sm font-semibold text-foreground">{eventTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* User Counts */}
        <div className="flex items-center gap-4 border-r border-border pr-4">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">{concurrentUsers}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">{totalUsers}</span>
          </div>
        </div>

        {/* Live Status and Timer */}
        <div className="flex items-center gap-3 border-r border-border pr-4">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                isLive ? "bg-status-live animate-pulse-glow glow-live" : "bg-status-offline"
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {isLive ? "LIVE" : "OFFLINE"}
            </span>
          </div>

          <div className="text-xs font-mono text-muted-foreground px-2 py-0.5 surface-elevated rounded">
            {elapsedTime}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            onClick={onStopModeration}
            size="sm"
            variant={isModerationStopped ? "destructive" : "outline"}
            className="gap-1 h-7 text-xs px-2"
          >
            <ShieldOff className="w-3 h-3" />
            {isModerationStopped ? "Resume Moderation" : "Stop Moderation"}
          </Button>
          <Button
            onClick={onStartRecording}
            size="sm"
            variant={isRecording ? "default" : "outline"}
            className="gap-1 h-7 text-xs px-2"
            disabled={!isLive}
          >
            <Circle className="w-3 h-3" />
            START REC
          </Button>
          {isLive && (
            <Button onClick={onStop} size="sm" variant="destructive" className="gap-1 h-7 text-xs px-2">
              <Square className="w-3 h-3" />
              STOP LIVE
            </Button>
          )}
          <Button onClick={onEndEvent} size="sm" variant="destructive" className="gap-1 h-7 text-xs px-2">
            END EVENT
          </Button>
        </div>
      </div>
    </header>
  );
}
