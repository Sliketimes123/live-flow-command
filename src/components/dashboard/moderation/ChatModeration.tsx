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
  type ComposerMessageType,
  type StudioUser,
  type StudioChatTarget,
} from "./ModerationMessagePanel";
import { useModerationStore } from "@/contexts/ModerationStoreContext";

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
  onSendCommentMessage?: (message: string, messageType: ComposerMessageType) => void;
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
  const [activeStudioTarget, setActiveStudioTarget] = useState<StudioChatTarget>({ type: "broadcast" });
  const [privateStudioMessages, setPrivateStudioMessages] = useState<Record<string, ChatMessage[]>>({});
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

  // Studio messages and users come from the shared moderation store
  const { studioMessages, setStudioMessages, studioUsers } = useModerationStore();

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

  const activeStudioMessages = useMemo(() => {
    const query = studioSearchQuery.trim().toLowerCase();
    const msgs =
      activeStudioTarget.type === "broadcast"
        ? studioMessages
        : (privateStudioMessages[activeStudioTarget.userId] ?? []);
    return msgs.filter((msg) => {
      if (!query) return true;
      return (
        msg.username.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query) ||
        msg.timestamp.toLowerCase().includes(query)
      );
    });
  }, [activeStudioTarget, studioMessages, privateStudioMessages, studioSearchQuery]);

  const handleSendCommentMessage = (messageType: ComposerMessageType = "broadcast") => {
    if (!newCommentMessage.trim()) return;

    onSendCommentMessage?.(newCommentMessage.trim(), messageType);
    setNewCommentMessage("");
    toast({
      title: messageType === "pinned" ? "Message pinned" : "Message sent",
      description:
        messageType === "pinned"
          ? "Your message was pinned to the top of chat"
          : "Your message was posted to comments",
    });
  };

  const handleSendStudioMessage = () => {
    if (!newStudioMessage.trim()) return;

    const msg: ChatMessage = {
      id: `studio-${activeStudioTarget.type === "private" ? `dm-${activeStudioTarget.userId}-` : "mod-"}${Date.now()}`,
      username: "Moderator",
      message: newStudioMessage.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isHighlighted: false,
      isHidden: false,
      isPinned: false,
      isSelected: false,
    };

    if (activeStudioTarget.type === "broadcast") {
      setStudioMessages((prev) => [...prev, msg]);
      toast({ title: "Message sent", description: "Your message was posted to studio chat" });
    } else {
      const userId = activeStudioTarget.userId;
      setPrivateStudioMessages((prev) => ({
        ...prev,
        [userId]: [...(prev[userId] ?? []), msg],
      }));
      toast({ title: "Message sent", description: `Message sent to ${activeStudioTarget.username}` });
    }
    setNewStudioMessage("");
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
    if (activeTab === "studio" && studioAutoScrollActive && activeStudioMessages.length > 0) {
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
  }, [activeStudioMessages.length, studioAutoScrollActive, activeTab]);

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

    if (activeTab === "studio" && prevTab !== "studio" && studioAutoScrollActive && activeStudioMessages.length > 0) {
      setTimeout(() => scrollToBottom(studioScrollRef), 100);
    }
  }, [activeTab, studioAutoScrollActive, activeStudioMessages.length]);

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

  const handleStudioSelectUser = (userId: string, username: string) => {
    const user = studioUsers.find((u) => u.id === userId);
    setActiveStudioTarget({
      type: "private",
      userId,
      username,
      role: user?.role,
      status: user?.status,
    });
  };

  // Studio Chat Tab Content
  const renderStudioChatContent = () => (
    <ModerationMessagePanel
      variant={variant}
      chatChannel="studio"
      messages={activeStudioMessages}
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
      composerPlaceholder={
        activeStudioTarget.type === "broadcast"
          ? "Send internal studio message..."
          : `Message ${activeStudioTarget.username} privately...`
      }
      composerValue={newStudioMessage}
      onComposerChange={setNewStudioMessage}
      onComposerSend={handleSendStudioMessage}
      composerSendDisabled={!newStudioMessage.trim()}
      studioUsers={studioUsers}
      studioActiveTarget={activeStudioTarget}
      onStudioSelectBroadcast={() => setActiveStudioTarget({ type: "broadcast" })}
      onStudioSelectUser={handleStudioSelectUser}
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
