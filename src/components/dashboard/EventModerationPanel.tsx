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
  onToggleSelect?: (messageId: string) => void;
  onCopy?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  commentsEnabled?: boolean;
  qnaEnabled?: boolean;
}

export function EventModerationPanel({
  messages,
  blockedUsers,
  onBlockUser,
  onUnblockUser,
  onToggleHide,
  onToggleSelect,
  onCopy,
  onDeleteMessage,
  commentsEnabled = true,
  qnaEnabled = true,
}: EventModerationPanelProps) {
  // Lift auto-scroll state to parent to persist across tab switches
  // These states persist independently for each tab
  // Default to disabled (false)
  const [commentsAutoScroll, setCommentsAutoScroll] = useState(false);
  const [studioAutoScroll, setStudioAutoScroll] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");

  useEffect(() => {
    if (activeTab === "comments" && !commentsEnabled) {
      setActiveTab(qnaEnabled ? "qa" : "studio");
    }
    if (activeTab === "qa" && !qnaEnabled) {
      setActiveTab(commentsEnabled ? "comments" : "studio");
    }
  }, [activeTab, commentsEnabled, qnaEnabled]);

  return (
    <div className="flex flex-col h-full bg-background/50 rounded-xl overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
        <div className="p-2 pb-1">
          <TabsList className="w-full bg-muted/50 p-1 h-10 mb-1">
            {commentsEnabled && (
              <TabsTrigger value="comments" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MessageSquare className="w-3.5 h-3.5 mr-2" />
                Comments
              </TabsTrigger>
            )}
            <TabsTrigger value="studio" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Lock className="w-3.5 h-3.5 mr-2" />
              Studio Chat
            </TabsTrigger>
            <TabsTrigger value="private" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="w-3.5 h-3.5 mr-2" />
              Private Chat
            </TabsTrigger>
            {qnaEnabled && (
              <TabsTrigger value="qa" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <HelpCircle className="w-3.5 h-3.5 mr-2" />
                Q&A
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
                onToggleSelect={onToggleSelect}
                onCopy={onCopy}
                onDeleteMessage={onDeleteMessage}
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
              onToggleSelect={onToggleSelect}
              onCopy={onCopy}
              onDeleteMessage={onDeleteMessage}
              activeTab="studio"
              autoScroll={studioAutoScroll}
              onAutoScrollChange={setStudioAutoScroll}
            />
          </TabsContent>

          <TabsContent value="private" className="mt-0 h-full data-[state=inactive]:hidden pt-0">
            <ChatModeration
              messages={messages}
              blockedUsers={blockedUsers}
              onBlockUser={onBlockUser}
              onUnblockUser={onUnblockUser}
              onToggleHide={onToggleHide}
              onToggleSelect={onToggleSelect}
              onCopy={onCopy}
              onDeleteMessage={onDeleteMessage}
              activeTab="private"
            />
          </TabsContent>

          {qnaEnabled && (
            <TabsContent value="qa" className="mt-0 h-full data-[state=inactive]:hidden pt-0">
              <QAPanel onBlockUser={onBlockUser} blockedUsers={blockedUsers} />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
