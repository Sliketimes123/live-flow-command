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
  ChevronsDown,
  ChevronDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode, type RefObject } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { BlockedUser, ChatMessage } from "./ChatModeration";

export type ModerationChatLayout = "row" | "card";

/** `comments` = public live chat; `studio` = internal studio chat (no hide/pin/select). */
export type ChatChannel = "comments" | "studio";

/** `moderation` = full panel two-column; `sidebar` = narrow stacked accordion. */
export type ChatPanelVariant = "moderation" | "sidebar";

const MESSAGE_DRAG_SOURCE_MIME = "application/x-moderation-message-source";
const MESSAGE_DRAG_PAYLOAD_MIME = "application/x-moderation-chat-message";

/** Avoid focus ring clipping inside overflow-hidden moderation panels */
const panelInputClass =
  "h-[38px] border-border/50 bg-muted/25 text-xs shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0";

type MessageDragSource = "visible" | "hidden";
type ManagementDropZone = "selected" | "blocked" | "hidden";
type DragOverTarget = ManagementDropZone | "visible";

export interface ChatMessageDragPayload {
  type: "chat-message";
  messageId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  isHidden: boolean;
  isSelected: boolean;
  isBlocked: boolean;
  source: MessageDragSource;
}

function buildDragPayload(
  msg: ChatMessage,
  source: MessageDragSource,
  isBlocked: boolean,
): ChatMessageDragPayload {
  return {
    type: "chat-message",
    messageId: msg.id,
    userId: msg.username,
    username: msg.username,
    message: msg.message,
    timestamp: msg.timestamp,
    isHidden: !!msg.isHidden,
    isSelected: !!msg.isSelected,
    isBlocked,
    source,
  };
}

function setMessageDragData(event: DragEvent, payload: ChatMessageDragPayload) {
  event.dataTransfer.setData("text/plain", payload.messageId);
  event.dataTransfer.setData(MESSAGE_DRAG_SOURCE_MIME, payload.source);
  event.dataTransfer.setData(MESSAGE_DRAG_PAYLOAD_MIME, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "move";
}

function readMessageDragPayload(event: DragEvent): ChatMessageDragPayload | null {
  const json = event.dataTransfer.getData(MESSAGE_DRAG_PAYLOAD_MIME);
  if (json) {
    try {
      const parsed = JSON.parse(json) as ChatMessageDragPayload;
      if (parsed?.type === "chat-message" && parsed.messageId) {
        return parsed;
      }
    } catch {
      /* fall through to legacy */
    }
  }

  const messageId = event.dataTransfer.getData("text/plain");
  const source = event.dataTransfer.getData(MESSAGE_DRAG_SOURCE_MIME) as MessageDragSource;
  if (!messageId || (source !== "visible" && source !== "hidden")) {
    return null;
  }

  return {
    type: "chat-message",
    messageId,
    userId: "",
    username: "",
    message: "",
    timestamp: "",
    isHidden: source === "hidden",
    isSelected: false,
    isBlocked: false,
    source,
  };
}

function managementDropHighlightClass(zone: ManagementDropZone, active: boolean) {
  if (!active) return "";
  switch (zone) {
    case "selected":
      return "ring-2 ring-blue-500/40 bg-blue-500/[0.07]";
    case "blocked":
      return "ring-2 ring-amber-500/40 bg-amber-500/[0.07]";
    case "hidden":
      return "ring-2 ring-primary/45 bg-primary/[0.06]";
  }
}

function isDragLeavingZone(event: DragEvent<HTMLElement>) {
  const related = event.relatedTarget as Node | null;
  return related !== null && event.currentTarget.contains(related);
}

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
  scrollRef: RefObject<HTMLDivElement | null>;
  requestScrollToBottom: () => void;
  copiedMessageId: string | null;
  isUserBlocked: (username: string) => boolean;
  onToggleHide: (messageId: string) => void;
  onTogglePin: (messageId: string) => void;
  onToggleSelect: (messageId: string) => void;
  onCopyMessage: (messageId: string, text: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onBlockRequest: (username: string) => void;
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

function ManagementMessageCard({
  msg,
  blocked,
  copiedMessageId,
  menuAriaLabel,
  menuItems,
  draggable,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  msg: ChatMessage;
  blocked: boolean;
  copiedMessageId: string | null;
  menuAriaLabel: string;
  menuItems: ManagementMenuItem[];
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        managementItemCardClass,
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-45 ring-1 ring-primary/30",
      )}
    >
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
  );
}

function BlockedUserCard({
  user,
  messageCount,
  onUnblock,
  onCopyUsername,
}: {
  user: BlockedUser;
  messageCount: number;
  onUnblock: () => void;
  onCopyUsername: () => void;
}) {
  return (
    <div className="rounded-[10px] border border-border/50 bg-muted/25 px-3 py-2.5 shadow-sm">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              aria-label="Blocked user actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="text-xs" onClick={onUnblock}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              Unblock
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={onCopyUsername}>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy username
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

type ManagementSectionDropHandlers = {
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
};

function ManagementAccordionSection({
  title,
  count,
  helperText,
  dragOverHint,
  open,
  onOpenChange,
  maxHeightClass,
  dropZone,
  dropHandlers,
  dropHighlight,
  children,
}: {
  title: string;
  count: number;
  helperText?: string;
  dragOverHint?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxHeightClass: string;
  dropZone: ManagementDropZone;
  dropHandlers?: ManagementSectionDropHandlers;
  dropHighlight?: boolean;
  children: ReactNode;
}) {
  const hintText = dropHighlight && dragOverHint ? dragOverHint : open ? helperText : undefined;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border-b border-border/40 last:border-b-0">
      <div
        {...dropHandlers}
        className={cn("transition-shadow", managementDropHighlightClass(dropZone, !!dropHighlight))}
      >
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
                <p
                  className={cn(
                    "mt-0.5 text-[10px] text-muted-foreground/90",
                    dropHighlight && dragOverHint && "font-medium text-foreground/80",
                  )}
                >
                  {hintText}
                </p>
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
  scrollRef,
  requestScrollToBottom,
  copiedMessageId,
  isUserBlocked,
  onToggleHide,
  onTogglePin,
  onToggleSelect,
  onCopyMessage,
  onDeleteMessage,
  onBlockRequest,
  composerPlaceholder,
  composerValue,
  onComposerChange,
  onComposerSend,
  composerSendDisabled,
}: ModerationMessagePanelProps) {
  const isModerationVariant = variant === "moderation";
  const isSidebarVariant = variant === "sidebar";
  const isStudioChat = chatChannel === "studio";
  const hasManagementData = hiddenMessages !== undefined;
  const showManagementColumn = hasManagementData && isModerationVariant;
  const hiddenList = hiddenMessages ?? [];
  const selectedList = selectedMessages ?? [];
  const blockedList = blockedUsers ?? [];
  const messagePool = allMessages ?? messages;
  const { toast } = useToast();
  const dragDropEnabled = showManagementColumn;
  const sidebarInputClass = cn(
    panelInputClass,
    isSidebarVariant && "h-9 rounded-[10px] text-sm",
  );
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [draggingPayload, setDraggingPayload] = useState<ChatMessageDragPayload | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<DragOverTarget | null>(null);
  const expandTimersRef = useRef<Partial<Record<ManagementDropZone, ReturnType<typeof setTimeout>>>>({});
  const [accordionSections, setAccordionSections] = useState({
    selected: true,
    blocked: false,
    hidden: false,
  });

  const setAccordionOpen = (section: keyof typeof accordionSections, open: boolean) => {
    setAccordionSections((prev) => ({ ...prev, [section]: open }));
  };

  const messageById = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    for (const msg of messagePool) {
      map.set(msg.id, msg);
    }
    return map;
  }, [messagePool]);

  const blockedUserMessageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const msg of messagePool) {
      counts.set(msg.username, (counts.get(msg.username) ?? 0) + 1);
    }
    return counts;
  }, [messagePool]);

  const clearExpandTimer = (zone: ManagementDropZone) => {
    const timer = expandTimersRef.current[zone];
    if (timer) {
      clearTimeout(timer);
    }
    delete expandTimersRef.current[zone];
  };

  const scheduleSectionExpand = (zone: ManagementDropZone) => {
    if (accordionSections[zone]) return;
    clearExpandTimer(zone);
    expandTimersRef.current[zone] = setTimeout(() => {
      setAccordionOpen(zone, true);
      delete expandTimersRef.current[zone];
    }, 400);
  };

  const clearAllExpandTimers = () => {
    for (const zone of ["selected", "blocked", "hidden"] as const) {
      clearExpandTimer(zone);
    }
  };

  const resolvePayloadMessage = (payload: ChatMessageDragPayload) =>
    messageById.get(payload.messageId) ??
    ({
      id: payload.messageId,
      username: payload.username,
      message: payload.message,
      timestamp: payload.timestamp,
      isHidden: payload.isHidden,
      isSelected: payload.isSelected,
    } satisfies ChatMessage);

  const handleDropToSelected = (payload: ChatMessageDragPayload) => {
    if (payload.source !== "visible") return;

    const msg = resolvePayloadMessage(payload);
    if (msg.isSelected) {
      toast({ title: "Already selected", description: "Message already selected" });
      return;
    }

    onToggleSelect(payload.messageId);
    setAccordionOpen("selected", true);
  };

  const handleDropToBlocked = (payload: ChatMessageDragPayload) => {
    if (payload.source !== "visible") return;

    const username = payload.username || resolvePayloadMessage(payload).username;
    if (!username) return;

    if (isUserBlocked(username) || payload.isBlocked) {
      toast({ title: "Already blocked", description: "User already blocked" });
      return;
    }

    onBlockRequest(username);
    setAccordionOpen("blocked", true);
  };

  const handleDropToHidden = (payload: ChatMessageDragPayload) => {
    if (payload.source === "visible") {
      const msg = resolvePayloadMessage(payload);
      if (msg.isHidden) {
        return;
      }
      onToggleHide(payload.messageId);
      setAccordionOpen("hidden", true);
      return;
    }

    if (payload.source === "hidden") {
      onToggleHide(payload.messageId);
    }
  };

  const handleMessageDragStart = (
    event: DragEvent<HTMLDivElement>,
    msg: ChatMessage,
    source: MessageDragSource,
  ) => {
    if (!dragDropEnabled) {
      event.preventDefault();
      return;
    }
    const payload = buildDragPayload(msg, source, isUserBlocked(msg.username));
    setMessageDragData(event, payload);
    setDraggingPayload(payload);
  };

  const handleMessageDragEnd = () => {
    setDraggingPayload(null);
    setDragOverTarget(null);
    clearAllExpandTimers();
  };

  const handleDragOverZone = (event: DragEvent<HTMLElement>, zone: DragOverTarget) => {
    if (!dragDropEnabled || !draggingPayload) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverTarget(zone);
    if (zone === "selected" || zone === "blocked" || zone === "hidden") {
      scheduleSectionExpand(zone);
    }
  };

  const handleDragLeaveZone = (event: DragEvent<HTMLElement>, zone?: DragOverTarget) => {
    if (isDragLeavingZone(event)) return;
    if (zone === "selected" || zone === "blocked" || zone === "hidden") {
      clearExpandTimer(zone);
    }
    setDragOverTarget(null);
  };

  const createManagementDropHandlers = (zone: ManagementDropZone): ManagementSectionDropHandlers => ({
    onDragOver: (event) => handleDragOverZone(event, zone),
    onDragLeave: (event) => handleDragLeaveZone(event, zone),
    onDrop: (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearExpandTimer(zone);
      setDragOverTarget(null);
      setDraggingPayload(null);
      if (!dragDropEnabled) return;

      const payload = readMessageDragPayload(event);
      if (!payload) return;

      if (zone === "selected") {
        handleDropToSelected(payload);
      } else if (zone === "blocked") {
        handleDropToBlocked(payload);
      } else {
        handleDropToHidden(payload);
      }
    },
  });

  const handleDropOnVisibleZone = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragOverTarget(null);
    setDraggingPayload(null);
    clearAllExpandTimers();
    if (!dragDropEnabled) return;

    const payload = readMessageDragPayload(event);
    if (!payload || payload.source !== "hidden") return;

    onToggleHide(payload.messageId);
  };

  const dropZoneHighlightClass = (zone: DragOverTarget) =>
    dragOverTarget === zone && "ring-2 ring-primary/45 bg-primary/[0.06]";

  const isDragging = draggingPayload !== null;

  useEffect(() => {
    return () => {
      for (const zone of ["selected", "blocked", "hidden"] as const) {
        const timer = expandTimersRef.current[zone];
        if (timer) clearTimeout(timer);
      }
    };
  }, []);

  const messageMetaLine = (msg: ChatMessage, blocked: boolean) => (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
      {!isStudioChat && msg.isSelected && <Star className="h-3 w-3 shrink-0 fill-primary text-primary" />}
      <span className="min-w-0 truncate text-[12px] font-semibold leading-tight text-foreground">
        {msg.username}
      </span>
      <span className="shrink-0 font-mono text-[10px] leading-none text-muted-foreground">{msg.timestamp}</span>
      {msg.isHighlighted && <Star className="h-3 w-3 shrink-0 fill-primary text-primary" />}
      {blocked && (
        <span className="rounded border border-destructive/25 bg-destructive/10 px-1 py-px text-[9px] font-bold uppercase leading-none text-destructive">
          Blocked
        </span>
      )}
    </div>
  );

  const messageBody = (msg: ChatMessage) => (
    <p className="mt-0.5 text-[12px] leading-snug text-foreground/90 break-words">{msg.message}</p>
  );

  const avatarEl = (username: string) => (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-primary/10 text-[10px] font-semibold uppercase leading-none text-primary"
      aria-hidden
    >
      {chatUserInitials(username)}
    </div>
  );

  const messageActionIconClass = "h-3 w-3 shrink-0";

  const messageActionBtnClass =
    "h-6 w-6 shrink-0 p-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground [&_svg]:!size-3";

  const messageActionsVisibilityClass = (placement: "inline" | "cardCorner") =>
    cn(
      placement === "inline" &&
        "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 has-[:focus-visible]:opacity-100 has-[[data-state=open]]:opacity-100",
      placement === "cardCorner" && "opacity-80 hover:opacity-100",
    );

  const messagePinAction = (msg: ChatMessage) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            messageActionBtnClass,
            msg.isPinned &&
              "bg-orange-600/15 text-orange-600 opacity-100 hover:bg-orange-600/20 hover:text-orange-600 dark:bg-orange-500/15 dark:text-orange-400 dark:hover:bg-orange-500/20 dark:hover:text-orange-300",
          )}
          aria-label={msg.isPinned ? "Unpin message" : "Pin message"}
          aria-pressed={msg.isPinned}
          onClick={() => onTogglePin(msg.id)}
        >
          {msg.isPinned ? (
            <PinOff className={messageActionIconClass} />
          ) : (
            <Pin className={messageActionIconClass} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">{msg.isPinned ? "Unpin" : "Pin"}</p>
      </TooltipContent>
    </Tooltip>
  );

  const messageQuickActions = (msg: ChatMessage, blocked: boolean, includePin = true) => (
    <>
      {!isStudioChat ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(messageActionBtnClass, msg.isHidden && "text-primary")}
                aria-label={msg.isHidden ? "Unhide message" : "Hide message"}
                onClick={() => onToggleHide(msg.id)}
              >
                {msg.isHidden ? (
                  <Eye className={messageActionIconClass} />
                ) : (
                  <EyeOff className={messageActionIconClass} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">{msg.isHidden ? "Unhide" : "Hide"}</p>
            </TooltipContent>
          </Tooltip>
          {includePin ? messagePinAction(msg) : null}
        </>
      ) : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              messageActionBtnClass,
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
            <Ban className={messageActionIconClass} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{blocked ? "Unblock user" : "Block user"}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );

  const messageOverflowMenu = (msg: ChatMessage, placement: "inline" | "cardCorner") => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(messageActionBtnClass, "data-[state=open]:opacity-100")}
          aria-label="More message actions"
        >
          <MoreVertical className={messageActionIconClass} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {!isStudioChat ? (
          <DropdownMenuItem className="text-xs" onClick={() => onToggleSelect(msg.id)}>
            <Star className={cn("mr-2 h-3.5 w-3.5", msg.isSelected && "fill-primary text-primary")} />
            {msg.isSelected ? "Unselect" : "Select"}
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
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={() => onDeleteMessage(msg.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const messageActionsBar = (msg: ChatMessage, blocked: boolean, placement: "inline" | "cardCorner") => (
    <TooltipProvider delayDuration={200}>
      <div className="flex shrink-0 items-center">
        {!isStudioChat && msg.isPinned ? messagePinAction(msg) : null}
        <div className={cn("flex shrink-0 items-center", messageActionsVisibilityClass(placement))}>
          {messageQuickActions(msg, blocked, !msg.isPinned)}
          {messageOverflowMenu(msg, placement)}
        </div>
      </div>
    </TooltipProvider>
  );

  const messageShellClass = (msg: ChatMessage, blocked: boolean) =>
    cn(
      "group min-w-0 border transition-colors",
      layout === "row" &&
        (isSidebarVariant
          ? "w-full rounded-xl border-border/50 bg-card/90 px-3 py-2.5 shadow-sm"
          : "w-full rounded-md border-border/50 bg-card/90 px-2 py-1.5 shadow-sm"),
      layout === "card" &&
        "relative flex min-h-[96px] flex-col rounded-xl border-border/50 bg-card/95 p-3 shadow-sm md:min-h-[100px]",
      "hover:border-border hover:bg-muted/15",
      msg.isHighlighted && "border-primary/35 bg-primary/[0.07]",
      blocked && "opacity-[0.72]",
      !isStudioChat && msg.isPinned && "border-orange-600/40 bg-orange-600/[0.06] dark:border-orange-500/35 dark:bg-orange-500/[0.06]",
      !isStudioChat && msg.isSelected && "border-primary/50 bg-primary/10 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.22)]",
    );

  const messageDragShellClass = (msg: ChatMessage, blocked: boolean) =>
    cn(
      messageShellClass(msg, blocked),
      dragDropEnabled && "cursor-grab active:cursor-grabbing",
      draggingPayload?.messageId === msg.id && "opacity-45 ring-1 ring-primary/30",
    );

  const messageDragHandlers = (msg: ChatMessage) =>
    dragDropEnabled
      ? {
          draggable: true as const,
          onDragStart: (event: DragEvent<HTMLDivElement>) => handleMessageDragStart(event, msg, "visible"),
          onDragEnd: handleMessageDragEnd,
        }
      : {};

  const renderMessage = (msg: ChatMessage) => {
    const blocked = isUserBlocked(msg.username);

    if (layout === "card") {
      return (
        <div key={msg.id} className={messageDragShellClass(msg, blocked)} {...messageDragHandlers(msg)}>
          <div className="flex min-h-0 flex-1 gap-2">
            {avatarEl(msg.username)}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0 flex-1">{messageMetaLine(msg, blocked)}</div>
                {messageActionsBar(msg, blocked, "cardCorner")}
              </div>
              {messageBody(msg)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className={messageDragShellClass(msg, blocked)} {...messageDragHandlers(msg)}>
        <div className="flex gap-2">
          {avatarEl(msg.username)}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0 flex-1">
                {messageMetaLine(msg, blocked)}
                {messageBody(msg)}
              </div>
              {messageActionsBar(msg, blocked, "inline")}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const feedClass = cn(
    "min-w-0 pb-0.5",
    layout === "row" && "flex flex-col gap-1.5",
    layout === "card" && "grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]",
  );

  const toolbarIconBtnClass = (active: boolean) =>
    cn(
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
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
          className={toolbarIconBtnClass(layout === l)}
          aria-pressed={layout === l}
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
    const blocked = isUserBlocked(msg.username);
    return (
      <ManagementMessageCard
        key={msg.id}
        msg={msg}
        blocked={blocked}
        copiedMessageId={copiedMessageId}
        menuAriaLabel="Selected chat actions"
        menuItems={[
          {
            key: "unselect",
            label: "Unselect",
            icon: <Star className="mr-2 h-3.5 w-3.5" />,
            onClick: () => onToggleSelect(msg.id),
          },
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
          {
            key: "block",
            label: blocked ? "Unblock" : "Block",
            icon: <Ban className="mr-2 h-3.5 w-3.5" />,
            onClick: () => {
              if (blocked) {
                onUnblockUser?.(msg.username);
              } else {
                onBlockRequest(msg.username);
              }
            },
            separatorBefore: true,
          },
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
      onCopyUsername={() => onCopyMessage(`blocked-${user.id}`, user.username)}
    />
  ));

  const hiddenChatCards = hiddenList.map((msg) => (
    <ManagementMessageCard
      key={msg.id}
      msg={msg}
      blocked={isUserBlocked(msg.username)}
      copiedMessageId={copiedMessageId}
      menuAriaLabel="Hidden chat actions"
      menuItems={[
        {
          key: "unhide",
          label: "Unhide",
          icon: <Eye className="mr-2 h-3.5 w-3.5" />,
          onClick: () => onToggleHide(msg.id),
        },
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
      draggable={dragDropEnabled}
      isDragging={draggingPayload?.messageId === msg.id}
      onDragStart={(event) => handleMessageDragStart(event, msg, "hidden")}
      onDragEnd={handleMessageDragEnd}
    />
  ));

  const selectedDropHandlers = createManagementDropHandlers("selected");
  const blockedDropHandlers = createManagementDropHandlers("blocked");
  const hiddenDropHandlers = createManagementDropHandlers("hidden");

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

  const hiddenDragHelper =
    dragDropEnabled && accordionSections.hidden && !isDragging
      ? "Drag here to hide · drag out to restore"
      : undefined;

  const managementAccordionSections = (
    <>
      <ManagementAccordionSection
        title="Selected Chats"
        count={selectedList.length}
        open={accordionSections.selected}
        onOpenChange={(open) => setAccordionOpen("selected", open)}
        maxHeightClass={selectedAccordionMaxHeight}
        dropZone="selected"
        dropHandlers={selectedDropHandlers}
        dropHighlight={dragOverTarget === "selected"}
        dragOverHint="Drop to select chat"
      >
        {selectedList.length > 0 ? (
          selectedChatCards
        ) : (
          <ManagementEmptyState
            compact={accordionEmptyCompact}
            title="No selected chats"
            description="Drag chats here to select them."
          />
        )}
      </ManagementAccordionSection>
      <ManagementAccordionSection
        title="Blocked Users"
        count={blockedList.length}
        open={accordionSections.blocked}
        onOpenChange={(open) => setAccordionOpen("blocked", open)}
        maxHeightClass={blockedAccordionMaxHeight}
        dropZone="blocked"
        dropHandlers={blockedDropHandlers}
        dropHighlight={dragOverTarget === "blocked"}
        dragOverHint="Drop to block user"
      >
        {blockedList.length > 0 ? (
          blockedUserCards
        ) : (
          <ManagementEmptyState
            compact={accordionEmptyCompact}
            title="No blocked users"
            description="Drag a chat here to block the user."
          />
        )}
      </ManagementAccordionSection>
      <ManagementAccordionSection
        title="Hidden Chats"
        count={hiddenList.length}
        helperText={hiddenDragHelper}
        open={accordionSections.hidden}
        onOpenChange={(open) => setAccordionOpen("hidden", open)}
        maxHeightClass={hiddenAccordionMaxHeight}
        dropZone="hidden"
        dropHandlers={hiddenDropHandlers}
        dropHighlight={dragOverTarget === "hidden"}
        dragOverHint="Drop to hide chat"
      >
        {hiddenList.length > 0 ? (
          hiddenChatCards
        ) : (
          <ManagementEmptyState
            compact={accordionEmptyCompact}
            title="No hidden chats"
            description={
              isModerationVariant
                ? "Hidden chats will appear here when you hide them."
                : "Drag messages here from the chat list to hide them."
            }
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
        "mb-2 flex shrink-0 overflow-visible pt-0.5",
        isSidebarVariant
          ? "flex-row items-center gap-2"
          : "flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5",
      )}
    >
      <div className="relative min-h-0 min-w-0 flex-1 overflow-visible px-0.5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(sidebarInputClass, "pl-9 pr-2.5")}
        />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1.5 sm:justify-start">
        <TooltipProvider delayDuration={100}>
          <div
            className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/25 p-0.5"
            role="group"
            aria-label="Message layout"
          >
            {layoutBtn("card", <Grid3x3 className="h-3.5 w-3.5" />, "Card view")}
            {layoutBtn("row", <List className="h-3.5 w-3.5" />, "Row view")}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  toolbarIconBtnClass(autoScroll),
                  !autoScroll && "border-border/60 bg-muted/25 shadow-sm",
                )}
                aria-label={
                  autoScroll ? "Disable auto-scroll to latest" : "Enable auto-scroll to latest"
                }
                aria-pressed={autoScroll}
                onClick={() => {
                  const next = !autoScroll;
                  onAutoScrollChange(next);
                  if (next) {
                    setTimeout(() => requestScrollToBottom(), 80);
                  }
                }}
              >
                <ChevronsDown className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                {autoScroll ? "Auto-scroll to latest (on)" : "Auto-scroll to latest (off)"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {!hasManagementData && !isStudioChat && onToggleShowHidden ? (
          <Button
            type="button"
            size="sm"
            variant={showHidden ? "default" : "outline"}
            className="h-[38px] shrink-0 rounded-md border-border/50 px-2.5 text-[11px] font-medium shadow-sm"
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
        "mt-3 flex shrink-0 gap-2 overflow-visible border-t border-border/50 pb-1",
        isSidebarVariant ? "pt-2.5" : "pt-3",
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
          className={cn(sidebarInputClass, "min-w-0 pl-9 pr-2.5")}
        />
      </div>
      <Button
        size="sm"
        onClick={onComposerSend}
        disabled={composerSendDisabled}
        className={cn(
          "shrink-0 rounded-md p-0 shadow-sm",
          isSidebarVariant ? "h-9 w-9" : "h-[38px] w-[38px]",
        )}
        title="Send message"
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const mainChatMessages = (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md transition-shadow",
        dropZoneHighlightClass("visible"),
      )}
      onDragOver={(event) => handleDragOverZone(event, "visible")}
      onDragLeave={handleDragLeaveZone}
      onDrop={handleDropOnVisibleZone}
    >
      <div
        ref={scrollRef}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1.5 custom-scrollbar force-vertical-scrollbar scrollbar-gutter-stable",
          feedClass,
        )}
      >
        {messages.map(renderMessage)}
        {messages.length === 0 && (
          <div className="col-span-full w-full py-6 text-center text-xs text-muted-foreground">
            {isSidebarVariant ? "No chat messages" : "No messages found."}
          </div>
        )}
      </div>
    </div>
  );

  const chatMessagesHeading = hasManagementData ? (
    <div className="mb-2 shrink-0 border-b border-border/40 pb-1.5">
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

  const sidebarChatPanel =
    isSidebarVariant && hasManagementData ? (
      <section className="flex h-full min-h-0 flex-col">
        <div className="shrink-0">{chatToolbar}</div>
        {chatMessagesHeading}
        <div className="min-h-0 flex-1 overflow-hidden">{mainChatMessages}</div>
        <div className="shrink-0">{chatComposer}</div>
      </section>
    ) : null;

  const mainChatSection = !hasManagementData ? (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      {chatToolbar}
      {mainChatMessages}
      {chatComposer}
    </section>
  ) : null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col px-1.5 py-1.5">
      {sidebarChatPanel}
      {moderationChatPanel}
      {!hasManagementData ? mainChatSection : null}


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
