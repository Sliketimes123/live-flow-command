import type { ChatMessage, BlockedUser } from "@/components/dashboard/moderation/ChatModeration";

export type ModerationTab = "comments" | "qa" | "studio";

export type ModerationSessionSnapshot = {
  eventId: string;
  eventTitle: string;
  isLive: boolean;
  isPaused: boolean;
  elapsedTime: string;
  concurrentUsers: number;
  totalUsers: number;
  audienceCountEnabled: boolean;
  commentsEnabled: boolean;
  qnaEnabled: boolean;
  publishingHealth: "stable" | "warning" | "poor";
  messages: ChatMessage[];
  blockedUsers: BlockedUser[];
  notifications: Array<{
    id: string;
    title: string;
    description: string;
    severity: "info" | "warning" | "critical";
    timestamp: string;
    isRead: boolean;
  }>;
  theme: "light" | "dark";
  activeTab?: ModerationTab;
};

const storageKey = (eventId: string) => `live-flow-moderation:${eventId}`;

export function saveModerationSession(snapshot: ModerationSessionSnapshot) {
  try {
    sessionStorage.setItem(storageKey(snapshot.eventId), JSON.stringify(snapshot));
  } catch {
    // Ignore quota / private mode errors
  }
}

export function loadModerationSession(eventId: string): ModerationSessionSnapshot | null {
  try {
    const raw = sessionStorage.getItem(storageKey(eventId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ModerationSessionSnapshot;
    if (parsed.eventId !== eventId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildModerationViewPath(
  eventId: string,
  activeTab?: ModerationTab
): string {
  const base = `/events/${encodeURIComponent(eventId)}/moderation`;
  if (!activeTab) return base;
  return `${base}?tab=${activeTab}`;
}

export const DEFAULT_EVENT_ID = "npn57jcgzzo";

export function createDefaultModerationSession(eventId: string): ModerationSessionSnapshot {
  return {
    eventId,
    eventTitle: "Live Event – Global Summit",
    isLive: true,
    isPaused: false,
    elapsedTime: "00:45:32",
    concurrentUsers: 3,
    totalUsers: 9,
    audienceCountEnabled: true,
    commentsEnabled: true,
    qnaEnabled: true,
    publishingHealth: "stable",
    theme: "dark",
    activeTab: "comments",
    notifications: [],
    messages: [
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
    ],
    blockedUsers: [
      {
        id: "1",
        username: "User123",
        blockedAt: "2:34 PM",
      },
    ],
  };
}
