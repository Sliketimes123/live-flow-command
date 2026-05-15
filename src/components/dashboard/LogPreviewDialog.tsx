import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={
            iconOnly
              ? `h-7 shrink-0 px-2.5 text-[10px] font-medium text-muted-foreground hover:text-foreground ${triggerClassName}`
              : `h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground ${triggerClassName}`
          }
          aria-label={`Show details: ${title}`}
        >
          Show Details
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(92vh,44rem)] w-[min(100vw-1.5rem,40rem)] max-w-[95vw] flex-col gap-3 overflow-hidden p-4 sm:gap-4 sm:p-5">
        <DialogHeader className="shrink-0 space-y-1 pr-10 text-left">
          <DialogTitle className="text-sm font-semibold tracking-wide text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-xs leading-snug text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <LiveLogTable
          title={title}
          logs={logs}
          emptyMessage={emptyMessage}
          tableHeight="max-h-[min(calc(92vh-10.5rem),24rem)]"
          showTitle={false}
          bordered={true}
          extraContent={extraContent}
        />
      </DialogContent>
    </Dialog>
  );
}
