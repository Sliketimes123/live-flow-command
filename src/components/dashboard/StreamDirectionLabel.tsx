import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { cn } from "@/lib/utils";

export type StreamDirection = "in" | "out";

interface StreamDirectionLabelProps {
  direction: StreamDirection;
  className?: string;
  iconClassName?: string;
}

export function StreamDirectionLabel({ direction, className, iconClassName }: StreamDirectionLabelProps) {
  const isIn = direction === "in";
  const colorClass = isIn ? "text-[#3b82f6]" : "text-[#22c55e]";
  const Icon = isIn ? ArrowDownToLine : ArrowUpFromLine;
  const label = isIn ? "IN" : "OUT";

  return (
    <div className={cn("inline-flex shrink-0 items-center gap-1.5", className)}>
      <Icon
        className={cn("h-[18px] w-[18px] shrink-0", colorClass, iconClassName)}
        aria-hidden
      />
      <span className={cn("text-xs font-semibold", colorClass)}>{label}</span>
    </div>
  );
}
