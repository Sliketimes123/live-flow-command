import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
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
  ArrowLeft,
  Ban,
  Pin,
  PinOff,
  MoreVertical,
  Megaphone,
  ChevronDown,
  Users,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FocusEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import type { BlockedUser, ChatMessage } from "./ChatModeration";

export type ModerationChatLayout = "row" | "card";

export type ComposerMessageType = "broadcast" | "pinned";

export type StudioChatTarget =
  | { type: "broadcast" }
  | { type: "private"; userId: string; username: string; role?: string; status?: string };

export type StudioUserRole = "Host" | "Co-host" | "Moderator" | "Participant" | "Audience";
export type StudioUserStatus = "Online" | "Offline" | "Speaking" | "Muted" | "In Queue" | "Live";

export interface StudioUser {
  id: string;
  username: string;
  role: StudioUserRole;
  status: StudioUserStatus;
  lastActive?: string;
}

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
  onComposerSend: (messageType: ComposerMessageType) => void;
  composerSendDisabled: boolean;
  /** Studio users list shown in the LHS sidebar when chatChannel === "studio" */
  studioUsers?: StudioUser[];
  /** Active studio chat target — broadcast or 1:1 with a user */
  studioActiveTarget?: StudioChatTarget;
  onStudioSelectBroadcast?: () => void;
  onStudioSelectUser?: (userId: string, username: string) => void;
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
            "group-hover:opacity-100",
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
          <DropdownMenuContent align="end" sideOffset={6} collisionPadding={10} className="w-44">
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
            "group-hover:opacity-100 has-[:focus-visible]:opacity-100",
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

const studioRoleClass: Record<StudioUserRole, string> = {
  Host: "border-purple-200/70 bg-purple-50 text-purple-700 dark:border-purple-800/40 dark:bg-purple-900/20 dark:text-purple-300",
  "Co-host": "border-blue-200/70 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300",
  Moderator: "border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-800/40 dark:bg-sky-900/20 dark:text-sky-300",
  Participant: "border-slate-200/70 bg-slate-50 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-400",
  Audience: "border-slate-200/50 bg-slate-50/60 text-slate-500 dark:border-slate-700/30 dark:bg-slate-800/20 dark:text-slate-500",
};

const studioStatusConfig: Record<StudioUserStatus, { dot: string; bg: string; text: string }> = {
  Online: { dot: "bg-green-500", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
  Offline: { dot: "bg-slate-400", bg: "bg-slate-100 dark:bg-slate-800/40", text: "text-slate-500 dark:text-slate-400" },
  Speaking: { dot: "bg-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
  Muted: { dot: "bg-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
  "In Queue": { dot: "bg-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400" },
  Live: { dot: "bg-red-500", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
};

function StudioUsersSidebar({
  users,
  activeTarget,
  onSelectBroadcast,
  onSelectUser,
}: {
  users: StudioUser[];
  activeTarget?: StudioChatTarget;
  onSelectBroadcast?: () => void;
  onSelectUser?: (userId: string, username: string) => void;
}) {
  const isBroadcastActive = !activeTarget || activeTarget.type === "broadcast";

  return (
    <aside className={managementPanelClass}>
      {/* Panel header */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border/40 px-3.5">
        <span className="flex-1 truncate text-[11px] font-bold tracking-wide text-foreground">Studio Users</span>
        <span className={accordionCountBadgeClass}>{users.length}</span>
      </div>

      {/* All Studio Chat / Broadcast row */}
      <button
        type="button"
        onClick={onSelectBroadcast}
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors",
          isBroadcastActive
            ? "border-primary bg-primary/[0.07] dark:bg-primary/10"
            : "border-transparent hover:bg-muted/40",
        )}
      >
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isBroadcastActive ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground",
        )}>
          <Users className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-[13px] font-semibold leading-snug text-foreground">All Studio Chat</p>
          <p className="truncate text-[11px] text-muted-foreground">Broadcast to all</p>
        </div>
        {isBroadcastActive && (
          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">Active</span>
        )}
      </button>

      {/* Divider */}
      <div className="border-b border-border/30" />

      {/* Scrollable user list */}
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar py-1">
        {users.length > 0 ? (
          <div className="flex flex-col">
            {users.map((user) => {
              const isActive = activeTarget?.type === "private" && activeTarget.userId === user.id;
              const st = studioStatusConfig[user.status];
              const meta = [user.role, user.lastActive].filter(Boolean).join(" • ");
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onSelectUser?.(user.id, user.username)}
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/[0.07] dark:bg-primary/10"
                      : "border-transparent hover:bg-muted/40",
                  )}
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-[12px] font-bold text-muted-foreground">
                    {chatUserInitials(user.username)}
                  </div>

                  {/* Name + role/active meta */}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-[13px] font-semibold leading-snug text-foreground">{user.username}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{meta}</p>
                  </div>

                  {/* Status badge */}
                  <div className={cn("flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5", st.bg)}>
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", st.dot)} />
                    <span className={cn("text-[11px] font-semibold leading-none", st.text)}>{user.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <ManagementEmptyState
            title="No studio users"
            description="Studio participants will appear here once they join."
          />
        )}
      </div>
    </aside>
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
            <div className={cn("w-full overflow-x-hidden overflow-y-auto custom-scrollbar pr-1", maxHeightClass)}>
              <div className="flex flex-col gap-2">{children}</div>
            </div>
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
  studioUsers,
  studioActiveTarget,
  onStudioSelectBroadcast,
  onStudioSelectUser,
}: ModerationMessagePanelProps) {
  const isModerationVariant = variant === "moderation";
  const isSidebarVariant = variant === "sidebar";
  const effectiveLayout: ModerationChatLayout = "row";
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
  const [composerMessageType, setComposerMessageType] = useState<ComposerMessageType>("broadcast");
  const [composerTypeOpen, setComposerTypeOpen] = useState(false);
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
    onAutoScrollPauseChange?.(hoveredMessageId !== null);
  }, [hoveredMessageId, onAutoScrollPauseChange]);

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
        "flex min-w-0 items-center gap-x-1.5",
        isSidebarVariant ? "overflow-hidden leading-[1.2]" : "flex-wrap gap-y-0.5",
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
          isSidebarVariant ? "text-[12.5px] font-bold leading-tight" : "text-[12px] font-semibold leading-tight",
        )}
      >
        {msg.username}
      </span>
      <span
        className={cn(
          "shrink-0 leading-none text-muted-foreground",
          isSidebarVariant ? "text-[10.5px] font-medium" : "font-mono text-[10px]",
        )}
      >
        {msg.timestamp}
      </span>
      {!isStudioChat && msg.isPinned && (
        <Pin
          className={cn(
            "shrink-0 fill-[#ef4444] text-[#ef4444]",
            isSidebarVariant ? "h-[10px] w-[10px]" : "h-[11px] w-[11px]",
          )}
          aria-label="Pinned message"
        />
      )}
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
            ? "mt-[2px] line-clamp-1 group-hover:line-clamp-none break-words text-[12.5px] leading-[1.28] text-foreground/85"
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
        isSidebarVariant ? "h-7 w-7 text-[10px]" : "h-7 w-7 text-[10px]",
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
        isModerationVariant ? "h-7 w-7 min-h-7 min-w-7 rounded-[7px]" : "h-9 w-9 min-h-9 min-w-9",
      ),
      icon: isModerationVariant ? "h-[15px] w-[15px] shrink-0" : "h-[18px] w-[18px] shrink-0",
      cluster: isModerationVariant
        ? "flex shrink-0 items-center gap-1.5"
        : "flex shrink-0 items-center gap-3 pr-3",
    };
  };

  const messageActionsHoverClass =
    "opacity-0 transition-opacity group-hover:opacity-100 has-[:focus-visible]:opacity-100 has-[[data-state=open]]:opacity-100";

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
            msg.isPinned && "text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444]",
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

  const messageCopyAction = (msg: ChatMessage, size: MessageActionSize = "row") => {
    const { btn, icon } = messageActionStyles(size);
    const copied = copiedMessageId === msg.id;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={btn}
            aria-label="Copy message"
            onClick={() => onCopyMessage(msg.id, msg.message)}
          >
            {copied ? <Check className={cn(icon, "text-primary")} /> : <Copy className={icon} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{copied ? "Copied!" : "Copy"}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const messageDeleteAction = (msg: ChatMessage, size: MessageActionSize = "row") => {
    if (!onDeleteMessage) return null;
    const { btn, icon } = messageActionStyles(size);
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(btn, "hover:bg-destructive/10 hover:text-destructive")}
            aria-label="Delete message"
            onClick={() => setDeleteTargetId(msg.id)}
          >
            <Trash2 className={icon} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">Delete</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const sidebarActionClusterVisibleClass = () =>
    cn(
      "overflow-hidden transition-[max-height,opacity] duration-150 ease-out",
      "max-h-0 opacity-0",
      "group-hover:max-h-8 group-hover:opacity-100",
      "has-[:focus-visible]:max-h-8 has-[:focus-visible]:opacity-100",
      "has-[[data-state=open]]:max-h-8 has-[[data-state=open]]:opacity-100",
    );

  const messageSidebarActionCluster = (msg: ChatMessage, blocked: boolean) => {
    const { cluster } = messageActionStyles("sidebar");
    return (
      <TooltipProvider delayDuration={200}>
        <div className={cn("mt-1", sidebarActionClusterVisibleClass())}>
          <div className={cluster}>
            {!isStudioChat ? messageHideAction(msg, "sidebar") : null}
            {!isStudioChat ? messageSelectAction(msg, "sidebar") : null}
            {!isStudioChat ? messagePinAction(msg, "sidebar") : null}
            {!isStudioChat ? messageBlockAction(msg, blocked, "sidebar") : null}
            {messageCopyAction(msg, "sidebar")}
            {messageDeleteAction(msg, "sidebar")}
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
          className={cn(cluster, messageActionsHoverClass)}
          onMouseEnter={() => setHoveredMessageId(msg.id)}
        >
          {!isStudioChat ? messagePinAction(msg, "row") : null}
          {!isStudioChat ? messageSelectAction(msg, "row") : null}
          {messageCopyAction(msg, "row")}
          {!isStudioChat ? messageHideAction(msg, "row") : null}
          {!isStudioChat ? messageBlockAction(msg, blocked, "row") : null}
          {messageDeleteAction(msg, "row")}
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
          <div className={cn(cluster, messageActionsHoverClass)}>
            {!isStudioChat ? messageHideAction(msg, "card") : null}
            {!isStudioChat ? messagePinAction(msg, "card") : null}
            {!isStudioChat ? messageSelectAction(msg, "card") : null}
            {!isStudioChat ? messageBlockAction(msg, blocked, "card") : null}
            {messageCopyAction(msg, "card")}
            {messageDeleteAction(msg, "card")}
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
          ? "w-full min-w-0 rounded-[10px] border-slate-400/[0.12] bg-transparent px-[10px] py-2 shadow-none"
          : "w-full rounded-md border-border/50 bg-card/90 px-3 py-2.5 shadow-sm"),
      effectiveLayout === "card" &&
        "relative h-auto w-full self-start rounded-xl border-border/50 bg-card/95 p-3 shadow-sm",
      "hover:border-border hover:bg-muted/15",
      msg.isHighlighted && "border-primary/35 bg-primary/[0.07]",
      !isStudioChat && blocked && "opacity-[0.72]",
      !isStudioChat && msg.isPinned && "border-[rgba(37,99,235,0.55)] bg-[rgba(37,99,235,0.04)] hover:border-[rgba(59,130,246,0.75)] hover:bg-[rgba(37,99,235,0.07)]",
      !isStudioChat && msg.isSelected && !isSidebarVariant && "border-primary/50 bg-primary/10 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.22)]",
    );

  const renderSidebarMessage = (msg: ChatMessage) => {
    const blocked = isUserBlockedForChannel(msg.username);
    return (
      <div
        key={msg.id}
        className={messageShellClass(msg, blocked)}
        {...messageInteractionHandlers(msg.id)}
      >
        <div className="grid w-full min-w-0 grid-cols-[28px_minmax(0,1fr)] gap-[10px]">
          {avatarEl(msg.username)}
          <div className="min-w-0">
            <div className="mb-[2px] flex min-w-0 items-center gap-1">
              <div className="min-w-0 flex-1 overflow-hidden">
                {messageMetaLine(msg, blocked)}
              </div>
            </div>
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
        <div className="flex w-full min-w-0 items-start gap-2.5 box-border">
          {avatarEl(msg.username)}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0 flex-1">{messageMetaLine(msg, blocked)}</div>
              {messageRowActionsBar(msg, blocked)}
            </div>
            {messageBody(msg)}
          </div>
        </div>
      </div>
    );
  };

  const sidebarFeedClass = "flex w-full min-w-0 flex-col gap-[5px] pb-0";

  const feedClass = cn(
    "min-w-0 w-full pb-0.5",
    effectiveLayout === "row" && "flex w-full min-w-0 flex-col gap-1.5",
    effectiveLayout === "card" &&
      "grid items-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]",
  );

  const handleConfirmDelete = () => {
    if (deleteTargetId && onDeleteMessage) {
      onDeleteMessage(deleteTargetId);
    }
    setDeleteTargetId(null);
  };

  const copyIcon = (messageId: string) =>
    copiedMessageId === messageId ? (
      <Check className="h-3.5 w-3.5 text-primary" />
    ) : (
      <Copy className="h-3.5 w-3.5" />
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
                  icon: <Trash2 className="h-3.5 w-3.5" />,
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
                icon: <Trash2 className="h-3.5 w-3.5" />,
                onClick: () => setDeleteTargetId(msg.id),
                destructive: true,
                separatorBefore: true,
              } satisfies ManagementMenuItem,
            ]
          : []),
      ]}
    />
  ));

  const sidebarAccordionMaxHeight = "max-h-[180px]";
  const moderationAccordionMaxHeights = {
    selected: "max-h-[300px]",
    blocked: "max-h-[260px]",
    hidden: "max-h-[260px]",
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

  // Sidebar-only: compact search bar (no layout toggle)
  const chatToolbar = (
    <div className="mb-2.5 flex shrink-0 flex-row items-center gap-2 overflow-visible pt-2">
      <div className="relative min-h-0 min-w-0 flex-1 overflow-visible px-0.5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(sidebarSearchInputClass, "pl-9 pr-2.5")}
        />
      </div>
    </div>
  );

  // Moderation variant: unified header — title on top, search + auto-scroll in one row
  const isPrivateStudioMode = isStudioChat && studioActiveTarget?.type === "private";
  const privateTarget = isPrivateStudioMode
    ? (studioActiveTarget as Extract<StudioChatTarget, { type: "private" }>)
    : null;

  const moderationChatHeader = isModerationVariant ? (
    <div className="mb-3 flex shrink-0 flex-col gap-2">
      {/* Title row — with back arrow in private mode */}
      <div className="flex min-w-0 items-center gap-1.5">
        {isPrivateStudioMode && onStudioSelectBroadcast && (
          <button
            type="button"
            onClick={onStudioSelectBroadcast}
            className="flex shrink-0 items-center justify-center rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            title="Back to All Studio Chat"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[11px] font-bold tracking-wide text-foreground">
            {isPrivateStudioMode
              ? `Private · ${privateTarget!.username}`
              : isStudioChat ? "Studio Chat Messages" : "Chat Messages"} · {messages.length}
          </h3>
          {isPrivateStudioMode && (privateTarget!.role || privateTarget!.status) && (
            <p className="mt-px truncate text-[10px] text-muted-foreground">
              {[privateTarget!.role, privateTarget!.status].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
      {/* Search + Auto Scroll — broadcast mode only */}
      {!isPrivateStudioMode && (
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-0 flex-1 overflow-visible">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(sidebarSearchInputClass, "pl-9 pr-2.5")}
            />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="whitespace-nowrap text-[11px] font-semibold text-muted-foreground">Auto Scroll</span>
            <Switch
              checked={autoScroll}
              onCheckedChange={(checked) => {
                onAutoScrollChange(checked);
                if (checked) setTimeout(() => requestScrollToBottom(), 80);
              }}
              aria-label="Auto Scroll"
              className="h-5 w-9 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600 [&_span]:h-4 [&_span]:w-4 [&_span]:bg-white"
            />
          </div>
        </div>
      )}
      <div className="border-b border-border/40" />
    </div>
  ) : null;

  const ComposerIcon = composerMessageType === "pinned" ? Pin : Megaphone;
  const effectiveComposerPlaceholder =
    !isStudioChat && composerMessageType === "pinned"
      ? "Send pinned message to live chat..."
      : composerPlaceholder;

  const chatComposer = (
    <div
      className={cn(
        "flex shrink-0 overflow-visible border-t border-border/50",
        isSidebarVariant ? "mt-2 gap-2 pb-1 pt-2" : "mt-3 gap-2 pb-1 pt-3",
      )}
    >
      <div className="relative min-w-0 flex-1 overflow-visible px-0.5">
        {!isStudioChat ? (
          <DropdownMenu open={composerTypeOpen} onOpenChange={setComposerTypeOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "absolute left-1.5 top-1/2 z-[1] -translate-y-1/2",
                  "flex items-center gap-[2px] rounded-md px-1.5 py-1",
                  "transition-colors hover:bg-muted/60",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  composerMessageType === "pinned"
                    ? "text-orange-500 dark:text-orange-400"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Select message type"
                aria-haspopup="menu"
                aria-expanded={composerTypeOpen}
              >
                <ComposerIcon className="h-3.5 w-3.5 shrink-0" />
                <ChevronDown
                  className={cn(
                    "h-[9px] w-[9px] shrink-0 transition-transform duration-150",
                    composerTypeOpen && "rotate-180",
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              sideOffset={8}
              collisionPadding={10}
              className="w-[220px]"
            >
              <DropdownMenuPrimitive.Item
                className={cn(
                  "flex cursor-pointer select-none items-start gap-[10px] rounded-[10px] px-3 py-[10px] outline-none transition-colors",
                  "hover:bg-accent focus:bg-accent",
                  composerMessageType === "broadcast" && "bg-accent/50",
                )}
                onSelect={() => setComposerMessageType("broadcast")}
              >
                <Megaphone className="mt-[1px] h-[13px] w-[13px] shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-[700] leading-none text-foreground">Broadcast Message</span>
                    {composerMessageType === "broadcast" && <Check className="h-3 w-3 shrink-0 text-primary" />}
                  </div>
                  <span className="text-[11px] leading-[1.3] text-muted-foreground">
                    Send this message to all viewers
                  </span>
                </div>
              </DropdownMenuPrimitive.Item>
              <DropdownMenuPrimitive.Item
                className={cn(
                  "flex cursor-pointer select-none items-start gap-[10px] rounded-[10px] px-3 py-[10px] outline-none transition-colors",
                  "hover:bg-accent focus:bg-accent",
                  composerMessageType === "pinned" && "bg-accent/50",
                )}
                onSelect={() => setComposerMessageType("pinned")}
              >
                <Pin className="mt-[1px] h-[13px] w-[13px] shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-[700] leading-none text-foreground">Pinned Message</span>
                    {composerMessageType === "pinned" && <Check className="h-3 w-3 shrink-0 text-primary" />}
                  </div>
                  <span className="text-[11px] leading-[1.3] text-muted-foreground">
                    Pin this message to the top of chat
                  </span>
                </div>
              </DropdownMenuPrimitive.Item>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Megaphone className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          placeholder={effectiveComposerPlaceholder}
          value={composerValue}
          onChange={(e) => onComposerChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onComposerSend(composerMessageType);
            }
          }}
          className={cn(
            sidebarComposerInputClass,
            "min-w-0 pr-2.5",
            isStudioChat ? "pl-9" : "pl-[44px]",
          )}
        />
      </div>
      <Button
        size="sm"
        onClick={() => onComposerSend(composerMessageType)}
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

  const chatMessagesHeading = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 border-b border-border/40",
        isSidebarVariant ? "mb-1 pb-1 pr-2" : "mb-2 pb-1.5",
      )}
    >
      <h3 className="text-[11px] font-bold tracking-wide text-foreground whitespace-nowrap">
        {isStudioChat ? "Studio Chat" : "Chat"} Messages · {messages.length}
      </h3>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="whitespace-nowrap text-[11px] font-[600] text-muted-foreground">
          Auto Scroll
        </span>
        <Switch
          checked={autoScroll}
          onCheckedChange={(checked) => {
            onAutoScrollChange(checked);
            if (checked) setTimeout(() => requestScrollToBottom(), 80);
          }}
          aria-label="Auto Scroll"
          className="h-5 w-9 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600 [&_span]:h-4 [&_span]:w-4 [&_span]:bg-white"
        />
      </div>
    </div>
  );

  const moderationChatPanel = showManagementColumn ? (
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3.5 md:grid-cols-[320px_minmax(0,1fr)] md:grid-rows-1 md:items-stretch">
        {managementColumn}
        <section className="flex min-h-0 min-w-0 flex-col">
          {moderationChatHeader}
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

  const showStudioSidebar = isStudioChat && isModerationVariant && studioUsers !== undefined;

  const studioModerationPanel = showStudioSidebar ? (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3.5 md:grid-cols-[300px_minmax(0,1fr)] md:grid-rows-1 md:items-stretch">
      <StudioUsersSidebar
        users={studioUsers ?? []}
        activeTarget={studioActiveTarget}
        onSelectBroadcast={onStudioSelectBroadcast}
        onSelectUser={onStudioSelectUser}
      />
      <section className="flex min-h-0 min-w-0 flex-col">
        {moderationChatHeader}
        {mainChatMessages}
        <div className="shrink-0">{chatComposer}</div>
      </section>
    </div>
  ) : null;

  const mainChatSection = isModerationVariant && !showManagementColumn && !showStudioSidebar ? (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {moderationChatHeader}
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
      {studioModerationPanel}
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
