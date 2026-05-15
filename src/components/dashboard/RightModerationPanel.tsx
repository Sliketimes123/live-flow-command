import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChatModeration, type BlockedUser, type ChatMessage } from "./moderation/ChatModeration";
import { QAPanel } from "./moderation/QAPanel";
import {
  Info,
  Settings,
  MessageSquare,
  MessageCircle,
  Lock,
  HelpCircle,
  Calendar,
  Clock,
  Link2,
  ExternalLink,
  MoreVertical,
  UserPlus,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCw,
  Play,
  Zap,
  BarChart,
  Heart,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";

type PanelKey = "info" | "settings" | "comments" | "qa" | "studio";

interface RightModerationPanelProps {
  messages: ChatMessage[];
  blockedUsers: BlockedUser[];
  onBlockUser: (username: string) => void;
  onUnblockUser: (username: string) => void;
  onToggleHide?: (messageId: string) => void;
  onTogglePin?: (messageId: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onCopy?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onSendCommentMessage?: (message: string) => void;
  commentsEnabled?: boolean;
  qnaEnabled?: boolean;
  eventTitle?: string;
  eventDescription?: string;
  eventDate?: string;
  eventTime?: string;
  rtmpUrl?: string;
  commentsToggle?: boolean;
  audienceCountEnabled?: boolean;
  reactionsEnabled?: boolean;
  qnaToggle?: boolean;
  onCommentsEnabledChange?: (enabled: boolean) => void;
  onAudienceCountEnabledChange?: (enabled: boolean) => void;
  onReactionsEnabledChange?: (enabled: boolean) => void;
  onQnaEnabledChange?: (enabled: boolean) => void;
  onQuestionMetricsChange?: (metrics: { total: number; queue: number; selected: number; closed: number }) => void;
  onQASpike?: (payload: { increaseBy: number; queueCount: number }) => void;
  onTabViewed?: (tab: "comments" | "qa" | "studio") => void;
  isDarkTheme?: boolean;
  onToggleTheme?: () => void;
  eventId?: string;
  /** When true, the content column (chat / Q&A / info) is collapsed; the icon rail stays visible. */
  contentCollapsed?: boolean;
  onContentCollapsedChange?: (collapsed: boolean) => void;
}

export function RightModerationPanel({
  messages,
  blockedUsers,
  onBlockUser,
  onUnblockUser,
  onToggleHide,
  onTogglePin,
  onToggleSelect,
  onCopy,
  onDeleteMessage,
  onSendCommentMessage,
  commentsEnabled = true,
  qnaEnabled = true,
  eventTitle = "Live Event – Global Summit",
  eventDescription = "Join us for an exciting live event featuring industry leaders and innovative discussions.",
  eventDate = "Nov 20, 2025",
  eventTime = "11:09 AM",
  rtmpUrl = "rtmp://studio-vwfeyv.sli.ke/live/",
  commentsToggle = true,
  audienceCountEnabled = true,
  reactionsEnabled = true,
  qnaToggle = true,
  onCommentsEnabledChange,
  onAudienceCountEnabledChange,
  onReactionsEnabledChange,
  onQnaEnabledChange,
  onQuestionMetricsChange,
  onQASpike,
  onTabViewed,
  isDarkTheme = true,
  onToggleTheme,
  eventId: eventIdProp,
  contentCollapsed = false,
  onContentCollapsedChange,
}: RightModerationPanelProps) {
  const [activePanel, setActivePanel] = useState<PanelKey>("comments");
  const [commentsAutoScroll, setCommentsAutoScroll] = useState(false);
  const [studioAutoScroll, setStudioAutoScroll] = useState(false);
  const [studioCount, setStudioCount] = useState(0);
  const [qaQueueCount, setQaQueueCount] = useState(0);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [isResetStreamDialogOpen, setIsResetStreamDialogOpen] = useState(false);
  const [liveDurationEnabled, setLiveDurationEnabled] = useState(false);
  const [quickMessagesEnabled, setQuickMessagesEnabled] = useState(false);
  const [reactionStatsEnabled, setReactionStatsEnabled] = useState(true);
  const [isEventDescriptionExpanded, setIsEventDescriptionExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const eventId = eventIdProp ?? "npn57jcgzzo";
  const streamKey = "npn57eigzo";

  const commentsCount = messages.length;
  const badgeClass = (key: PanelKey) =>
    activePanel === key
      ? "absolute right-1 top-1 z-20 inline-flex min-w-[16px] justify-center rounded-full bg-primary px-1 py-0 text-[10px] font-semibold text-primary-foreground pointer-events-none"
      : "absolute right-1 top-1 z-20 inline-flex min-w-[16px] justify-center rounded-full bg-muted/90 px-1 py-0 text-[10px] font-medium text-muted-foreground border border-border/50 pointer-events-none";

  useEffect(() => {
    if (["comments", "qa", "studio"].includes(activePanel)) {
      onTabViewed?.(activePanel as "comments" | "qa" | "studio");
    }
  }, [activePanel, onTabViewed]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const navItems = useMemo(
    () => [
      { key: "info" as const, icon: Info, label: "Info" },
      { key: "comments" as const, icon: MessageCircle, label: "Chat", count: commentsCount },
      { key: "qa" as const, icon: HelpCircle, label: "Q&A", count: qaQueueCount },
      { key: "studio" as const, icon: MessageSquare, label: "Studio Chat", count: studioCount },
      { key: "settings" as const, icon: Settings, label: "Settings" },
    ],
    [commentsCount, qaQueueCount, studioCount]
  );
  const panelTitleMap: Record<PanelKey, string> = {
    info: "Info",
    comments: "Chat",
    qa: "Q&A",
    studio: "Studio Chat",
    settings: "Event Settings",
  };
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

  const handleNavSelect = (key: PanelKey) => {
    if (contentCollapsed) {
      onContentCollapsedChange?.(false);
    }
    setActivePanel(key);
  };

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      toast({
        title: "Fullscreen unavailable",
        description: "Your browser blocked fullscreen mode.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full rounded-2xl border border-border/70 bg-card overflow-hidden">
      <div className="flex h-full min-w-0">
        <div
          className={cn(
            "flex min-h-0 flex-col border-r border-border/60 transition-[flex-grow,flex-shrink,opacity,padding,width] duration-200 ease-in-out",
            contentCollapsed
              ? "pointer-events-none w-0 max-w-0 shrink-0 grow-0 overflow-hidden border-r-0 p-0 opacity-0"
              : "min-w-0 flex-1 px-1.5 pb-1.5 pt-1 opacity-100",
          )}
          aria-hidden={contentCollapsed}
        >
          <div className="shrink-0 border-b border-border/60 px-1.5 pb-1.5 pt-0.5">
            <h2 className="min-w-0 truncate text-xs font-semibold text-foreground">
              {panelTitleMap[activePanel]}
            </h2>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            {activePanel === "comments" && (
              <ChatModeration
                variant="sidebar"
                messages={messages}
                blockedUsers={blockedUsers}
                onBlockUser={onBlockUser}
                onUnblockUser={onUnblockUser}
                onToggleHide={onToggleHide}
                onTogglePin={onTogglePin}
                onToggleSelect={onToggleSelect}
                onCopy={onCopy}
                onDeleteMessage={onDeleteMessage}
                onSendCommentMessage={onSendCommentMessage}
                activeTab="comments"
                autoScroll={commentsAutoScroll}
                onAutoScrollChange={setCommentsAutoScroll}
              />
            )}

            {activePanel === "qa" && qnaEnabled && (
              <QAPanel
                variant="sidebar"
                onBlockUser={onBlockUser}
                blockedUsers={blockedUsers}
                onQuestionMetricsChange={(metrics) => {
                  setQaQueueCount(metrics.queue);
                  onQuestionMetricsChange?.(metrics);
                }}
                onQASpike={onQASpike}
              />
            )}

            {activePanel === "studio" && (
              <ChatModeration
                variant="sidebar"
                messages={messages}
                blockedUsers={blockedUsers}
                onBlockUser={onBlockUser}
                onUnblockUser={onUnblockUser}
                onToggleHide={onToggleHide}
                onTogglePin={onTogglePin}
                onToggleSelect={onToggleSelect}
                onCopy={onCopy}
                onDeleteMessage={onDeleteMessage}
                activeTab="studio"
                autoScroll={studioAutoScroll}
                onAutoScrollChange={setStudioAutoScroll}
                onMessageCountChange={setStudioCount}
              />
            )}

            {activePanel === "info" && (
              <ScrollArea className="h-full -mr-2 pr-2">
                <div className="space-y-4 min-w-0 p-2">
                  <div className="rounded-xl border border-border/60 bg-card p-3 min-w-0">
                    <h3 className="text-xs font-semibold uppercase tracking-wide">Event Details</h3>
                    <div className="mt-2 flex flex-wrap items-start gap-2 min-w-0">
                      <p className="text-sm font-semibold min-w-0 break-words flex-1">{eventTitle}</p>
                      <div className="flex items-center gap-1 shrink-0 ml-auto">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-muted-foreground hover:text-black">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Open Preview</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-muted-foreground hover:text-black">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem>
                              <UserPlus className="w-3.5 h-3.5 mr-2" />
                              Invite
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy(`${window.location.origin}/event/${eventId}`, "Event URL")}>
                              <Copy className="w-3.5 h-3.5 mr-2" />
                              Copy URL
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p
                        className="text-xs text-muted-foreground"
                        style={
                          isEventDescriptionExpanded
                            ? undefined
                            : {
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }
                        }
                      >
                        {eventDescription}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEventDescriptionExpanded((prev) => !prev)}
                        className="mt-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        {isEventDescriptionExpanded ? "Read less" : "Read more"}
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground min-w-0">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{eventDate}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{eventTime}</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-3 min-w-0">
                    <h3 className="text-xs font-semibold uppercase tracking-wide">Ingestion</h3>
                    <p className="mt-2 text-xs text-muted-foreground uppercase">Primary RTMP</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 min-w-0">
                      <div className="rounded-md border border-border/60 bg-muted/40 px-2 py-1.5 text-xs font-mono truncate flex-1 min-w-0">
                        {rtmpUrl}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(rtmpUrl, "RTMP URL")}>
                          {copiedField === "RTMP URL" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground uppercase">Stream Key</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 min-w-0">
                      <Input
                        type={showStreamKey ? "text" : "password"}
                        value={streamKey}
                        readOnly
                        className="h-8 text-xs font-mono bg-muted/30 border-border/50 min-w-0 flex-1"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => setShowStreamKey((prev) => !prev)}>
                          {showStreamKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(streamKey, "Stream Key")}>
                          {copiedField === "Stream Key" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      Stream configured and active
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-3 min-w-0">
                    <h3 className="text-xs font-semibold uppercase tracking-wide">Live Channels</h3>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="h-8 mt-2 text-xs bg-muted/30 border-border/50 w-full min-w-0">
                        <SelectValue placeholder="Select Live Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="channel1">Channel 1</SelectItem>
                        <SelectItem value="channel2">Channel 2</SelectItem>
                        <SelectItem value="channel3">Channel 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ScrollArea>
            )}

            {activePanel === "settings" && (
              <ScrollArea className="h-full p-2">
                <div className="space-y-2 rounded-xl border border-border/60 bg-card p-3">
                  {[
                    { label: "Comments", checked: commentsToggle, onChange: onCommentsEnabledChange },
                    { label: "Live Duration", checked: liveDurationEnabled, onChange: setLiveDurationEnabled },
                    { label: "Audience Count", checked: audienceCountEnabled, onChange: onAudienceCountEnabledChange },
                    { label: "Quick Messages", checked: quickMessagesEnabled, onChange: setQuickMessagesEnabled },
                    { label: "Reactions", checked: reactionsEnabled, onChange: onReactionsEnabledChange },
                    { label: "Reaction Stats", checked: reactionStatsEnabled, onChange: setReactionStatsEnabled },
                    { label: "Q&A", checked: qnaToggle, onChange: onQnaEnabledChange },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-2">
                      <span className="text-xs">{item.label}</span>
                      <Switch checked={item.checked} onCheckedChange={item.onChange ?? (() => undefined)} />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full gap-2 h-9 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    onClick={() => setIsResetStreamDialogOpen(true)}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Reset Stream
                  </Button>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <aside className="w-[52px] shrink-0 px-1 py-2 border-l border-border/60 bg-background">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onContentCollapsedChange?.(!contentCollapsed)}
                  className={cn(
                    "relative flex h-12 w-full items-center justify-center rounded-xl transition-colors",
                    contentCollapsed
                      ? "text-primary bg-primary/12 hover:bg-primary/18"
                      : "text-muted-foreground hover:bg-muted/35 hover:text-foreground",
                  )}
                  aria-label={contentCollapsed ? "Expand panel" : "Collapse panel"}
                  aria-pressed={contentCollapsed}
                  title={contentCollapsed ? "Expand panel" : "Collapse panel"}
                >
                  {contentCollapsed ? (
                    <ChevronLeft className="h-[20px] w-[20px] shrink-0" aria-hidden />
                  ) : (
                    <ChevronRight className="h-[20px] w-[20px] shrink-0" aria-hidden />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{contentCollapsed ? "Expand panel" : "Collapse panel"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mx-1 my-1 h-px bg-border/60" />
          {navItems
            .filter((item) => (item.key === "comments" ? commentsEnabled : true))
            .filter((item) => (item.key === "qa" ? qnaEnabled : true))
            .map((item) => {
              const ActiveIcon = item.icon;
              const isActive = activePanel === item.key;
              return (
                <div key={item.key} className="relative">
                  <button
                    type="button"
                    onClick={() => handleNavSelect(item.key)}
                    className={`relative flex h-12 w-full items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/35"
                    }`}
                    title={item.label}
                    aria-label={item.label}
                  >
                    <ActiveIcon className="w-[20px] h-[20px]" />
                    {typeof item.count === "number" && <span className={badgeClass(item.key)}>{item.count}</span>}
                  </button>
                  <div className={`mx-1 my-1 h-px ${isActive ? "bg-primary/90" : "bg-border/60"}`} />
                </div>
              );
            })}
          <div className="mx-1 my-1 h-px bg-border/60" />
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="relative flex h-12 w-full items-center justify-center rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/35"
                  aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
                  title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkTheme ? <Sun className="w-[20px] h-[20px]" /> : <Moon className="w-[20px] h-[20px]" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isDarkTheme ? "Light mode" : "Dark mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mx-1 my-1 h-px bg-border/60" />
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="relative flex h-12 w-full items-center justify-center rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/35"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-[20px] h-[20px]" /> : <Maximize2 className="w-[20px] h-[20px]" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </aside>
      </div>
      <AlertDialog open={isResetStreamDialogOpen} onOpenChange={setIsResetStreamDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Stream</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the stream? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setIsResetStreamDialogOpen(false)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Stream
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
