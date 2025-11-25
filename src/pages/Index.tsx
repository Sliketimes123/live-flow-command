import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { LiveModerationPanel } from "@/components/dashboard/LiveModerationPanel";
import { EventModerationPanel } from "@/components/dashboard/EventModerationPanel";
import type { ChatMessage, BlockedUser } from "@/components/dashboard/moderation/ChatModeration";

const Index = () => {
  const [isLive, setIsLive] = useState(true);
  const [elapsedTime, setElapsedTime] = useState("00:45:32");
  const [activeSource, setActiveSource] = useState("Camera-1");
  const [publishingHealth, setPublishingHealth] = useState<"stable" | "warning" | "poor">(
    "stable"
  );
  const [isModerationStopped, setIsModerationStopped] = useState(false);
  const [messagesBeforeStop, setMessagesBeforeStop] = useState<Set<string>>(new Set());
  const [viewType, setViewType] = useState<"input" | "output">("input");
  const [concurrentUsers, setConcurrentUsers] = useState(3);
  const [totalUsers, setTotalUsers] = useState(9);
  const [isRecording, setIsRecording] = useState(false);
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
  const qaCount = 24;
  const reactionsCount = 156;

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

  const handleStart = () => {
    setIsLive(true);
    setElapsedTime("00:00:00");
  };

  const handleStop = () => {
    setIsLive(false);
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleBack = () => {
    console.log("Back clicked");
    // Add navigation logic here if needed
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

  const handleCopy = (message: string) => {
    // Copy functionality is handled in ChatModeration component
    // This callback can be used for logging or analytics
    console.log("Message copied:", message);
  };

  const handleStopModeration = () => {
    if (!isModerationStopped) {
      // Store current message IDs before stopping
      setMessagesBeforeStop(new Set(messages.map((msg) => msg.id)));
    }
    setIsModerationStopped(!isModerationStopped);
  };

  // Filter messages to only show those that existed before moderation was stopped
  const filteredMessages = isModerationStopped
    ? messages.filter((msg) => messagesBeforeStop.has(msg.id))
    : messages;
  const chatMessageCount = messages.length;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <DashboardHeader
        isLive={isLive}
        eventTitle="Live Event – Global Summit"
        elapsedTime={elapsedTime}
        isModerationStopped={isModerationStopped}
        concurrentUsers={concurrentUsers}
        totalUsers={totalUsers}
        isRecording={isRecording}
        onStart={handleStart}
        onStop={handleStop}
        onSettings={handleSettings}
        onStopModeration={handleStopModeration}
        onStartRecording={handleStartRecording}
        onEndEvent={handleEndEvent}
        onBack={handleBack}
      />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Live Moderation */}
        <aside className="w-[35%] border-r border-border p-6 overflow-y-auto">
          <LiveModerationPanel
            publishingHealth={publishingHealth}
            activeSource={activeSource}
            bitrate={3500}
            fps={30}
            onViewTypeChange={setViewType}
            eventTitle="Live Event – Global Summit"
            eventDescription="Join us for an exciting live event featuring industry leaders and innovative discussions. This event brings together experts from various fields to share insights and engage in meaningful conversations."
            eventDate="Nov 20, 2025"
            eventTime={new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            rtmpUrl="rtmp://studio-vwfeyv.sli.ke/live/"
            streamKey="npn57eigzo"
          />
        </aside>

        {/* Right Panel - Event Moderation */}
        <section className="flex-1 p-6 overflow-y-auto">
          <EventModerationPanel
            messages={filteredMessages}
            blockedUsers={blockedUsers}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onToggleHide={handleToggleHide}
            onToggleSelect={handleToggleSelect}
            onCopy={handleCopy}
            onDeleteMessage={handleDeleteMessage}
            isModerationStopped={isModerationStopped}
          />
        </section>
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
        chatMessageCount={chatMessageCount}
        qaCount={qaCount}
        reactionsCount={reactionsCount}
      />
    </div>
  );
};

export default Index;
