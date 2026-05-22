import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Star,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  Ban,
  Pin,
  PinOff,
  Grid3x3,
  List,
  MoreVertical,
  Megaphone,
  ChevronDown,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FocusEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { AutoScrollIcon } from "@/components/icons/AutoScrollIcon";
import { cn } from "@/lib/utils";
import type { BlockedUser, ChatMessage } from "./ChatModeration";

export type ModerationChatLayout = "row" | "card";

/** `comments` = public live chat; `studio` = internal studio chat (no hide/pin/select). */
export type ChatChannel = "comments" | "studio";

/** `moderation` = full panel two-column; `sidebar` = narrow stacked accordion. */
export type ChatPanelVariant = "moderation" | "sidebar";

/** Avoid focus ring clipping inside overflow-hidden moderation panels */
const panelInputClass =
  "h-[38px] border-border/50 bg-muted/25 text-xs shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0";

function chatUserInitials(username: string): string {
  const t = username.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0] ?? "";
    const b = parts[1][0] ?? "";
    return `${a}${b}`.toUpperCase().slice(0, 2) || "??";
  }
  const alnum = t.replace(/[^a-zA-Z0-9]/g, "");
  if (alnum.length >= 2) return alnum.slice(0, 2).toUpperCase();
  return t.slice(0, 2).toUpperCase();
}

export interface ModerationMessagePanelProps {
  variant?: ChatPanelVariant;
  chatChannel?: ChatChannel;
  messages: ChatMessage[];
  layout: ModerationChatLayout;
  onLayoutChange: (layout: ModerationChatLayout) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showHidden?: boolean;
  onToggleShowHidden?: () => void;
  /** When provided, enables the left management column (Chat). */
  hiddenMessages?: ChatMessage[];
  selectedMessages?: ChatMessage[];
  blockedUsers?: BlockedUser[];
  /** Full message list for blocked-user message counts. */
  allMessages?: ChatMessage[];
  onUnblockUser?: (username: string) => void;
  autoScroll: boolean;
  onAutoScrollChange: (value: boolean) => void;
  /** Pauses parent auto-scroll while a row or action menu is active. */
  onAutoScrollPauseChange?: (paused: boolean) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  requestScrollToBottom: () => void;
  copiedMessageId: string | null;
  /** Not used for studio chat — block/unblock is public-chat only. */
  isUserBlocked?: (username: string) => boolean;
  onToggleHide: (messageId: string) => void;
  onTogglePin: (messageId: string) => void;
  onToggleSelect: (messageId: string) => void;
  onCopyMessage: (messageId: string, text: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  /** Not used for studio chat — block/unblock is public-chat only. */
  onBlockRequest?: (username: string) => void;
  composerPlaceholder: string;
  composerValue: string;
  onComposerChange: (value: string) => void;
  onComposerSend: () => void;
  composerSendDisabled: boolean;
}

const managementItemCardClass =
  "rounded-[10px] border border-border/50 bg-muted/30 px-3 py-2.5 shadow-sm transition-colors hover:border-border/70 hover:bg-muted/40";

const managementPanelClass =
  "flex h-full min-h-0 w-full min-w-0 flex-col overflow-y-auto rounded-xl border border-border/50 bg-muted/15 custom-scrollbar force-vertical-scrollbar scrollbar-gutter-stable";

const accordionCountBadgeClass =
  "inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-muted/80 px-1.5 text-[11px] font-semibold tabular-nums text-foreground";

function ManagementEmptyState({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-2.5 text-center",
        compact ? "min-h-[56px] py-2.5" : "min-h-[88px] py-4",
      )}
    >
      <p className={cn("font-medium text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>{title}</p>
      <p className={cn("leading-snug text-muted-foreground/80", compact ? "mt-0.5 text-[10px]" : "mt-1 text-[11px]")}>
        {description}
      </p>
    </div>
  );
}

type ManagementMenuItem = {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  separatorBefore?: boolean;
};

const managementQuickActionBtnClass =
  "inline-flex h-8 w-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-[8px] p-0 text-muted-foreground transition-colors hover:bg-primary/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-1 active:bg-primary/15";

function ManagementMessageCard({
  msg,
  blocked,
  menuAriaLabel,
  menuItems,
  quickActions,
}: {
  msg: ChatMessage;
  blocked: boolean;
  copiedMessageId: string | null;
  menuAriaLabel: string;
  menuItems: ManagementMenuItem[];
  quickActions?: ReactNode;
}) {
  return (
    <div className={cn(managementItemCardClass, "group")}>
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
            <span className="truncate text-[11px] font-semibold text-foreground">{msg.username}</span>
            <span className="shrink-0 text-[10px] text-muted-foreground">·</span>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{msg.timestamp}</span>
            {msg.isSelected && <Star className="h-2.5 w-2.5 shrink-0 fill-primary text-primary" />}
            {msg.isHighlighted && <Star className="h-2.5 w-2.5 shrink-0 fill-primary text-primary" />}
            {blocked && (
              <span className="rounded border border-destructive/25 bg-destructive/10 px-1 py-px text-[8px] font-bold uppercase leading-none text-destructive">
                Blocked
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-foreground/85">{msg.message}</p>
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 opacity-0 transition-opacity",
            "group-hover:opacity-100 group-focus-within:opacity-100",
            "has-[:focus-visible]:opacity-100 has-[[data-state=open]]:opacity-100",
          )}
        >
          {quickActions}
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              aria-label={menuAriaLabel}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {menuItems.map((item) => (
              <div key={item.key}>
                {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  className={cn("text-xs", item.destructive && "text-destructive focus:text-destructive")}
                  onClick={item.onClick}
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function BlockedUserCard({
  user,
  messageCount,
  onUnblock,
}: {
  user: BlockedUser;
  messageCount: number;
  onUnblock: () => void;
}) {
  return (
    <div className="group rounded-[10px] border border-border/50 bg-muted/25 px-3 py-2.5 shadow-sm">
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-foreground">{user.username}</p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">Blocked {user.blockedAt}</p>
          {messageCount > 0 ? (
            <p className="mt-0.5 text-[10px] text-muted-foreground/90">
              {messageCount} message{messageCount === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "shrink-0 opacity-0 transition-opacity",
            "group-hover:opacity-100 group-focus-within:opacity-100 has-[:focus-visible]:opacity-100",
          )}
        >
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    managementQuickActionBtnClass,
                    "text-destructive hover:bg-destructive/10 hover:text-destructive",
                  )}
                  aria-label="Unblock user"
                  onClick={onUnblock}
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Unblock</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

function ManagementAccordionSection({
  title,
  count,
  helperText,
  open,
  onOpenChange,
  maxHeightClass,
  children,
}: {
  title: string;
  count: number;
  helperText?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxHeightClass: string;
  children: ReactNode;
}) {
  const hintText = open ? helperText : undefined;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border-b border-border/40 last:border-b-0">
      <div>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-muted/20"
            aria-expanded={open}
          >
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[11px] font-bold tracking-wide text-foreground">{title}</span>
                <span className={accordionCountBadgeClass}>{count}</span>
              </div>
              {hintText ? (
                <p className="mt-0.5 text-[10px] text-muted-foreground/90">{hintText}</p>
              ) : null}
            </div>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="border-t border-border/40 p-2.5">
            <ScrollArea className={cn("overflow-hidden pr-1", maxHeightClass)}>
              <div className="flex flex-col gap-2">{children}</div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}



export function ModerationMessagePanel({
  variant = "sidebar",
  chatChannel = "comments",
  messages,
  layout,
  onLayoutChange,
  searchQuery,
  onSearchChange,
  showHidden,
  onToggleShowHidden,
  hiddenMessages,
  selectedMessages,
  blockedUsers,
  allMessages,
  onUnblockUser,
  autoScroll,
  onAutoScrollChange,
  onAutoScrollPauseChange,
  scrollRef,
  requestScrollToBottom,
  copiedMessageId,
  isUserBlocked = () => false,
  onToggleHide,
  onTogglePin,
  onToggleSelect,
  onCopyMessage,
  onDeleteMessage,
  onBlockRequest = () => undefined,
  composerPlaceholder,
  composerValue,
  onComposerChange,
  onComposerSend,
  composerSendDisabled,
}: ModerationMessagePanelProps) {
  const isModerationVariant = variant === "moderation";
  const isSidebarVariant = variant === "sidebar";
  /** Sidebar width is too narrow for card/grid layouts — always use compact rows. */
  const effectiveLayout: ModerationChatLayout = isSidebarVariant ? "row" : layout;
  const isStudioChat = chatChannel === "studio";
  const isUserBlockedForChannel = (username: string) =>
    !isStudioChat && isUserBlocked(username);
  const hasManagementData = hiddenMessages !== undefined && !isStudioChat;
  const showManagementColumn = hasManagementData && isModerationVariant;
  const hiddenList = hiddenMessages ?? [];
  const selectedList = selectedMessages ?? [];
  const blockedList = blockedUsers ?? [];
  const messagePool = allMessages ?? messages;
  const sidebarSearchInputClass = cn(panelInputClass, "h-9 rounded-[10px] text-sm leading-none");
  const sidebarComposerInputClass = cn(panelInputClass, "h-10 rounded-[10px] text-sm leading-none");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [openActionsMenuId, setOpenActionsMenuId] = useState<string | null>(null);
  const [accordionSections, setAccordionSections] = useState({
    selected: true,
    blocked: false,
    hidden: false,
  });

  const setAccordionOpen = (section: keyof typeof accordionSections, open: boolean) => {
    setAccordionSections((prev) => ({ ...prev, [section]: open }));
  };

  const blockedUserMessageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const msg of messagePool) {
      counts.set(msg.username, (counts.get(msg.username) ?? 0) + 1);
    }
    return counts;
  }, [messagePool]);

  useEffect(() => {
    onAutoScrollPauseChange?.(hoveredMessageId !== null || openActionsMenuId !== null);
  }, [hoveredMessageId, openActionsMenuId, onAutoScrollPauseChange]);

  const messageInteractionHandlers = (messageId: string) => ({
    onMouseEnter: () => setHoveredMessageId(messageId),
    onMouseLeave: () => setHoveredMessageId((current) => (current === messageId ? null : current)),
    onFocusCapture: () => setHoveredMessageId(messageId),
    onBlurCapture: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setHoveredMessageId((current) => (current === messageId ? null : current));
      }
    },
  });

  const messageMetaLine = (msg: ChatMessage, blocked: boolean) => (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-1.5",
        isSidebarVariant ? "gap-y-0 leading-[1.2]" : "gap-y-0.5",
      )}
    >
      {!isStudioChat && msg.isSelected && (
        <Star
          className={cn(
            "shrink-0 fill-primary text-primary",
            isSidebarVariant ? "h-2.5 w-2.5" : "h-3 w-3",
          )}
        />
      )}
      <span
        className={cn(
          "min-w-0 truncate text-foreground",
          isSidebarVariant ? "text-[13px] font-bold leading-tight" : "text-[12px] font-semibold leading-tight",
        )}
      >
        {msg.username}
      </span>
      <span
        className={cn(
          "shrink-0 leading-none text-muted-foreground",
          isSidebarVariant ? "text-[11px] font-medium" : "font-mono text-[10px]",
        )}
      >
        {msg.timestamp}
      </span>
      {msg.isHighlighted && (
        <Star className={cn("shrink-0 fill-primary text-primary", isSidebarVariant ? "h-2.5 w-2.5" : "h-3 w-3")} />
      )}
      {!isStudioChat && blocked && (
        <span
          className={cn(
            "inline-flex items-center rounded border border-destructive/25 bg-destructive/10 font-bold uppercase text-destructive",
            isSidebarVariant
              ? "h-[18px] rounded-md px-1.5 text-[10px] leading-none"
              : "px-1 py-px text-[9px] leading-none",
          )}
        >
          Blocked
        </span>
      )}
    </div>
  );

  const messageBody = (msg: ChatMessage, bodyVariant: "row" | "card" = "row") => (
    <p
      className={cn(
        "block text-foreground/90",
        bodyVariant === "card"
          ? "mt-2 line-clamp-3 break-words text-[12px] leading-snug"
          : isSidebarVariant
            ? "m-0 mb-0 line-clamp-2 break-words text-[12px] leading-[1.35] text-foreground"
            : "mt-0.5 break-words text-[12px] leading-snug",
      )}
    >
      {msg.message}
    </p>
  );

  const avatarEl = (username: string) => (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-primary/10 font-semibold uppercase leading-none text-primary",
        isSidebarVariant ? "h-[34px] w-[34px] text-[13px]" : "h-7 w-7 text-[10px]",
      )}
      aria-hidden
    >
      {chatUserInitials(username)}
    </div>
  );

  type MessageActionSize = "row" | "card" | "sidebar";

  const messageActionBaseBtnClass =
    "inline-flex shrink-0 items-center justify-center rounded-[10px] p-0 text-muted-foreground transition-colors hover:bg-primary/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-1 active:bg-primary/15";

  const messageActionStyles = (size: MessageActionSize) => {
    if (size === "sidebar") {
      return {
        btn: cn(messageActionBaseBtnClass, "h-7 w-7 min-w-7 rounded-[7px]"),
        icon: "h-[15px] w-[15px] shrink-0",
        cluster: "flex items-center justify-end gap-1.5",
      };
    }
    if (size === "card") {
      return {
        btn: cn(messageActionBaseBtnClass, "h-9 w-9 min-h-9 min-w-9"),
        icon: "h-[18px] w-[18px] shrink-0",
        cluster: "flex items-center justify-end gap-3",
      };
    }
    return {
      btn: cn(
        messageActionBaseBtnClass,
        isModerationVariant ? "h-10 w-10 min-h-10 min-w-10" : "h-9 w-9 min-h-9 min-w-9",
      ),
      icon: isModerationVariant ? "h-5 w-5 shrink-0" : "h-[18px] w-[18px] shrink-0",
      cluster: "flex shrink-0 items-center gap-3 pr-3",
    };
  };

  const messageActionsHoverClass =
    "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 has-[:focus-visible]:opacity-100 has-[[data-state=open]]:opacity-100";

  const messagePinAction = (msg: ChatMessage, size: MessageActionSize = "row") => {
    const { btn, icon } = messageActionStyles(size);
    return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            btn,
            msg.isPinned &&
              "bg-orange-600/15 text-orange-600 opacity-100 hover:bg-orange-600/20 hover:text-orange-600 dark:bg-orange-500/15 dark:text-orange-400 dark:hover:bg-orange-500/20 dark:hover:text-orange-300",
          )}
          aria-label={msg.isPinned ? "Unpin message" : "Pin message"}
          aria-pressed={msg.isPinned}
          onClick={() => onTogglePin(msg.id)}
        >
          {msg.isPinned ? <PinOff className={icon} /> : <Pin className={icon} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">{msg.isPinned ? "Unpin" : "Pin"}</p>
      </TooltipContent>
    </Tooltip>
    );
  };

  const messageHideAction = (msg: ChatMessage, size: MessageActionSize = "row") => {
    const { btn, icon } = messageActionStyles(size);
    return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, msg.isHidden && "text-primary")}
          aria-label={msg.isHidden ? "Unhide message" : "Hide message"}
          onClick={() => onToggleHide(msg.id)}
        >
          {msg.isHidden ? <Eye className={icon} /> : <EyeOff className={icon} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">{msg.isHidden ? "Unhide" : "Hide"}</p>
      </TooltipContent>
    </Tooltip>
    );
  };

  const messageSelectAction = (msg: ChatMessage, size: MessageActionSize = "row") => {
    const { btn, icon } = messageActionStyles(size);
    return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, msg.isSelected && "text-primary")}
          aria-label={msg.isSelected ? "Unselect message" : "Select message"}
          aria-pressed={msg.isSelected}
          onClick={() => onToggleSelect(msg.id)}
        >
          <Star className={cn(icon, msg.isSelected && "fill-primary")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">{msg.isSelected ? "Unselect" : "Select"}</p>
      </TooltipContent>
    </Tooltip>
    );
  };

  const messageBlockAction = (msg: ChatMessage, blocked: boolean, size: MessageActionSize = "row") => {
    const { btn, icon } = messageActionStyles(size);
    return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            btn,
            blocked && "text-destructive hover:bg-destructive/10 hover:text-destructive",
            size === "sidebar" && !blocked && "hover:bg-destructive/10 hover:text-destructive",
          )}
          aria-label={blocked ? "Unblock user" : "Block user"}
          onClick={() => {
            if (blocked) {
              onUnblockUser?.(msg.username);
            } else {
              onBlockRequest(msg.username);
            }
          }}
        >
          <Ban className={icon} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">{blocked ? "Unblock user" : "Block user"}</p>
      </TooltipContent>
    </Tooltip>
    );
  };

  const messageOverflowMenu = (
    msg: ChatMessage,
    blocked: boolean,
    size: MessageActionSize = "row",
    options?: { includeBlock?: boolean; fullMenu?: boolean; sidebarMenu?: boolean },
  ) => {
    const { btn, icon } = messageActionStyles(size);
    return (
      <DropdownMenu
        onOpenChange={(open) => {
          setOpenActionsMenuId(open ? msg.id : null);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(btn, "data-[state=open]:bg-primary/[0.08]")}
            aria-label="Message actions"
          >
            <MoreVertical className={icon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {options?.fullMenu && !isStudioChat ? (
            <>
              <DropdownMenuItem className="text-xs" onClick={() => onToggleHide(msg.id)}>
                {msg.isHidden ? (
                  <Eye className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="mr-2 h-3.5 w-3.5" />
                )}
                {msg.isHidden ? "Unhide" : "Hide"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => onTogglePin(msg.id)}>
                {msg.isPinned ? (
                  <PinOff className="mr-2 h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                ) : (
                  <Pin className="mr-2 h-3.5 w-3.5" />
                )}
                {msg.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => onToggleSelect(msg.id)}>
                <Star className={cn("mr-2 h-3.5 w-3.5", msg.isSelected && "fill-primary text-primary")} />
                {msg.isSelected ? "Unselect" : "Select"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {options?.sidebarMenu && !isStudioChat ? (
            <DropdownMenuItem className="text-xs" onClick={() => onTogglePin(msg.id)}>
              {msg.isPinned ? (
                <PinOff className="mr-2 h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
              ) : (
                <Pin className="mr-2 h-3.5 w-3.5" />
              )}
              {msg.isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem className="text-xs" onClick={() => onCopyMessage(msg.id, msg.message)}>
            {copiedMessageId === msg.id ? (
              <Check className="mr-2 h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy className="mr-2 h-3.5 w-3.5" />
            )}
            Copy
          </DropdownMenuItem>
          {onDeleteMessage ? (
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={() => onDeleteMessage(msg.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          ) : null}
          {!isStudioChat && (options?.includeBlock || options?.sidebarMenu) ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-destructive focus:text-destructive"
                onClick={() => {
                  if (blocked) {
                    onUnblockUser?.(msg.username);
                  } else {
                    onBlockRequest(msg.username);
                  }
                }}
              >
                <Ban className="mr-2 h-3.5 w-3.5" />
                {blocked ? "Unblock user" : "Block user"}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const sidebarActionClusterVisibleClass = (msg: ChatMessage) =>
    cn(
      "overflow-hidden transition-[max-height,opacity] duration-150 ease-out",
      "max-h-0 opacity-0",
      "group-hover:max-h-8 group-hover:opacity-100",
      "group-focus-within:max-h-8 group-focus-within:opacity-100",
      "has-[[data-state=open]]:max-h-8 has-[[data-state=open]]:opacity-100",
      !isStudioChat && msg.isSelected && "max-h-8 opacity-100",
      !isStudioChat && msg.isPinned && "max-h-8 opacity-100",
    );

  const messageSidebarActionCluster = (msg: ChatMessage, blocked: boolean) => {
    const { cluster } = messageActionStyles("sidebar");
    return (
      <TooltipProvider delayDuration={200}>
        <div className={cn("mt-1", sidebarActionClusterVisibleClass(msg))}>
          <div className={cluster}>
            {isStudioChat ? (
              messageOverflowMenu(msg, blocked, "sidebar")
            ) : (
              <>
                {messageHideAction(msg, "sidebar")}
                {messageSelectAction(msg, "sidebar")}
                {messageOverflowMenu(msg, blocked, "sidebar", { sidebarMenu: true })}
              </>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  };

  const messageRowActionsBar = (msg: ChatMessage, blocked: boolean) => {
    const { cluster } = messageActionStyles("row");
    return (
      <TooltipProvider delayDuration={200}>
        <div
          className="flex shrink-0 items-center self-center gap-3 pl-2"
          onMouseEnter={() => setHoveredMessageId(msg.id)}
        >
          {!isStudioChat && msg.isPinned ? messagePinAction(msg, "row") : null}
          <div className={cn(cluster, messageActionsHoverClass)}>
            {!isStudioChat ? messageHideAction(msg, "row") : null}
            {!isStudioChat && !msg.isPinned ? messagePinAction(msg, "row") : null}
            {!isStudioChat ? messageSelectAction(msg, "row") : null}
            {!isStudioChat ? messageBlockAction(msg, blocked, "row") : null}
            {messageOverflowMenu(msg, blocked, "row")}
          </div>
        </div>
      </TooltipProvider>
    );
  };

  const messageCardActionsBar = (msg: ChatMessage, blocked: boolean) => {
    const { cluster } = messageActionStyles("card");
    return (
      <TooltipProvider delayDuration={200}>
        <div
          className="mt-3 flex items-center justify-end gap-3 border-t border-border/50 pt-3"
          onMouseEnter={() => setHoveredMessageId(msg.id)}
        >
          {!isStudioChat && msg.isPinned ? messagePinAction(msg, "card") : null}
          <div className={cn(cluster, messageActionsHoverClass)}>
            {!isStudioChat ? messageHideAction(msg, "card") : null}
            {!isStudioChat && !msg.isPinned ? messagePinAction(msg, "card") : null}
            {!isStudioChat ? messageSelectAction(msg, "card") : null}
            {!isStudioChat
              ? messageOverflowMenu(msg, blocked, "card", { includeBlock: true })
              : messageOverflowMenu(msg, blocked, "card")}
          </div>
        </div>
      </TooltipProvider>
    );
  };

  const messageShellClass = (msg: ChatMessage, blocked: boolean) =>
    cn(
      "group box-border min-w-0 border transition-colors",
      effectiveLayout === "row" &&
        (isSidebarVariant
          ? "w-full min-w-0 rounded-xl border-border/50 bg-card/90 px-2.5 py-2 shadow-none"
          : "w-full rounded-md border-border/50 bg-card/90 px-3 py-2.5 shadow-sm"),
      effectiveLayout === "card" &&
        "relative h-auto w-full self-start rounded-xl border-border/50 bg-card/95 p-3 shadow-sm",
      "hover:border-border hover:bg-muted/15",
      msg.isHighlighted && "border-primary/35 bg-primary/[0.07]",
      !isStudioChat && blocked && "opacity-[0.72]",
      !isStudioChat && msg.isPinned && "border-orange-600/40 bg-orange-600/[0.06] dark:border-orange-500/35 dark:bg-orange-500/[0.06]",
      !isStudioChat && msg.isSelected && "border-primary/50 bg-primary/10 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.22)]",
    );

  const renderSidebarMessage = (msg: ChatMessage) => {
    const blocked = isUserBlockedForChannel(msg.username);
    return (
      <div
        key={msg.id}
        className={messageShellClass(msg, blocked)}
        {...messageInteractionHandlers(msg.id)}
      >
        <div className="flex w-full min-w-0 items-start gap-2 box-border">
          {avatarEl(msg.username)}
          <div className="min-w-0 flex-1">
            <div className="mb-0.5">{messageMetaLine(msg, blocked)}</div>
            {messageBody(msg)}
            {messageSidebarActionCluster(msg, blocked)}
          </div>
        </div>
      </div>
    );
  };

  const renderMessage = (msg: ChatMessage) => {
    const blocked = isUserBlockedForChannel(msg.username);

    if (isSidebarVariant) {
      return renderSidebarMessage(msg);
    }

    if (effectiveLayout === "card") {
      return (
        <div
          key={msg.id}
          className={messageShellClass(msg, blocked)}
          {...messageInteractionHandlers(msg.id)}
        >
          <div className="flex items-start gap-2.5">
            {avatarEl(msg.username)}
            <div className="min-w-0 flex-1">{messageMetaLine(msg, blocked)}</div>
          </div>
          {messageBody(msg, "card")}
          {messageCardActionsBar(msg, blocked)}
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={messageShellClass(msg, blocked)}
        {...messageInteractionHandlers(msg.id)}
      >
        <div className="flex w-full min-w-0 items-center gap-2.5 box-border">
          {avatarEl(msg.username)}
          <div className="min-w-0 flex-1">
            {messageMetaLine(msg, blocked)}
            {messageBody(msg)}
          </div>
          {messageRowActionsBar(msg, blocked)}
        </div>
      </div>
    );
  };

  const sidebarFeedClass = "flex w-full min-w-0 flex-col gap-2 pb-0";

  const feedClass = cn(
    "min-w-0 w-full pb-0.5",
    effectiveLayout === "row" && "flex w-full min-w-0 flex-col gap-1.5",
    effectiveLayout === "card" &&
      "grid items-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]",
  );

  const toolbarIconBtnClass = (active: boolean) =>
    cn(
      "flex shrink-0 items-center justify-center rounded-md border transition-colors",
      isSidebarVariant ? "h-9 w-9" : "h-7 w-7",
      active
        ? "border-primary/45 bg-primary/15 text-primary shadow-sm"
        : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40 hover:text-foreground",
    );

  const layoutBtn = (l: ModerationChatLayout, icon: ReactNode, label: string) => (
    <Tooltip key={l}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onLayoutChange(l)}
          className={toolbarIconBtnClass(effectiveLayout === l)}
          aria-pressed={effectiveLayout === l}
          aria-label={label}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-xs">{label}</p>
      </TooltipContent>
    </Tooltip>
  );

  const handleConfirmDelete = () => {
    if (deleteTargetId && onDeleteMessage) {
      onDeleteMessage(deleteTargetId);
    }
    setDeleteTargetId(null);
  };

  const copyIcon = (messageId: string) =>
    copiedMessageId === messageId ? (
      <Check className="mr-2 h-3.5 w-3.5 text-primary" />
    ) : (
      <Copy className="mr-2 h-3.5 w-3.5" />
    );

  const selectedChatCards = selectedList.map((msg) => {
    const blocked = isUserBlockedForChannel(msg.username);
    return (
      <ManagementMessageCard
        key={msg.id}
        msg={msg}
        blocked={blocked}
        copiedMessageId={copiedMessageId}
        menuAriaLabel="Selected chat actions"
        quickActions={
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(managementQuickActionBtnClass, "text-primary")}
                    aria-label="Unselect message"
                    onClick={() => onToggleSelect(msg.id)}
                  >
                    <Star className="h-4 w-4 fill-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Unselect</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      managementQuickActionBtnClass,
                      blocked && "text-destructive hover:bg-destructive/10 hover:text-destructive",
                    )}
                    aria-label={blocked ? "Unblock user" : "Block user"}
                    onClick={() => {
                      if (blocked) {
                        onUnblockUser?.(msg.username);
                      } else {
                        onBlockRequest(msg.username);
                      }
                    }}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{blocked ? "Unblock user" : "Block user"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        }
        menuItems={[
          {
            key: "copy",
            label: "Copy",
            icon: copyIcon(msg.id),
            onClick: () => onCopyMessage(msg.id, msg.message),
          },
          ...(onDeleteMessage
            ? [
                {
                  key: "delete",
                  label: "Delete",
                  icon: <Trash2 className="mr-2 h-3.5 w-3.5" />,
                  onClick: () => setDeleteTargetId(msg.id),
                  destructive: true,
                  separatorBefore: true,
                } satisfies ManagementMenuItem,
              ]
            : []),
        ]}
      />
    );
  });

  const blockedUserCards = blockedList.map((user) => (
    <BlockedUserCard
      key={user.id}
      user={user}
      messageCount={blockedUserMessageCounts.get(user.username) ?? 0}
      onUnblock={() => onUnblockUser?.(user.username)}
    />
  ));

  const hiddenChatCards = hiddenList.map((msg) => (
    <ManagementMessageCard
      key={msg.id}
      msg={msg}
      blocked={isUserBlockedForChannel(msg.username)}
      copiedMessageId={copiedMessageId}
      menuAriaLabel="Hidden chat actions"
      quickActions={
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(managementQuickActionBtnClass, "text-primary")}
                aria-label="Unhide message"
                onClick={() => onToggleHide(msg.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Unhide</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
      menuItems={[
        {
          key: "copy",
          label: "Copy",
          icon: copyIcon(msg.id),
          onClick: () => onCopyMessage(msg.id, msg.message),
        },
        ...(onDeleteMessage
          ? [
              {
                key: "delete",
                label: "Delete",
                icon: <Trash2 className="mr-2 h-3.5 w-3.5" />,
                onClick: () => setDeleteTargetId(msg.id),
                destructive: true,
                separatorBefore: true,
              } satisfies ManagementMenuItem,
            ]
          : []),
      ]}
    />
  ));

  const sidebarAccordionMaxHeight = "max-h-[160px]";
  const moderationAccordionMaxHeights = {
    selected: "max-h-[260px]",
    blocked: "max-h-[220px]",
    hidden: "max-h-[220px]",
  } as const;
  const selectedAccordionMaxHeight = isSidebarVariant
    ? sidebarAccordionMaxHeight
    : moderationAccordionMaxHeights.selected;
  const blockedAccordionMaxHeight = isSidebarVariant
    ? sidebarAccordionMaxHeight
    : moderationAccordionMaxHeights.blocked;
  const hiddenAccordionMaxHeight = isSidebarVariant
    ? sidebarAccordionMaxHeight
    : moderationAccordionMaxHeights.hidden;
  const accordionEmptyCompact = isSidebarVariant;

  const managementAccordionSections = (
    <>
      <ManagementAccordionSection
        title="Selected Chats"
        count={selectedList.length}
        open={accordionSections.selected}
        onOpenChange={(open) => setAccordionOpen("selected", open)}
        maxHeightClass={selectedAccordionMaxHeight}
      >
        {selectedList.length > 0 ? (
          selectedChatCards
        ) : (
          <ManagementEmptyState
            compact={accordionEmptyCompact}
            title="No selected chats"
            description="Select messages from the chat list using the star action."
          />
        )}
      </ManagementAccordionSection>
      <ManagementAccordionSection
        title="Blocked Users"
        count={blockedList.length}
        open={accordionSections.blocked}
        onOpenChange={(open) => setAccordionOpen("blocked", open)}
        maxHeightClass={blockedAccordionMaxHeight}
      >
        {blockedList.length > 0 ? (
          blockedUserCards
        ) : (
          <ManagementEmptyState
            compact={accordionEmptyCompact}
            title="No blocked users"
            description="Block users from the chat list using the block action."
          />
        )}
      </ManagementAccordionSection>
      <ManagementAccordionSection
        title="Hidden Chats"
        count={hiddenList.length}
        open={accordionSections.hidden}
        onOpenChange={(open) => setAccordionOpen("hidden", open)}
        maxHeightClass={hiddenAccordionMaxHeight}
      >
        {hiddenList.length > 0 ? (
          hiddenChatCards
        ) : (
          <ManagementEmptyState
            compact={accordionEmptyCompact}
            title="No hidden chats"
            description="Hidden chats will appear here when you hide them from the chat list."
          />
        )}
      </ManagementAccordionSection>
    </>
  );

  const managementColumn = showManagementColumn ? (
    <aside className={managementPanelClass}>{managementAccordionSections}</aside>
  ) : null;

  const chatToolbar = (
    <div
      className={cn(
        "flex shrink-0 overflow-visible",
        isSidebarVariant
          ? "mb-2.5 flex-row items-center gap-2 pt-0"
          : "mb-2 flex-col gap-2 pt-0.5 sm:flex-row sm:items-center sm:gap-2.5",
      )}
    >
      <div className="relative min-h-0 min-w-0 flex-1 overflow-visible px-0.5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(sidebarSearchInputClass, "pl-9 pr-2.5")}
        />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1.5 sm:justify-start">
        <TooltipProvider delayDuration={100}>
          {!isSidebarVariant ? (
            <div
              className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/25 p-0.5"
              role="group"
              aria-label="Message layout"
            >
              {layoutBtn("card", <Grid3x3 className="h-3.5 w-3.5" />, "Card view")}
              {layoutBtn("row", <List className="h-3.5 w-3.5" />, "Row view")}
            </div>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-[10px] border transition-colors",
                  "h-9 w-9",
                  autoScroll
                    ? "border-primary/45 bg-[rgba(37,99,235,0.12)] text-[#3b82f6]"
                    : "border-border/60 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
                )}
                aria-label="Auto scroll"
                aria-pressed={autoScroll}
                onClick={() => {
                  const next = !autoScroll;
                  onAutoScrollChange(next);
                  if (next) {
                    setTimeout(() => requestScrollToBottom(), 80);
                  }
                }}
              >
                <AutoScrollIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                {autoScroll ? "Auto scroll enabled" : "Enable auto scroll"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {!hasManagementData && !isStudioChat && onToggleShowHidden ? (
          <Button
            type="button"
            size="sm"
            variant={showHidden ? "default" : "outline"}
            className={cn(
              "shrink-0 rounded-md border-border/50 font-medium shadow-sm",
              isSidebarVariant ? "h-9 px-2 text-[11px]" : "h-[38px] px-2.5 text-[11px]",
            )}
            onClick={onToggleShowHidden}
          >
            {showHidden ? "Hide hidden" : "Show hidden"}
          </Button>
        ) : null}
      </div>
    </div>
  );

  const chatComposer = (
    <div
      className={cn(
        "flex shrink-0 overflow-visible border-t border-border/50",
        isSidebarVariant ? "mt-2 gap-2 pb-1 pt-2" : "mt-3 gap-2 pb-1 pt-3",
      )}
    >
      <div className="relative min-w-0 flex-1 overflow-visible px-0.5">
        <Megaphone className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={composerPlaceholder}
          value={composerValue}
          onChange={(e) => onComposerChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onComposerSend();
            }
          }}
          className={cn(sidebarComposerInputClass, "min-w-0 pl-9 pr-2.5")}
        />
      </div>
      <Button
        size="sm"
        onClick={onComposerSend}
        disabled={composerSendDisabled}
        className={cn(
          "shrink-0 rounded-md p-0 shadow-sm",
          isSidebarVariant ? "h-10 w-10" : "h-[38px] w-[38px]",
        )}
        title="Send message"
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const mainChatMessages = isSidebarVariant ? (
    <div className="relative min-h-0 flex-1 basis-0 overflow-hidden">
      <div
        ref={scrollRef}
        className="sidebar-chat-scrollbar absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-y-contain pr-1"
      >
        <div className={sidebarFeedClass}>
          {messages.map(renderMessage)}
          {messages.length === 0 && (
            <div className="w-full py-6 text-center text-xs text-muted-foreground">No chat messages</div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md">
      <div
        ref={scrollRef}
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1.5 custom-scrollbar force-vertical-scrollbar scrollbar-gutter-stable",
          feedClass,
        )}
      >
        {messages.map(renderMessage)}
        {messages.length === 0 && (
          <div
            className={cn(
              "w-full py-6 text-center text-xs text-muted-foreground",
              effectiveLayout === "card" && "col-span-full",
            )}
          >
            No messages found.
          </div>
        )}
      </div>
    </div>
  );

  const showChatMessagesHeading = hasManagementData || isSidebarVariant;

  const chatMessagesHeading = showChatMessagesHeading ? (
    <div
      className={cn(
        "shrink-0 border-b border-border/40",
        isSidebarVariant ? "mb-1 pb-1" : "mb-2 pb-1.5",
      )}
    >
      <h3 className="text-[11px] font-bold tracking-wide text-foreground">
        Chat Messages · {messages.length}
      </h3>
    </div>
  ) : null;

  const moderationChatPanel = showManagementColumn ? (
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3.5 md:grid-cols-[320px_minmax(0,1fr)] md:grid-rows-1 md:items-stretch">
        {managementColumn}
        <section className="flex min-h-0 min-w-0 flex-col">
          {chatToolbar}
          {chatMessagesHeading}
          {mainChatMessages}
          {chatComposer}
        </section>
      </div>
    ) : null;

  const sidebarChatPanel = isSidebarVariant ? (
    <section className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0">{chatToolbar}</div>
      {chatMessagesHeading}
      {mainChatMessages}
      <div className="shrink-0">{chatComposer}</div>
    </section>
  ) : null;

  const mainChatSection = isModerationVariant && !showManagementColumn ? (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0">{chatToolbar}</div>
      {chatMessagesHeading}
      {mainChatMessages}
      <div className="shrink-0">{chatComposer}</div>
    </section>
  ) : null;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        isSidebarVariant ? "h-full" : isModerationVariant ? "h-full px-0 py-0" : "h-full px-1.5 py-1.5",
      )}
    >
      {sidebarChatPanel}
      {moderationChatPanel}
      {mainChatSection}


      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be permanently removed from the chat. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
