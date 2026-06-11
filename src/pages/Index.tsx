import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { EventHealthColumn } from "@/components/dashboard/EventHealthColumn";
import { OutputHealthColumn } from "@/components/dashboard/OutputHealthColumn";
import { RightModerationPanel } from "@/components/dashboard/RightModerationPanel";
import type { ComposerMessageType } from "@/components/dashboard/moderation/ModerationMessagePanel";
import {
  buildModerationViewPath,
  DEFAULT_EVENT_ID,
  saveModerationSession,
  type ModerationTab,
} from "@/lib/moderationSession";
import { useModerationStore } from "@/contexts/ModerationStoreContext";

type SocialDestination = {
  id: string;
  channelName: string;
  description: string;
  status: "ONLINE" | "OFFLINE";
  platform: "YouTube" | "Facebook";
  logo: string;
  logoColor: string;
  textColor: string;
  subText: string;
  subTextColor: string;
  isPublished: boolean;
};

/** Default width for expanded right moderation panel (px). */
const DEFAULT_MODERATION_COL_FRAC = 0.26;

/** Collapsed right section: ~52px rail + outer card border/padding */
const RIGHT_SECTION_COLLAPSED_PX = 60;

const EVENT_ID = DEFAULT_EVENT_ID;

const Index = () => {
  const MIN_RIGHT_WIDTH = 360;
  /** One `w-1` resizer + two `gap-2` gutters when the right panel is expanded. */
  const MAIN_ROW_FIXED_CHROME_PX = 4 + 2 * 8;

  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [isLive, setIsLive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:45:32");
  const [activeSource, setActiveSource] = useState("Camera-1");
  const [publishingHealth, setPublishingHealth] = useState<"stable" | "warning" | "poor">(
    "stable"
  );
  const [viewType, setViewType] = useState<"input" | "output">("input");
  const [concurrentUsers, setConcurrentUsers] = useState(3);
  const [totalUsers, setTotalUsers] = useState(9);
  const [isRecording, setIsRecording] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [audienceCountEnabled, setAudienceCountEnabled] = useState(true);
  const [reactionsEnabled, setReactionsEnabled] = useState(true);
  const [qnaEnabled, setQnaEnabled] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Shared moderation store — single source of truth for all windows
  const { chatMessages, setChatMessages, blockedUsers, blockUser, unblockUser } = useModerationStore();
  const [notificationFeed, setNotificationFeed] = useState<Array<{
    id: string;
    title: string;
    description: string;
    severity: "info" | "warning" | "critical";
    timestamp: string;
    isRead: boolean;
  }>>([]);
  const [alertBadges, setAlertBadges] = useState({
    comments: 0,
    studio: 0,
    qa: 0,
  });
  const [rightPanelWidth, setRightPanelWidth] = useState(0);
  const [isRightContentCollapsed, setIsRightContentCollapsed] = useState(false);
  const [resizingSide, setResizingSide] = useState<"right" | null>(null);
  const [socialDestinations] = useState<SocialDestination[]>([
    {
      id: "1",
      channelName: "NBT UP-Uttarakhand",
      description: "Congress Press Conference by Supriya Shrinate Live | SIR Vote Chori | Rahul Gandhi",
      status: "ONLINE",
      platform: "YouTube",
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
      status: "ONLINE",
      platform: "YouTube",
      logo: "NBT",
      logoColor: "bg-red-600",
      textColor: "text-white",
      subText: "नवभारत टाइम्स",
      subTextColor: "text-white",
      isPublished: true,
    },
    {
      id: "3",
      channelName: "Navbharat Times Online",
      description: "Congress Press Conference by Supriya Shrinate Live | SIR | BLO | Vote Chori | Rahul Gandhi | BJP",
      status: "ONLINE",
      platform: "Facebook",
      logo: "p",
      logoColor: "bg-gray-400",
      textColor: "text-white",
      subText: "",
      subTextColor: "",
      isPublished: true,
    },
    {
      id: "4",
      channelName: "NBT Uttar Pradesh",
      description: "Congress Press Conference by Supriya Shrinate Live | SIR | BLO | Vote Chori | Rahul Gandhi | BJP",
      status: "ONLINE",
      platform: "Facebook",
      logo: "p",
      logoColor: "bg-gray-400",
      textColor: "text-white",
      subText: "",
      subTextColor: "",
      isPublished: true,
    },
  ]);

  // Simulate elapsed time
  useEffect(() => {
    if (!isLive) return;

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
  }, [isLive]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
      return;
    }

    setTheme("dark");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleStart = () => {
    setIsLive(true);
    setIsPaused(false);
    setElapsedTime("00:00:00");
  };

  const handleStop = () => {
    setIsLive(false);
    setIsPaused(false);
    setIsRecording(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsLive(false);
  };

  const handleResume = () => {
    setIsPaused(false);
    setIsLive(true);
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  const handleStartRecording = () => {
    setIsRecording(!isRecording);
    console.log(isRecording ? "Recording stopped" : "Recording started");
  };

  const handleEndEvent = () => {
    setIsLive(false);
    setIsRecording(false);
    console.log("Event ended");
  };

  const handleToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const addNotification = (
    title: string,
    description: string,
    severity: "info" | "warning" | "critical",
    targetTabs: Array<"comments" | "studio" | "qa"> = []
  ) => {
    setNotificationFeed((prev) => [
      {
        id: `notif-${Date.now()}`,
        title,
        description,
        severity,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        isRead: false,
      },
      ...prev.slice(0, 49),
    ]);

    if (targetTabs.length > 0) {
      setAlertBadges((prev) => {
        const updated = { ...prev };
        targetTabs.forEach((tab) => {
          updated[tab] += 1;
        });
        return updated;
      });
    }

  };


  const handleBlockUser = (username: string) => {
    const isAlreadyBlocked = blockedUsers.some((user) => user.username === username);
    if (!isAlreadyBlocked) {
      blockUser(username);
      addNotification(
        "User blocked",
        `${username} was blocked by a moderator action.`,
        "warning",
        ["comments", "qa"]
      );
    }
  };

  const handleUnblockUser = (username: string) => {
    unblockUser(username);
  };

  const handleToggleHide = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isHidden: !msg.isHidden } : msg))
    );
  };

  const handleTogglePin = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg))
    );
  };

  const handleToggleSelect = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isSelected: !msg.isSelected } : msg))
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setChatMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const handleSendCommentMessage = (message: string, messageType: ComposerMessageType = "broadcast") => {
    const moderatorMessage = {
      id: `mod-${Date.now()}`,
      username: "Moderator",
      message,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isHighlighted: false,
      isHidden: false,
      isPinned: messageType === "pinned",
      isSelected: false,
    };

    if (messageType === "pinned") {
      setChatMessages((prev) => [
        ...prev.map((m) => (m.isPinned ? { ...m, isPinned: false } : m)),
        moderatorMessage,
      ]);
    } else {
      setChatMessages((prev) => [...prev, moderatorMessage]);
    }
  };

  const handleQuestionMetricsChange = (metrics: { total: number; queue: number; selected: number; closed: number }) => {
    void metrics;
  };

  const handleQASpike = (payload: { increaseBy: number; queueCount: number }) => {
    addNotification(
      "Q&A spike detected",
      `${payload.increaseBy} questions queued quickly (${payload.queueCount} in queue).`,
      "warning",
      ["qa"]
    );
  };

  const handleTabViewed = (tab: "comments" | "qa" | "studio") => {
    setAlertBadges((prev) => ({ ...prev, [tab]: 0 }));
  };

  const markAllNotificationsRead = () => {
    setNotificationFeed((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  };

  const handleCopy = (message: string) => {
    // Copy functionality is handled in ChatModeration component
    // This callback can be used for logging or analytics
    console.log("Message copied:", message);
  };

  const handleOpenModerationView = (activeTab: ModerationTab) => {
    saveModerationSession({
      eventId: EVENT_ID,
      eventTitle: "Live Event – Global Summit",
      isLive,
      isPaused,
      elapsedTime,
      concurrentUsers,
      totalUsers,
      audienceCountEnabled,
      commentsEnabled,
      qnaEnabled,
      publishingHealth,
      messages: chatMessages,
      blockedUsers,
      notifications: notificationFeed,
      theme,
      activeTab,
    });
    window.open(buildModerationViewPath(EVENT_ID, activeTab), "_blank", "noopener,noreferrer");
  };

  const filteredMessages = chatMessages;

  useEffect(() => {
    if (publishingHealth === "warning" || publishingHealth === "poor") {
      addNotification(
        "Stream health degraded",
        `Publishing health is now ${publishingHealth}. Please check input/output panels.`,
        publishingHealth === "poor" ? "critical" : "warning",
        ["studio", "comments"]
      );
    }
  }, [publishingHealth]);

  useEffect(() => {
    const initializePanelWidths = () => {
      const container = mainContentRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      if (containerWidth <= 0) return;

      const inner = containerWidth - MAIN_ROW_FIXED_CHROME_PX;
      if (inner <= 0) return;

      const right = Math.max(MIN_RIGHT_WIDTH, Math.round(inner * DEFAULT_MODERATION_COL_FRAC));
      setRightPanelWidth(right);
    };

    initializePanelWidths();
    window.addEventListener("resize", initializePanelWidths);
    return () => window.removeEventListener("resize", initializePanelWidths);
  }, []);

  useEffect(() => {
    if (!resizingSide) return;

    const handleMouseMove = (event: MouseEvent) => {
      const container = mainContentRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const inner = rect.width - MAIN_ROW_FIXED_CHROME_PX;
      const playerAreaMin = 560;
      const maxRight = inner - playerAreaMin;

      if (!isRightContentCollapsed) {
        const proposed = rect.right - event.clientX;
        const clamped = Math.min(Math.max(proposed, MIN_RIGHT_WIDTH), Math.max(MIN_RIGHT_WIDTH, maxRight));
        setRightPanelWidth(clamped);
      }
    };

    const handleMouseUp = () => {
      setResizingSide(null);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingSide, rightPanelWidth, isRightContentCollapsed]);

  const rightSectionWidthPx = isRightContentCollapsed
    ? RIGHT_SECTION_COLLAPSED_PX
    : rightPanelWidth || MIN_RIGHT_WIDTH;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <DashboardHeader
        isLive={isLive}
        isPaused={isPaused}
        eventTitle="Live Event – Global Summit"
        eventId={EVENT_ID}
        elapsedTime={elapsedTime}
        concurrentUsers={concurrentUsers}
        totalUsers={totalUsers}
        audienceCountEnabled={audienceCountEnabled}
        isRecording={isRecording}
        onStart={handleStart}
        onStop={handleStop}
        onPause={handlePause}
        onResume={handleResume}
        onSettings={handleSettings}
        onStartRecording={handleStartRecording}
        onEndEvent={handleEndEvent}
        onBack={handleBack}
        notifications={notificationFeed}
        onMarkAllNotificationsRead={markAllNotificationsRead}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-3 min-w-0 min-h-0">
        <div
          ref={mainContentRef}
          className="grid h-full min-h-0 min-w-0 w-full items-stretch gap-2"
          style={{
            gridTemplateColumns: isRightContentCollapsed
              ? `minmax(0, 1fr) ${RIGHT_SECTION_COLLAPSED_PX}px`
              : `minmax(0, 1fr) 4px ${rightSectionWidthPx}px`,
          }}
        >
        <div className="grid min-h-0 min-w-0 grid-cols-1 gap-4 overflow-visible min-[1101px]:grid-cols-2">
          <section className="min-h-0 min-w-0 overflow-visible">
            <EventHealthColumn />
          </section>
          <section className="min-h-0 min-w-0 overflow-visible">
            <OutputHealthColumn
              publishingHealth={publishingHealth}
              socialDestinations={socialDestinations}
            />
          </section>
        </div>

        {!isRightContentCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize right panel"
            onMouseDown={() => setResizingSide("right")}
            className="w-1 cursor-col-resize rounded-full bg-border/70 transition-colors hover:bg-primary/60 active:bg-primary/80"
          />
        )}

        <section
          className={`min-h-0 overflow-hidden transition-[width,opacity] duration-200 ease-in-out ${
            isRightContentCollapsed ? "min-w-0" : "min-w-[360px]"
          }`}
          style={{ width: isRightContentCollapsed ? RIGHT_SECTION_COLLAPSED_PX : undefined }}
        >
          <RightModerationPanel
            eventId={EVENT_ID}
            contentCollapsed={isRightContentCollapsed}
            onContentCollapsedChange={setIsRightContentCollapsed}
            messages={filteredMessages}
            blockedUsers={blockedUsers}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onToggleHide={handleToggleHide}
            onTogglePin={handleTogglePin}
            onToggleSelect={handleToggleSelect}
            onCopy={handleCopy}
            onDeleteMessage={handleDeleteMessage}
            onSendCommentMessage={handleSendCommentMessage}
            commentsEnabled={commentsEnabled}
            qnaEnabled={qnaEnabled}
            eventTitle="Live Event – Global Summit"
            eventDescription="Join us for an exciting live event featuring industry leaders and innovative discussions. This event brings together experts from various fields to share insights and engage in meaningful conversations."
            eventDate="Nov 20, 2025"
            eventTime={new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            rtmpUrl="rtmp://studio-vwfeyv.sli.ke/live/"
            commentsToggle={commentsEnabled}
            audienceCountEnabled={audienceCountEnabled}
            reactionsEnabled={reactionsEnabled}
            qnaToggle={qnaEnabled}
            onCommentsEnabledChange={setCommentsEnabled}
            onAudienceCountEnabledChange={setAudienceCountEnabled}
            onReactionsEnabledChange={setReactionsEnabled}
            onQnaEnabledChange={setQnaEnabled}
            onQuestionMetricsChange={handleQuestionMetricsChange}
            onQASpike={handleQASpike}
            onTabViewed={handleTabViewed}
            isDarkTheme={theme === "dark"}
            onToggleTheme={handleToggleTheme}
          />
        </section>
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar
        publishingHealth={publishingHealth}
        bitrate={3500}
        fps={30}
        cpuUsage={45}
        messages={filteredMessages}
        blockedUsers={blockedUsers}
        onBlockUser={handleBlockUser}
        onUnblockUser={handleUnblockUser}
        onToggleSelect={handleToggleSelect}
        onDeleteMessage={handleDeleteMessage}
        viewType={viewType}
        activeSource={activeSource}
        commentsEnabled={commentsEnabled}
        onOpenModerationPanel={() => handleOpenModerationView("comments")}
        socialDestinations={socialDestinations}
      />
    </div>
  );
};

export default Index;
