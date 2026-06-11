import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useCallback,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { ChatMessage, BlockedUser } from "@/components/dashboard/moderation/ChatModeration";
import type { StudioUser } from "@/components/dashboard/moderation/ModerationMessagePanel";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QAQuestion {
  id: string;
  username: string;
  question: string;
  timestamp: string;
  isApproved: boolean;
  status: "queue" | "selected" | "closed";
  assignedTo?: string;
  isHidden?: boolean;
}

interface StoredState {
  chatMessages: ChatMessage[];
  blockedUsers: BlockedUser[];
  qaQuestions: QAQuestion[];
  studioMessages: ChatMessage[];
  studioUsers: StudioUser[];
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  { id: "1", username: "User123", message: "This is an amazing event! Thanks for hosting!", timestamp: "2:34 PM" },
  { id: "2", username: "StreamFan99", message: "Can you explain more about the topic?", timestamp: "2:35 PM" },
  { id: "3", username: "TechGuru", message: "The production quality is outstanding!", timestamp: "2:36 PM" },
  { id: "4", username: "NewViewer", message: "Just joined, what did I miss?", timestamp: "2:37 PM" },
  { id: "5", username: "EventAttendee", message: "Looking forward to the Q&A session", timestamp: "2:38 PM" },
  { id: "6", username: "LiveWatcher", message: "This is better than last year's summit!", timestamp: "2:39 PM" },
  { id: "7", username: "CuriousCat42", message: "Will the recording be available after?", timestamp: "2:40 PM" },
  { id: "8", username: "DevDude", message: "The slides are super detailed, love it!", timestamp: "2:41 PM" },
  { id: "9", username: "MarketingPro", message: "Sharing this with my whole team!", timestamp: "2:42 PM" },
  { id: "10", username: "FirstTimer", message: "First time attending this event, incredible experience!", timestamp: "2:43 PM" },
  { id: "11", username: "SummitFan", message: "The speaker lineup is absolutely top notch this year.", timestamp: "2:44 PM" },
  { id: "12", username: "QuickQuestion", message: "Is there a community Discord for this event?", timestamp: "2:45 PM" },
  { id: "13", username: "InspiredViewer", message: "Taking so many notes right now!", timestamp: "2:46 PM" },
  { id: "14", username: "GlobalFan", message: "Watching from Singapore, great stream quality!", timestamp: "2:47 PM" },
  { id: "15", username: "TechEnthusiast", message: "Could you share the resources mentioned earlier?", timestamp: "2:48 PM" },
];

const DEFAULT_BLOCKED_USERS: BlockedUser[] = [
  { id: "1", username: "User123", blockedAt: "2:34 PM" },
];

const DEFAULT_QA_QUESTIONS: QAQuestion[] = [
  { id: "1", username: "CuriousUser", question: "What are the key takeaways from this session?", timestamp: "2:30 PM", isApproved: false, status: "queue", isHidden: false },
  { id: "2", username: "Learner123", question: "Can you provide more details about the implementation?", timestamp: "2:32 PM", isApproved: false, status: "queue", isHidden: false },
  { id: "3", username: "TechEnthusiast", question: "How does this compare to other solutions?", timestamp: "2:35 PM", isApproved: false, status: "queue", isHidden: false },
  { id: "4", username: "Developer99", question: "What tools do you recommend for beginners?", timestamp: "2:38 PM", isApproved: false, status: "queue", isHidden: false },
  { id: "5", username: "PriyaM", question: "Is there a roadmap for the next major release?", timestamp: "2:41 PM", isApproved: false, status: "queue", isHidden: false },
  { id: "6", username: "SarahK", question: "How does the platform handle real-time data synchronisation across multiple clients?", timestamp: "2:43 PM", isApproved: false, status: "queue", isHidden: false },
  { id: "7", username: "MarcusT", question: "Can we integrate this with third-party analytics tools?", timestamp: "2:45 PM", isApproved: false, status: "queue", isHidden: false },
  { id: "8", username: "ZoeW", question: "What is the expected latency when scaling to 10,000 concurrent users?", timestamp: "2:47 PM", isApproved: false, status: "queue", isHidden: false },
  { id: "9", username: "RahulV", question: "Are there any best practices for structuring large moderation workflows?", timestamp: "2:49 PM", isApproved: false, status: "queue", isHidden: false },
  { id: "10", username: "EmmaL", question: "Does the system support multi-language moderation out of the box?", timestamp: "2:51 PM", isApproved: false, status: "queue", isHidden: false },
];

const DEFAULT_STUDIO_MESSAGES: ChatMessage[] = [
  { id: "studio-1", username: "StudioUser1", message: "Welcome to the studio chat!", timestamp: "2:40 PM", isHighlighted: false, isHidden: false, isPinned: false, isSelected: false },
  { id: "studio-2", username: "StudioUser2", message: "This is a separate studio chat channel.", timestamp: "2:41 PM", isHighlighted: false, isHidden: false, isPinned: false, isSelected: false },
];

const DEFAULT_STUDIO_USERS: StudioUser[] = [
  { id: "su-1", username: "HostUser", role: "Host", status: "Live", lastActive: "Active now" },
  { id: "su-2", username: "CoHostUser", role: "Co-host", status: "Speaking", lastActive: "Active now" },
  { id: "su-3", username: "ModeratorUser", role: "Moderator", status: "Online", lastActive: "Active now" },
  { id: "su-4", username: "Participant1", role: "Participant", status: "In Queue", lastActive: "2m ago" },
  { id: "su-5", username: "AudienceUser", role: "Audience", status: "Online", lastActive: "5m ago" },
  { id: "su-6", username: "MutedUser", role: "Participant", status: "Muted", lastActive: "1m ago" },
  { id: "su-7", username: "StudioUser1", role: "Participant", status: "Speaking", lastActive: "Active now" },
  { id: "su-8", username: "StudioUser2", role: "Audience", status: "Offline", lastActive: "10m ago" },
];

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "lfc_moderation_v1";
const CHANNEL_NAME = "lfc_moderation";

function loadFromStorage(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}

function saveToStorage(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private-mode errors
  }
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type SetFn<T> = T | ((prev: T) => T);

function applySetFn<T>(prev: T, fn: SetFn<T>): T {
  return typeof fn === "function" ? (fn as (p: T) => T)(prev) : fn;
}

type StoreAction =
  | { type: "APPLY_REMOTE"; state: StoredState }
  | { type: "SET_CHAT_MESSAGES"; fn: SetFn<ChatMessage[]> }
  | { type: "SET_BLOCKED_USERS"; fn: SetFn<BlockedUser[]> }
  | { type: "SET_QA_QUESTIONS"; fn: SetFn<QAQuestion[]> }
  | { type: "SET_STUDIO_MESSAGES"; fn: SetFn<ChatMessage[]> }
  | { type: "SET_STUDIO_USERS"; fn: SetFn<StudioUser[]> };

function storeReducer(state: StoredState, action: StoreAction): StoredState {
  switch (action.type) {
    case "APPLY_REMOTE":
      return action.state;
    case "SET_CHAT_MESSAGES":
      return { ...state, chatMessages: applySetFn(state.chatMessages, action.fn) };
    case "SET_BLOCKED_USERS":
      return { ...state, blockedUsers: applySetFn(state.blockedUsers, action.fn) };
    case "SET_QA_QUESTIONS":
      return { ...state, qaQuestions: applySetFn(state.qaQuestions, action.fn) };
    case "SET_STUDIO_MESSAGES":
      return { ...state, studioMessages: applySetFn(state.studioMessages, action.fn) };
    case "SET_STUDIO_USERS":
      return { ...state, studioUsers: applySetFn(state.studioUsers, action.fn) };
    default:
      return state;
  }
}

function buildInitialState(): StoredState {
  const stored = loadFromStorage();
  return stored ?? {
    chatMessages: DEFAULT_CHAT_MESSAGES,
    blockedUsers: DEFAULT_BLOCKED_USERS,
    qaQuestions: DEFAULT_QA_QUESTIONS,
    studioMessages: DEFAULT_STUDIO_MESSAGES,
    studioUsers: DEFAULT_STUDIO_USERS,
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ModerationStoreContextValue {
  chatMessages: ChatMessage[];
  setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  blockedUsers: BlockedUser[];
  blockUser: (username: string) => void;
  unblockUser: (username: string) => void;
  qaQuestions: QAQuestion[];
  setQAQuestions: Dispatch<SetStateAction<QAQuestion[]>>;
  studioMessages: ChatMessage[];
  setStudioMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  studioUsers: StudioUser[];
  setStudioUsers: Dispatch<SetStateAction<StudioUser[]>>;
}

const ModerationStoreCtx = createContext<ModerationStoreContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ModerationStoreProvider({ children }: { children: ReactNode }) {
  const [store, dispatchRaw] = useReducer(storeReducer, undefined, buildInitialState);

  const channelRef = useRef<BroadcastChannel | null>(null);
  // Tracks whether the most recent state change came from a remote broadcast.
  // Prevents re-broadcasting state we just received from another window.
  const lastActionWasRemote = useRef(false);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<{ type: string; state: StoredState }>) => {
      if (event.data?.type === "STORE_SYNC") {
        lastActionWasRemote.current = true;
        dispatchRaw({ type: "APPLY_REMOTE", state: event.data.state });
      }
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  // Persist and broadcast after every state change, unless it came from remote.
  useEffect(() => {
    if (lastActionWasRemote.current) {
      lastActionWasRemote.current = false;
      return;
    }
    saveToStorage(store);
    channelRef.current?.postMessage({ type: "STORE_SYNC", state: store });
  }, [store]);

  // Typed dispatch wrappers that match Dispatch<SetStateAction<T>> signature
  const setChatMessages = useCallback<Dispatch<SetStateAction<ChatMessage[]>>>(
    (fn) => dispatchRaw({ type: "SET_CHAT_MESSAGES", fn: fn as SetFn<ChatMessage[]> }),
    []
  );

  const setQAQuestions = useCallback<Dispatch<SetStateAction<QAQuestion[]>>>(
    (fn) => dispatchRaw({ type: "SET_QA_QUESTIONS", fn: fn as SetFn<QAQuestion[]> }),
    []
  );

  const setStudioMessages = useCallback<Dispatch<SetStateAction<ChatMessage[]>>>(
    (fn) => dispatchRaw({ type: "SET_STUDIO_MESSAGES", fn: fn as SetFn<ChatMessage[]> }),
    []
  );

  const setStudioUsers = useCallback<Dispatch<SetStateAction<StudioUser[]>>>(
    (fn) => dispatchRaw({ type: "SET_STUDIO_USERS", fn: fn as SetFn<StudioUser[]> }),
    []
  );

  const blockUser = useCallback((username: string) => {
    dispatchRaw({
      type: "SET_BLOCKED_USERS",
      fn: (prev) => {
        if (prev.some((u) => u.username === username)) return prev;
        return [
          ...prev,
          {
            id: Date.now().toString(),
            username,
            blockedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          },
        ];
      },
    });
  }, []);

  const unblockUser = useCallback((username: string) => {
    dispatchRaw({
      type: "SET_BLOCKED_USERS",
      fn: (prev) => prev.filter((u) => u.username !== username),
    });
  }, []);

  return (
    <ModerationStoreCtx.Provider
      value={{
        chatMessages: store.chatMessages,
        setChatMessages,
        blockedUsers: store.blockedUsers,
        blockUser,
        unblockUser,
        qaQuestions: store.qaQuestions,
        setQAQuestions,
        studioMessages: store.studioMessages,
        setStudioMessages,
        studioUsers: store.studioUsers,
        setStudioUsers,
      }}
    >
      {children}
    </ModerationStoreCtx.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useModerationStore(): ModerationStoreContextValue {
  const ctx = useContext(ModerationStoreCtx);
  if (!ctx) throw new Error("useModerationStore must be used within ModerationStoreProvider");
  return ctx;
}
