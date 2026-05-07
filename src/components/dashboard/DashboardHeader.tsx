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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play, Square, Eye, Users, Circle, ChevronLeft, Copy, Check, ChevronDown, Pause, X, Bell } from "lucide-react";
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
  notifications?: Array<{
    id: string;
    title: string;
    description: string;
    severity: "info" | "warning" | "critical";
    timestamp: string;
    isRead: boolean;
  }>;
  onMarkAllNotificationsRead?: () => void;
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
  notifications = [],
  onMarkAllNotificationsRead,
}: DashboardHeaderProps) {
  const liveControlItemClass = "gap-2.5";
  const liveControlIconClass = "w-3.5 h-3.5 shrink-0";
  const endEventMenuItemClass =
    "text-destructive/90 hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive transition-colors";
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEndEventDialogOpen, setIsEndEventDialogOpen] = useState(false);
  const [isRecordingDialogOpen, setIsRecordingDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [recordingAction, setRecordingAction] = useState<"start" | "stop">("start");
  const { toast } = useToast();
  const unreadNotificationCount = notifications.filter((notification) => !notification.isRead).length;

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

  const handleBackClick = () => {
    setIsLeaveDialogOpen(true);
  };

  return (
    <header className="h-12 border-b border-border/70 bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleBackClick}
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
        {/* User Counts + Notifications */}
        <div className="flex items-center gap-3 border-r border-border pr-4">
          {audienceCountEnabled && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">{concurrentUsers}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">{totalUsers}</span>
                </div>
              </div>
              <div className="h-4 w-px bg-border" />
            </>
          )}
          <Dialog
            open={isNotificationDialogOpen}
            onOpenChange={(open) => {
              setIsNotificationDialogOpen(open);
              if (open) onMarkAllNotificationsRead?.();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 relative" title="Notifications">
                <Bell className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-white group-focus-visible:text-white" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] px-1 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full text-center leading-none">
                    {unreadNotificationCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Moderation Alerts</DialogTitle>
                <DialogDescription>
                  Latest stream and moderation notifications.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[320px] pr-2">
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                      No alerts yet.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-lg border p-2 ${
                          notification.severity === "critical"
                            ? "border-destructive/40 bg-destructive/5"
                            : notification.severity === "warning"
                              ? "border-warning/40 bg-warning/10"
                              : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground">{notification.title}</p>
                          <span className="text-[10px] text-muted-foreground">{notification.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
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
      </div>

      {/* End Event Warning Dialog */}
      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning!</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure, you want to leave the Event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsLeaveDialogOpen(false);
                onBack?.();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              LEAVE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
