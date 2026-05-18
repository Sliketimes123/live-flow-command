import { useEffect, useMemo, useState } from "react";
import { ChatModeration, type BlockedUser, type ChatMessage } from "./moderation/ChatModeration";
import { ModerationSectionSwitcher } from "./moderation/ModerationSectionSwitcher";
import { QAPanel } from "./moderation/QAPanel";
import type { ModerationTab } from "@/lib/moderationSession";

export interface ModerationWorkspaceProps {
  messages: ChatMessage[];
  blockedUsers: BlockedUser[];
  commentsEnabled?: boolean;
  qnaEnabled?: boolean;
  initialTab?: ModerationTab;
  onBlockUser: (username: string) => void;
  onUnblockUser: (username: string) => void;
  onToggleHide?: (messageId: string) => void;
  onTogglePin?: (messageId: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onCopy?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onSendCommentMessage?: (message: string) => void;
  onQuestionMetricsChange?: (metrics: {
    total: number;
    queue: number;
    selected: number;
    closed: number;
  }) => void;
  onQASpike?: (payload: { increaseBy: number; queueCount: number }) => void;
  onTabViewed?: (tab: ModerationTab) => void;
}

export function ModerationWorkspace({
  messages,
  blockedUsers,
  commentsEnabled = true,
  qnaEnabled = true,
  initialTab = "comments",
  onBlockUser,
  onUnblockUser,
  onToggleHide,
  onTogglePin,
  onToggleSelect,
  onCopy,
  onDeleteMessage,
  onSendCommentMessage,
  onQuestionMetricsChange,
  onQASpike,
  onTabViewed,
}: ModerationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ModerationTab>(initialTab);
  const [studioCount, setStudioCount] = useState(0);
  const [qaQueueCount, setQaQueueCount] = useState(0);
  const commentsCount = messages.length;

  const sectionTabs = useMemo(
    () => [
      { key: "comments" as const, label: "Chat", count: commentsCount, enabled: commentsEnabled },
      { key: "qa" as const, label: "Q&A", count: qaQueueCount, enabled: qnaEnabled },
      { key: "studio" as const, label: "Studio Chat", count: studioCount, enabled: true },
    ],
    [commentsCount, qaQueueCount, studioCount, commentsEnabled, qnaEnabled],
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === "comments" && !commentsEnabled) {
      setActiveTab(qnaEnabled ? "qa" : "studio");
    }
    if (activeTab === "qa" && !qnaEnabled) {
      setActiveTab(commentsEnabled ? "comments" : "studio");
    }
  }, [activeTab, commentsEnabled, qnaEnabled]);

  useEffect(() => {
    onTabViewed?.(activeTab);
  }, [activeTab, onTabViewed]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-3 py-2">
        <ModerationSectionSwitcher value={activeTab} onValueChange={setActiveTab} tabs={sectionTabs} />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-3 pb-3 pt-1">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
          {activeTab === "comments" && commentsEnabled && (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col p-1.5">
              <ChatModeration
                variant="moderation"
                messages={messages}
                blockedUsers={blockedUsers}
                onBlockUser={onBlockUser}
                onUnblockUser={onUnblockUser}
                onToggleHide={onToggleHide}
                onTogglePin={onTogglePin}
                onToggleSelect={onToggleSelect}
                onCopy={onCopy}
                onDeleteMessage={onDeleteMessage}
                onSendCommentMessage={onSendCommentMessage}
                activeTab="comments"
              />
            </div>
          )}

          {activeTab === "qa" && qnaEnabled && (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-1.5">
              <QAPanel
                variant="moderation"
                onBlockUser={onBlockUser}
                blockedUsers={blockedUsers}
                onQuestionMetricsChange={(metrics) => {
                  setQaQueueCount(metrics.queue);
                  onQuestionMetricsChange?.(metrics);
                }}
                onQASpike={onQASpike}
              />
            </div>
          )}

          {activeTab === "studio" && (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col p-1.5">
              <ChatModeration
                variant="moderation"
                messages={messages}
                blockedUsers={blockedUsers}
                onBlockUser={onBlockUser}
                onUnblockUser={onUnblockUser}
                onToggleHide={onToggleHide}
                onTogglePin={onTogglePin}
                onToggleSelect={onToggleSelect}
                onCopy={onCopy}
                onDeleteMessage={onDeleteMessage}
                activeTab="studio"
                onMessageCountChange={setStudioCount}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
