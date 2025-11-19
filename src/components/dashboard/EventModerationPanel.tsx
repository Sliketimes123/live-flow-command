import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatModeration, type ChatMessage, type BlockedUser } from "./moderation/ChatModeration";
import { QAPanel } from "./moderation/QAPanel";
import { EventSummary } from "./moderation/EventSummary";

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
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">Event Moderation</h2>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="chat">Chat Moderation</TabsTrigger>
          <TabsTrigger value="qa">Q&A Panel</TabsTrigger>
          <TabsTrigger value="summary">Event Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 mt-4">
          <ChatModeration
            messages={messages}
            blockedUsers={blockedUsers}
            onBlockUser={onBlockUser}
            onUnblockUser={onUnblockUser}
            onToggleHide={onToggleHide}
            onToggleSelect={onToggleSelect}
            onCopy={onCopy}
            onDeleteMessage={onDeleteMessage}
          />
        </TabsContent>

        <TabsContent value="qa" className="flex-1 mt-4">
          <QAPanel onBlockUser={onBlockUser} blockedUsers={blockedUsers} />
        </TabsContent>

        <TabsContent value="summary" className="flex-1 mt-4">
          <EventSummary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
