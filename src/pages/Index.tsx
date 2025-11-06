import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { LiveModerationPanel } from "@/components/dashboard/LiveModerationPanel";
import { EventModerationPanel } from "@/components/dashboard/EventModerationPanel";

const Index = () => {
  const [isLive, setIsLive] = useState(true);
  const [elapsedTime, setElapsedTime] = useState("00:45:32");
  const [activeSource, setActiveSource] = useState("Camera-1");
  const [publishingHealth, setPublishingHealth] = useState<"stable" | "warning" | "poor">(
    "stable"
  );

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
          <EventModerationPanel />
        </section>
      </main>

      {/* Status Bar */}
      <StatusBar
        publishingHealth={publishingHealth}
        bitrate={3500}
        fps={30}
        cpuUsage={45}
        lastAction="Blocked User123"
      />
    </div>
  );
};

export default Index;
