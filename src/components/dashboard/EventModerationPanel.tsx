import { ChatModeration, type ChatMessage, type BlockedUser } from "./moderation/ChatModeration";
import { ModerationSectionSwitcher } from "./moderation/ModerationSectionSwitcher";
import { QAPanel } from "./moderation/QAPanel";
import { useEffect, useMemo, useState } from "react";
import type { ModerationTab } from "@/lib/moderationSession";

interface EventModerationPanelProps {
  messages: ChatMessage[];
  blockedUsers: BlockedUser[];
  onBlockUser: (username: string) => void;
  onUnblockUser: (username: string) => void;
  onToggleHide?: (messageId: string) => void;
  onTogglePin?: (messageId: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onCopy?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onSendCommentMessage?: (message: string) => void;
  commentsEnabled?: boolean;
  qnaEnabled?: boolean;
  onQuestionMetricsChange?: (metrics: { total: number; queue: number; selected: number; closed: number }) => void;
  onQASpike?: (payload: { increaseBy: number; queueCount: number }) => void;
  onTabViewed?: (tab: ModerationTab) => void;
}

export function EventModerationPanel({
  messages,
  blockedUsers,
  onBlockUser,
  onUnblockUser,
  onToggleHide,
  onTogglePin,
  onToggleSelect,
  onCopy,
  onDeleteMessage,
  onSendCommentMessage,
  commentsEnabled = true,
  qnaEnabled = true,
  onQuestionMetricsChange,
  onQASpike,
  onTabViewed,
}: EventModerationPanelProps) {
  const [commentsAutoScroll, setCommentsAutoScroll] = useState(false);
  const [studioAutoScroll, setStudioAutoScroll] = useState(false);
  const [activeTab, setActiveTab] = useState<ModerationTab>("comments");
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
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-background/35">
      <div className="shrink-0 px-3 py-2">
        <ModerationSectionSwitcher value={activeTab} onValueChange={setActiveTab} tabs={sectionTabs} />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-2 pb-2 pt-1">
        {activeTab === "comments" && commentsEnabled && (
          <div className="flex h-full min-h-0 flex-col p-1">
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
              autoScroll={commentsAutoScroll}
              onAutoScrollChange={setCommentsAutoScroll}
            />
          </div>
        )}

        {activeTab === "qa" && qnaEnabled && (
          <div className="flex h-full min-h-0 flex-col overflow-hidden p-1">
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
          <div className="flex h-full min-h-0 flex-col p-1">
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
              autoScroll={studioAutoScroll}
              onAutoScrollChange={setStudioAutoScroll}
              onMessageCountChange={setStudioCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
