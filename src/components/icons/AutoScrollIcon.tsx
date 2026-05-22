import { cn } from "@/lib/utils";

interface AutoScrollIconProps {
  className?: string;
}

/** Line-style auto-scroll: dotted trail + downward arrow (inherits `currentColor`). */
export function AutoScrollIcon({ className }: AutoScrollIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-[18px] w-[18px] shrink-0", className)}
    >
      <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M12 15v5" />
      <path d="M8 17l4 4 4-4" />
    </svg>
  );
}
