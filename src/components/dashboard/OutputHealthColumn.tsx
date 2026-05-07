import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Settings, Lock, Layers } from "lucide-react";

interface OutputHealthColumnProps {
  publishingHealth: "stable" | "warning" | "poor";
}

export function OutputHealthColumn({
  publishingHealth,
}: OutputHealthColumnProps) {
  const outputData = {
    status: "Healthy",
    streamType: "HLS",
    quality: "HD",
    encryption: "No",
  };

  void publishingHealth;

  return (
    <div className="h-full rounded-2xl border border-border/70 bg-card p-4">
      <div className="h-full flex flex-col">
        <div className="mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">Output</h2>
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
          <Accordion type="multiple" defaultValue={["output-details"]} className="space-y-3">
            <AccordionItem value="output-details" className="border-none bg-card rounded-xl px-3">
              <AccordionTrigger className="py-2 hover:no-underline">
                <span className="text-xs font-semibold uppercase tracking-wide">Output Details</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 p-2 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                    <span className="px-1.5 py-0.5 rounded-sm text-xs font-bold border text-success bg-success/10 border-success/20">
                      {outputData.status}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Settings className="w-3 h-3" />
                      <span className="text-xs uppercase">Stream Type</span>
                    </div>
                    <span className="text-xs font-semibold">{outputData.streamType}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span className="text-xs uppercase">Encryption</span>
                    </div>
                    <span className="text-xs font-semibold">{outputData.encryption}</span>
                  </div>
                  <div className="col-span-2 p-2 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Layers className="w-3 h-3" />
                      <span className="text-xs uppercase">Quality</span>
                    </div>
                    <span className="text-xs font-semibold">{outputData.quality}</span>
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
