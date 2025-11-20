import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star, EyeOff, Copy, Check, List, Grid2X2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isHighlighted?: boolean;
  isHidden?: boolean;
  isSelected?: boolean;
}

export interface BlockedUser {
  id: string;
  username: string;
  blockedAt: string;
}

interface ChatModerationProps {
  messages: ChatMessage[];
  blockedUsers: BlockedUser[];
  onBlockUser?: (username: string) => void;
  onUnblockUser?: (username: string) => void;
  onToggleHide?: (messageId: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onCopy?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export function ChatModeration({
  messages,
  blockedUsers,
  onBlockUser,
  onUnblockUser,
  onToggleHide,
  onToggleSelect,
  onCopy,
  onDeleteMessage,
}: ChatModerationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const { toast } = useToast();

  const isUserBlocked = (username: string) => {
    return blockedUsers.some((user) => user.username === username);
  };

  const handleCopy = (messageId: string, message: string) => {
    navigator.clipboard.writeText(message);
    setCopiedMessageId(messageId);
    onCopy?.(message);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleToggleHide = (messageId: string) => {
    onToggleHide?.(messageId);
  };

  const handleToggleSelect = (messageId: string) => {
    onToggleSelect?.(messageId);
  };

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return messages
      .filter((msg) => !msg.isHidden)
      .filter((msg) => {
        if (!query) return true;
        return (
          msg.username.toLowerCase().includes(query) ||
          msg.message.toLowerCase().includes(query) ||
          msg.timestamp.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (a.isSelected && !b.isSelected) return -1;
        if (!a.isSelected && b.isSelected) return 1;
        return 0;
      });
  }, [messages, searchQuery]);

  return (
    <div className="flex flex-col h-full space-y-2 relative">
      {/* Search Bar & View Toggle */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-7 text-xs"
          />
        </div>
        <div className="inline-flex items-center rounded border border-border bg-muted/30 p-0.5">
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            className="h-6 w-6 p-0"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            title="List view"
          >
            <List className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "ghost"}
            className="h-6 w-6 p-0"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            title="Grid view"
          >
            <Grid2X2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Chat Feed */}
      <ScrollArea className="flex-1 pr-2">
        <div
          className={
            viewMode === "grid"
              ? "grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
              : "space-y-2"
          }
        >
          {filteredMessages.map((msg) => {
              const blocked = isUserBlocked(msg.username);
              return (
                <div
                  key={msg.id}
                className={`group p-2.5 rounded-lg surface-elevated border border-border hover:border-primary/60 transition-all ${
                    msg.isHighlighted ? "bg-primary/10 border-primary/30" : ""
                  } ${blocked ? "opacity-50" : ""} ${msg.isSelected ? "border-primary/50 bg-primary/5" : ""}`}
                >
                <div
                  className={`flex flex-col gap-1.5 ${
                    viewMode === "grid" ? "min-h-[120px]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center flex-wrap gap-1.5 text-xs">
                        {msg.isSelected && (
                          <Star className="w-3 h-3 text-primary fill-primary" />
                        )}
                        <span className="font-semibold text-foreground text-xs">
                          {msg.username}
                        </span>
                        <span className="text-[10px] text-muted-foreground tracking-wide">
                          {msg.timestamp}
                        </span>
                        {msg.isHighlighted && (
                          <Star className="w-3 h-3 text-primary fill-primary" />
                        )}
                        {blocked && (
                          <span className="text-[10px] text-destructive font-medium">(Blocked)</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {msg.message}
                      </p>
                    </div>
                    {/* Action Icons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleToggleHide(msg.id)}
                        title="Hide"
                      >
                        <EyeOff className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleToggleSelect(msg.id)}
                        title={msg.isSelected ? "Unselect" : "Select"}
                      >
                        <Star
                          className={`w-3 h-3 ${msg.isSelected ? "text-primary fill-primary" : ""}`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleCopy(msg.id, msg.message)}
                        title="Copy"
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="w-3 h-3 text-primary" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => onDeleteMessage?.(msg.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  </div>
                </div>
              );
            })}
          {filteredMessages.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No messages found.
            </div>
          )}
        </div>
      </ScrollArea>

    </div>
  );
}
