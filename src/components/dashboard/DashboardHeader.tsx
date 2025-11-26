import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Square, Eye, Users, Circle, ChevronLeft, Copy, Check, ChevronDown, Pause } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  isLive: boolean;
  isPaused?: boolean;
  eventTitle: string;
  eventId?: string;
  elapsedTime: string;
  concurrentUsers: number;
  totalUsers: number;
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onSettings: () => void;
  onStartRecording: () => void;
  onEndEvent: () => void;
  onBack?: () => void;
}

export function DashboardHeader({
  isLive,
  isPaused = false,
  eventTitle,
  eventId,
  elapsedTime,
  concurrentUsers,
  totalUsers,
  isRecording,
  onStart,
  onStop,
  onPause,
  onResume,
  onSettings,
  onStartRecording,
  onEndEvent,
  onBack,
}: DashboardHeaderProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

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
        {eventId && (
          <>
            <div className="h-4 w-px bg-border" />
            <button
              onClick={() => handleCopy(eventId, "Event ID")}
              className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
              title="Click to copy Event ID"
            >
              <img 
                src="/slike_mini.svg" 
                alt="Event ID Logo" 
                className="w-4 h-4 flex-shrink-0"
              />
              <span className="font-mono text-xs">{eventId}</span>
              {copiedField === "Event ID" ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </>
        )}
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
                isLive ? "bg-status-live animate-pulse-glow glow-live" : 
                isPaused ? "bg-yellow-500" : "bg-status-offline"
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {isLive ? "LIVE" : isPaused ? "PAUSED" : "OFFLINE"}
            </span>
          </div>

          <div className="text-xs font-mono text-muted-foreground px-2 py-0.5 surface-elevated rounded">
            {elapsedTime}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            onClick={onStartRecording}
            size="sm"
            variant={isRecording ? "destructive" : "outline"}
            className="h-7 text-[10px] px-1.5 w-[120px] flex items-center gap-1.5 justify-center"
            disabled={!isLive && !isPaused}
          >
            <Circle className="w-3 h-3 flex-shrink-0" />
            <span className="whitespace-nowrap leading-none">
              {isRecording ? "STOP REC" : "START REC"}
            </span>
          </Button>
          
          {/* Live Control Button with Dropdown */}
          {isLive ? (
            // Condition 1: When Live is active, show "STOP LIVE" with dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-[10px] px-1.5 w-[120px] flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Square className="w-3 h-3 flex-shrink-0" />
                    <span className="whitespace-nowrap leading-none">STOP LIVE</span>
                  </div>
                  <ChevronDown className="w-3 h-3 flex-shrink-0 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPause}>
                  <Pause className="w-3 h-3 mr-2" />
                  Pause Live
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onStop}>
                  <Square className="w-3 h-3 mr-2" />
                  Stop Live
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isPaused ? (
            // Condition 2: When Paused, show "PAUSE LIVE" with dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-[10px] px-1.5 bg-yellow-600 hover:bg-yellow-700 text-white w-[120px] flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Pause className="w-3 h-3 flex-shrink-0" />
                    <span className="whitespace-nowrap leading-none">PAUSE LIVE</span>
                  </div>
                  <ChevronDown className="w-3 h-3 flex-shrink-0 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onStop}>
                  <Square className="w-3 h-3 mr-2" />
                  Stop Live
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onResume}>
                  <Play className="w-3 h-3 mr-2" />
                  Start Live
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Condition 3: When stopped, show "START LIVE" button (direct action)
            <Button
              onClick={onStart}
              size="sm"
              variant="outline"
              className="h-7 text-[10px] px-1.5 w-[120px] flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 flex-shrink-0" />
              <span className="whitespace-nowrap leading-none">START LIVE</span>
            </Button>
          )}
          <Button
            onClick={onEndEvent}
            size="sm"
            variant="destructive"
            className="h-7 text-[10px] px-1.5 w-[120px] flex items-center gap-1.5 justify-center"
          >
            END EVENT
          </Button>
        </div>
      </div>
    </header>
  );
}
