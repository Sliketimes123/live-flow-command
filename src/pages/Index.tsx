import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { EventHealthColumn } from "@/components/dashboard/EventHealthColumn";
import { OutputHealthColumn } from "@/components/dashboard/OutputHealthColumn";
import { RightModerationPanel } from "@/components/dashboard/RightModerationPanel";
import type { ChatMessage, BlockedUser } from "@/components/dashboard/moderation/ChatModeration";

const Index = () => {
  const MIN_LEFT_WIDTH = 280;
  const MIN_MIDDLE_WIDTH = 280;
  const MIN_RIGHT_WIDTH = 360;

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
    private: 0,
    qa: 0,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
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
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    {
      id: "1",
      username: "User123",
      blockedAt: "2:34 PM",
    },
  ]);
  const [leftPanelWidth, setLeftPanelWidth] = useState(0);
  const [rightPanelWidth, setRightPanelWidth] = useState(0);
  const [resizingSide, setResizingSide] = useState<"left" | "right" | null>(null);

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

  const playAlertSound = () => {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.05;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
  };

  const addNotification = (
    title: string,
    description: string,
    severity: "info" | "warning" | "critical",
    targetTabs: Array<"comments" | "studio" | "private" | "qa"> = []
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

    playAlertSound();
  };


  const handleBlockUser = (username: string) => {
    const isAlreadyBlocked = blockedUsers.some((user) => user.username === username);
    if (!isAlreadyBlocked) {
      const newBlockedUser: BlockedUser = {
        id: Date.now().toString(),
        username,
        blockedAt: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
      setBlockedUsers([...blockedUsers, newBlockedUser]);
      addNotification(
        "User blocked",
        `${username} was blocked by a moderator action.`,
        "warning",
        ["comments", "qa"]
      );
    }
  };

  const handleUnblockUser = (username: string) => {
    setBlockedUsers(blockedUsers.filter((user) => user.username !== username));
  };

  const handleToggleHide = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isHidden: !msg.isHidden } : msg
      )
    );
  };

  const handleTogglePin = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
      )
    );
  };

  const handleToggleSelect = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isSelected: !msg.isSelected } : msg
      )
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
  };

  const handleSendCommentMessage = (message: string) => {
    const moderatorMessage: ChatMessage = {
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
    };

    setMessages((prevMessages) => [...prevMessages, moderatorMessage]);
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

  const handleTabViewed = (tab: "comments" | "studio" | "private" | "qa") => {
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

  // Use all messages (no filtering needed)
  const filteredMessages = messages;

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

      const nextLeft = Math.max(MIN_LEFT_WIDTH, Math.floor(containerWidth * 0.3));
      const nextRight = Math.max(MIN_RIGHT_WIDTH, Math.floor(containerWidth * 0.36));
      setLeftPanelWidth(nextLeft);
      setRightPanelWidth(nextRight);
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
      const maxLeft = rect.width - rightPanelWidth - MIN_MIDDLE_WIDTH;
      const maxRight = rect.width - leftPanelWidth - MIN_MIDDLE_WIDTH;

      if (resizingSide === "left") {
        const proposed = event.clientX - rect.left;
        const clamped = Math.min(Math.max(proposed, MIN_LEFT_WIDTH), Math.max(MIN_LEFT_WIDTH, maxLeft));
        setLeftPanelWidth(clamped);
      } else {
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
  }, [resizingSide, leftPanelWidth, rightPanelWidth]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <DashboardHeader
        isLive={isLive}
        isPaused={isPaused}
        eventTitle="Live Event – Global Summit"
        eventId="npn57jcgzzo"
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
        <div ref={mainContentRef} className="h-full flex min-w-0 min-h-0 items-stretch gap-2">
        <section
          className="min-w-[280px] overflow-visible min-h-0"
          style={{ width: leftPanelWidth || undefined }}
        >
          <EventHealthColumn />
        </section>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize left panel"
          onMouseDown={() => setResizingSide("left")}
          className="w-1 shrink-0 cursor-col-resize rounded-full bg-border/70 hover:bg-primary/60 active:bg-primary/80 transition-colors"
        />

        <section className="flex-1 min-w-[280px] overflow-visible min-h-0">
          <OutputHealthColumn
            publishingHealth={publishingHealth}
          />
        </section>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize right panel"
          onMouseDown={() => setResizingSide("right")}
          className="w-1 shrink-0 cursor-col-resize rounded-full bg-border/70 hover:bg-primary/60 active:bg-primary/80 transition-colors"
        />

        <section
          className="min-w-[360px] overflow-hidden min-h-0"
          style={{ width: rightPanelWidth || undefined }}
        >
          <RightModerationPanel
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
      />
    </div>
  );
};

export default Index;
