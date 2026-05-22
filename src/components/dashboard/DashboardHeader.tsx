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
import type { ModerationTab } from "@/lib/moderationSession";

interface DashboardHeaderProps {
  /** `moderation` hides live/recording control actions (dedicated moderation workspace). */
  mode?: "admin" | "moderation";
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
  moderationTabs?: Array<{
    key: ModerationTab;
    label: string;
    count: number;
    enabled?: boolean;
  }>;
  activeModerationTab?: ModerationTab;
  onModerationTabChange?: (tab: ModerationTab) => void;
}

export function DashboardHeader({
  mode = "admin",
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
  moderationTabs,
  activeModerationTab,
  onModerationTabChange,
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
  const visibleModerationTabs = (moderationTabs ?? []).filter((tab) => tab.enabled !== false);

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
    <header className="flex h-[50px] shrink-0 items-center justify-between border-b border-border/70 bg-card px-4">
      {mode === "moderation" ? (
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          {eventId ? (
            <>
              <TooltipProvider delayDuration={300}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleCopy(eventId, "Event ID")}
                      className="group flex max-w-[min(12rem,28vw)] shrink-0 items-center gap-1 rounded border border-border bg-muted/30 px-1.5 py-0.5 transition-colors hover:bg-muted/50"
                    >
                      <img src="/slike_mini.svg" alt="" className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate font-mono text-[11px]">{eventId}</span>
                      {copiedField === "Event ID" ? (
                        <Check className="h-3 w-3 shrink-0 text-primary" />
                      ) : (
                        <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy Event ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="h-5 w-px shrink-0 bg-border/80 opacity-80" aria-hidden />
            </>
          ) : null}
          <TooltipProvider delayDuration={300}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="min-w-0 max-w-[260px] shrink overflow-hidden">
                  <h1
                    title={eventTitle}
                    className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold leading-tight text-foreground"
                  >
                    {eventTitle}
                  </h1>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-sm">
                <p className="text-xs">{eventTitle}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="h-5 w-px shrink-0 bg-border/80 opacity-80" aria-hidden />
          <div className="flex h-10 shrink-0 items-center gap-[22px] bg-transparent p-0">
            {visibleModerationTabs.map((tab) => {
              const isActive = activeModerationTab === tab.key;
              const isStudio = tab.key === "studio";
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onModerationTabChange?.(tab.key)}
                  className={`relative inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap p-0 text-sm leading-none transition-colors ${
                    isActive
                      ? "font-bold text-[#0f4fd8] dark:text-[#60a5fa]"
                      : "font-semibold text-[#64748b] hover:text-foreground"
                  }`}
                  aria-pressed={isActive}
                  title={isStudio ? "Studio Chat" : undefined}
                >
                  <span>{isStudio ? "Studio" : tab.label}</span>
                  <span
                    className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] text-[11px] font-bold tabular-nums ${
                      isActive
                        ? "bg-[#dbeafe] text-[#1d4ed8] dark:bg-[rgba(37,99,235,0.24)] dark:text-[#93c5fd]"
                        : "bg-[#eef2f7] text-[#64748b] dark:bg-[rgba(148,163,184,0.18)] dark:text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#0f4fd8] dark:bg-[#60a5fa]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <Button
            onClick={handleBackClick}
            variant="ghost"
            size="sm"
            className="group h-7 w-7 shrink-0 p-0"
            title="Go back"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground" />
          </Button>
          <div className="h-5 w-px shrink-0 bg-border/80 opacity-80" aria-hidden />
          {eventId ? (
            <>
              <TooltipProvider delayDuration={300}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleCopy(eventId, "Event ID")}
                      className="group flex max-w-[min(12rem,28vw)] shrink-0 items-center gap-1 rounded border border-border bg-muted/30 px-1.5 py-0.5 transition-colors hover:bg-muted/50"
                    >
                      <img src="/slike_mini.svg" alt="" className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate font-mono text-[11px]">{eventId}</span>
                      {copiedField === "Event ID" ? (
                        <Check className="h-3 w-3 shrink-0 text-primary" />
                      ) : (
                        <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy Event ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="h-5 w-px shrink-0 bg-border/80 opacity-80" aria-hidden />
            </>
          ) : null}
          <TooltipProvider delayDuration={300}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="min-w-0 max-w-[260px] shrink overflow-hidden">
                  <h1
                    title={eventTitle}
                    className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold leading-tight text-foreground"
                  >
                    {eventTitle}
                  </h1>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-sm">
                <p className="text-xs">{eventTitle}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
        {/* User Counts + Notifications */}
        <div className="flex items-center gap-2 border-r border-border pr-2 sm:gap-2.5 sm:pr-3">
          {audienceCountEnabled && (
            <>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-xs font-semibold tabular-nums text-foreground">{concurrentUsers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-xs font-semibold tabular-nums text-foreground">{totalUsers}</span>
                </div>
              </div>
              <div className="hidden h-3.5 w-px bg-border sm:block" />
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
              <Button variant="ghost" size="sm" className="relative h-7 w-7 shrink-0 p-0" title="Notifications">
                <Bell className="h-3.5 w-3.5 text-muted-foreground transition-colors hover:text-foreground" />
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
        <div className="flex items-center gap-2 border-r border-border pr-2 sm:gap-2.5 sm:pr-3">
          <div className="flex items-center gap-1">
            <div
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                isLive ? "bg-status-live animate-pulse-glow glow-live" : isPaused ? "bg-yellow-500" : "bg-status-offline"
              }`}
            />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
              {isLive ? "LIVE" : isPaused ? "PAUSED" : "OFFLINE"}
            </span>
          </div>

          <div className="surface-elevated rounded px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
            {elapsedTime}
          </div>
        </div>

        {/* Action Buttons — admin panel only */}
        {mode === "admin" && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleRecordingClick}
            className="h-7 shrink-0 rounded-md px-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isLive && !isPaused}
          >
            {isRecording ? "STOP REC" : "START REC"}
          </button>
          <div className="mx-0.5 hidden h-3.5 w-px bg-border sm:block" />

          {/* Live Control Button with Dropdown */}
          {isLive ? (
            // Condition 1: When Live is active, show "STOP LIVE" with dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-7 shrink-0 items-center gap-0.5 rounded-md px-2 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive">
                  STOP LIVE
                  <ChevronDown className="h-3 w-3" />
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
                <button className="flex h-7 shrink-0 items-center gap-0.5 rounded-md px-2 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive">
                  PAUSE LIVE
                  <ChevronDown className="h-3 w-3" />
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
              className="h-7 shrink-0 rounded-md px-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              START LIVE
            </button>
          )}
        </div>
        )}
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
