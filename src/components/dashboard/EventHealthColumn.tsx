import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Eye, ExternalLink, Play } from "lucide-react";
export function EventHealthColumn() {

  const inputData = {
    primaryInput: "RTMP",
    streamHealth: "stable" as const,
    inputMode: "RTMP",
    bitrateCurrent: 1470,
    bitrateAverage: 1451,
    dimension: "1280×720",
    frameRate: 25,
  };

  const healthTextColor = {
    stable: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    poor: "text-destructive bg-destructive/10 border-destructive/20",
  };

  return (
    <div className="h-full rounded-2xl border border-border/70 bg-card p-4">
      <div className="h-full flex flex-col">
        <div className="mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">Input</h2>
        </div>

        <div className="space-y-2 mb-3">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border/50 group">
            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
              <Play className="w-8 h-8 text-white/50 group-hover:text-white/80 transition-colors" fill="currentColor" />
            </div>
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-600/90 rounded flex items-center gap-1 border border-red-500/50">
              <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold uppercase tracking-wider leading-none">LIVE</span>
            </div>
          </div>

        </div>

        <ScrollArea className="flex-1 -mr-2 pr-2">
          <Accordion type="multiple" defaultValue={["input-details"]} className="space-y-3">
            <AccordionItem value="input-details" className="border-none bg-card rounded-xl px-3">
              <AccordionTrigger className="py-2 hover:no-underline">
                <span className="text-xs font-semibold uppercase tracking-wide">Input Details</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 p-2 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-xs font-bold border ${healthTextColor[inputData.streamHealth]}`}>
                      Healthy
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ExternalLink className="w-3 h-3" />
                      <span className="text-xs uppercase">Input</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold">{inputData.inputMode}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span className="text-xs uppercase">Resolution</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold">{inputData.dimension}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Play className="w-3 h-3" />
                      <span className="text-xs uppercase">FPS</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold">{inputData.frameRate}</div>
                  </div>
                  <div className="col-span-2 p-2 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Activity className="w-3 h-3" />
                      <span className="text-xs uppercase">Bitrate</span>
                      <span className="text-xs normal-case">(Cur / Avg)</span>
                    </div>
                    <div className="mt-1 text-xs font-semibold font-mono tabular-nums leading-tight break-words">
                      {inputData.bitrateCurrent}/{inputData.bitrateAverage}
                      <span className="ml-1 text-xs text-muted-foreground">kbps</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </div>
    </div>
  );
}
