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
import { useState } from "react";
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
}

export function QAPanel({ onBlockUser, blockedUsers = [] }: QAPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
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

  // Get filtered questions
  const allFilteredQuestions = applyStatusFilter(filterQuestions(questions));
  const approvedQuestions = allFilteredQuestions.filter((q) => q.isApproved);
  const pendingQuestions = allFilteredQuestions.filter((q) => !q.isApproved);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search Bar and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(value: "all" | "open" | "closed") => setFilter(value)}>
          <SelectTrigger className="w-[140px]">
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
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-success uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved Questions ({approvedQuestions.length})
          </h3>
          <div className="space-y-2">
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
        <div className="flex-1 flex flex-col space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Pending Review ({pendingQuestions.length})
          </h3>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-2">
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
      className={`group p-4 rounded-lg surface-elevated border transition-all ${
        question.isApproved
          ? "border-success/30 bg-success/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{question.username}</span>
            <span className="text-xs text-muted-foreground">{question.timestamp}</span>
            {blocked && (
              <span className="text-xs text-destructive font-medium">(Blocked)</span>
            )}
          </div>
          <p className="text-sm text-foreground/90">{question.question}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Icons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onCopy(question.id, question.question)}
              title="Copy"
            >
              {copiedQuestionId === question.id ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            {!question.isApproved && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => onCloseQuestion(question.id)}
                title="Close Question"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive"
              onClick={() => onBlockUser(question.username)}
              title="Block user"
              disabled={blocked}
            >
              <Ban className="w-4 h-4" />
            </Button>
          </div>
          <Switch checked={question.isApproved} onCheckedChange={() => onToggle(question.id)} />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {question.isApproved ? "Approved" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}
