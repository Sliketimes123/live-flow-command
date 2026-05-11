import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Star, Eye, EyeOff, Copy, Check, Trash2, ArrowRight, User, Ban, MessageSquare, Pin, PinOff, ChevronsDown } from "lucide-react";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isHighlighted?: boolean;
  isHidden?: boolean;
  isPinned?: boolean;
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
  onTogglePin?: (messageId: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onCopy?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  activeTab?: "comments" | "studio" | "private";
  autoScroll?: boolean;
  onAutoScrollChange?: (enabled: boolean) => void;
  onSendCommentMessage?: (message: string) => void;
  onMessageCountChange?: (count: number) => void;
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
  onTogglePin,
  onToggleSelect,
  onCopy,
  onDeleteMessage,
  activeTab = "comments",
  autoScroll: propAutoScroll,
  onAutoScrollChange,
  onSendCommentMessage,
  onMessageCountChange,
}: ChatModerationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [studioSearchQuery, setStudioSearchQuery] = useState("");
  // Fallback to internal state if props not provided (for backward compatibility)
  // Default to disabled (false)
  const [internalAutoScroll, setInternalAutoScroll] = useState(false);
  const [internalStudioAutoScroll, setInternalStudioAutoScroll] = useState(false);
  const [showHiddenComments, setShowHiddenComments] = useState(false);
  const [showHiddenStudio, setShowHiddenStudio] = useState(false);

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
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [newStudioMessage, setNewStudioMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedUserToBlock, setSelectedUserToBlock] = useState<string | null>(null);
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
      isPinned: false,
      isSelected: false,
    },
    {
      id: "studio-2",
      username: "StudioUser2",
      message: "This is a separate studio chat channel.",
      timestamp: "2:41 PM",
      isHighlighted: false,
      isHidden: false,
      isPinned: false,
      isSelected: false,
    },
  ]);

  const isUserBlocked = (username: string) => {
    return blockedUsers.some((user) => user.username === username);
  };

  const handleBlockRequest = (username: string) => {
    setSelectedUserToBlock(username);
    setIsConfirmBlockOpen(true);
  };

  const handleConfirmBlock = () => {
    if (selectedUserToBlock) {
      onBlockUser?.(selectedUserToBlock);
      toast({
        title: "User blocked",
        description: `${selectedUserToBlock} has been blocked.`,
      });
    }
    setIsConfirmBlockOpen(false);
    setSelectedUserToBlock(null);
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

  const handleTogglePin = (messageId: string) => {
    onTogglePin?.(messageId);
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

  const handleStudioTogglePin = (messageId: string) => {
    setStudioMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
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
      .filter((msg) => showHiddenComments || !msg.isHidden)
      .filter((msg) => {
        if (!query) return true;
        return (
          msg.username.toLowerCase().includes(query) ||
          msg.message.toLowerCase().includes(query) ||
          msg.timestamp.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isSelected && !b.isSelected) return -1;
        if (!a.isSelected && b.isSelected) return 1;
        return 0;
      });
  }, [messages, searchQuery, showHiddenComments]);

  const filteredStudioMessages = useMemo(() => {
    const query = studioSearchQuery.trim().toLowerCase();
    return studioMessages
      .filter((msg) => showHiddenStudio || !msg.isHidden)
      .filter((msg) => {
        if (!query) return true;
        return (
          msg.username.toLowerCase().includes(query) ||
          msg.message.toLowerCase().includes(query) ||
          msg.timestamp.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isSelected && !b.isSelected) return -1;
        if (!a.isSelected && b.isSelected) return 1;
        return 0;
      });
  }, [studioMessages, studioSearchQuery, showHiddenStudio]);

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

  const handleSendCommentMessage = () => {
    if (!newCommentMessage.trim()) return;

    onSendCommentMessage?.(newCommentMessage.trim());
    setNewCommentMessage("");
    toast({
      title: "Message sent",
      description: "Your message was posted to comments",
    });
  };

  const handleSendStudioMessage = () => {
    if (!newStudioMessage.trim()) return;

    const moderatorMessage: ChatMessage = {
      id: `studio-mod-${Date.now()}`,
      username: "Moderator",
      message: newStudioMessage.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isHighlighted: false,
      isHidden: false,
      isPinned: false,
      isSelected: false,
    };

    setStudioMessages((prev) => [...prev, moderatorMessage]);
    setNewStudioMessage("");
    toast({
      title: "Message sent",
      description: "Your message was posted to studio chat",
    });
  };

  const selectedChat = privateChats.find((c) => c.id === selectedChatId);
  const privateMessageCount = useMemo(
    () => privateChats.reduce((sum, chat) => sum + chat.messages.length, 0),
    [privateChats]
  );
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

  useEffect(() => {
    if (!onMessageCountChange) return;

    if (activeTab === "comments") {
      onMessageCountChange(messages.length);
      return;
    }

    if (activeTab === "studio") {
      onMessageCountChange(studioMessages.length);
      return;
    }

    if (activeTab === "private") {
      onMessageCountChange(privateMessageCount);
    }
  }, [
    activeTab,
    messages.length,
    studioMessages.length,
    privateMessageCount,
    onMessageCountChange,
  ]);

  // Comments Tab Content
  const renderCommentsContent = () => (
    <div className="flex-1 flex flex-col space-y-2 h-full overflow-hidden">
      {/* Search Bar & Auto Scroll Toggle */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center px-1 pt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-lg border-border/50 bg-muted/30 pl-9 pr-3 text-xs"
          />
        </div>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={autoScroll ? "default" : "outline"}
                className={`group h-9 w-9 p-0 rounded-lg border border-border/50 ${
                  autoScroll
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                onClick={() => {
                  const newAutoScroll = !autoScroll;
                  handleAutoScrollChange(newAutoScroll);
                  if (newAutoScroll) {
                    // Immediately scroll to bottom when enabling
                    setTimeout(() => scrollToBottom(commentsScrollRef), 100);
                  }
                }}
              >
                <ChevronsDown className="w-3.5 h-3.5 text-current" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{autoScroll ? "Auto scroll enabled" : "Auto scroll disabled"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={showHiddenComments ? "default" : "outline"}
                className="h-9 px-3 text-xs rounded-lg border-border/50 bg-muted/30"
                onClick={() => setShowHiddenComments((prev) => !prev)}
              >
                {showHiddenComments ? "Hide hidden" : "Show hidden"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showHiddenComments ? "Showing hidden messages" : "Hidden messages are filtered out"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Chat Feed */}
      <ScrollArea className="flex-1 min-h-0 pr-2">
        <div ref={commentsScrollRef} className="space-y-1.5">
          {filteredMessages.map((msg) => {
            const blocked = isUserBlocked(msg.username);
            return (
              <div
                key={msg.id}
                className={`group p-2 rounded-lg bg-card/90 border border-border/70 hover:border-primary/40 transition-all ${msg.isHighlighted ? "bg-primary/10 border-primary/30" : ""
                  } ${blocked ? "opacity-50" : ""} ${msg.isPinned ? "border-primary/50 bg-primary/10" : ""} ${msg.isSelected ? "ring-1 ring-primary/35" : ""}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center flex-wrap gap-1.5">
                        {msg.isPinned && (
                          <Pin className="w-3 h-3 text-primary" />
                        )}
                        {msg.isSelected && (
                          <Star className="w-3 h-3 text-primary fill-primary" />
                        )}
                        <span className="font-bold text-foreground text-xs">
                          {msg.username}
                        </span>
                        <span className="text-[11px] text-muted-foreground/90 tracking-wide font-mono">
                          {msg.timestamp}
                        </span>
                        {msg.isHighlighted && (
                          <Star className="w-3 h-3 text-primary fill-primary" />
                        )}
                        {blocked && (
                          <span className="text-[10px] text-destructive font-medium uppercase">(Blocked)</span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/90 leading-snug break-words">
                        {msg.message}
                      </p>
                    </div>
                    {/* Action Icons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleToggleHide(msg.id)}
                        title={msg.isHidden ? "Unhide" : "Hide"}
                      >
                        {msg.isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="group/unpin h-6 w-6 p-0"
                        onClick={() => handleTogglePin(msg.id)}
                        title={msg.isPinned ? "Unpin" : "Pin"}
                      >
                        {msg.isPinned ? (
                          <PinOff className="w-3 h-3 !text-black transition-colors group-hover/unpin:!text-white group-focus-visible/unpin:!text-white" />
                        ) : (
                          <Pin className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleToggleSelect(msg.id)}
                        title={msg.isSelected ? "Unselect" : "Select"}
                      >
                        <Star className={`w-3 h-3 ${msg.isSelected ? "text-primary fill-primary" : ""}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
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
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => onDeleteMessage?.(msg.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => handleBlockRequest(msg.username)}
                        title={blocked ? "User is blocked" : "Block user"}
                        disabled={blocked}
                      >
                        <Ban className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredMessages.length === 0 && (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No messages found.
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="sticky bottom-0 z-10 flex min-w-0 shrink-0 gap-2 border-t border-border/50 bg-card/95 px-1 pb-1 pt-2 backdrop-blur-sm">
        <Input
          placeholder="Send announcement to live chat..."
          value={newCommentMessage}
          onChange={(e) => setNewCommentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendCommentMessage();
            }
          }}
          className="h-9 min-w-0 flex-1 text-xs rounded-lg border-border/50 bg-muted/30"
        />
        <Button
          size="sm"
          onClick={handleSendCommentMessage}
          disabled={!newCommentMessage.trim()}
          className="h-9 w-9 p-0 rounded-lg"
          title="Send message"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  // Studio Chat Tab Content
  const renderStudioChatContent = () => (
    <div className="flex-1 flex flex-col space-y-2 h-full overflow-hidden">
      {/* Search Bar & Auto Scroll Toggle */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center px-1 pt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={studioSearchQuery}
            onChange={(e) => setStudioSearchQuery(e.target.value)}
            className="h-9 rounded-lg border-border/50 bg-muted/30 pl-9 pr-3 text-xs"
          />
        </div>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={studioAutoScroll ? "default" : "outline"}
                className={`group h-9 w-9 p-0 rounded-lg border border-border/50 ${
                  studioAutoScroll
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                onClick={() => {
                  const newStudioAutoScroll = !studioAutoScroll;
                  handleStudioAutoScrollChange(newStudioAutoScroll);
                  if (newStudioAutoScroll) {
                    // Immediately scroll to bottom when enabling
                    setTimeout(() => scrollToBottom(studioScrollRef), 100);
                  }
                }}
              >
                <ChevronsDown className="w-3.5 h-3.5 text-current" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{studioAutoScroll ? "Auto scroll enabled" : "Auto scroll disabled"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={showHiddenStudio ? "default" : "outline"}
                className="h-9 px-3 text-xs rounded-lg border-border/50 bg-muted/30"
                onClick={() => setShowHiddenStudio((prev) => !prev)}
              >
                {showHiddenStudio ? "Hide hidden" : "Show hidden"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showHiddenStudio ? "Showing hidden messages" : "Hidden messages are filtered out"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Chat Feed */}
      <ScrollArea className="flex-1 min-h-0 pr-2">
        <div ref={studioScrollRef} className="space-y-1.5">
          {filteredStudioMessages.map((msg) => {
            const blocked = isUserBlocked(msg.username);
            return (
              <div
                key={msg.id}
                className={`group p-2 rounded-lg bg-card/90 border border-border/70 hover:border-primary/40 transition-all ${msg.isHighlighted ? "bg-primary/10 border-primary/30" : ""
                  } ${blocked ? "opacity-50" : ""} ${msg.isPinned ? "border-primary/50 bg-primary/10" : ""} ${msg.isSelected ? "ring-1 ring-primary/35" : ""}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center flex-wrap gap-1.5">
                        {msg.isPinned && (
                          <Pin className="w-3 h-3 text-primary" />
                        )}
                        {msg.isSelected && (
                          <Star className="w-3 h-3 text-primary fill-primary" />
                        )}
                        <span className="font-bold text-foreground text-xs">
                          {msg.username}
                        </span>
                        <span className="text-[11px] text-muted-foreground/90 tracking-wide font-mono">
                          {msg.timestamp}
                        </span>
                        {msg.isHighlighted && (
                          <Star className="w-3 h-3 text-primary fill-primary" />
                        )}
                        {blocked && (
                          <span className="text-[10px] text-destructive font-medium uppercase">(Blocked)</span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/90 leading-snug break-words">
                        {msg.message}
                      </p>
                    </div>
                    {/* Action Icons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleStudioToggleHide(msg.id)}
                        title={msg.isHidden ? "Unhide" : "Hide"}
                      >
                        {msg.isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="group/unpin h-6 w-6 p-0"
                        onClick={() => handleStudioTogglePin(msg.id)}
                        title={msg.isPinned ? "Unpin" : "Pin"}
                      >
                        {msg.isPinned ? (
                          <PinOff className="w-3 h-3 !text-black transition-colors group-hover/unpin:!text-white group-focus-visible/unpin:!text-white" />
                        ) : (
                          <Pin className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleStudioToggleSelect(msg.id)}
                        title={msg.isSelected ? "Unselect" : "Select"}
                      >
                        <Star className={`w-3 h-3 ${msg.isSelected ? "text-primary fill-primary" : ""}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
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
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => handleStudioDeleteMessage(msg.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => handleBlockRequest(msg.username)}
                        title={blocked ? "User is blocked" : "Block user"}
                        disabled={blocked}
                      >
                        <Ban className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredStudioMessages.length === 0 && (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No messages found.
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="sticky bottom-0 z-10 flex min-w-0 shrink-0 gap-2 border-t border-border/50 bg-card/95 px-1 pb-1 pt-2 backdrop-blur-sm">
        <Input
          placeholder="Send internal studio message..."
          value={newStudioMessage}
          onChange={(e) => setNewStudioMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendStudioMessage();
            }
          }}
          className="h-9 min-w-0 flex-1 text-xs rounded-lg border-border/50 bg-muted/30"
        />
        <Button
          size="sm"
          onClick={handleSendStudioMessage}
          disabled={!newStudioMessage.trim()}
          className="h-9 w-9 p-0 rounded-lg"
          title="Send message"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  // Private Chats Tab Content
  const renderPrivateChatsContent = () => (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex gap-3 h-full min-h-0">
        {/* User List */}
        <div className="w-1/3 border-r border-border pr-2 min-h-0">
          <div className="space-y-2 h-full min-h-0 flex flex-col">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Users</h3>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-1">
                {uniqueUsers.map((username) => {
                  const chat = privateChats.find((c) => c.username === username);
                  const hasUnread = chat && chat.messages.some((m) => !m.isFromAdmin);
                  return (
                    <Button
                      key={username}
                      variant={selectedChatId === chat?.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start h-9 px-2.5 text-xs rounded-lg"
                      onClick={() => handleStartPrivateChat(username)}
                    >
                      <User className="w-3 h-3 mr-2" />
                      <span className="flex-1 text-left truncate">{username}</span>
                      {hasUnread && (
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 pb-2">
          {selectedChat ? (
            <>
              <div className="border-b border-border pb-2 mb-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <User className="w-3 h-3 text-muted-foreground" />
                  {selectedChat.username}
                </h3>
              </div>
              <ScrollArea className="flex-1 min-h-0 pr-2 mb-2">
                <div className="space-y-2">
                  {selectedChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-2 rounded-lg ${msg.isFromAdmin
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                          }`}
                      >
                        <p className="text-xs leading-snug">{msg.message}</p>
                        <span className="text-[10px] opacity-70 mt-0.5 block font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                  {selectedChat.messages.length === 0 && (
                    <div className="text-center text-[10px] text-muted-foreground py-8">
                      No messages yet.
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex min-w-0 shrink-0 gap-2 px-1 pb-1 pt-1">
                <Input
                  placeholder="Type message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrivateMessage();
                    }
                  }}
                  className="h-9 min-w-0 flex-1 text-xs rounded-lg border-border/50 bg-muted/30"
                />
                <Button
                  size="sm"
                  onClick={handleSendPrivateMessage}
                  disabled={!newMessage.trim()}
                  className="h-9 w-9 p-0 rounded-lg"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 px-4">
              <MessageSquare className="w-8 h-8 opacity-20" />
              <span className="text-xs font-medium text-foreground/80">Select a user to start chatting</span>
              <span className="text-[11px] text-muted-foreground/90">Pick someone from the Users list to open a private thread.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full">
        {activeTab === "comments" && renderCommentsContent()}
        {activeTab === "studio" && renderStudioChatContent()}
        {activeTab === "private" && renderPrivateChatsContent()}
      </div>

      {/* Confirm Block Dialog */}
      <AlertDialog open={isConfirmBlockOpen} onOpenChange={setIsConfirmBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you wish to continue?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {selectedUserToBlock}? This action will restrict their participation in the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsConfirmBlockOpen(false);
              setSelectedUserToBlock(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBlock} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
