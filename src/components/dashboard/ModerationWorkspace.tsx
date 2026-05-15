import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatModeration, type BlockedUser, type ChatMessage } from "./moderation/ChatModeration";
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

  const windowTabs = useMemo(
    () => [
      { key: "comments" as const, label: "Chat", count: commentsCount, enabled: commentsEnabled },
      { key: "qa" as const, label: "Q&A", count: qaQueueCount, enabled: qnaEnabled },
      { key: "studio" as const, label: "Studio Chat", count: studioCount, enabled: true },
    ],
    [commentsCount, qaQueueCount, studioCount, commentsEnabled, qnaEnabled]
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
      <div className="shrink-0 border-b border-border/50 bg-muted/15 px-3 py-2 sm:px-4">
        <div className="overflow-x-auto">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ModerationTab)}
            className="w-full"
          >
            <TabsList className="inline-flex h-auto min-h-0 w-max min-w-full justify-start gap-1.5 bg-transparent p-0">
              {windowTabs
                .filter((tab) => tab.enabled)
                .map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="group h-8 shrink-0 rounded-full border border-border/60 bg-background/80 px-2.5 py-0 text-[11px] font-medium text-muted-foreground shadow-sm data-[state=active]:border-primary/50 data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:shadow-sm sm:h-9 sm:px-3 sm:text-xs"
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1.5 inline-flex min-h-[14px] min-w-[14px] items-center justify-center rounded-full bg-muted/80 px-1 text-[9px] font-semibold leading-none text-foreground tabular-nums group-data-[state=active]:bg-primary/20 group-data-[state=active]:text-primary">
                      {tab.count}
                    </span>
                  </TabsTrigger>
                ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-3 sm:p-4">
        <div className="flex h-full min-h-0 flex-col rounded-lg border border-border/60 bg-card p-1 shadow-sm">
          {activeTab === "comments" && commentsEnabled && (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
