import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, MicOff, Eye, EyeOff, Star, ListPlus } from "lucide-react";
import { useState } from "react";

interface LiveModerationPanelProps {
  publishingHealth: "stable" | "warning" | "poor";
  activeSource: string;
  onSourceSwitch: (source: string) => void;
}

export function LiveModerationPanel({
  publishingHealth,
  activeSource,
  onSourceSwitch,
}: LiveModerationPanelProps) {
  const [selectedSource, setSelectedSource] = useState(activeSource);
  const [isMuted, setIsMuted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const healthColor = {
    stable: "bg-success",
    warning: "bg-warning",
    poor: "bg-destructive",
  };

  const sources = ["Camera-1", "Camera-2", "Studio Feed", "Screen Share", "Remote Guest"];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-lg font-bold mb-4">Live Moderation Panel</h2>

        {/* Live Player Preview */}
        <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border border-border shadow-lg">
          {/* Health Indicator Bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${healthColor[publishingHealth]}`} />

          {/* Placeholder Video */}
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Live Feed Preview</p>
              <p className="text-xs opacity-70 mt-1">{activeSource}</p>
            </div>
          </div>

          {/* Live Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 bg-status-live backdrop-blur-sm rounded-lg flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse-glow" />
            <span className="text-white text-xs font-bold uppercase tracking-wide">LIVE</span>
          </div>
        </div>
      </div>

      {/* Source Switching */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Source Switching
        </h3>
        <div className="space-y-3">
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => onSourceSwitch(selectedSource)}
            className="w-full"
            disabled={selectedSource === activeSource}
          >
            Switch Live Feed
          </Button>

          <div className="px-3 py-2 surface-elevated rounded-lg text-sm">
            <span className="text-muted-foreground">Active Source:</span>{" "}
            <span className="text-foreground font-medium">{activeSource}</span>
          </div>
        </div>
      </div>

      {/* Quick Moderation Actions */}
      <div className="space-y-3 mt-auto">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="gap-2"
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>

          <Button
            variant={isHidden ? "destructive" : "secondary"}
            size="sm"
            onClick={() => setIsHidden(!isHidden)}
            className="gap-2"
          >
            {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isHidden ? "Show" : "Hide"}
          </Button>

          <Button variant="secondary" size="sm" className="gap-2">
            <Star className="w-4 h-4" />
            Mark Highlight
          </Button>

          <Button variant="secondary" size="sm" className="gap-2">
            <ListPlus className="w-4 h-4" />
            Add to Playlist
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
