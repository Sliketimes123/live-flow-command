import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Copy, Check, Ban, ChevronDown, User, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { BlockedUser } from "./ChatModeration";

export type QAPanelVariant = "moderation" | "sidebar";

// ─── Accordion sidebar helpers ────────────────────────────────────────────────

const qaAccordionCountBadgeClass =
  "inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-muted/80 px-1.5 text-[11px] font-semibold tabular-nums text-foreground";

const qaManagementPanelClass =
  "flex h-full min-h-0 w-full min-w-0 flex-col overflow-y-auto rounded-xl border border-border/50 bg-muted/15 custom-scrollbar force-vertical-scrollbar scrollbar-gutter-stable";

function QAManagementEmptyState({
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

function QAAccordionSection({
  title,
  count,
  open,
  onOpenChange,
  maxHeightClass,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxHeightClass: string;
  children: ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border-b border-border/40 last:border-b-0">
      <div>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex h-8 w-full cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-muted/20"
            aria-expanded={open}
          >
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-[11px] font-bold tracking-wide text-foreground">{title}</span>
                <span className={qaAccordionCountBadgeClass}>{count}</span>
              </div>
            </div>
            <ChevronDown
              className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="border-t border-border/40 px-1.5 pb-1.5 pt-1">
            <ScrollArea className={cn("w-full overflow-hidden", maxHeightClass)}>
              <div className="flex w-full flex-col items-stretch gap-1.5 pr-1">{children}</div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function QABlockedUserCard({
  user,
  onUnblock,
}: {
  user: BlockedUser;
  onUnblock?: () => void;
}) {
  return (
    <div className="w-full overflow-hidden rounded-[8px] border border-border/50 bg-muted/25 px-2 py-1.5 shadow-sm">
      <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
        <span className="min-w-0 truncate text-[11px] font-semibold text-foreground">{user.username}</span>
        <span className="shrink-0 rounded border border-destructive/25 bg-destructive/10 px-1 py-px text-[8px] font-bold uppercase leading-none text-destructive">
          Blocked
        </span>
      </div>
      <p className="mt-px font-mono text-[10px] text-muted-foreground">Blocked {user.blockedAt}</p>
      {onUnblock && (
        <div className="mt-1.5">
          <Button
            variant="ghost"
            onClick={onUnblock}
            className="h-[22px] rounded-full border border-destructive/30 bg-destructive/5 px-2 text-[10px] font-semibold text-destructive shadow-none transition-colors hover:bg-destructive/15 hover:text-destructive dark:border-destructive/40 dark:bg-destructive/10"
          >
            Unblock User
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Compact sidebar card (accordion LHS only) ────────────────────────────────

const qaSidebarCompactCardClass =
  "w-full overflow-hidden rounded-[8px] border border-border/50 bg-card px-2 py-1.5 shadow-sm";

const qaSidebarActionBtnBase =
  "h-[22px] shrink-0 rounded-full border px-1.5 text-[10px] font-semibold shadow-none transition-colors";

const qaSidebarIconBtn =
  "h-[22px] w-[22px] shrink-0 rounded-md border border-transparent bg-transparent text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted/40 hover:text-foreground";

const qaSidebarIconBtnDanger =
  "hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900/40 dark:hover:bg-red-950/30 dark:hover:text-red-400";

function QACompactSidebarCard({
  question,
  type,
  onQueue,
  onSelect,
  participants,
  onAssignQuestion,
  onCopy,
  onBlockUser,
  onDelete,
  copiedQuestionId,
  isUserBlocked,
}: {
  question: Question;
  type: "selected" | "skipped";
  onQueue: (id: string) => void;
  onSelect?: (id: string) => void;
  participants: string[];
  onAssignQuestion: (questionId: string, participant: string) => void;
  onCopy: (questionId: string, question: string) => void;
  onBlockUser: (username: string) => void;
  onDelete: (id: string) => void;
  copiedQuestionId: string | null;
  isUserBlocked: (username: string) => boolean;
}) {
  const blocked = isUserBlocked(question.username);

  return (
    <div className={qaSidebarCompactCardClass}>
      {/* Header: username + time + status badge */}
      <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
        <span className="min-w-0 truncate text-[12px] font-bold leading-tight text-foreground">
          {question.username}
        </span>
        <span className="shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground">
          {question.timestamp}
        </span>
        {blocked && (
          <span className="shrink-0 rounded border border-destructive/25 bg-destructive/10 px-1 py-px text-[8px] font-bold uppercase leading-none text-destructive">
            Blocked
          </span>
        )}
        {type === "selected" && (
          <span className="shrink-0 rounded-full bg-[#eef4ff] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[#1d4ed8] dark:bg-primary/15 dark:text-primary">
            Selected
          </span>
        )}
        {type === "skipped" && (
          <span className="shrink-0 rounded-full bg-[#f1f5f9] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[#64748b] dark:bg-muted dark:text-muted-foreground">
            Skipped
          </span>
        )}
      </div>

      {/* Question text — max 2 lines */}
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-foreground/80">
        {question.question}
      </p>

      {/* Action row — wraps freely inside the card width */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          onClick={() => onQueue(question.id)}
          className={cn(
            qaSidebarActionBtnBase,
            "border-[#dbe3ef] bg-transparent text-[#475569] hover:border-[#cbd5e1] hover:bg-[#f8fafc] dark:border-border dark:text-muted-foreground dark:hover:bg-muted/40",
          )}
        >
          Queue
        </Button>

        {type === "skipped" && onSelect && (
          <Button
            variant="ghost"
            onClick={() => onSelect(question.id)}
            className={cn(
              qaSidebarActionBtnBase,
              "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] hover:border-[#93c5fd] hover:bg-[#dbeafe] dark:border-primary/40 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15",
            )}
          >
            Select
          </Button>
        )}

        <AssignQuestionDropdown
          questionId={question.id}
          participants={participants}
          onAssignQuestion={onAssignQuestion}
          compact
        />

        {/* Divider */}
        <div className="h-3 w-px shrink-0 bg-border/50" />

        <Button
          variant="ghost"
          size="icon"
          className={qaSidebarIconBtn}
          onClick={() => onCopy(question.id, question.question)}
          title="Copy"
        >
          {copiedQuestionId === question.id ? (
            <Check className="h-3 w-3 text-primary" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={qaSidebarIconBtn}
          onClick={() => onBlockUser(question.username)}
          title="Block user"
          disabled={blocked}
        >
          <Ban className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(qaSidebarIconBtn, qaSidebarIconBtnDanger)}
          onClick={() => onDelete(question.id)}
          title="Delete question"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Question {
  id: string;
  username: string;
  question: string;
  timestamp: string;
  isApproved: boolean;
  status: "queue" | "selected" | "closed";
  assignedTo?: string;
  isHidden?: boolean;
}

interface QAPanelProps {
  variant?: QAPanelVariant;
  onBlockUser?: (username: string) => void;
  onUnblockUser?: (username: string) => void;
  blockedUsers?: BlockedUser[];
  onQuestionMetricsChange?: (metrics: { total: number; queue: number; selected: number; closed: number }) => void;
  onQASpike?: (payload: { increaseBy: number; queueCount: number }) => void;
}

export function QAPanel({
  variant = "moderation",
  onBlockUser,
  onUnblockUser,
  blockedUsers = [],
  onQuestionMetricsChange,
  onQASpike,
}: QAPanelProps) {
  const isSidebar = variant === "sidebar";
  const [activeTab, setActiveTab] = useState<"queue" | "selected" | "closed">("queue");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedUserToBlock, setSelectedUserToBlock] = useState<string | null>(null);
  const [accordionSections, setAccordionSections] = useState({
    selected: true,
    skipped: false,
    blocked: false,
  });
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      username: "CuriousUser",
      question: "What are the key takeaways from this session?",
      timestamp: "2:30 PM",
      isApproved: false,
      status: "queue",
      isHidden: false,
    },
    {
      id: "2",
      username: "Learner123",
      question: "Can you provide more details about the implementation?",
      timestamp: "2:32 PM",
      isApproved: false,
      status: "queue",
      isHidden: false,
    },
    {
      id: "3",
      username: "TechEnthusiast",
      question: "How does this compare to other solutions?",
      timestamp: "2:35 PM",
      isApproved: false,
      status: "queue",
      isHidden: false,
    },
    {
      id: "4",
      username: "Developer99",
      question: "What tools do you recommend for beginners?",
      timestamp: "2:38 PM",
      isApproved: false,
      status: "queue",
      isHidden: false,
    },
  ]);

  const [, setRecentQueueIncreaseAt] = useState<number[]>([]);

  const participants = useMemo(() => [
    "All",
    "P1",
    "Arvind Prasanna",
    "John Doe",
    "Jane Smith",
    "Admin User",
  ], []);

  const setAccordionOpen = (section: keyof typeof accordionSections, open: boolean) => {
    setAccordionSections((prev) => ({ ...prev, [section]: open }));
  };

  const handleSelectQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "selected" as const } : q))
    );
    toast({
      title: "Question Selected",
      description: "Question moved to Selected tab",
    });
  };

  const handleSkipQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "closed" as const } : q))
    );
    toast({
      title: "Question Skipped",
      description: "Question moved to Skipped tab",
    });
  };

  const handleQueueQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "queue" as const } : q))
    );
    toast({
      title: "Question Queued",
      description: "Question moved to Queue tab",
    });
  };

  const handleAssignQuestion = (questionId: string, participant: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, assignedTo: participant, status: "selected" as const } : q,
      ),
    );
    toast({
      title: "Question Assigned",
      description: `Question moved to Selected and assigned to ${participant}`,
    });
  };

  const handleCopy = (questionId: string, question: string) => {
    navigator.clipboard.writeText(question);
    setCopiedQuestionId(questionId);
    toast({
      title: "Copied!",
      description: "Question copied to clipboard",
    });
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast({
      title: "Question deleted",
      description: "Question removed from moderation queue",
    });
  };

  const isUserBlocked = (username: string) => {
    return blockedUsers.some((user) => user.username === username);
  };

  const handleBlockRequest = (username: string) => {
    setSelectedUserToBlock(username);
    setIsConfirmBlockOpen(true);
  };

  const handleConfirmBlock = () => {
    if (selectedUserToBlock) {
      onBlockUser?.(selectedUserToBlock);
    }
    setIsConfirmBlockOpen(false);
    setSelectedUserToBlock(null);
  };

  const filteredQuestions = questions;

  const filterQuestions = (questions: Question[]) => {
    if (!searchQuery.trim()) {
      return questions;
    }
    const query = searchQuery.toLowerCase();
    return questions.filter(
      (q) =>
        q.question.toLowerCase().includes(query) ||
        q.username.toLowerCase().includes(query)
    );
  };

  const queueQuestions = useMemo(() => {
    return filterQuestions(filteredQuestions.filter((q) => q.status === "queue"));
  }, [filteredQuestions, searchQuery]);

  const selectedQuestions = useMemo(() => {
    return filterQuestions(filteredQuestions.filter((q) => q.status === "selected"));
  }, [filteredQuestions, searchQuery]);

  const closedQuestions = useMemo(() => {
    return filterQuestions(filteredQuestions.filter((q) => q.status === "closed"));
  }, [filteredQuestions, searchQuery]);

  // Unfiltered lists for the accordion sidebar
  const allSelectedQuestions = useMemo(
    () => questions.filter((q) => q.status === "selected"),
    [questions],
  );
  const allSkippedQuestions = useMemo(
    () => questions.filter((q) => q.status === "closed"),
    [questions],
  );

  useEffect(() => {
    onQuestionMetricsChange?.({
      total: questions.length,
      queue: questions.filter((q) => q.status === "queue").length,
      selected: questions.filter((q) => q.status === "selected").length,
      closed: questions.filter((q) => q.status === "closed").length,
    });
  }, [questions, onQuestionMetricsChange]);

  useEffect(() => {
    const queueCount = questions.filter((q) => q.status === "queue").length;
    const now = Date.now();

    if (queueCount > 0) {
      setRecentQueueIncreaseAt((prev) => {
        const pruned = prev.filter((ts) => now - ts < 15000);
        if (queueCount > pruned.length) {
          const increasesToAdd = queueCount - pruned.length;
          const updated = [...pruned, ...Array.from({ length: increasesToAdd }, () => now)];
          if (updated.length >= 6) {
            onQASpike?.({
              increaseBy: updated.length,
              queueCount,
            });
            return [];
          }
          return updated;
        }
        return pruned;
      });
    }
  }, [questions, onQASpike]);

  const queueCount = useMemo(
    () => questions.filter((q) => q.status === "queue").length,
    [questions],
  );
  const selectedCount = useMemo(
    () => questions.filter((q) => q.status === "selected").length,
    [questions],
  );
  const skippedCount = useMemo(
    () => questions.filter((q) => q.status === "closed").length,
    [questions],
  );

  const qaTabTriggerSidebar =
    "group/tab flex h-[30px] min-w-0 items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold whitespace-nowrap text-[#64748b] transition-colors data-[state=active]:bg-white data-[state=active]:text-[#0f4fd8] data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)] data-[state=inactive]:hover:text-[#334155] dark:text-muted-foreground dark:data-[state=active]:bg-card dark:data-[state=active]:text-primary";

  const qaTabCountSidebarClass =
    "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#eef4ff] px-1 text-[10px] font-semibold tabular-nums text-[#1d4ed8] dark:bg-primary/15 dark:text-primary";

  const qaSearchInputClass =
    "h-9 w-full min-w-0 rounded-[10px] border border-[#dbe3ef] bg-white pl-9 pr-3 text-sm font-normal text-foreground shadow-none transition-[border-color,box-shadow] placeholder:text-[#94a3b8] hover:border-[#cbd5e1] focus-visible:border-[#93c5fd] focus-visible:ring-1 focus-visible:ring-[#93c5fd]/40 dark:border-border dark:bg-background dark:placeholder:text-muted-foreground";

  const queueCardProps = {
    onSelect: handleSelectQuestion,
    onSkip: handleSkipQuestion,
    participants,
    onAssignQuestion: handleAssignQuestion,
    onCopy: handleCopy,
    onBlockUser: handleBlockRequest,
    onDelete: handleDeleteQuestion,
    copiedQuestionId,
    isUserBlocked,
  };

  const selectedCardProps = {
    onQueue: handleQueueQuestion,
    onSkip: handleSkipQuestion,
    participants,
    onAssignQuestion: handleAssignQuestion,
    onCopy: handleCopy,
    onBlockUser: handleBlockRequest,
    onDelete: handleDeleteQuestion,
    copiedQuestionId,
    isUserBlocked,
  };

  const closedCardProps = {
    onSelect: handleSelectQuestion,
    onQueue: handleQueueQuestion,
    participants,
    onAssignQuestion: handleAssignQuestion,
    onCopy: handleCopy,
    onBlockUser: handleBlockRequest,
    onDelete: handleDeleteQuestion,
    copiedQuestionId,
    isUserBlocked,
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col",
        !isSidebar && "bg-transparent p-0",
        isSidebar && "min-h-0 flex-1",
      )}
    >
      {isSidebar ? (
        // ── Sidebar variant: keep existing horizontal tabs ──────────────────
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "queue" | "selected" | "closed")}
          className="flex h-full min-h-0 flex-1 flex-col"
        >
          <div className="flex w-full shrink-0 flex-col gap-2.5">
            <TabsList className="grid h-[34px] w-full grid-cols-3 gap-0 overflow-hidden rounded-[10px] border border-[#dbe3ef] bg-[#f8fafc] p-[2px] shadow-none dark:border-border dark:bg-muted/40">
              <TabsTrigger value="queue" className={qaTabTriggerSidebar}>
                <span>Queue</span>
                <span className={qaTabCountSidebarClass}>{queueCount}</span>
              </TabsTrigger>
              <TabsTrigger value="selected" className={qaTabTriggerSidebar}>
                <span>Selected</span>
                <span className={qaTabCountSidebarClass}>{selectedCount}</span>
              </TabsTrigger>
              <TabsTrigger value="closed" className={qaTabTriggerSidebar}>
                <span>Skipped</span>
                <span className={qaTabCountSidebarClass}>{skippedCount}</span>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" aria-hidden />
              <Input
                placeholder="Search questions…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(qaSearchInputClass, "h-[38px] text-sm")}
                aria-label="Search questions"
              />
            </div>
          </div>

          <TabsContent
            value="queue"
            className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <ScrollArea className="min-h-0 flex-1 pr-1">
              <div className="flex flex-col gap-2 pb-1">
                {queueQuestions.length > 0 ? (
                  queueQuestions.map((q) => (
                    <QueueQuestionCard key={q.id} question={q} {...queueCardProps} />
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-muted-foreground">No questions in queue.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="selected"
            className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <ScrollArea className="min-h-0 flex-1 pr-1">
              <div className="flex flex-col gap-2 pb-1">
                {selectedQuestions.length > 0 ? (
                  selectedQuestions.map((q) => (
                    <SelectedQuestionCard key={q.id} question={q} {...selectedCardProps} />
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-muted-foreground">No selected questions.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="closed"
            className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <ScrollArea className="min-h-0 flex-1 pr-1">
              <div className="flex flex-col gap-2 pb-1">
                {closedQuestions.length > 0 ? (
                  closedQuestions.map((q) => (
                    <ClosedQuestionCard key={q.id} question={q} {...closedCardProps} />
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-muted-foreground">No skipped questions.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      ) : (
        // ── Moderation variant: two-column layout with accordion LHS ────────
        <div className="grid h-full min-h-0 grid-cols-1 gap-3.5 md:grid-cols-[300px_minmax(0,1fr)] md:grid-rows-1 md:items-stretch">
          {/* Left sidebar */}
          <aside className={qaManagementPanelClass}>
            <QAAccordionSection
              title="Selected Questions"
              count={allSelectedQuestions.length}
              open={accordionSections.selected}
              onOpenChange={(open) => setAccordionOpen("selected", open)}
              maxHeightClass="max-h-[300px]"
            >
              {allSelectedQuestions.length > 0 ? (
                allSelectedQuestions.map((q) => (
                  <QACompactSidebarCard
                    key={q.id}
                    question={q}
                    type="selected"
                    onQueue={handleQueueQuestion}
                    participants={participants}
                    onAssignQuestion={handleAssignQuestion}
                    onCopy={handleCopy}
                    onBlockUser={handleBlockRequest}
                    onDelete={handleDeleteQuestion}
                    copiedQuestionId={copiedQuestionId}
                    isUserBlocked={isUserBlocked}
                  />
                ))
              ) : (
                <QAManagementEmptyState
                  title="No selected questions"
                  description="Questions marked as selected will appear here."
                />
              )}
            </QAAccordionSection>

            <QAAccordionSection
              title="Skipped Questions"
              count={allSkippedQuestions.length}
              open={accordionSections.skipped}
              onOpenChange={(open) => setAccordionOpen("skipped", open)}
              maxHeightClass="max-h-[300px]"
            >
              {allSkippedQuestions.length > 0 ? (
                allSkippedQuestions.map((q) => (
                  <QACompactSidebarCard
                    key={q.id}
                    question={q}
                    type="skipped"
                    onQueue={handleQueueQuestion}
                    onSelect={handleSelectQuestion}
                    participants={participants}
                    onAssignQuestion={handleAssignQuestion}
                    onCopy={handleCopy}
                    onBlockUser={handleBlockRequest}
                    onDelete={handleDeleteQuestion}
                    copiedQuestionId={copiedQuestionId}
                    isUserBlocked={isUserBlocked}
                  />
                ))
              ) : (
                <QAManagementEmptyState
                  title="No skipped questions"
                  description="Questions skipped from the queue will appear here."
                />
              )}
            </QAAccordionSection>

            <QAAccordionSection
              title="Blocked Users"
              count={blockedUsers.length}
              open={accordionSections.blocked}
              onOpenChange={(open) => setAccordionOpen("blocked", open)}
              maxHeightClass="max-h-[260px]"
            >
              {blockedUsers.length > 0 ? (
                blockedUsers.map((user) => (
                  <QABlockedUserCard
                    key={user.id}
                    user={user}
                    onUnblock={onUnblockUser ? () => onUnblockUser(user.username) : undefined}
                  />
                ))
              ) : (
                <QAManagementEmptyState
                  title="No blocked users"
                  description="Blocked users will appear here."
                />
              )}
            </QAAccordionSection>
          </aside>

          {/* Right main panel */}
          <section className="flex min-h-0 min-w-0 flex-col">
            {/* Search bar */}
            <div className="mb-2 flex w-full shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="relative w-full min-w-0 max-w-[480px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" aria-hidden />
                <Input
                  placeholder="Search questions…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={qaSearchInputClass}
                  aria-label="Search questions"
                />
              </div>
            </div>

            {/* Queue heading */}
            <div className="mb-2 flex shrink-0 items-center justify-between gap-3 border-b border-border/40 pb-1.5">
              <h3 className="whitespace-nowrap text-[11px] font-bold tracking-wide text-foreground">
                Queue · {queueCount}
              </h3>
            </div>

            {/* Queue list */}
            <ScrollArea className="min-h-0 flex-1 pr-1">
              <div className="flex flex-col gap-2 pb-1">
                {queueQuestions.length > 0 ? (
                  queueQuestions.map((q) => (
                    <QueueQuestionCard key={q.id} question={q} {...queueCardProps} />
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-muted-foreground">No questions in queue.</p>
                )}
              </div>
            </ScrollArea>
          </section>
        </div>
      )}

      {/* Confirm Block Dialog */}
      <AlertDialog open={isConfirmBlockOpen} onOpenChange={setIsConfirmBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you wish to continue?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to block {selectedUserToBlock}. They will no longer be able to participate in the chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBlock}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Card style constants ─────────────────────────────────────────────────────

const qaCardShell =
  "rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,border-color] hover:border-[#cbd5e1] hover:shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:border-border/50 dark:bg-card";

const qaIconBtn =
  "h-6 w-6 shrink-0 rounded-md border border-transparent bg-transparent text-[#64748b] transition-colors hover:border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#334155] dark:text-muted-foreground dark:hover:border-border dark:hover:bg-muted/50 dark:hover:text-foreground";

const qaIconBtnDangerHover =
  "hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900/40 dark:hover:bg-red-950/30 dark:hover:text-red-400";

const qaBtnSelect =
  "h-[26px] shrink-0 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 text-[11px] font-semibold text-[#1d4ed8] shadow-none transition-colors hover:border-[#93c5fd] hover:bg-[#dbeafe] active:bg-[#bfdbfe] dark:border-primary/40 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15";

const qaBtnSkip =
  "h-[26px] shrink-0 rounded-full border border-[#dbe3ef] bg-white px-2.5 text-[11px] font-semibold text-[#475569] shadow-none transition-colors hover:border-[#cbd5e1] hover:bg-[#f8fafc] dark:border-border dark:bg-background dark:text-muted-foreground dark:hover:bg-muted/40";

// ─── Assign dropdown ──────────────────────────────────────────────────────────

function AssignQuestionDropdown({
  questionId,
  participants,
  onAssignQuestion,
  compact = false,
}: {
  questionId: string;
  participants: string[];
  onAssignQuestion: (questionId: string, participant: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [assignSearchQuery, setAssignSearchQuery] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState("");

  const filteredParticipants = useMemo(() => {
    if (!assignSearchQuery.trim()) return participants;
    const query = assignSearchQuery.toLowerCase();
    return participants.filter((p) => p.toLowerCase().includes(query));
  }, [participants, assignSearchQuery]);

  const resetAssignState = () => {
    setAssignSearchQuery("");
    setSelectedParticipant("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetAssignState();
  };

  const handleAssign = () => {
    if (!selectedParticipant) return;
    onAssignQuestion(questionId, selectedParticipant);
    setOpen(false);
    resetAssignState();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className={cn(
        "inline-flex shrink-0 items-center overflow-hidden rounded-full border border-[#dbe3ef] bg-white transition-colors hover:border-[#cbd5e1] hover:bg-[#f8fafc] dark:border-border dark:bg-background dark:hover:bg-muted/40",
        compact ? "h-[22px]" : "h-[26px]",
      )}>
        <span className={cn("font-semibold leading-none text-[#334155] dark:text-foreground", compact ? "px-1.5 text-[10px]" : "px-2.5 text-[11px]")}>Assign</span>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-full shrink-0 items-center justify-center border-l border-[#dbe3ef] text-[#64748b] transition-colors hover:text-[#334155] dark:border-border dark:text-muted-foreground",
              compact ? "w-4" : "w-5",
            )}
            aria-label="Open assign menu"
          >
            <ChevronDown className="h-3 w-3 shrink-0" aria-hidden />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-[min(100vw-1.5rem,13.5rem)] rounded-lg p-0 shadow-md"
      >
        <div className="border-b border-border/60 px-2 py-1.5">
          <p className="text-[11px] font-semibold leading-tight text-foreground">Assign Question</p>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">Select a participant</p>
        </div>
        <div className="space-y-1.5 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search User"
              value={assignSearchQuery}
              onChange={(e) => setAssignSearchQuery(e.target.value)}
              className="h-6 rounded-md pl-7 text-[11px] placeholder:text-[10px]"
            />
          </div>
          <ScrollArea className="h-[108px] pr-1">
            <div className="space-y-0.5">
              {filteredParticipants.map((participant) => (
                <button
                  key={participant}
                  type="button"
                  onClick={() => setSelectedParticipant(participant)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-1.5 py-1 text-[11px] transition-colors",
                    selectedParticipant === participant
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-card hover:bg-accent",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <User className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{participant}</span>
                  </div>
                  {selectedParticipant === participant ? (
                    <Check className="h-2.5 w-2.5 shrink-0" />
                  ) : null}
                </button>
              ))}
            </div>
          </ScrollArea>
          <Button
            onClick={handleAssign}
            disabled={!selectedParticipant}
            className="h-6 w-full rounded-md text-[11px] font-medium"
          >
            Assign
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Question card components ─────────────────────────────────────────────────

function QueueQuestionCard({
  question,
  onSelect,
  onSkip,
  participants,
  onAssignQuestion,
  onCopy,
  onBlockUser,
  onDelete,
  copiedQuestionId,
  isUserBlocked,
}: {
  question: Question;
  onSelect: (id: string) => void;
  onSkip: (id: string) => void;
  participants: string[];
  onAssignQuestion: (questionId: string, participant: string) => void;
  onCopy: (questionId: string, question: string) => void;
  onBlockUser: (username: string) => void;
  onDelete: (id: string) => void;
  copiedQuestionId: string | null;
  isUserBlocked: (username: string) => boolean;
}) {
  const blocked = isUserBlocked(question.username);
  return (
    <div className={`group ${qaCardShell}`}>
      <div className="flex items-center justify-between gap-2">
        {/* Left: meta */}
        <div className="flex min-w-0 shrink items-center gap-1.5 overflow-hidden">
          <span className="truncate text-sm font-bold leading-tight text-[#0f1f3d] dark:text-foreground">
            {question.username}
          </span>
          <span className="shrink-0 text-xs font-medium tabular-nums text-[#64748b] dark:text-muted-foreground">
            {question.timestamp}
          </span>
          {blocked && (
            <span className="shrink-0 text-xs font-medium text-destructive">Blocked</span>
          )}
          {question.assignedTo && (
            <span className="shrink-0 truncate text-xs font-medium text-primary">Assigned · {question.assignedTo}</span>
          )}
        </div>
        {/* Right: action buttons + icon buttons */}
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" className={qaBtnSelect} onClick={() => onSelect(question.id)}>
            Select
          </Button>
          <Button variant="ghost" className={qaBtnSkip} onClick={() => onSkip(question.id)}>
            Skip
          </Button>
          <AssignQuestionDropdown
            questionId={question.id}
            participants={participants}
            onAssignQuestion={onAssignQuestion}
          />
          <div className="mx-0.5 h-3.5 w-px shrink-0 bg-border/50" />
          <Button
            variant="ghost"
            size="icon"
            className={qaIconBtn}
            onClick={() => onCopy(question.id, question.question)}
            title="Copy"
          >
            {copiedQuestionId === question.id ? (
              <Check className="h-3.5 w-3.5 text-[#1d4ed8]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={qaIconBtn}
            onClick={() => onBlockUser(question.username)}
            title="Block user"
            disabled={blocked}
          >
            <Ban className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${qaIconBtn} ${qaIconBtnDangerHover}`}
            onClick={() => onDelete(question.id)}
            title="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="mt-1.5 text-[12px] font-normal leading-[1.35] text-[#24324b] dark:text-foreground/90">
        {question.question}
      </p>
    </div>
  );
}

function SelectedQuestionCard({
  question,
  onQueue,
  onSkip,
  participants,
  onAssignQuestion,
  onCopy,
  onBlockUser,
  onDelete,
  copiedQuestionId,
  isUserBlocked,
}: {
  question: Question;
  onQueue: (id: string) => void;
  onSkip: (id: string) => void;
  participants: string[];
  onAssignQuestion: (questionId: string, participant: string) => void;
  onCopy: (questionId: string, question: string) => void;
  onBlockUser: (username: string) => void;
  onDelete: (id: string) => void;
  copiedQuestionId: string | null;
  isUserBlocked: (username: string) => boolean;
}) {
  const blocked = isUserBlocked(question.username);
  return (
    <div className={`group ${qaCardShell}`}>
      <div className="flex items-center justify-between gap-2">
        {/* Left: meta */}
        <div className="flex min-w-0 shrink items-center gap-1.5 overflow-hidden">
          <span className="truncate text-sm font-bold leading-tight text-[#0f1f3d] dark:text-foreground">
            {question.username}
          </span>
          <span className="shrink-0 text-xs font-medium tabular-nums text-[#64748b] dark:text-muted-foreground">
            {question.timestamp}
          </span>
          {blocked && (
            <span className="shrink-0 text-xs font-medium text-destructive">Blocked</span>
          )}
          {question.assignedTo && (
            <span className="shrink-0 truncate text-xs font-medium text-primary">Assigned · {question.assignedTo}</span>
          )}
          <span className="shrink-0 rounded-full bg-[#eef4ff] px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-[#1d4ed8] dark:bg-primary/15 dark:text-primary">
            Selected
          </span>
        </div>
        {/* Right: action buttons + icon buttons */}
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" className={qaBtnSkip} onClick={() => onSkip(question.id)}>
            Skip
          </Button>
          <Button variant="ghost" className={qaBtnSelect} onClick={() => onQueue(question.id)}>
            Queue
          </Button>
          <AssignQuestionDropdown
            questionId={question.id}
            participants={participants}
            onAssignQuestion={onAssignQuestion}
          />
          <div className="mx-0.5 h-3.5 w-px shrink-0 bg-border/50" />
          <Button
            variant="ghost"
            size="icon"
            className={qaIconBtn}
            onClick={() => onCopy(question.id, question.question)}
            title="Copy"
          >
            {copiedQuestionId === question.id ? (
              <Check className="h-3.5 w-3.5 text-[#1d4ed8]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={qaIconBtn}
            onClick={() => onBlockUser(question.username)}
            title="Block user"
            disabled={blocked}
          >
            <Ban className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${qaIconBtn} ${qaIconBtnDangerHover}`}
            onClick={() => onDelete(question.id)}
            title="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="mt-1.5 text-[12px] font-normal leading-[1.35] text-[#24324b] dark:text-foreground/90">
        {question.question}
      </p>
    </div>
  );
}

function ClosedQuestionCard({
  question,
  onSelect,
  onQueue,
  participants,
  onAssignQuestion,
  onCopy,
  onBlockUser,
  onDelete,
  copiedQuestionId,
  isUserBlocked,
}: {
  question: Question;
  onSelect: (id: string) => void;
  onQueue: (id: string) => void;
  participants: string[];
  onAssignQuestion: (questionId: string, participant: string) => void;
  onCopy: (questionId: string, question: string) => void;
  onBlockUser: (username: string) => void;
  onDelete: (id: string) => void;
  copiedQuestionId: string | null;
  isUserBlocked: (username: string) => boolean;
}) {
  const blocked = isUserBlocked(question.username);
  return (
    <div className={`group ${qaCardShell}`}>
      <div className="flex items-center justify-between gap-2">
        {/* Left: meta */}
        <div className="flex min-w-0 shrink items-center gap-1.5 overflow-hidden">
          <span className="truncate text-sm font-bold leading-tight text-[#0f1f3d] dark:text-foreground">
            {question.username}
          </span>
          <span className="shrink-0 text-xs font-medium tabular-nums text-[#64748b] dark:text-muted-foreground">
            {question.timestamp}
          </span>
          {blocked && (
            <span className="shrink-0 text-xs font-medium text-destructive">Blocked</span>
          )}
          {question.assignedTo && (
            <span className="shrink-0 truncate text-xs font-medium text-primary">Assigned · {question.assignedTo}</span>
          )}
          <span className="shrink-0 rounded-full bg-[#f1f5f9] px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-[#64748b] dark:bg-muted dark:text-muted-foreground">
            Skipped
          </span>
        </div>
        {/* Right: action buttons + icon buttons */}
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" className={qaBtnSelect} onClick={() => onSelect(question.id)}>
            Select
          </Button>
          <Button variant="ghost" className={qaBtnSkip} onClick={() => onQueue(question.id)}>
            Queue
          </Button>
          <AssignQuestionDropdown
            questionId={question.id}
            participants={participants}
            onAssignQuestion={onAssignQuestion}
          />
          <div className="mx-0.5 h-3.5 w-px shrink-0 bg-border/50" />
          <Button
            variant="ghost"
            size="icon"
            className={qaIconBtn}
            onClick={() => onCopy(question.id, question.question)}
            title="Copy"
          >
            {copiedQuestionId === question.id ? (
              <Check className="h-3.5 w-3.5 text-[#1d4ed8]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={qaIconBtn}
            onClick={() => onBlockUser(question.username)}
            title="Block user"
            disabled={blocked}
          >
            <Ban className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${qaIconBtn} ${qaIconBtnDangerHover}`}
            onClick={() => onDelete(question.id)}
            title="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="mt-1.5 text-[12px] font-normal leading-[1.35] text-[#24324b] dark:text-foreground/90">
        {question.question}
      </p>
    </div>
  );
}
