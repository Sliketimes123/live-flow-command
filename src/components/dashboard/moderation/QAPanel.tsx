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
import { CheckCircle2, XCircle, Search, Copy, Check, Ban, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { BlockedUser } from "./ChatModeration";

interface Question {
  id: string;
  username: string;
  question: string;
  timestamp: string;
  isApproved: boolean;
}

interface QAPanelProps {
  onBlockUser?: (username: string) => void;
  blockedUsers?: BlockedUser[];
  isModerationStopped?: boolean;
}

export function QAPanel({ onBlockUser, blockedUsers = [], isModerationStopped = false }: QAPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedUserToBlock, setSelectedUserToBlock] = useState<string | null>(null);
  const [questionsBeforeStop, setQuestionsBeforeStop] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      username: "CuriousUser",
      question: "What are the key takeaways from this session?",
      timestamp: "2:30 PM",
      isApproved: true,
    },
    {
      id: "2",
      username: "Learner123",
      question: "Can you provide more details about the implementation?",
      timestamp: "2:32 PM",
      isApproved: false,
    },
    {
      id: "3",
      username: "TechEnthusiast",
      question: "How does this compare to other solutions?",
      timestamp: "2:35 PM",
      isApproved: true,
    },
    {
      id: "4",
      username: "Developer99",
      question: "What tools do you recommend for beginners?",
      timestamp: "2:38 PM",
      isApproved: false,
    },
  ]);

  const toggleApproval = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isApproved: !q.isApproved } : q))
    );
  };

  const handleCloseQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isApproved: true } : q))
    );
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

  // Track questions when moderation is stopped
  useEffect(() => {
    if (isModerationStopped) {
      // Store current question IDs when moderation is stopped
      setQuestionsBeforeStop(new Set(questions.map((q) => q.id)));
    } else {
      // Clear the set when moderation resumes
      setQuestionsBeforeStop(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModerationStopped]);

  // Filter questions to only show those that existed before moderation was stopped
  const filteredQuestions = isModerationStopped
    ? questions.filter((q) => questionsBeforeStop.has(q.id))
    : questions;

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

  // Apply status filter (all, open, closed)
  const applyStatusFilter = (questions: Question[]) => {
    switch (filter) {
      case "open":
        return questions.filter((q) => !q.isApproved);
      case "closed":
        return questions.filter((q) => q.isApproved);
      case "all":
      default:
        return questions;
    }
  };

  // Get filtered questions (apply moderation stop filter first, then search and status filters)
  const allFilteredQuestions = applyStatusFilter(filterQuestions(filteredQuestions));
  const approvedQuestions = allFilteredQuestions.filter((q) => q.isApproved);
  const pendingQuestions = allFilteredQuestions.filter((q) => !q.isApproved);

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Search Bar and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-7 text-xs"
          />
        </div>
        <Select value={filter} onValueChange={(value: "all" | "open" | "closed") => setFilter(value)}>
          <SelectTrigger className="w-[120px] h-7 text-xs">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Approved Questions */}
      {(filter === "all" || filter === "closed") && approvedQuestions.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-success uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Approved Questions ({approvedQuestions.length})
          </h3>
          <div className="space-y-1.5">
            {approvedQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onToggle={toggleApproval}
                onCopy={handleCopy}
                onCloseQuestion={handleCloseQuestion}
                onBlockUser={handleBlockRequest}
                copiedQuestionId={copiedQuestionId}
                isUserBlocked={isUserBlocked}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Questions */}
      {(filter === "all" || filter === "open") && (
        <div className="flex-1 flex flex-col space-y-1.5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <XCircle className="w-3 h-3" />
            Pending Review ({pendingQuestions.length})
          </h3>
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-1.5">
              {pendingQuestions.length > 0 ? (
                pendingQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onToggle={toggleApproval}
                    onCopy={handleCopy}
                    onCloseQuestion={handleCloseQuestion}
                    onBlockUser={handleBlockRequest}
                    copiedQuestionId={copiedQuestionId}
                    isUserBlocked={isUserBlocked}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending questions found.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Empty State */}
      {allFilteredQuestions.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            No questions found matching your search criteria.
          </p>
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
      className={`group p-2 rounded-lg surface-elevated border transition-all ${
        question.isApproved
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
          <p className="text-xs text-foreground/90 leading-snug">{question.question}</p>
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
