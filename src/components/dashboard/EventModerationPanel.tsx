import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatModeration } from "./moderation/ChatModeration";
import { QAPanel } from "./moderation/QAPanel";
import { EventSummary } from "./moderation/EventSummary";

export function EventModerationPanel() {
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
          <ChatModeration />
        </TabsContent>

        <TabsContent value="qa" className="flex-1 mt-4">
          <QAPanel />
        </TabsContent>

        <TabsContent value="summary" className="flex-1 mt-4">
          <EventSummary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
