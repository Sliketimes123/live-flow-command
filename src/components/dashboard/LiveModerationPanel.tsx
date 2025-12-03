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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Info, Settings, Eye, EyeOff, Copy, ExternalLink, Check, Plus, RotateCw, MoreVertical, UserPlus, Play, Activity, Lock, Layers, Calendar, Clock, Signal, Tv, Sliders, MessageSquare, Users, Zap, Heart, BarChart, HelpCircle } from "lucide-react";
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
      description: "Stream connection established",
    },
    {
      id: "5",
      timestamp: "10:59 AM",
      category: "Stream",
      description: "Live streaming is running",
    },
    {
      id: "6",
      timestamp: "11:02 AM",
      category: "Stream",
      description: "Bitrate stable at 3500 kbps",
    },
    {
      id: "7",
      timestamp: "11:15 AM",
      category: "Event",
      description: "Audience engagement increased",
    },
    {
      id: "8",
      timestamp: "11:30 AM",
      category: "Stream",
      description: "Health check passed",
    },
    {
      id: "9",
      timestamp: "11:45 AM",
      category: "Live Status",
      description: "Viewer count updated: 1.2k",
    },
    {
      id: "10",
      timestamp: "12:00 PM",
      category: "Event",
      description: "Q&A session started",
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
    <div className="flex flex-col h-full bg-background/50">
      {/* Main Tabs - Event Health, Info Section, Settings */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="flex flex-col h-full">
        {/* Fixed Section - Main Tabs */}
        <div className="flex-shrink-0 px-4 pt-2">
          {/* Main Tabs List */}
          <TabsList className="w-full mb-4 bg-muted/50 p-1 h-10">
            <TabsTrigger value="event-health" className="flex-1 gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200">
              <Activity className="w-3.5 h-3.5" />
              Event Health
            </TabsTrigger>
            <TabsTrigger value="event-logs" className="flex-1 gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200">
              <FileText className="w-3.5 h-3.5" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="info-section" className="flex-1 gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200">
              <Info className="w-3.5 h-3.5" />
              Info
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Settings</TabsTrigger>
          </TabsList>

          {/* Input/Output Tabs and Live Preview - Only visible for Event Health tab */}
          {activeMainTab === "event-health" && (
            <div className="space-y-2 mb-2">
              {/* Live Player Preview - Fixed */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-md border border-border/50 group ring-1 ring-white/5">
                {/* Placeholder Video */}
                <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <Play className="w-8 h-8 mx-auto text-white/50 group-hover:text-white/80 transition-colors" fill="currentColor" />
                  </div>
                </div>

                {/* Live Badge */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-600/90 backdrop-blur-md rounded flex items-center gap-1 shadow-sm border border-red-500/50">
                  <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-[9px] font-bold uppercase tracking-wider leading-none">LIVE</span>
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Input/Output Tabs */}
              <Tabs value={viewType} onValueChange={(value) => handleViewTypeChange(value as "input" | "output")}>
                <TabsList className="w-full bg-muted/40 p-0.5 h-7">
                  <TabsTrigger value="input" className="flex-1 text-[10px] font-medium h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Input</TabsTrigger>
                  <TabsTrigger value="output" className="flex-1 text-[10px] font-medium h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Output</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>

        {/* Main Tabs Content */}
        {/* Event Health Tab */}
        <TabsContent value="event-health" className="flex-1 flex flex-col min-h-0 px-4 pb-4 mt-0 data-[state=active]:flex data-[state=inactive]:hidden">
          <ScrollArea className="flex-1 min-h-0 -mr-3 pr-3">
            <div className="space-y-4">
              <Accordion type="multiple" defaultValue={["input-details", "output-details"]} className="w-full space-y-3">

                {/* Input Details Accordion */}
                <AccordionItem value="input-details" className="border-none bg-card rounded-xl shadow-sm px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${inputData.streamHealth === 'stable' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Input Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-3 p-2 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Stream Health</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold border ${healthTextColor[inputData.streamHealth]}`}>
                          {healthText[inputData.streamHealth]}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-muted/30 border border-border/30 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <ExternalLink className="w-3 h-3" />
                          <span className="text-[10px] font-medium uppercase">Mode</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground block truncate" title={inputData.inputMode}>{inputData.inputMode}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-muted/30 border border-border/30 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          <span className="text-[10px] font-medium uppercase">Dim</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground block truncate" title={inputData.dimension}>{inputData.dimension}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-muted/30 border border-border/30 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Play className="w-3 h-3" />
                          <span className="text-[10px] font-medium uppercase">FPS</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground block truncate">{inputData.frameRate}</span>
                      </div>

                      <div className="col-span-3 p-2 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Activity className="w-3 h-3" />
                          <span className="text-[10px] font-medium uppercase">Bitrate</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-semibold text-foreground">{inputData.bitrateCurrent}</span>
                          <span className="text-[10px] text-muted-foreground">kbps</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Output Details Accordion */}
                <AccordionItem value="output-details" className="border-none bg-card rounded-xl shadow-sm px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${outputData.streamHealth === 'stable' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Output Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2 p-2 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Stream Health</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold border ${healthTextColor[outputData.streamHealth]}`}>
                          {healthText[outputData.streamHealth]}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-muted/30 border border-border/30 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Settings className="w-3 h-3" />
                          <span className="text-[10px] font-medium uppercase">Modes</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground block truncate" title={outputData.modes}>{outputData.modes}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-muted/30 border border-border/30 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          <span className="text-[10px] font-medium uppercase">Encrypt</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground block truncate" title={outputData.encrypted}>{outputData.encrypted}</span>
                      </div>

                      <div className="col-span-2 p-2 rounded-lg bg-muted/30 border border-border/30 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Layers className="w-3 h-3" />
                          <span className="text-[10px] font-medium uppercase">Qualities</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground block truncate" title={outputData.qualities}>{outputData.qualities}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Event Logs Tab */}
        <TabsContent value="event-logs" className="flex-1 flex flex-col min-h-0 px-4 pb-4 mt-0 data-[state=active]:flex data-[state=inactive]:hidden">
          <ScrollArea className="flex-1 min-h-0 -mr-3 pr-3">
            <div className="space-y-4">
              <Accordion type="multiple" defaultValue={["event-logs-list"]} className="w-full space-y-3">
                <AccordionItem value="event-logs-list" className="border-none bg-card rounded-xl shadow-sm px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Event Logs</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <div className="space-y-2">


                      {/* Logs List */}
                      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {eventLogs.map((log) => (
                          <div
                            key={log.id}
                            className="group flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30"
                          >
                            <span className="text-[9px] font-medium text-muted-foreground font-mono whitespace-nowrap mt-0.5 bg-background px-1 py-0.5 rounded border border-border/20">
                              {log.timestamp}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-primary/70">{log.category}</span>
                                {log.description && (
                                  <span className="text-[11px] text-foreground font-medium leading-tight">{log.description}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Info Section Tab */}
        <TabsContent value="info-section" className="flex-1 flex flex-col min-h-0 px-4 pb-4 mt-0 data-[state=active]:flex data-[state=inactive]:hidden">
          <ScrollArea className="flex-1 min-h-0 -mr-3 pr-3">
            <div className="space-y-4">
              <Accordion type="multiple" defaultValue={["event-details", "ingestion-details", "live-channels"]} className="w-full space-y-3">
                {/* Event Details Accordion */}
                <AccordionItem value="event-details" className="border-none bg-card rounded-xl shadow-sm px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Event Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <div className="space-y-3">
                      {/* Live Event Preview */}
                      <div className="relative w-full aspect-video rounded-lg border border-border/50 bg-muted/30 overflow-hidden shadow-sm group ring-1 ring-white/5">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-destructive/50 mb-2 group-hover:text-destructive transition-colors">LIVE</div>
                            <div className="text-sm font-medium text-muted-foreground">Event Preview</div>
                          </div>
                        </div>
                      </div>

                      {/* Event Title and Description */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-foreground leading-tight">{eventTitle}</h3>
                          <div className="flex items-center gap-1">
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted" onClick={handleOpenPreview}>
                                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Open Preview</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted">
                                  <MoreVertical className="w-3 h-3 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={handleInvite}>
                                  <UserPlus className="w-3.5 h-3.5 mr-2" /> Invite
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleCopyEventUrl}>
                                  <Copy className="w-3.5 h-3.5 mr-2" /> Copy URL
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{eventDescription}</p>

                        {/* Date and Time */}
                        <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>{eventDate}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-border" />
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>{eventTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Ingestion Details Accordion */}
                <AccordionItem value="ingestion-details" className="border-none bg-card rounded-xl shadow-sm px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Signal className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Ingestion Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <div className="space-y-3">
                      {/* Primary RTMP URL */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-muted-foreground uppercase">Primary RTMP</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <Input
                              value={rtmpUrl}
                              readOnly
                              className="h-8 text-[10px] font-mono bg-muted/30 border-border/50 pr-8"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 border-border/50 bg-card hover:bg-accent"
                            onClick={() => handleCopy(rtmpUrl, "RTMP URL")}
                          >
                            {copiedField === "RTMP URL" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>

                      {/* Stream Key */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-muted-foreground uppercase">Stream Key</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <Input
                              type={showStreamKey ? "text" : "password"}
                              value={streamKey}
                              readOnly
                              className="h-8 text-[10px] font-mono bg-muted/30 border-border/50"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 border-border/50 bg-card hover:bg-accent"
                            onClick={() => setShowStreamKey(!showStreamKey)}
                          >
                            {showStreamKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 border-border/50 bg-card hover:bg-accent"
                            onClick={() => handleCopy(streamKey, "Stream Key")}
                          >
                            {copiedField === "Stream Key" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Live Channels Accordion */}
                <AccordionItem value="live-channels" className="border-none bg-card rounded-xl shadow-sm px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Tv className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Live Channels</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="h-8 text-xs bg-muted/30 border-border/50">
                        <SelectValue placeholder="Select Live Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="channel1">Channel 1</SelectItem>
                        <SelectItem value="channel2">Channel 2</SelectItem>
                        <SelectItem value="channel3">Channel 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 flex flex-col min-h-0 px-4 pb-4 mt-0 data-[state=active]:flex data-[state=inactive]:hidden">
          <ScrollArea className="flex-1 min-h-0 -mr-3 pr-3">
            <div className="space-y-4">
              <Accordion type="multiple" defaultValue={["features", "stream-controls"]} className="w-full space-y-3">
                {/* Features Accordion */}
                <AccordionItem value="features" className="border-none bg-card rounded-xl shadow-sm px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Features</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <div className="space-y-2">
                      {[
                        { label: "Comments", checked: commentsEnabled, set: setCommentsEnabled, icon: MessageSquare },
                        { label: "Live Duration", checked: liveDurationEnabled, set: setLiveDurationEnabled, icon: Clock },
                        { label: "Audience Count", checked: audienceCountEnabled, set: setAudienceCountEnabled, icon: Users },
                        { label: "Quick Messages", checked: quickMessagesEnabled, set: setQuickMessagesEnabled, icon: Zap },
                        { label: "Reactions", checked: reactionsEnabled, set: setReactionsEnabled, icon: Heart },
                        { label: "Reaction Stats", checked: reactionStatsEnabled, set: setReactionStatsEnabled, icon: BarChart },
                        { label: "Q&A", checked: qnaEnabled, set: setQnaEnabled, icon: HelpCircle },
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30 hover:border-border/50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1 rounded bg-background text-muted-foreground">
                              <feature.icon className="w-3 h-3" />
                            </div>
                            <label className="text-xs font-medium text-foreground cursor-pointer">
                              {feature.label}
                            </label>
                          </div>
                          <Switch
                            checked={feature.checked}
                            onCheckedChange={feature.set}
                            className="scale-90"
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Stream Controls Accordion */}
                <AccordionItem value="stream-controls" className="border-none bg-card rounded-xl shadow-sm px-3">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Manage Stream</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <Button
                      variant="outline"
                      className="w-full gap-2 h-9 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      onClick={() => setIsResetStreamDialogOpen(true)}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Reset Stream
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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


