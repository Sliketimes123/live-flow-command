import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Copy, Check, Ban, X, ChevronDown, User, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { BlockedUser } from "./ChatModeration";

export type QAPanelVariant = "moderation" | "sidebar";

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
  blockedUsers?: BlockedUser[];
  onQuestionMetricsChange?: (metrics: { total: number; queue: number; selected: number; closed: number }) => void;
  onQASpike?: (payload: { increaseBy: number; queueCount: number }) => void;
}

export function QAPanel({
  variant = "moderation",
  onBlockUser,
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

  const [recentQueueIncreaseAt, setRecentQueueIncreaseAt] = useState<number[]>([]);

  // Mock participants list
  const participants = useMemo(() => [
    "All",
    "P1",
    "Arvind Prasanna",
    "John Doe",
    "Jane Smith",
    "Admin User",
  ], []);

  const toggleApproval = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isApproved: !q.isApproved } : q))
    );
  };

  const handleCloseQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isApproved: true, status: "closed" as const } : q))
    );
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

  const handleShowHide = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isHidden: !q.isHidden } : q))
    );
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

  // Use all questions (no filtering needed)
  const filteredQuestions = questions;

  // Filter questions based on search query
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


  // Get filtered questions by status
  const queueQuestions = useMemo(() => {
    return filterQuestions(filteredQuestions.filter((q) => q.status === "queue"));
  }, [filteredQuestions, searchQuery]);

  const selectedQuestions = useMemo(() => {
    return filterQuestions(filteredQuestions.filter((q) => q.status === "selected"));
  }, [filteredQuestions, searchQuery]);

  const closedQuestions = useMemo(() => {
    return filterQuestions(filteredQuestions.filter((q) => q.status === "closed"));
  }, [filteredQuestions, searchQuery]);

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

  const qaTabTriggerModeration =
    "group/tab flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-[#64748b] transition-colors data-[state=active]:bg-white data-[state=active]:text-[#0f4fd8] data-[state=active]:shadow-[0_1px_3px_rgba(15,23,42,0.08)] data-[state=inactive]:hover:text-[#334155] dark:text-muted-foreground dark:data-[state=active]:bg-card dark:data-[state=active]:text-primary flex-none";

  const qaTabTriggerSidebar =
    "group/tab flex h-[30px] min-w-0 items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold whitespace-nowrap text-[#64748b] transition-colors data-[state=active]:bg-white data-[state=active]:text-[#0f4fd8] data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)] data-[state=inactive]:hover:text-[#334155] dark:text-muted-foreground dark:data-[state=active]:bg-card dark:data-[state=active]:text-primary";

  const qaTabCountClass =
    "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#eef4ff] px-[5px] text-[11px] font-semibold tabular-nums text-[#1d4ed8] dark:bg-primary/15 dark:text-primary";

  const qaTabCountSidebarClass =
    "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#eef4ff] px-1 text-[10px] font-semibold tabular-nums text-[#1d4ed8] dark:bg-primary/15 dark:text-primary";

  const qaSearchInputClass =
    "h-9 w-full min-w-0 rounded-[10px] border border-[#dbe3ef] bg-white pl-9 pr-3 text-sm font-normal text-foreground shadow-none transition-[border-color,box-shadow] placeholder:text-[#94a3b8] hover:border-[#cbd5e1] focus-visible:border-[#93c5fd] focus-visible:ring-1 focus-visible:ring-[#93c5fd]/40 dark:border-border dark:bg-background dark:placeholder:text-muted-foreground";

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col",
        !isSidebar && "bg-transparent p-0",
        isSidebar && "min-h-0 flex-1",
      )}
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "queue" | "selected" | "closed")}
        className="flex h-full min-h-0 flex-1 flex-col"
      >
        <div
          className={cn(
            "flex w-full shrink-0",
            isSidebar ? "flex-col gap-2.5" : "mb-2 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
          )}
        >
          <TabsList
            className={cn(
              isSidebar
                ? "grid h-[34px] w-full grid-cols-3 gap-0 overflow-hidden rounded-[10px] border border-[#dbe3ef] bg-[#f8fafc] p-[2px] shadow-none dark:border-border dark:bg-muted/40"
                : "inline-flex h-[34px] w-fit shrink-0 items-center gap-0.5 self-start rounded-[10px] border border-[#dbe3ef] bg-[#f8fafc] p-[3px] shadow-none dark:border-border dark:bg-muted/40",
            )}
          >
            <TabsTrigger value="queue" className={isSidebar ? qaTabTriggerSidebar : qaTabTriggerModeration}>
              <span>Queue</span>
              <span className={isSidebar ? qaTabCountSidebarClass : qaTabCountClass}>{queueCount}</span>
            </TabsTrigger>
            <TabsTrigger value="selected" className={isSidebar ? qaTabTriggerSidebar : qaTabTriggerModeration}>
              <span>Selected</span>
              <span className={isSidebar ? qaTabCountSidebarClass : qaTabCountClass}>{selectedCount}</span>
            </TabsTrigger>
            <TabsTrigger value="closed" className={isSidebar ? qaTabTriggerSidebar : qaTabTriggerModeration}>
              <span>Skipped</span>
              <span className={isSidebar ? qaTabCountSidebarClass : qaTabCountClass}>{skippedCount}</span>
            </TabsTrigger>
          </TabsList>

          <div
            className={cn(
              isSidebar ? "relative w-full shrink-0" : "flex w-full min-w-0 justify-stretch sm:flex-1 sm:justify-end",
            )}
          >
            <div className={cn("relative w-full min-w-0", !isSidebar && "max-w-[480px] sm:ml-auto sm:min-w-[280px]")}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" aria-hidden />
              <Input
                placeholder="Search questions…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(qaSearchInputClass, isSidebar && "h-[38px] text-sm")}
                aria-label="Search questions"
              />
            </div>
          </div>
        </div>

        <TabsContent
          value="queue"
          className={cn(
            "mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden",
            isSidebar && "mt-3",
          )}
        >
          <ScrollArea className="min-h-0 flex-1 pr-1">
            <div className="flex flex-col gap-2 pb-1">
              {queueQuestions.length > 0 ? (
                queueQuestions.map((q) => (
                  <QueueQuestionCard
                    key={q.id}
                    question={q}
                    onSelect={handleSelectQuestion}
                    onSkip={handleSkipQuestion}
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
                <p className="text-xs text-muted-foreground text-center py-4">
                  No questions in queue.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="selected"
          className={cn(
            "mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden",
            isSidebar && "mt-3",
          )}
        >
          <ScrollArea className="min-h-0 flex-1 pr-1">
            <div className="flex flex-col gap-2 pb-1">
              {selectedQuestions.length > 0 ? (
                selectedQuestions.map((q) => (
                  <SelectedQuestionCard
                    key={q.id}
                    question={q}
                    onQueue={handleQueueQuestion}
                    onSkip={handleSkipQuestion}
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
                <p className="text-xs text-muted-foreground text-center py-4">
                  No selected questions.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="closed"
          className={cn(
            "mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden",
            isSidebar && "mt-3",
          )}
        >
          <ScrollArea className="min-h-0 flex-1 pr-1">
            <div className="flex flex-col gap-2 pb-1">
              {closedQuestions.length > 0 ? (
                closedQuestions.map((q) => (
                  <ClosedQuestionCard
                    key={q.id}
                    question={q}
                    onSelect={handleSelectQuestion}
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
                <p className="text-xs text-muted-foreground text-center py-4">
                  No skipped questions.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

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

const qaCardShell =
  "rounded-xl border border-[#e2e8f0] bg-white py-3 px-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,border-color] hover:border-[#cbd5e1] hover:shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:border-border/50 dark:bg-card";

const qaIconBtn =
  "h-7 w-7 shrink-0 rounded-lg border border-transparent bg-transparent text-[#64748b] transition-colors hover:border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#334155] dark:text-muted-foreground dark:hover:border-border dark:hover:bg-muted/50 dark:hover:text-foreground";

const qaIconBtnDangerHover =
  "hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900/40 dark:hover:bg-red-950/30 dark:hover:text-red-400";

/** Action row: tight gap, no extra top margin (question carries bottom spacing) */
const qaActionRow = "flex flex-wrap items-center gap-2";

/** Calm “primary” moderation action — outline blue, not solid fill */
const qaBtnSelect =
  "h-7 shrink-0 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 text-xs font-semibold text-[#1d4ed8] shadow-none transition-colors hover:border-[#93c5fd] hover:bg-[#dbeafe] active:bg-[#bfdbfe] dark:border-primary/40 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15";

const qaBtnSkip =
  "h-7 shrink-0 rounded-lg border border-[#dbe3ef] bg-white px-3 text-xs font-semibold text-[#475569] shadow-none transition-colors hover:border-[#cbd5e1] hover:bg-[#f8fafc] dark:border-border dark:bg-background dark:text-muted-foreground dark:hover:bg-muted/40";

const qaBtnAssign =
  "h-7 shrink-0 rounded-lg border border-[#dbe3ef] bg-white px-3 text-xs font-semibold text-[#334155] shadow-none transition-colors hover:border-[#cbd5e1] hover:bg-[#f8fafc] gap-1 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0 [&>svg]:text-[#64748b] dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted/40";

const qaBtnAssignChevron =
  "flex h-7 w-7 shrink-0 items-center justify-center border-l border-[#dbe3ef] text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#334155] dark:border-border dark:text-muted-foreground dark:hover:bg-muted/40";

function AssignQuestionDropdown({
  questionId,
  participants,
  onAssignQuestion,
}: {
  questionId: string;
  participants: string[];
  onAssignQuestion: (questionId: string, participant: string) => void;
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
      <div className={cn(qaBtnAssign, "inline-flex items-center gap-0 p-0")}>
        <span className="px-3 leading-none">Assign</span>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={qaBtnAssignChevron}
            aria-label="Open assign menu"
          >
            <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
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
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <span className="text-sm font-bold leading-tight text-[#0f1f3d] dark:text-foreground">
            {question.username}
          </span>
          <span className="text-xs font-medium tabular-nums text-[#64748b] dark:text-muted-foreground">
            {question.timestamp}
          </span>
          {blocked && (
            <span className="text-xs font-medium text-destructive">Blocked</span>
          )}
          {question.assignedTo && (
            <span className="text-xs font-medium text-primary">Assigned · {question.assignedTo}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={qaIconBtn}
            onClick={() => onCopy(question.id, question.question)}
            title="Copy"
          >
            {copiedQuestionId === question.id ? (
              <Check className="h-4 w-4 text-[#1d4ed8]" />
            ) : (
              <Copy className="h-4 w-4" />
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
            <Ban className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${qaIconBtn} ${qaIconBtnDangerHover}`}
            onClick={() => onDelete(question.id)}
            title="Delete question"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mb-2.5 text-[12px] font-normal leading-[1.35] text-[#24324b] dark:text-foreground/90">
        {question.question}
      </p>
      <div className={qaActionRow}>
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
      </div>
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
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <span className="text-sm font-bold leading-tight text-[#0f1f3d] dark:text-foreground">
            {question.username}
          </span>
          <span className="text-xs font-medium tabular-nums text-[#64748b] dark:text-muted-foreground">
            {question.timestamp}
          </span>
          {blocked && (
            <span className="text-xs font-medium text-destructive">Blocked</span>
          )}
          {question.assignedTo && (
            <span className="text-xs font-medium text-primary">Assigned · {question.assignedTo}</span>
          )}
          <span className="rounded-full bg-[#eef4ff] px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-[#1d4ed8] dark:bg-primary/15 dark:text-primary">
            Selected
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={qaIconBtn}
            onClick={() => onCopy(question.id, question.question)}
            title="Copy"
          >
            {copiedQuestionId === question.id ? (
              <Check className="h-4 w-4 text-[#1d4ed8]" />
            ) : (
              <Copy className="h-4 w-4" />
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
            <Ban className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${qaIconBtn} ${qaIconBtnDangerHover}`}
            onClick={() => onDelete(question.id)}
            title="Delete question"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p
        className={`text-[12px] font-normal leading-[1.35] text-[#24324b] dark:text-foreground/90 ${!question.assignedTo ? "mb-2.5" : "mb-0"}`}
      >
        {question.question}
      </p>
      {!question.assignedTo && (
        <div className={qaActionRow}>
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
        </div>
      )}
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
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <span className="text-sm font-bold leading-tight text-[#0f1f3d] dark:text-foreground">
            {question.username}
          </span>
          <span className="text-xs font-medium tabular-nums text-[#64748b] dark:text-muted-foreground">
            {question.timestamp}
          </span>
          {blocked && (
            <span className="text-xs font-medium text-destructive">Blocked</span>
          )}
          {question.assignedTo && (
            <span className="text-xs font-medium text-primary">Assigned · {question.assignedTo}</span>
          )}
          <span className="rounded-full bg-[#f1f5f9] px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-[#64748b] dark:bg-muted dark:text-muted-foreground">
            Skipped
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={qaIconBtn}
            onClick={() => onCopy(question.id, question.question)}
            title="Copy"
          >
            {copiedQuestionId === question.id ? (
              <Check className="h-4 w-4 text-[#1d4ed8]" />
            ) : (
              <Copy className="h-4 w-4" />
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
            <Ban className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${qaIconBtn} ${qaIconBtnDangerHover}`}
            onClick={() => onDelete(question.id)}
            title="Delete question"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mb-2.5 text-[12px] font-normal leading-[1.35] text-[#24324b] dark:text-foreground/90">
        {question.question}
      </p>
      <div className={qaActionRow}>
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
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  onToggle,
  onCopy,
  onCloseQuestion,
  onBlockUser,
  copiedQuestionId,
  isUserBlocked,
}: {
  question: Question;
  onToggle: (id: string) => void;
  onCopy: (questionId: string, question: string) => void;
  onCloseQuestion: (id: string) => void;
  onBlockUser: (username: string) => void;
  copiedQuestionId: string | null;
  isUserBlocked: (username: string) => boolean;
}) {
  const blocked = isUserBlocked(question.username);
  return (
    <div
      className={`group p-2 rounded-lg surface-elevated border transition-all ${question.isApproved
          ? "border-success/30 bg-success/5"
          : "border-border hover:border-primary/50"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-foreground text-xs">{question.username}</span>
            <span className="text-[10px] text-muted-foreground">{question.timestamp}</span>
            {blocked && (
              <span className="text-[10px] text-destructive font-medium">(Blocked)</span>
            )}
          </div>
          <p className="text-[12px] text-foreground/90 leading-snug">{question.question}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Action Icons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onCopy(question.id, question.question)}
              title="Copy"
            >
              {copiedQuestionId === question.id ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
            {!question.isApproved && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => onCloseQuestion(question.id)}
                title="Close Question"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-destructive"
              onClick={() => onBlockUser(question.username)}
              title="Block user"
              disabled={blocked}
            >
              <Ban className="w-3 h-3" />
            </Button>
          </div>
          <Switch checked={question.isApproved} onCheckedChange={() => onToggle(question.id)} className="scale-75" />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {question.isApproved ? "Approved" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}
