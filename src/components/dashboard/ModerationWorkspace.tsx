import { useEffect } from "react";
import { ChatModeration, type BlockedUser, type ChatMessage } from "./moderation/ChatModeration";
import { QAPanel } from "./moderation/QAPanel";
import type { ModerationTab } from "@/lib/moderationSession";

export interface ModerationWorkspaceProps {
  messages: ChatMessage[];
  blockedUsers: BlockedUser[];
  commentsEnabled?: boolean;
  qnaEnabled?: boolean;
  activeTab: ModerationTab;
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
  onQaQueueCountChange?: (count: number) => void;
  onStudioCountChange?: (count: number) => void;
}

export function ModerationWorkspace({
  messages,
  blockedUsers,
  commentsEnabled = true,
  qnaEnabled = true,
  activeTab,
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
  onQaQueueCountChange,
  onStudioCountChange,
}: ModerationWorkspaceProps) {
  const tabAllowed =
    (activeTab === "comments" && commentsEnabled) ||
    (activeTab === "qa" && qnaEnabled) ||
    activeTab === "studio";

  useEffect(() => {
    onTabViewed?.(activeTab);
  }, [activeTab, onTabViewed]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-3">
        {tabAllowed && activeTab === "comments" && commentsEnabled && (
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
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

        {tabAllowed && activeTab === "qa" && qnaEnabled && (
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <QAPanel
              variant="moderation"
              onBlockUser={onBlockUser}
              blockedUsers={blockedUsers}
              onQuestionMetricsChange={(metrics) => {
                onQaQueueCountChange?.(metrics.queue);
                onQuestionMetricsChange?.(metrics);
              }}
              onQASpike={onQASpike}
            />
          </div>
        )}

        {tabAllowed && activeTab === "studio" && (
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
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
              onMessageCountChange={onStudioCountChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
