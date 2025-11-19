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

  const handleSourceSwitch = (source: string) => {
    setActiveSource(source);
    // Simulate publishing health change
    const health: Array<"stable" | "warning" | "poor"> = ["stable", "warning", "poor"];
    setPublishingHealth(health[Math.floor(Math.random() * health.length)]);
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

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <DashboardHeader
        isLive={isLive}
        eventTitle="Live Event – Global Summit"
        elapsedTime={elapsedTime}
        onStart={handleStart}
        onStop={handleStop}
        onSettings={handleSettings}
      />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Live Moderation */}
        <aside className="w-[35%] border-r border-border p-6 overflow-y-auto">
          <LiveModerationPanel
            publishingHealth={publishingHealth}
            activeSource={activeSource}
            onSourceSwitch={handleSourceSwitch}
          />
        </aside>

        {/* Right Panel - Event Moderation */}
        <section className="flex-1 p-6 overflow-y-auto">
          <EventModerationPanel
            messages={messages}
            blockedUsers={blockedUsers}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onToggleHide={handleToggleHide}
            onToggleSelect={handleToggleSelect}
            onCopy={handleCopy}
            onDeleteMessage={handleDeleteMessage}
          />
        </section>
      </main>

      {/* Status Bar */}
      <StatusBar
        publishingHealth={publishingHealth}
        bitrate={3500}
        fps={30}
        cpuUsage={45}
        messages={messages}
        blockedUsers={blockedUsers}
        onBlockUser={handleBlockUser}
        onUnblockUser={handleUnblockUser}
        onToggleSelect={handleToggleSelect}
        onDeleteMessage={handleDeleteMessage}
      />
    </div>
  );
};

export default Index;
