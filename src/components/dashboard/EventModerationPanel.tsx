import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatModeration, type ChatMessage, type BlockedUser } from "./moderation/ChatModeration";
import { QAPanel } from "./moderation/QAPanel";
import { MessageSquare, HelpCircle } from "lucide-react";

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
    <div className="flex flex-col h-full bg-background/50 rounded-xl overflow-hidden">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col h-full">
        <div className="p-2 pb-4">
          <TabsList className="w-full bg-muted/50 p-1 h-10 mb-4">
            <TabsTrigger value="chat" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <MessageSquare className="w-3.5 h-3.5 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex-1 text-xs h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <HelpCircle className="w-3.5 h-3.5 mr-2" />
              Q&A
            </TabsTrigger>

          </TabsList>
        </div>

        <div className="flex-1 p-2 h-full overflow-hidden">
          <TabsContent value="chat" className="mt-0 h-full data-[state=inactive]:hidden">
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

          <TabsContent value="qa" className="mt-0 h-full data-[state=inactive]:hidden">
            <QAPanel onBlockUser={onBlockUser} blockedUsers={blockedUsers} />
          </TabsContent>


        </div>
      </Tabs>
    </div>
  );
}
