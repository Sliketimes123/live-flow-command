import { type ReactNode } from "react";
import { Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LiveLogTable, type LiveLog } from "./LiveLogTable";

interface LogPreviewDialogProps {
  title: string;
  description: string;
  logs: LiveLog[];
  emptyMessage: string;
  iconOnly?: boolean;
  triggerClassName?: string;
  extraContent?: ReactNode;
}

export function LogPreviewDialog({
  title,
  description,
  logs,
  emptyMessage,
  iconOnly = false,
  triggerClassName = "",
  extraContent,
}: LogPreviewDialogProps) {
  return (
    <Dialog>
      {iconOnly ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-7 w-7 ${triggerClassName}`}
                  aria-label={`Preview ${title}`}
                >
                  <Expand className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open expanded log preview</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={`h-6 px-2 text-[10px] ${triggerClassName}`}>
            <Expand className="h-3 w-3" />
            Preview
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-[92vw] max-w-6xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-sm uppercase tracking-wide">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <LiveLogTable
          title={title}
          logs={logs}
          emptyMessage={emptyMessage}
          tableHeight="h-[65vh]"
          showTitle={false}
          bordered={true}
          extraContent={extraContent}
        />
      </DialogContent>
    </Dialog>
  );
}
