import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ModerationWorkspace } from "@/components/dashboard/ModerationWorkspace";
import type { ChatMessage, BlockedUser } from "@/components/dashboard/moderation/ChatModeration";
import {
  createDefaultModerationSession,
  loadModerationSession,
  saveModerationSession,
  type ModerationSessionSnapshot,
  type ModerationTab,
} from "@/lib/moderationSession";

function parseTab(value: string | null): ModerationTab | undefined {
  if (value === "comments" || value === "qa" || value === "studio") {
    return value;
  }
  return undefined;
}

const ModerationViewPage = () => {
  const { eventId: eventIdParam } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const eventId = eventIdParam ?? "unknown";

  const initialSnapshot = useMemo(() => {
    return loadModerationSession(eventId) ?? createDefaultModerationSession(eventId);
  }, [eventId]);

  const tabFromQuery = parseTab(searchParams.get("tab"));
  const initialTab = tabFromQuery ?? initialSnapshot.activeTab ?? "comments";

  const [session, setSession] = useState<ModerationSessionSnapshot>(() => ({
    ...initialSnapshot,
    activeTab: initialTab,
  }));
  const [messages, setMessages] = useState<ChatMessage[]>(initialSnapshot.messages);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(initialSnapshot.blockedUsers);
  const [notifications, setNotifications] = useState(initialSnapshot.notifications);
  const [elapsedTime, setElapsedTime] = useState(initialSnapshot.elapsedTime);
  const [activeTab, setActiveTab] = useState<ModerationTab>(initialTab);
  const [qaQueueCount, setQaQueueCount] = useState(0);
  const [studioCount, setStudioCount] = useState(0);

  const persistSession = useCallback(
    (patch: Partial<ModerationSessionSnapshot> = {}) => {
      const next: ModerationSessionSnapshot = {
        ...session,
        messages,
        blockedUsers,
        notifications,
        elapsedTime,
        ...patch,
      };
      setSession(next);
      saveModerationSession(next);
    },
    [session, messages, blockedUsers, notifications, elapsedTime]
  );

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      document.documentElement.classList.toggle("dark", session.theme === "dark");
    }
  }, [session.theme]);

  useEffect(() => {
    if (!session.isLive) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const [h, m, s] = prev.split(":").map(Number);
        const totalSeconds = h * 3600 + m * 60 + s + 1;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session.isLive]);

  useEffect(() => {
    setSession((current) => {
      const next = { ...current, messages, blockedUsers, notifications, elapsedTime };
      saveModerationSession(next);
      return next;
    });
  }, [messages, blockedUsers, notifications, elapsedTime]);

  const handleBlockUser = (username: string) => {
    const isAlreadyBlocked = blockedUsers.some((user) => user.username === username);
    if (!isAlreadyBlocked) {
      setBlockedUsers([
        ...blockedUsers,
        {
          id: Date.now().toString(),
          username,
          blockedAt: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };

  const handleUnblockUser = (username: string) => {
    setBlockedUsers(blockedUsers.filter((user) => user.username !== username));
  };

  const handleToggleHide = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isHidden: !msg.isHidden } : msg))
    );
  };

  const handleTogglePin = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg))
    );
  };

  const handleToggleSelect = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isSelected: !msg.isSelected } : msg))
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const handleSendCommentMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `mod-${Date.now()}`,
        username: "Moderator",
        message,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isHighlighted: false,
        isHidden: false,
        isPinned: false,
        isSelected: false,
      },
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const moderationTabs = useMemo(
    () => [
      { key: "comments" as const, label: "Chat", count: messages.length, enabled: session.commentsEnabled },
      { key: "qa" as const, label: "Q&A", count: qaQueueCount, enabled: session.qnaEnabled },
      { key: "studio" as const, label: "Studio Chat", count: studioCount, enabled: true },
    ],
    [messages.length, qaQueueCount, studioCount, session.commentsEnabled, session.qnaEnabled],
  );

  useEffect(() => {
    if (activeTab === "comments" && !session.commentsEnabled) {
      setActiveTab(session.qnaEnabled ? "qa" : "studio");
      return;
    }
    if (activeTab === "qa" && !session.qnaEnabled) {
      setActiveTab(session.commentsEnabled ? "comments" : "studio");
    }
  }, [activeTab, session.commentsEnabled, session.qnaEnabled]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <DashboardHeader
        mode="moderation"
        isLive={session.isLive}
        isPaused={session.isPaused}
        eventTitle={session.eventTitle}
        eventId={session.eventId}
        elapsedTime={elapsedTime}
        concurrentUsers={session.concurrentUsers}
        totalUsers={session.totalUsers}
        audienceCountEnabled={session.audienceCountEnabled}
        isRecording={false}
        onStart={() => undefined}
        onStop={() => undefined}
        onSettings={() => undefined}
        onStartRecording={() => undefined}
        onEndEvent={() => undefined}
        notifications={notifications}
        onMarkAllNotificationsRead={markAllNotificationsRead}
        moderationTabs={moderationTabs}
        activeModerationTab={activeTab}
        onModerationTabChange={setActiveTab}
      />

      <main className="min-h-0 flex-1 overflow-hidden">
        <ModerationWorkspace
          messages={messages}
          blockedUsers={blockedUsers}
          commentsEnabled={session.commentsEnabled}
          qnaEnabled={session.qnaEnabled}
          activeTab={activeTab}
          onBlockUser={handleBlockUser}
          onUnblockUser={handleUnblockUser}
          onToggleHide={handleToggleHide}
          onTogglePin={handleTogglePin}
          onToggleSelect={handleToggleSelect}
          onDeleteMessage={handleDeleteMessage}
          onSendCommentMessage={handleSendCommentMessage}
          onTabViewed={(tab) => persistSession({ activeTab: tab })}
          onQaQueueCountChange={setQaQueueCount}
          onStudioCountChange={setStudioCount}
        />
      </main>

    </div>
  );
};

export default ModerationViewPage;
