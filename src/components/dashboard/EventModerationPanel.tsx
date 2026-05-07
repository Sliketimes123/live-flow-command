import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatModeration, type ChatMessage, type BlockedUser } from "./moderation/ChatModeration";
import { QAPanel } from "./moderation/QAPanel";
import { MessageSquare, Lock, Users, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

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
  onTabViewed?: (tab: "comments" | "studio" | "private" | "qa") => void;
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
  // Lift auto-scroll state to parent to persist across tab switches
  // These states persist independently for each tab
  // Default to disabled (false)
  const [commentsAutoScroll, setCommentsAutoScroll] = useState(false);
  const [studioAutoScroll, setStudioAutoScroll] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");
  const [studioCount, setStudioCount] = useState(0);
  const [privateCount, setPrivateCount] = useState(0);
  const [qaQueueCount, setQaQueueCount] = useState(0);
  const commentsCount = messages.length;

  const getCountBadgeClass = (tab: "comments" | "studio" | "private" | "qa") =>
    activeTab === tab
      ? "ml-1.5 inline-flex min-w-[20px] justify-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-primary border border-primary/40"
      : "ml-1.5 inline-flex min-w-[20px] justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none font-medium text-muted-foreground border border-border/60";

  useEffect(() => {
    if (activeTab === "comments" && !commentsEnabled) {
      setActiveTab(qnaEnabled ? "qa" : "studio");
    }
    if (activeTab === "qa" && !qnaEnabled) {
      setActiveTab(commentsEnabled ? "comments" : "studio");
    }
  }, [activeTab, commentsEnabled, qnaEnabled]);

  useEffect(() => {
    onTabViewed?.(activeTab as "comments" | "studio" | "private" | "qa");
  }, [activeTab, onTabViewed]);

  return (
    <div className="flex flex-col h-full bg-background/35 rounded-xl border border-border/60 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
        <div className="p-2 pb-1">
          <TabsList className="w-full bg-muted/70 p-1 h-10 mb-1 border border-border/60">
            {commentsEnabled && (
              <TabsTrigger value="comments" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MessageSquare className="w-3.5 h-3.5 mr-2" />
                Comments
                <span className={getCountBadgeClass("comments")}>{commentsCount}</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="studio" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Lock className="w-3.5 h-3.5 mr-2" />
              Studio Chat
              <span className={getCountBadgeClass("studio")}>{studioCount}</span>
            </TabsTrigger>
            <TabsTrigger value="private" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="w-3.5 h-3.5 mr-2" />
              Private Chat
              <span className={getCountBadgeClass("private")}>{privateCount}</span>
            </TabsTrigger>
            {qnaEnabled && (
              <TabsTrigger value="qa" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <HelpCircle className="w-3.5 h-3.5 mr-2" />
                Q&A
                <span className={getCountBadgeClass("qa")}>{qaQueueCount}</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="flex-1 p-2 pt-1 h-full overflow-hidden">
          {commentsEnabled && (
            <TabsContent value="comments" className="mt-0 h-full data-[state=inactive]:hidden pt-0">
              <ChatModeration
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
            </TabsContent>
          )}

          <TabsContent value="studio" className="mt-0 h-full data-[state=inactive]:hidden pt-0">
            <ChatModeration
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
          </TabsContent>

          <TabsContent value="private" className="mt-0 h-full data-[state=inactive]:hidden pt-0">
            <ChatModeration
              messages={messages}
              blockedUsers={blockedUsers}
              onBlockUser={onBlockUser}
              onUnblockUser={onUnblockUser}
              onToggleHide={onToggleHide}
              onTogglePin={onTogglePin}
              onToggleSelect={onToggleSelect}
              onCopy={onCopy}
              onDeleteMessage={onDeleteMessage}
              activeTab="private"
              onMessageCountChange={setPrivateCount}
            />
          </TabsContent>

          {qnaEnabled && (
            <TabsContent value="qa" className="mt-0 h-full data-[state=inactive]:hidden pt-0">
              <QAPanel
                onBlockUser={onBlockUser}
                blockedUsers={blockedUsers}
                onQuestionMetricsChange={(metrics) => {
                  setQaQueueCount(metrics.queue);
                  onQuestionMetricsChange?.(metrics);
                }}
                onQASpike={onQASpike}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
