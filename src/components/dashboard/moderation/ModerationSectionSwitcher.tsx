import { cn } from "@/lib/utils";
import type { ModerationTab } from "@/lib/moderationSession";

export type ModerationSectionTab = {
  key: ModerationTab;
  label: string;
  count: number;
  enabled?: boolean;
};

interface ModerationSectionSwitcherProps {
  value: ModerationTab;
  onValueChange: (value: ModerationTab) => void;
  tabs: ModerationSectionTab[];
  className?: string;
}

export function ModerationSectionSwitcher({
  value,
  onValueChange,
  tabs,
  className,
}: ModerationSectionSwitcherProps) {
  const visibleTabs = tabs.filter((tab) => tab.enabled !== false);

  return (
    <div
      role="tablist"
      aria-label="Moderation sections"
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl border border-border/50 bg-muted/40 p-1",
        className,
      )}
    >
      {visibleTabs.map((tab) => {
        const isActive = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onValueChange(tab.key)}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold leading-none transition-colors",
              isActive
                ? "bg-background text-primary shadow-sm ring-1 ring-primary/25"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            <span className="whitespace-nowrap">{tab.label}</span>
            <span
              className={cn(
                "inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                isActive ? "bg-primary/15 text-primary" : "bg-muted/80 text-muted-foreground",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
