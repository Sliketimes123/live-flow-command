import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Star, EyeOff, Copy, Check, Trash2, Send, User } from "lucide-react";
import React, { useMemo, useState, useRef, useEffect } from "react";
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
  activeTab?: "comments" | "studio" | "private";
  autoScroll?: boolean;
  onAutoScrollChange?: (enabled: boolean) => void;
}

interface PrivateChat {
  id: string;
  username: string;
  messages: Array<{
    id: string;
    message: string;
    timestamp: string;
    isFromAdmin: boolean;
  }>;
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
  activeTab = "comments",
  autoScroll: propAutoScroll,
  onAutoScrollChange,
}: ChatModerationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [studioSearchQuery, setStudioSearchQuery] = useState("");
  // Fallback to internal state if props not provided (for backward compatibility)
  // Default to disabled (false)
  const [internalAutoScroll, setInternalAutoScroll] = useState(false);
  const [internalStudioAutoScroll, setInternalStudioAutoScroll] = useState(false);
  
  // Use prop if provided for the active tab, otherwise fall back to internal state
  const autoScroll = activeTab === "comments" && propAutoScroll !== undefined 
    ? propAutoScroll 
    : internalAutoScroll;
  const studioAutoScroll = activeTab === "studio" && propAutoScroll !== undefined
    ? propAutoScroll
    : internalStudioAutoScroll;
  
  const handleAutoScrollChange = (value: boolean) => {
    if (onAutoScrollChange) {
      onAutoScrollChange(value);
    } else {
      // Fallback to internal state
      if (activeTab === "comments") {
        setInternalAutoScroll(value);
      } else {
        setInternalStudioAutoScroll(value);
      }
    }
  };
  
  const handleStudioAutoScrollChange = (value: boolean) => {
    if (onAutoScrollChange) {
      onAutoScrollChange(value);
    } else {
      setInternalStudioAutoScroll(value);
    }
  };
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const commentsScrollRef = useRef<HTMLDivElement>(null);
  const studioScrollRef = useRef<HTMLDivElement>(null);
  const prevActiveTabRef = useRef<string | undefined>(activeTab);
  const { toast } = useToast();

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      // Find the ScrollArea viewport by traversing up from the content div
      const scrollAreaRoot = ref.current.closest('[data-radix-scroll-area-root]');
      if (scrollAreaRoot) {
        const viewport = scrollAreaRoot.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        if (viewport) {
          // Use scrollTop for immediate scroll (better for auto-scroll)
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }
  };

  // Separate state for Studio Chat messages
  const [studioMessages, setStudioMessages] = useState<ChatMessage[]>([
    {
      id: "studio-1",
      username: "StudioUser1",
      message: "Welcome to the studio chat!",
      timestamp: "2:40 PM",
      isHighlighted: false,
      isHidden: false,
      isSelected: false,
    },
    {
      id: "studio-2",
      username: "StudioUser2",
      message: "This is a separate studio chat channel.",
      timestamp: "2:41 PM",
      isHighlighted: false,
      isHidden: false,
      isSelected: false,
    },
  ]);

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

  const handleStudioToggleHide = (messageId: string) => {
    setStudioMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isHidden: !msg.isHidden } : msg
      )
    );
  };

  const handleStudioToggleSelect = (messageId: string) => {
    setStudioMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isSelected: !msg.isSelected } : msg
      )
    );
  };

  const handleStudioDeleteMessage = (messageId: string) => {
    setStudioMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    toast({
      title: "Deleted",
      description: "Message deleted from studio chat",
    });
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

  const filteredStudioMessages = useMemo(() => {
    const query = studioSearchQuery.trim().toLowerCase();
    return studioMessages
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
  }, [studioMessages, studioSearchQuery]);

  const handleStartPrivateChat = (username: string) => {
    const existingChat = privateChats.find((chat) => chat.username === username);
    if (existingChat) {
      setSelectedChatId(existingChat.id);
    } else {
      const newChat: PrivateChat = {
        id: `chat-${Date.now()}`,
        username,
        messages: [],
      };
      setPrivateChats([...privateChats, newChat]);
      setSelectedChatId(newChat.id);
    }
  };

  const handleSendPrivateMessage = () => {
    if (!selectedChatId || !newMessage.trim()) return;

    const chat = privateChats.find((c) => c.id === selectedChatId);
    if (chat) {
      const message = {
        id: `msg-${Date.now()}`,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        isFromAdmin: true,
      };
      setPrivateChats(
        privateChats.map((c) =>
          c.id === selectedChatId
            ? { ...c, messages: [...c.messages, message] }
            : c
        )
      );
      setNewMessage("");
      toast({
        title: "Message sent",
        description: `Message sent to ${chat.username}`,
      });
    }
  };

  const selectedChat = privateChats.find((c) => c.id === selectedChatId);
  const uniqueUsers = useMemo(() => {
    const users = new Set(messages.map((msg) => msg.username));
    return Array.from(users);
  }, [messages]);

  // Auto scroll for Comments tab - only when Comments tab is active
  useEffect(() => {
    if (activeTab === "comments" && autoScroll && filteredMessages.length > 0) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Double-check tab is still active before scrolling
          if (activeTab === "comments" && autoScroll) {
            scrollToBottom(commentsScrollRef);
          }
        }, 50);
      });
    }
  }, [filteredMessages.length, autoScroll, activeTab]);

  // Auto scroll for Studio Chat tab - only when Studio Chat tab is active
  useEffect(() => {
    if (activeTab === "studio" && studioAutoScroll && filteredStudioMessages.length > 0) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Double-check tab is still active before scrolling
          if (activeTab === "studio" && studioAutoScroll) {
            scrollToBottom(studioScrollRef);
          }
        }, 50);
      });
    }
  }, [filteredStudioMessages.length, studioAutoScroll, activeTab]);

  // Scroll to bottom when switching to Comments tab if auto-scroll is enabled
  useEffect(() => {
    const prevTab = prevActiveTabRef.current;
    prevActiveTabRef.current = activeTab;
    
    if (activeTab === "comments" && prevTab !== "comments" && autoScroll && filteredMessages.length > 0) {
      setTimeout(() => scrollToBottom(commentsScrollRef), 100);
    }
  }, [activeTab, autoScroll, filteredMessages.length]);

  // Scroll to bottom when switching to Studio Chat tab if auto-scroll is enabled
  useEffect(() => {
    const prevTab = prevActiveTabRef.current;
    
    if (activeTab === "studio" && prevTab !== "studio" && studioAutoScroll && filteredStudioMessages.length > 0) {
      setTimeout(() => scrollToBottom(studioScrollRef), 100);
    }
  }, [activeTab, studioAutoScroll, filteredStudioMessages.length]);

  // Comments Tab Content
  const renderCommentsContent = () => (
    <div className="flex-1 flex flex-col space-y-2">
          {/* Search Bar & Auto Scroll Toggle */}
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
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={autoScroll ? "default" : "outline"}
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      const newAutoScroll = !autoScroll;
                      handleAutoScrollChange(newAutoScroll);
                      if (newAutoScroll) {
                        // Immediately scroll to bottom when enabling
                        setTimeout(() => scrollToBottom(commentsScrollRef), 100);
                      }
                    }}
                  >
                    <img 
                      src="/auto-scroll-icon.svg" 
                      alt="Auto scroll" 
                      className="w-3 h-3"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{autoScroll ? "Auto scroll enabled" : "Auto scroll disabled"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Chat Feed */}
          <ScrollArea className="flex-1 pr-2">
            <div ref={commentsScrollRef} className="space-y-2">
              {filteredMessages.map((msg) => {
                const blocked = isUserBlocked(msg.username);
                return (
                  <div
                    key={msg.id}
                    className={`group p-2.5 rounded-lg surface-elevated border border-border hover:border-primary/60 transition-all ${
                      msg.isHighlighted ? "bg-primary/10 border-primary/30" : ""
                    } ${blocked ? "opacity-50" : ""} ${msg.isSelected ? "border-primary/50 bg-primary/5" : ""}`}
                  >
                    <div className="flex flex-col gap-1.5">
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

  // Studio Chat Tab Content
  const renderStudioChatContent = () => (
    <div className="flex-1 flex flex-col space-y-2">
          {/* Search Bar & Auto Scroll Toggle */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={studioSearchQuery}
                onChange={(e) => setStudioSearchQuery(e.target.value)}
                className="pl-8 h-7 text-xs"
              />
            </div>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={studioAutoScroll ? "default" : "outline"}
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      const newStudioAutoScroll = !studioAutoScroll;
                      handleStudioAutoScrollChange(newStudioAutoScroll);
                      if (newStudioAutoScroll) {
                        // Immediately scroll to bottom when enabling
                        setTimeout(() => scrollToBottom(studioScrollRef), 100);
                      }
                    }}
                  >
                    <img 
                      src="/auto-scroll-icon.svg" 
                      alt="Auto scroll" 
                      className="w-3 h-3"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{studioAutoScroll ? "Auto scroll enabled" : "Auto scroll disabled"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Chat Feed */}
          <ScrollArea className="flex-1 pr-2">
            <div ref={studioScrollRef} className="space-y-2">
              {filteredStudioMessages.map((msg) => {
                const blocked = isUserBlocked(msg.username);
                return (
                  <div
                    key={msg.id}
                    className={`group p-2.5 rounded-lg surface-elevated border border-border hover:border-primary/60 transition-all ${
                      msg.isHighlighted ? "bg-primary/10 border-primary/30" : ""
                    } ${blocked ? "opacity-50" : ""} ${msg.isSelected ? "border-primary/50 bg-primary/5" : ""}`}
                  >
                    <div className="flex flex-col gap-1.5">
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
                            onClick={() => handleStudioToggleHide(msg.id)}
                            title="Hide"
                          >
                            <EyeOff className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleStudioToggleSelect(msg.id)}
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
                            onClick={() => handleStudioDeleteMessage(msg.id)}
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
              {filteredStudioMessages.length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No messages found.
                </div>
              )}
            </div>
          </ScrollArea>
    </div>
  );

  // Private Chats Tab Content
  const renderPrivateChatsContent = () => (
    <div className="flex-1 flex flex-col">
          <div className="flex gap-4 h-full">
            {/* User List */}
            <div className="w-1/3 border-r border-border pr-4">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-foreground mb-2">Select User</h3>
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-1">
                    {uniqueUsers.map((username) => {
                      const chat = privateChats.find((c) => c.username === username);
                      const hasUnread = chat && chat.messages.some((m) => !m.isFromAdmin);
                      return (
                        <Button
                          key={username}
                          variant={selectedChatId === chat?.id ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start h-auto py-2 text-xs"
                          onClick={() => handleStartPrivateChat(username)}
                        >
                          <User className="w-3 h-3 mr-2" />
                          <span className="flex-1 text-left">{username}</span>
                          {hasUnread && (
                            <span className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  <div className="border-b border-border pb-2 mb-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {selectedChat.username}
                    </h3>
                  </div>
                  <ScrollArea className="flex-1 pr-2 mb-2">
                    <div className="space-y-2">
                      {selectedChat.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] p-2 rounded-lg ${
                              msg.isFromAdmin
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-xs">{msg.message}</p>
                            <span className="text-[10px] opacity-70 mt-1 block">
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                      {selectedChat.messages.length === 0 && (
                        <div className="text-center text-xs text-muted-foreground py-8">
                          No messages yet. Start the conversation!
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendPrivateMessage();
                        }
                      }}
                      className="flex-1 min-h-[60px] text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendPrivateMessage}
                      disabled={!newMessage.trim()}
                      className="h-[60px]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Select a user to start a private chat
                </div>
              )}
            </div>
          </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {activeTab === "comments" && renderCommentsContent()}
      {activeTab === "studio" && renderStudioChatContent()}
      {activeTab === "private" && renderPrivateChatsContent()}
    </div>
  );
}
