import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play, Square, Eye, Users, Circle, ChevronLeft, Copy, Check, ChevronDown, Pause, X } from "lucide-react";
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
  audienceCountEnabled?: boolean;
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onSettings: () => void;
  onStartRecording: () => void;
  onEndEvent: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export function DashboardHeader({
  isLive,
  isPaused = false,
  eventTitle,
  eventId,
  elapsedTime,
  concurrentUsers,
  totalUsers,
  audienceCountEnabled = true,
  isRecording,
  onStart,
  onStop,
  onPause,
  onResume,
  onSettings,
  onStartRecording,
  onEndEvent,
  onBack,
  onClose,
}: DashboardHeaderProps) {
  const liveControlItemClass = "gap-2.5";
  const liveControlIconClass = "w-3.5 h-3.5 shrink-0";
  const endEventMenuItemClass =
    "text-destructive/90 hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive transition-colors";
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEndEventDialogOpen, setIsEndEventDialogOpen] = useState(false);
  const [isRecordingDialogOpen, setIsRecordingDialogOpen] = useState(false);
  const [recordingAction, setRecordingAction] = useState<"start" | "stop">("start");
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

  const handleRecordingClick = () => {
    if (isRecording) {
      setRecordingAction("stop");
      setIsRecordingDialogOpen(true);
      return;
    }
    setRecordingAction("start");
    setIsRecordingDialogOpen(true);
  };

  return (
    <header className="h-12 border-b border-border bg-card/50 backdrop-blur-sm px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="group h-7 w-7 p-0"
          title="Go back"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-white group-focus-visible:text-white" />
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-sm font-semibold text-foreground">{eventTitle}</h1>
        {eventId && (
          <>
            <div className="h-4 w-px bg-border" />
            <TooltipProvider delayDuration={300}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleCopy(eventId, "Event ID")}
                    className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy Event ID</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* User Counts */}
        {audienceCountEnabled && (
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
        )}

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
        <div className="flex items-center">
          <button
            onClick={handleRecordingClick}
            className="h-7 px-3 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isLive && !isPaused}
          >
            {isRecording ? "STOP REC" : "START REC"}
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          
          {/* Live Control Button with Dropdown */}
          {isLive ? (
            // Condition 1: When Live is active, show "STOP LIVE" with dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-7 px-3 text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1">
                  STOP LIVE
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPause} className={liveControlItemClass}>
                  <Pause className={liveControlIconClass} />
                  Pause Live
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onStop} className={liveControlItemClass}>
                  <Square className={liveControlIconClass} />
                  Stop Live
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsEndEventDialogOpen(true)}
                  className={`${liveControlItemClass} ${endEventMenuItemClass}`}
                >
                  <X className={liveControlIconClass} />
                  End Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isPaused ? (
            // Condition 2: When Paused, show "PAUSE LIVE" with dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-7 px-3 text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1">
                  PAUSE LIVE
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onStop} className={liveControlItemClass}>
                  <Square className={liveControlIconClass} />
                  Stop Live
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onResume} className={liveControlItemClass}>
                  <Play className={liveControlIconClass} />
                  Start Live
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsEndEventDialogOpen(true)}
                  className={`${liveControlItemClass} ${endEventMenuItemClass}`}
                >
                  <X className={liveControlIconClass} />
                  End Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Condition 3: When stopped, show "START LIVE" button (direct action)
            <button
              onClick={onStart}
              className="h-7 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              START LIVE
            </button>
          )}
        </div>
        <div className="h-4 w-px bg-border" />
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="group h-7 w-7 p-0"
          title="Close page"
        >
          <X className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-white group-focus-visible:text-white" />
        </Button>
      </div>

      {/* End Event Warning Dialog */}
      <AlertDialog open={isEndEventDialogOpen} onOpenChange={setIsEndEventDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning!</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure, you want to End Event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsEndEventDialogOpen(false);
                onEndEvent();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              CONFIRM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recording Warning Dialog */}
      <AlertDialog open={isRecordingDialogOpen} onOpenChange={setIsRecordingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning!</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure, you want to {recordingAction === "start" ? "Start" : "Stop"} Recording?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsRecordingDialogOpen(false);
                onStartRecording();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              CONFIRM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
