import { cn } from "@/lib/utils";

export type StreamDirection = "in" | "out";

interface StreamDirectionLabelProps {
  direction: StreamDirection;
  className?: string;
  iconClassName?: string;
}

export function StreamDirectionLabel({ direction, className }: StreamDirectionLabelProps) {
  const isIn = direction === "in";
  const colorClass = isIn ? "text-[#3b82f6]" : "text-[#22c55e]";
  const label = isIn ? "IN" : "OUT";

  return (
    <div className={cn("inline-flex shrink-0 items-center", className)}>
      <span className={cn("text-[13px] font-bold leading-none", colorClass)}>{label}</span>
    </div>
  );
}
