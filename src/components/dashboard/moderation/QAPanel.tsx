import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

interface Question {
  id: string;
  username: string;
  question: string;
  timestamp: string;
  isApproved: boolean;
}

export function QAPanel() {
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

  const approvedQuestions = questions.filter((q) => q.isApproved);
  const pendingQuestions = questions.filter((q) => !q.isApproved);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Approved Questions */}
      {approvedQuestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-success uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved Questions ({approvedQuestions.length})
          </h3>
          <div className="space-y-2">
            {approvedQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} onToggle={toggleApproval} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Questions */}
      <div className="flex-1 flex flex-col space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Pending Review ({pendingQuestions.length})
        </h3>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {pendingQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} onToggle={toggleApproval} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  onToggle,
}: {
  question: Question;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className={`p-4 rounded-lg surface-elevated border transition-all ${
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
          </div>
          <p className="text-sm text-foreground/90">{question.question}</p>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={question.isApproved} onCheckedChange={() => onToggle(question.id)} />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {question.isApproved ? "Approved" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}
