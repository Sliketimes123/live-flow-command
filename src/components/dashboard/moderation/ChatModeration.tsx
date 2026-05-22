import { Button } from "@/components/ui/button";
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
import { useMemo, useState, useRef, useEffect, type RefObject } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ModerationMessagePanel,
  type ChatPanelVariant,
  type ModerationChatLayout,
} from "./ModerationMessagePanel";

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
  variant?: ChatPanelVariant;
  messages: ChatMessage[];
  blockedUsers: BlockedUser[];
  onBlockUser?: (username: string) => void;
  onUnblockUser?: (username: string) => void;
  onToggleHide?: (messageId: string) => void;
  onTogglePin?: (messageId: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onCopy?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  activeTab?: "comments" | "studio";
  autoScroll?: boolean;
  onAutoScrollChange?: (enabled: boolean) => void;
  onSendCommentMessage?: (message: string) => void;
  onMessageCountChange?: (count: number) => void;
}

export function ChatModeration({
  variant = "sidebar",
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
  const [commentChatLayout, setCommentChatLayout] = useState<ModerationChatLayout>("row");
  const [studioChatLayout, setStudioChatLayout] = useState<ModerationChatLayout>("row");
  const [commentsAutoScrollPaused, setCommentsAutoScrollPaused] = useState(false);
  const [studioAutoScrollPaused, setStudioAutoScrollPaused] = useState(false);

  // Use prop if provided for the active tab, otherwise fall back to internal state
  const autoScroll = activeTab === "comments" && propAutoScroll !== undefined
    ? propAutoScroll
    : internalAutoScroll;
  const studioAutoScroll = activeTab === "studio" && propAutoScroll !== undefined
    ? propAutoScroll
    : internalStudioAutoScroll;

  const commentsAutoScrollActive = autoScroll && !commentsAutoScrollPaused;
  const studioAutoScrollActive = studioAutoScroll && !studioAutoScrollPaused;

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
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [newStudioMessage, setNewStudioMessage] = useState("");
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedUserToBlock, setSelectedUserToBlock] = useState<string | null>(null);
  const commentsScrollRef = useRef<HTMLDivElement>(null);
  const studioScrollRef = useRef<HTMLDivElement>(null);
  const prevActiveTabRef = useRef<string | undefined>(activeTab);
  const { toast } = useToast();

  const scrollToBottom = (ref: RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const radixViewport = ref.current.closest(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement | null;
    const scrollEl = radixViewport ?? ref.current;
    scrollEl.scrollTop = scrollEl.scrollHeight;
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
    if (activeTab === "studio") return;
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

  const handleStudioDeleteMessage = (messageId: string) => {
    setStudioMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    toast({
      title: "Deleted",
      description: "Message deleted from studio chat",
    });
  };

  const hiddenMessages = useMemo(
    () => messages.filter((msg) => msg.isHidden),
    [messages],
  );

  const selectedMessages = useMemo(
    () => messages.filter((msg) => msg.isSelected),
    [messages],
  );

  const visibleMessages = useMemo(() => {
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
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isSelected && !b.isSelected) return -1;
        if (!a.isSelected && b.isSelected) return 1;
        return 0;
      });
  }, [messages, searchQuery]);

  const filteredStudioMessages = useMemo(() => {
    const query = studioSearchQuery.trim().toLowerCase();
    return studioMessages.filter((msg) => {
      if (!query) return true;
      return (
        msg.username.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query) ||
        msg.timestamp.toLowerCase().includes(query)
      );
    });
  }, [studioMessages, studioSearchQuery]);

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

  // Auto scroll for Comments tab - only when Comments tab is active
  useEffect(() => {
    if (activeTab === "comments" && commentsAutoScrollActive && visibleMessages.length > 0) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Double-check tab is still active before scrolling
          if (activeTab === "comments" && commentsAutoScrollActive) {
            scrollToBottom(commentsScrollRef);
          }
        }, 50);
      });
    }
  }, [visibleMessages.length, commentsAutoScrollActive, activeTab]);

  // Auto scroll for Studio Chat tab - only when Studio Chat tab is active
  useEffect(() => {
    if (activeTab === "studio" && studioAutoScrollActive && filteredStudioMessages.length > 0) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Double-check tab is still active before scrolling
          if (activeTab === "studio" && studioAutoScrollActive) {
            scrollToBottom(studioScrollRef);
          }
        }, 50);
      });
    }
  }, [filteredStudioMessages.length, studioAutoScrollActive, activeTab]);

  // Scroll to bottom when switching to Comments tab if auto-scroll is enabled
  useEffect(() => {
    const prevTab = prevActiveTabRef.current;
    prevActiveTabRef.current = activeTab;

    if (activeTab === "comments" && prevTab !== "comments" && commentsAutoScrollActive && visibleMessages.length > 0) {
      setTimeout(() => scrollToBottom(commentsScrollRef), 100);
    }
  }, [activeTab, commentsAutoScrollActive, visibleMessages.length]);

  // Scroll to bottom when switching to Studio Chat tab if auto-scroll is enabled
  useEffect(() => {
    const prevTab = prevActiveTabRef.current;

    if (activeTab === "studio" && prevTab !== "studio" && studioAutoScrollActive && filteredStudioMessages.length > 0) {
      setTimeout(() => scrollToBottom(studioScrollRef), 100);
    }
  }, [activeTab, studioAutoScrollActive, filteredStudioMessages.length]);

  useEffect(() => {
    if (!onMessageCountChange) return;

    if (activeTab === "comments") {
      onMessageCountChange(messages.length);
      return;
    }

    if (activeTab === "studio") {
      onMessageCountChange(studioMessages.length);
    }
  }, [activeTab, messages.length, studioMessages.length, onMessageCountChange]);

  // Comments Tab Content
  const renderCommentsContent = () => (
    <ModerationMessagePanel
      variant={variant}
      chatChannel="comments"
      messages={visibleMessages}
      hiddenMessages={hiddenMessages}
      selectedMessages={selectedMessages}
      blockedUsers={blockedUsers}
      allMessages={messages}
      onUnblockUser={onUnblockUser}
      layout={variant === "sidebar" ? "row" : commentChatLayout}
      onLayoutChange={setCommentChatLayout}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      autoScroll={autoScroll}
      onAutoScrollChange={handleAutoScrollChange}
      onAutoScrollPauseChange={setCommentsAutoScrollPaused}
      scrollRef={commentsScrollRef}
      requestScrollToBottom={() => scrollToBottom(commentsScrollRef)}
      copiedMessageId={copiedMessageId}
      isUserBlocked={isUserBlocked}
      onToggleHide={handleToggleHide}
      onTogglePin={handleTogglePin}
      onToggleSelect={handleToggleSelect}
      onCopyMessage={handleCopy}
      onDeleteMessage={onDeleteMessage}
      onBlockRequest={handleBlockRequest}
      composerPlaceholder="Send announcement to live chat..."
      composerValue={newCommentMessage}
      onComposerChange={setNewCommentMessage}
      onComposerSend={handleSendCommentMessage}
      composerSendDisabled={!newCommentMessage.trim()}
    />
  );

  // Studio Chat Tab Content
  const renderStudioChatContent = () => (
    <ModerationMessagePanel
      variant={variant}
      chatChannel="studio"
      messages={filteredStudioMessages}
      layout={variant === "sidebar" ? "row" : studioChatLayout}
      onLayoutChange={setStudioChatLayout}
      searchQuery={studioSearchQuery}
      onSearchChange={setStudioSearchQuery}
      autoScroll={studioAutoScroll}
      onAutoScrollChange={handleStudioAutoScrollChange}
      onAutoScrollPauseChange={setStudioAutoScrollPaused}
      scrollRef={studioScrollRef}
      requestScrollToBottom={() => scrollToBottom(studioScrollRef)}
      copiedMessageId={copiedMessageId}
      onToggleHide={() => {}}
      onTogglePin={() => {}}
      onToggleSelect={() => {}}
      onCopyMessage={handleCopy}
      onDeleteMessage={handleStudioDeleteMessage}
      composerPlaceholder="Send internal studio message..."
      composerValue={newStudioMessage}
      onComposerChange={setNewStudioMessage}
      onComposerSend={handleSendStudioMessage}
      composerSendDisabled={!newStudioMessage.trim()}
    />
  );


  return (
    <>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          variant === "sidebar" ? "h-full" : "h-full min-h-0",
        )}
      >
        {activeTab === "comments" && renderCommentsContent()}
        {activeTab === "studio" && renderStudioChatContent()}
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
