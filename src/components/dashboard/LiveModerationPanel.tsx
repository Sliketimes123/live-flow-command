import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, Eye, EyeOff, Star, ListPlus } from "lucide-react";
import { useState } from "react";

interface LiveModerationPanelProps {
  publishingHealth: "stable" | "warning" | "poor";
  activeSource: string;
  bitrate: number;
  fps: number;
  onViewTypeChange?: (viewType: "input" | "output") => void;
}

export function LiveModerationPanel({
  publishingHealth,
  activeSource,
  bitrate,
  fps,
  onViewTypeChange,
}: LiveModerationPanelProps) {
  const [viewType, setViewType] = useState<"input" | "output">("input");
  const [isMuted, setIsMuted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

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
    <div className="flex flex-col gap-3 h-full">
      <div>
        {/* Input/Output Tabs */}
        <Tabs value={viewType} onValueChange={(value) => handleViewTypeChange(value as "input" | "output")} className="mb-2">
          <TabsList className="w-full">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Live Player Preview */}
        <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border border-border shadow-lg">
          {/* Health Indicator Bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${healthColor[publishingHealth]}`} />

          {/* Placeholder Video */}
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-1 opacity-50" />
              <p className="text-xs">Live Feed Preview</p>
              <p className="text-[10px] opacity-70 mt-0.5">{activeSource}</p>
            </div>
          </div>

          {/* Live Badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-status-live backdrop-blur-sm rounded flex items-center gap-1 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-glow" />
            <span className="text-white text-[10px] font-bold uppercase tracking-wide">LIVE</span>
          </div>
        </div>

        {/* Stream Health Information */}
        <div className="mt-2 space-y-2">
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
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground font-medium text-[10px]">FRAME RATE:</span>
                <span className="font-semibold text-foreground text-xs">{outputData.frameRate} FPS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Moderation Actions */}
      <div className="space-y-1.5 mt-auto">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="gap-1 h-7 text-xs"
          >
            {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>

          <Button
            variant={isHidden ? "destructive" : "secondary"}
            size="sm"
            onClick={() => setIsHidden(!isHidden)}
            className="gap-1 h-7 text-xs"
          >
            {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {isHidden ? "Show" : "Hide"}
          </Button>

          <Button variant="secondary" size="sm" className="gap-1 h-7 text-xs">
            <Star className="w-3 h-3" />
            Highlight
          </Button>

          <Button variant="secondary" size="sm" className="gap-1 h-7 text-xs">
            <ListPlus className="w-3 h-3" />
            Playlist
          </Button>
        </div>
      </div>
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
