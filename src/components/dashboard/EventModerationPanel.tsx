import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatModeration, type ChatMessage, type BlockedUser } from "./moderation/ChatModeration";
import { QAPanel } from "./moderation/QAPanel";
import { useState } from "react";

interface EventModerationPanelProps {
  messages: ChatMessage[];
  blockedUsers: BlockedUser[];
  onBlockUser: (username: string) => void;
  onUnblockUser: (username: string) => void;
  onToggleHide?: (messageId: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onCopy?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
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
}: EventModerationPanelProps) {
  // Lift auto-scroll state to parent to persist across tab switches
  // These states persist independently for each tab
  // Default to disabled (false)
  const [commentsAutoScroll, setCommentsAutoScroll] = useState(false);
  const [studioAutoScroll, setStudioAutoScroll] = useState(false);
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold mb-2">Event Moderation</h2>

      <Tabs defaultValue="comments" className="flex-1 flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="studio">Studio Chat</TabsTrigger>
          <TabsTrigger value="private">Private Chats</TabsTrigger>
          <TabsTrigger value="qa">Q&A Panel</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="flex-1 mt-2">
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

        <TabsContent value="studio" className="flex-1 mt-2">
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

        <TabsContent value="private" className="flex-1 mt-2">
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

        <TabsContent value="qa" className="flex-1 mt-2">
          <QAPanel onBlockUser={onBlockUser} blockedUsers={blockedUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
