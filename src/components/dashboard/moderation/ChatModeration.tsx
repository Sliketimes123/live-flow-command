import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Trash2, Ban, Clock, Star } from "lucide-react";
import { useState } from "react";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isHighlighted?: boolean;
}

export function ChatModeration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [messages] = useState<ChatMessage[]>([
    {
      id: "1",
      username: "User123",
      message: "This is an amazing event! Thanks for hosting!",
      timestamp: "2:34 PM",
    },
    {
      id: "2",
      username: "StreamFan99",
      message: "Can you explain more about the topic?",
      timestamp: "2:35 PM",
    },
    {
      id: "3",
      username: "TechGuru",
      message: "The production quality is outstanding!",
      timestamp: "2:36 PM",
      isHighlighted: true,
    },
    {
      id: "4",
      username: "NewViewer",
      message: "Just joined, what did I miss?",
      timestamp: "2:37 PM",
    },
    {
      id: "5",
      username: "EventAttendee",
      message: "Looking forward to the Q&A session",
      timestamp: "2:38 PM",
    },
  ]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Chat Feed */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`group p-4 rounded-lg surface-elevated border border-border hover:border-primary/50 transition-all ${
                msg.isHighlighted ? "bg-primary/10 border-primary/30" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{msg.username}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    {msg.isHighlighted && (
                      <Star className="w-3 h-3 text-primary fill-primary" />
                    )}
                  </div>
                  <p className="text-sm text-foreground/90">{msg.message}</p>
                </div>

                {/* Hover Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                    <Ban className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
