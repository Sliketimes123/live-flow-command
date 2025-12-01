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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Search, Copy, Check, Ban, X, ChevronDown, User, HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { BlockedUser } from "./ChatModeration";

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
  onBlockUser?: (username: string) => void;
  blockedUsers?: BlockedUser[];
}

export function QAPanel({ onBlockUser, blockedUsers = [] }: QAPanelProps) {
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

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedQuestionForAssign, setSelectedQuestionForAssign] = useState<string | null>(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");

  // Mock participants list
  const participants = useMemo(() => [
    "All",
    "P1",
    "Arvind Prasanna",
    "John Doe",
    "Jane Smith",
    "Admin User",
  ], []);

  const filteredParticipants = useMemo(() => {
    if (!assignSearchQuery.trim()) return participants;
    const query = assignSearchQuery.toLowerCase();
    return participants.filter((p) => p.toLowerCase().includes(query));
  }, [participants, assignSearchQuery]);

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

  const handleAssignClick = (id: string) => {
    setSelectedQuestionForAssign(id);
    setIsAssignDialogOpen(true);
    setSelectedParticipant("");
    setAssignSearchQuery("");
  };

  const handleAssignQuestion = () => {
    if (selectedQuestionForAssign && selectedParticipant) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === selectedQuestionForAssign
            ? { ...q, assignedTo: selectedParticipant }
            : q
        )
      );
      toast({
        title: "Question Assigned",
        description: `Question assigned to ${selectedParticipant}`,
      });
      setIsAssignDialogOpen(false);
      setSelectedQuestionForAssign(null);
      setSelectedParticipant("");
    }
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

  return (
    <div className="flex flex-col h-full bg-background/50 rounded-xl">
      <Tabs defaultValue="queue" className="flex-1 flex flex-col h-full">
        <div className="px-0 pb-1">
          <TabsList className="w-full bg-muted/50 p-1 h-9">
            <TabsTrigger value="queue" className="flex-1 text-[10px] h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <HelpCircle className="w-3 h-3 mr-1.5" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="selected" className="flex-1 text-[10px] h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <CheckCircle2 className="w-3 h-3 mr-1.5" />
              Selected
            </TabsTrigger>
            <TabsTrigger value="closed" className="flex-1 text-[10px] h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <XCircle className="w-3 h-3 mr-1.5" />
              Skipped
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="queue" className="flex-1 mt-3 data-[state=inactive]:hidden h-full overflow-hidden flex flex-col pt-2">
          {/* Search Bar */}
          <div className="relative px-1 mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-7 text-[10px]"
            />
          </div>

          {/* Queue Questions */}
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-2">
              {queueQuestions.length > 0 ? (
                queueQuestions.map((q) => (
                  <QueueQuestionCard
                    key={q.id}
                    question={q}
                    onSelect={handleSelectQuestion}
                    onSkip={handleSkipQuestion}
                    onAssign={handleAssignClick}
                    onCopy={handleCopy}
                    onBlockUser={handleBlockRequest}
                    copiedQuestionId={copiedQuestionId}
                    isUserBlocked={isUserBlocked}
                  />
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground text-center py-4">
                  No questions in queue.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="selected" className="flex-1 mt-3 data-[state=inactive]:hidden h-full overflow-hidden flex flex-col pt-2">
          {/* Search Bar */}
          <div className="relative px-1 mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-7 text-[10px]"
            />
          </div>

          {/* Selected Questions */}
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-2">
              {selectedQuestions.length > 0 ? (
                selectedQuestions.map((q) => (
                  <SelectedQuestionCard
                    key={q.id}
                    question={q}
                    onQueue={handleQueueQuestion}
                    onSkip={handleSkipQuestion}
                    onAssign={handleAssignClick}
                    onCopy={handleCopy}
                    onBlockUser={handleBlockRequest}
                    copiedQuestionId={copiedQuestionId}
                    isUserBlocked={isUserBlocked}
                  />
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground text-center py-4">
                  No selected questions.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="closed" className="flex-1 mt-3 data-[state=inactive]:hidden h-full overflow-hidden flex flex-col pt-2" >
          {/* Search Bar */}
          <div className="relative px-1 mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-7 text-[10px]"
            />
          </div>

          {/* Closed Questions */}
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-2">
              {closedQuestions.length > 0 ? (
                closedQuestions.map((q) => (
                  <ClosedQuestionCard
                    key={q.id}
                    question={q}
                    onSelect={handleSelectQuestion}
                    onQueue={handleQueueQuestion}
                    onAssign={handleAssignClick}
                    onCopy={handleCopy}
                    onBlockUser={handleBlockRequest}
                    copiedQuestionId={copiedQuestionId}
                    isUserBlocked={isUserBlocked}
                  />
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground text-center py-4">
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

      {/* Assign Question Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Assign Question</DialogTitle>
            <DialogDescription className="text-xs">
              Select a participant to assign this question to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search User"
                value={assignSearchQuery}
                onChange={(e) => setAssignSearchQuery(e.target.value)}
                className="pl-8 h-7 text-xs"
              />
            </div>

            {/* Participants List */}
            <ScrollArea className="h-[200px] pr-2">
              <div className="space-y-1">
                {filteredParticipants.map((participant) => (
                  <button
                    key={participant}
                    onClick={() => setSelectedParticipant(participant)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${selectedParticipant === participant
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-accent"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{participant}</span>
                    </div>
                    {selectedParticipant === participant && (
                      <Check className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Assign Button */}
            <Button
              onClick={handleAssignQuestion}
              disabled={!selectedParticipant}
              className="w-full h-7 text-xs"
            >
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QueueQuestionCard({
  question,
  onSelect,
  onSkip,
  onAssign,
  onCopy,
  onBlockUser,
  copiedQuestionId,
  isUserBlocked,
}: {
  question: Question;
  onSelect: (id: string) => void;
  onSkip: (id: string) => void;
  onAssign: (id: string) => void;
  onCopy: (questionId: string, question: string) => void;
  onBlockUser: (username: string) => void;
  copiedQuestionId: string | null;
  isUserBlocked: (username: string) => boolean;
}) {
  const blocked = isUserBlocked(question.username);
  return (
    <div className="p-2 rounded-lg border border-border/50 bg-card hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-foreground text-xs">{question.username}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{question.timestamp}</span>
            {blocked && (
              <span className="text-[10px] text-destructive font-medium uppercase">(Blocked)</span>
            )}
            {question.assignedTo && (
              <span className="text-[10px] text-primary font-medium">(Assigned to {question.assignedTo})</span>
            )}
          </div>
          <p className="text-xs text-foreground/90 leading-snug break-words">{question.question}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onCopy(question.id, question.question)}
            title="Copy"
          >
            {copiedQuestionId === question.id ? (
              <Check className="w-3 h-3 text-primary" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-destructive"
            onClick={() => onBlockUser(question.username)}
            title="Block user"
            disabled={blocked}
          >
            <Ban className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1"
          onClick={() => onSelect(question.id)}
        >
          Select
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1"
          onClick={() => onSkip(question.id)}
        >
          Skip
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 gap-1"
          onClick={() => onAssign(question.id)}
        >
          Assign
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function SelectedQuestionCard({
  question,
  onQueue,
  onSkip,
  onAssign,
  onCopy,
  onBlockUser,
  copiedQuestionId,
  isUserBlocked,
}: {
  question: Question;
  onQueue: (id: string) => void;
  onSkip: (id: string) => void;
  onAssign: (id: string) => void;
  onCopy: (questionId: string, question: string) => void;
  onBlockUser: (username: string) => void;
  copiedQuestionId: string | null;
  isUserBlocked: (username: string) => boolean;
}) {
  const blocked = isUserBlocked(question.username);
  return (
    <div className="p-2 rounded-lg border border-primary/30 bg-primary/5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-foreground text-[10px]">{question.username}</span>
            <span className="text-[9px] text-muted-foreground font-mono">{question.timestamp}</span>
            {blocked && (
              <span className="text-[9px] text-destructive font-medium uppercase">(Blocked)</span>
            )}
            {question.assignedTo && (
              <span className="text-[9px] text-primary font-medium">(Assigned to {question.assignedTo})</span>
            )}
            <span className="ml-auto text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
              SELECTED
            </span>
          </div>
          <p className="text-[10px] text-foreground/90 leading-snug break-words">{question.question}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onCopy(question.id, question.question)}
            title="Copy"
          >
            {copiedQuestionId === question.id ? (
              <Check className="w-3 h-3 text-primary" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-destructive"
            onClick={() => onBlockUser(question.username)}
            title="Block user"
            disabled={blocked}
          >
            <Ban className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1"
          onClick={() => onQueue(question.id)}
        >
          Queue
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1"
          onClick={() => onSkip(question.id)}
        >
          Skip
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 gap-1"
          onClick={() => onAssign(question.id)}
        >
          Assign
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function ClosedQuestionCard({
  question,
  onSelect,
  onQueue,
  onAssign,
  onCopy,
  onBlockUser,
  copiedQuestionId,
  isUserBlocked,
}: {
  question: Question;
  onSelect: (id: string) => void;
  onQueue: (id: string) => void;
  onAssign: (id: string) => void;
  onCopy: (questionId: string, question: string) => void;
  onBlockUser: (username: string) => void;
  copiedQuestionId: string | null;
  isUserBlocked: (username: string) => boolean;
}) {
  const blocked = isUserBlocked(question.username);
  return (
    <div className="p-2 rounded-lg border border-border/50 bg-muted/30 opacity-70 hover:opacity-100 transition-opacity">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-foreground text-[10px]">{question.username}</span>
            <span className="text-[9px] text-muted-foreground font-mono">{question.timestamp}</span>
            {blocked && (
              <span className="text-[9px] text-destructive font-medium uppercase">(Blocked)</span>
            )}
            {question.assignedTo && (
              <span className="text-[9px] text-primary font-medium">(Assigned to {question.assignedTo})</span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground font-bold uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded">
              SKIPPED
            </span>
          </div>
          <p className="text-[10px] text-foreground/90 leading-snug break-words">{question.question}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onCopy(question.id, question.question)}
            title="Copy"
          >
            {copiedQuestionId === question.id ? (
              <Check className="w-3 h-3 text-primary" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-destructive"
            onClick={() => onBlockUser(question.username)}
            title="Block user"
            disabled={blocked}
          >
            <Ban className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1"
          onClick={() => onSelect(question.id)}
        >
          Select
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1"
          onClick={() => onQueue(question.id)}
        >
          Queue
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 gap-1"
          onClick={() => onAssign(question.id)}
        >
          Assign
          <ChevronDown className="w-3 h-3" />
        </Button>
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
