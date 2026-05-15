import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ModerationWorkspace } from "@/components/dashboard/ModerationWorkspace";
import { StatusBar } from "@/components/dashboard/StatusBar";
import type { ChatMessage, BlockedUser } from "@/components/dashboard/moderation/ChatModeration";
import {
  createDefaultModerationSession,
  loadModerationSession,
  saveModerationSession,
  type ModerationSessionSnapshot,
  type ModerationTab,
} from "@/lib/moderationSession";

const DEFAULT_SOCIAL_DESTINATIONS = [
  {
    id: "1",
    channelName: "NBT UP-Uttarakhand",
    description: "Congress Press Conference by Supriya Shrinate Live | SIR Vote Chori | Rahul Gandhi",
    status: "ONLINE" as const,
    platform: "YouTube" as const,
    logo: "NBT",
    logoColor: "bg-black",
    textColor: "text-white",
    subText: "यूपी-उत्तराखंड",
    subTextColor: "text-red-600",
    isPublished: true,
  },
  {
    id: "2",
    channelName: "Navbharat Times नवभारत",
    description: "Congress Press Conference by Supriya Shrinate Live | SIR | BLO | Vote Chori | Rahul Gandhi | BJP",
    status: "ONLINE" as const,
    platform: "YouTube" as const,
    logo: "NBT",
    logoColor: "bg-red-600",
    textColor: "text-white",
    subText: "नवभारत टाइम्स",
    subTextColor: "text-white",
    isPublished: true,
  },
];

function parseTab(value: string | null): ModerationTab | undefined {
  if (value === "comments" || value === "qa" || value === "studio") {
    return value;
  }
  return undefined;
}

const ModerationViewPage = () => {
  const { eventId: eventIdParam } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [viewType] = useState<"input" | "output">("input");
  const [activeSource] = useState("Camera-1");

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

  const handleBack = () => {
    navigate("/");
  };

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
        onBack={handleBack}
        notifications={notifications}
        onMarkAllNotificationsRead={markAllNotificationsRead}
      />

      <main className="min-h-0 flex-1 overflow-hidden">
        <ModerationWorkspace
          messages={messages}
          blockedUsers={blockedUsers}
          commentsEnabled={session.commentsEnabled}
          qnaEnabled={session.qnaEnabled}
          initialTab={initialTab}
          onBlockUser={handleBlockUser}
          onUnblockUser={handleUnblockUser}
          onToggleHide={handleToggleHide}
          onTogglePin={handleTogglePin}
          onToggleSelect={handleToggleSelect}
          onDeleteMessage={handleDeleteMessage}
          onSendCommentMessage={handleSendCommentMessage}
          onTabViewed={(tab) => persistSession({ activeTab: tab })}
        />
      </main>

      <StatusBar
        publishingHealth={session.publishingHealth}
        bitrate={3500}
        fps={30}
        cpuUsage={45}
        messages={messages}
        blockedUsers={blockedUsers}
        onBlockUser={handleBlockUser}
        onUnblockUser={handleUnblockUser}
        onToggleSelect={handleToggleSelect}
        onDeleteMessage={handleDeleteMessage}
        viewType={viewType}
        activeSource={activeSource}
        commentsEnabled={session.commentsEnabled}
        socialDestinations={DEFAULT_SOCIAL_DESTINATIONS}
      />
    </div>
  );
};

export default ModerationViewPage;
