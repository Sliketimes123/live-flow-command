import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { FileText, Info, Settings, Eye, EyeOff, Copy, ExternalLink, Check, Plus, RotateCw, MoreVertical, UserPlus, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface LiveModerationPanelProps {
  publishingHealth: "stable" | "warning" | "poor";
  activeSource: string;
  bitrate: number;
  fps: number;
  onViewTypeChange?: (viewType: "input" | "output") => void;
  eventTitle?: string;
  eventDescription?: string;
  eventDate?: string;
  eventTime?: string;
  rtmpUrl?: string;
  streamKey?: string;
}

interface EventLog {
  id: string;
  timestamp: string;
  category: "Event" | "Live Status" | "Stream";
  description: string;
}

interface Screenshot {
  id: string;
  timestamp: string;
  thumbnail: string;
  title?: string;
}

export function LiveModerationPanel({
  publishingHealth,
  activeSource,
  bitrate,
  fps,
  onViewTypeChange,
  eventTitle = "Live Event – Global Summit",
  eventDescription = "Join us for an exciting live event featuring industry leaders and innovative discussions.",
  eventDate = "Nov 20, 2025",
  eventTime = "11:09 AM",
  rtmpUrl = "rtmp://studio-vwfeyv.sli.ke/live/",
  streamKey = "npn57eigzo",
}: LiveModerationPanelProps) {
  const [viewType, setViewType] = useState<"input" | "output">("input");
  const [activeMainTab, setActiveMainTab] = useState<string>("event-health");
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPreviewTooltip, setShowPreviewTooltip] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [momentsAllowed, setMomentsAllowed] = useState<string>("no");
  const [eventId] = useState<string>("npn57jcgzzo"); // Event ID
  const [isResetStreamDialogOpen, setIsResetStreamDialogOpen] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);
  
  // Settings toggles
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [liveDurationEnabled, setLiveDurationEnabled] = useState(false);
  const [audienceCountEnabled, setAudienceCountEnabled] = useState(false);
  const [quickMessagesEnabled, setQuickMessagesEnabled] = useState(false);
  const [reactionsEnabled, setReactionsEnabled] = useState(true);
  const [reactionStatsEnabled, setReactionStatsEnabled] = useState(true);
  const [qnaEnabled, setQnaEnabled] = useState(true);
  
  const { toast } = useToast();



  // Mock screenshots data
  const screenshots: Screenshot[] = [
    {
      id: "1",
      timestamp: "10:57 AM",
      thumbnail: "/placeholder.svg",
      title: "Event Start",
    },
    {
      id: "2",
      timestamp: "10:59 AM",
      thumbnail: "/placeholder.svg",
      title: "Live Stream Active",
    },
    {
      id: "3",
      timestamp: "11:05 AM",
      thumbnail: "/placeholder.svg",
      title: "Key Moment 1",
    },
    {
      id: "4",
      timestamp: "11:15 AM",
      thumbnail: "/placeholder.svg",
      title: "Key Moment 2",
    },
    {
      id: "5",
      timestamp: "11:25 AM",
      thumbnail: "/placeholder.svg",
      title: "Q&A Session",
    },
    {
      id: "6",
      timestamp: "11:35 AM",
      thumbnail: "/placeholder.svg",
      title: "Closing Remarks",
    },
  ];

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

  const handleOpenPreview = () => {
    // Redirect to preview screen - you can customize this URL
    window.open("/preview", "_blank");
  };

  const handleInvite = () => {
    toast({
      title: "Invite",
      description: "Invite functionality coming soon",
    });
  };

  const handleCopyEventUrl = () => {
    // Construct the event URL - you may need to adjust this based on your actual URL structure
    const eventUrl = `${window.location.origin}/event/${eventId}`;
    handleCopy(eventUrl, "Event URL");
  };

  const handleResetStream = () => {
    setIsResetStreamDialogOpen(false);
    toast({
      title: "Stream Reset",
      description: "The stream has been reset successfully",
    });
    // Add your reset stream logic here
  };

  // Event logs data
  const eventLogs: EventLog[] = [
    {
      id: "1",
      timestamp: "10:57 AM",
      category: "Event",
      description: "Event initializing started",
    },
    {
      id: "2",
      timestamp: "10:57 AM",
      category: "Event",
      description: "Event has been started",
    },
    {
      id: "3",
      timestamp: "10:59 AM",
      category: "Live Status",
      description: "Event is live for audience",
    },
    {
      id: "4",
      timestamp: "10:59 AM",
      category: "Stream",
      description: "",
    },
    {
      id: "5",
      timestamp: "10:59 AM",
      category: "Stream",
      description: "Live streaming is running",
    },
  ];

  const healthColor = {
    stable: "bg-success",
    warning: "bg-warning",
    poor: "bg-destructive",
  };

  const healthTextColor = {
    stable: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    poor: "text-destructive bg-destructive/10 border-destructive/20",
  };

  const healthText = {
    stable: "Stable",
    warning: "Warning",
    poor: "Poor",
  };

  // Input stream data
  const inputData = {
    primaryInput: activeSource,
    streamHealth: publishingHealth,
    inputMode: "HDMI",
    bitrateCurrent: bitrate,
    bitrateAverage: 3200,
    dimension: "1920:1080",
    frameRate: fps,
  };

  // Output stream data
  const outputData = {
    primaryOutput: "RTMP Stream",
    streamHealth: publishingHealth,
    modes: "Adaptive",
    qualities: "1080p, 720p, 480p",
    encrypted: "Yes",
    frameRate: fps,
  };

  const handleViewTypeChange = (value: "input" | "output") => {
    setViewType(value);
    onViewTypeChange?.(value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Tabs - Event Health, Info Section, Settings */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="flex flex-col h-full">
        {/* Fixed Section - Main Tabs */}
        <div className="flex-shrink-0">
          {/* Main Tabs List */}
          <TabsList className="w-full mb-2">
            <TabsTrigger value="event-health">Event Health</TabsTrigger>
            <TabsTrigger value="info-section">Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Input/Output Tabs and Live Preview - Only visible for Event Health tab */}
          {activeMainTab === "event-health" && (
            <>
              {/* Input/Output Tabs */}
              <Tabs value={viewType} onValueChange={(value) => handleViewTypeChange(value as "input" | "output")} className="mb-2">
                <TabsList className="w-full">
                  <TabsTrigger value="input">Input</TabsTrigger>
                  <TabsTrigger value="output">Output</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Live Player Preview - Fixed */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border shadow-lg">
                {/* Placeholder Video */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 mx-auto text-white" fill="white" />
                  </div>
                </div>

                {/* Live Badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-status-live backdrop-blur-sm rounded flex items-center gap-1 shadow-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-glow" />
                  <span className="text-white text-[10px] font-bold uppercase tracking-wide">LIVE</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Tabs Content */}
        {/* Event Health Tab */}
        <TabsContent value="event-health" className="flex-1 flex flex-col min-h-0 mt-3 data-[state=active]:flex data-[state=inactive]:hidden">
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-3 pr-2">
              {/* Stream Health Information */}
              <div className="space-y-2">
                {/* Input Stream Health */}
                <div className="p-2 rounded-lg border border-border bg-card space-y-1.5">
                  <h4 className="text-xs font-semibold text-foreground mb-1.5">INPUT</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-medium text-[10px]">STREAM HEALTH:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${healthTextColor[inputData.streamHealth]}`}
                      >
                        {healthText[inputData.streamHealth]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-medium text-[10px]">INPUT MODE:</span>
                      <span className="font-semibold text-foreground text-xs">{inputData.inputMode}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-medium text-[10px]">BITRATE:</span>
                      <span className="font-semibold text-foreground text-xs">
                        {inputData.bitrateCurrent} kbps (cur), {inputData.bitrateAverage} kbps (avg)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-medium text-[10px]">DIMENSION:</span>
                      <span className="font-semibold text-foreground text-xs">{inputData.dimension}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-medium text-[10px]">FRAME RATE:</span>
                      <span className="font-semibold text-foreground text-xs">{inputData.frameRate} FPS</span>
                    </div>
                  </div>
                </div>

                {/* Output Stream Health */}
                <div className="p-2 rounded-lg border border-border bg-card space-y-1.5">
                  <h4 className="text-xs font-semibold text-foreground mb-1.5">OUTPUT</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-medium text-[10px]">STREAM HEALTH:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${healthTextColor[outputData.streamHealth]}`}
                      >
                        {healthText[outputData.streamHealth]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-medium text-[10px]">Modes:</span>
                      <span className="font-semibold text-foreground text-xs">{outputData.modes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-medium text-[10px]">QUALITIES:</span>
                      <span className="font-semibold text-foreground text-xs">{outputData.qualities}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-medium text-[10px]">ENCRYPTED:</span>
                      <span className="font-semibold text-foreground text-xs">{outputData.encrypted}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Logs Section */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Event Logs</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View all event logs and system status information
                  </p>
                </div>

                {/* Status Bar */}
                <div className="mb-3 p-2 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">INPUT PRIMARY</span>
                      <span className="text-xs text-muted-foreground">{bitrate} kb/s</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">Healthy</span>
                    </div>
                  </div>
                </div>

                {/* Event Logs List */}
                <div className="space-y-2">
                  {eventLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-2 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-xs text-muted-foreground font-mono whitespace-nowrap mt-0.5">
                        {log.timestamp}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-foreground">{log.category}</span>
                          {log.description && (
                            <span className="text-xs text-foreground/80">{log.description}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Info Section Tab */}
        <TabsContent value="info-section" className="flex-1 flex flex-col min-h-0 mt-3 data-[state=active]:flex data-[state=inactive]:hidden">
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-6 pr-2">
              {/* Live Event Preview */}
              <div className="relative w-full aspect-video rounded-lg border border-border bg-muted/30 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-destructive mb-2">BREAKING</div>
                    <div className="text-sm text-muted-foreground">Live Event Preview</div>
                  </div>
                </div>
              </div>

              {/* Event Title and Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground flex-1">{eventTitle}</h3>
                  <div className="flex items-center gap-1">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip
                        open={showPreviewTooltip}
                        onOpenChange={setShowPreviewTooltip}
                        delayDuration={300}
                      >
                        <TooltipTrigger
                          asChild
                          onMouseEnter={() => setShowPreviewTooltip(true)}
                          onMouseLeave={() => setShowPreviewTooltip(false)}
                          onFocus={(e) => {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={handleOpenPreview}
                            tabIndex={-1}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open to Preview</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleInvite}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyEventUrl}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{eventDescription}</p>
                
                {/* Date and Time */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>{eventDate}</span>
                  <span>•</span>
                  <span>{eventTime}</span>
                </div>
              </div>

              {/* Ingestion Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Ingestion Details
                </h3>

                {/* Primary RTMP URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Primary RTMP</label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={rtmpUrl}
                      readOnly
                      className="flex-1 h-8 text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleCopy(rtmpUrl, "RTMP URL")}
                      title="Copy RTMP URL"
                    >
                      {copiedField === "RTMP URL" ? (
                        <Check className="w-3 h-3 text-primary" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Stream Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Stream Key</label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type={showStreamKey ? "text" : "password"}
                      value={streamKey}
                      readOnly
                      className="flex-1 h-8 text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowStreamKey(!showStreamKey)}
                      title={showStreamKey ? "Hide Stream Key" : "Show Stream Key"}
                    >
                      {showStreamKey ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleCopy(streamKey, "Stream Key")}
                      title="Copy Stream Key"
                    >
                      {copiedField === "Stream Key" ? (
                        <Check className="w-3 h-3 text-primary" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Live Channels Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Live Channels
                </h3>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="SELECT LIVE CHANNEL" />
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
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 flex flex-col min-h-0 mt-3 data-[state=active]:flex data-[state=inactive]:hidden">
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-4 pr-2">
              {/* Features Section */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Features
                </h3>
                
                <div className="space-y-2">
                  {/* Comments */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <label className="text-sm font-medium text-foreground cursor-pointer">
                      Comments
                    </label>
                    <Switch
                      checked={commentsEnabled}
                      onCheckedChange={setCommentsEnabled}
                    />
                  </div>

                  {/* Live Duration */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <label className="text-sm font-medium text-foreground cursor-pointer">
                      Live Duration
                    </label>
                    <Switch
                      checked={liveDurationEnabled}
                      onCheckedChange={setLiveDurationEnabled}
                    />
                  </div>

                  {/* Audience Count */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <label className="text-sm font-medium text-foreground cursor-pointer">
                      Audience Count
                    </label>
                    <Switch
                      checked={audienceCountEnabled}
                      onCheckedChange={setAudienceCountEnabled}
                    />
                  </div>

                  {/* Quick Messages */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <label className="text-sm font-medium text-foreground cursor-pointer">
                      Quick Messages
                    </label>
                    <Switch
                      checked={quickMessagesEnabled}
                      onCheckedChange={setQuickMessagesEnabled}
                    />
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <label className="text-sm font-medium text-foreground cursor-pointer">
                      Reactions
                    </label>
                    <Switch
                      checked={reactionsEnabled}
                      onCheckedChange={setReactionsEnabled}
                    />
                  </div>

                  {/* Reaction Stats */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <label className="text-sm font-medium text-foreground cursor-pointer">
                      Reaction Stats
                    </label>
                    <Switch
                      checked={reactionStatsEnabled}
                      onCheckedChange={setReactionStatsEnabled}
                    />
                  </div>

                  {/* QnA */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <label className="text-sm font-medium text-foreground cursor-pointer">
                      QnA
                    </label>
                    <Switch
                      checked={qnaEnabled}
                      onCheckedChange={setQnaEnabled}
                    />
                  </div>
                </div>
              </div>

              {/* Reset Stream Button */}
              <div className="pt-3 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 text-sm text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setIsResetStreamDialogOpen(true)}
                >
                  <RotateCw className="w-4 h-4" />
                  Reset Stream
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>




      {/* Reset Stream Confirmation Dialog */}
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
              onClick={handleResetStream}
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

function Play({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
