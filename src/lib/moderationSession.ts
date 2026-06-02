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
      {
        id: "6",
        username: "LiveWatcher",
        message: "This is better than last year's summit!",
        timestamp: "2:39 PM",
      },
      {
        id: "7",
        username: "CuriousCat42",
        message: "Will the recording be available after?",
        timestamp: "2:40 PM",
      },
      {
        id: "8",
        username: "DevDude",
        message: "The slides are super detailed, love it!",
        timestamp: "2:41 PM",
      },
      {
        id: "9",
        username: "MarketingPro",
        message: "Sharing this with my whole team 🔥",
        timestamp: "2:42 PM",
      },
      {
        id: "10",
        username: "FirstTimer",
        message: "First time attending this event, incredible experience!",
        timestamp: "2:43 PM",
      },
      {
        id: "11",
        username: "SummitFan",
        message: "The speaker lineup is absolutely top notch this year.",
        timestamp: "2:44 PM",
      },
      {
        id: "12",
        username: "QuickQuestion",
        message: "Is there a community Discord for this event?",
        timestamp: "2:45 PM",
      },
      {
        id: "13",
        username: "InspiredViewer",
        message: "Taking so many notes right now!",
        timestamp: "2:46 PM",
      },
      {
        id: "14",
        username: "GlobalFan",
        message: "Watching from Singapore, great stream quality!",
        timestamp: "2:47 PM",
      },
      {
        id: "15",
        username: "TechEnthusiast",
        message: "Could you share the resources mentioned earlier?",
        timestamp: "2:48 PM",
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
