import { Activity, Cpu, Ban, Star, Trash2, Search, MessageSquare, HelpCircle, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo, Fragment } from "react";
import type { ChatMessage, BlockedUser } from "./moderation/ChatModeration";

interface StatusBarProps {
  publishingHealth: "stable" | "warning" | "poor";
  bitrate: number;
  fps: number;
  cpuUsage: number;
  messages: ChatMessage[];
  blockedUsers: BlockedUser[];
  onBlockUser: (username: string) => void;
  onUnblockUser: (username: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  viewType?: "input" | "output";
  activeSource?: string;
  chatMessageCount?: number;
  qaCount?: number;
  reactionsCount?: number;
}

export function StatusBar({
  publishingHealth,
  bitrate,
  fps,
  cpuUsage,
  messages,
  blockedUsers,
  onBlockUser,
  onUnblockUser,
  onToggleSelect,
  onDeleteMessage,
  viewType = "input",
  activeSource = "Camera-1",
  chatMessageCount,
  qaCount = 0,
  reactionsCount = 0,
}: StatusBarProps) {
  const [isBlockUserDialogOpen, setIsBlockUserDialogOpen] = useState(false);
  const [isSelectedChatDialogOpen, setIsSelectedChatDialogOpen] = useState(false);
  const [isActiveUsersDialogOpen, setIsActiveUsersDialogOpen] = useState(false);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedUserToBlock, setSelectedUserToBlock] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const healthColor = {
    stable: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    poor: "text-destructive bg-destructive/10 border-destructive/20",
  };

  const healthText = {
    stable: "Stable",
    warning: "Warning",
    poor: "Poor",
  };

  const isUserBlocked = (username: string) => {
    return blockedUsers.some((user) => user.username === username);
  };

  const handleBlockRequest = (username: string) => {
    setSelectedUserToBlock(username);
    setIsConfirmBlockOpen(true);
  };

  const handleConfirmBlock = () => {
    if (selectedUserToBlock) {
      onBlockUser(selectedUserToBlock);
    }
    setIsConfirmBlockOpen(false);
    setSelectedUserToBlock(null);
  };

  // Get all unique users from messages and blocked users
  const allUsers = useMemo(() => {
    const uniqueUsers = new Map<string, { username: string; isActive: boolean }>();
    const blockedUsernames = new Set(blockedUsers.map((bu) => bu.username));
    
    // Add users from messages
    messages.forEach((msg) => {
      if (!uniqueUsers.has(msg.username)) {
        uniqueUsers.set(msg.username, {
          username: msg.username,
          isActive: !blockedUsernames.has(msg.username),
        });
      }
    });
    
    // Add users from blockedUsers list (includes users blocked from Q&A)
    blockedUsers.forEach((bu) => {
      if (!uniqueUsers.has(bu.username)) {
        uniqueUsers.set(bu.username, {
          username: bu.username,
          isActive: false, // They're blocked, so not active
        });
      }
    });
    
    return Array.from(uniqueUsers.values());
  }, [messages, blockedUsers]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return allUsers;
    }
    const query = searchQuery.toLowerCase();
    return allUsers.filter((user) => user.username.toLowerCase().includes(query));
  }, [allUsers, searchQuery]);

  // Get selected messages
  const selectedMessages = useMemo(() => {
    return messages.filter((msg) => msg.isSelected);
  }, [messages]);

  const totalChatMessages = chatMessageCount ?? messages.length;

  // Mock data for Input and Output
  const inputData = {
    primaryInput: activeSource,
    streamHealth: publishingHealth,
    inputMode: "HDMI",
    bitrateCurrent: bitrate,
    bitrateAverage: 3200,
    dimension: "1920:1080",
  };

  const outputData = {
    primaryOutput: "RTMP Stream",
    streamHealth: publishingHealth,
    modes: "Adaptive",
    qualities: "1080p, 720p, 480p",
    encrypted: "Yes",
    frameRate: fps,
  };

  return (
    <Fragment>
      <footer className="h-9 border-t border-border bg-card/50 backdrop-blur-sm px-4 flex items-center justify-between text-xs">
      <div className="flex items-center gap-3">
        {/* Status bar can show other information if needed */}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Selected Chat Button */}
        <Dialog open={isSelectedChatDialogOpen} onOpenChange={setIsSelectedChatDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs px-2">
              <Star className="w-3 h-3" />
              Selected Chat
              {selectedMessages.length > 0 && (
                <span className="ml-0.5 px-1 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                  {selectedMessages.length}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col">
            <DialogHeader>
              <DialogTitle>Selected Chats</DialogTitle>
              <DialogDescription>
                Manage selected chat messages. You can delete, unselect, or block users from here.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex-1 flex flex-col min-h-0">
              {selectedMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No chats are currently selected.
                </p>
              ) : (
                <ScrollArea className="flex-1 w-full rounded-md border">
                  <div className="space-y-1.5 p-2">
                    {selectedMessages.map((msg) => {
                      const blocked = isUserBlocked(msg.username);
                      return (
                        <div
                          key={msg.id}
                          className="flex items-start justify-between p-2 rounded-lg border border-border bg-card gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-semibold text-foreground text-xs">{msg.username}</span>
                              <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                              {blocked && (
                                <span className="text-[10px] text-destructive font-medium">(Blocked)</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">{msg.message}</p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive"
                              onClick={() => onDeleteMessage?.(msg.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => onToggleSelect?.(msg.id)}
                              title="Unselect"
                            >
                              <Star className="w-3 h-3 text-primary fill-primary" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive"
                              onClick={() => handleBlockRequest(msg.username)}
                              title="Block user"
                              disabled={blocked}
                            >
                              <Ban className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
            <div className="mt-4 flex justify-end border-t pt-4">
              <Button onClick={() => setIsSelectedChatDialogOpen(false)}>Apply</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Messages Summary */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1 h-7 text-xs px-2 font-semibold text-foreground"
          title="Total chat messages"
          disabled
        >
          <MessageSquare className="w-3 h-3" />
          Chat Messages
          <span className="ml-0.5 px-1 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full">
            {totalChatMessages}
          </span>
        </Button>

        {/* Q&A Summary */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1 h-7 text-xs px-2 font-semibold text-foreground"
          title="Total Q&A items"
          disabled
        >
          <HelpCircle className="w-3 h-3" />
          Q&A
          <span className="ml-0.5 px-1 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full">
            {qaCount}
          </span>
        </Button>

        {/* Reactions Summary */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1 h-7 text-xs px-2 font-semibold text-foreground"
          title="Total reactions"
          disabled
        >
          <Heart className="w-3 h-3" />
          Reactions
          <span className="ml-0.5 px-1 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full">
            {reactionsCount}
          </span>
        </Button>

        {/* Active Users Button */}
        <Dialog open={isActiveUsersDialogOpen} onOpenChange={setIsActiveUsersDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs px-2">
              <Users className="w-3 h-3" />
              Active Users
              <span className="ml-0.5 px-1 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                3
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col">
            <DialogHeader>
              <DialogTitle>Active Users</DialogTitle>
              <DialogDescription>
                View all active users currently participating in the event.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 w-full rounded-md border">
                <div className="space-y-2 p-2.5">
                  {["Moderator_Alpha", "Moderator_Beta", "Moderator_Gamma"].map((mod, index) => (
                    <div key={mod} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {mod.charAt(mod.indexOf("_") + 1)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{mod}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {15 + index * 5} actions today
                        </p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="mt-4 flex justify-end border-t pt-4">
              <Button onClick={() => setIsActiveUsersDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Block User Button */}
        <Dialog open={isBlockUserDialogOpen} onOpenChange={setIsBlockUserDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs px-2">
            <Ban className="w-3 h-3" />
            Block User
            {blockedUsers.length > 0 && (
              <span className="ml-0.5 px-1 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                {blockedUsers.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col">
          <DialogHeader>
            <DialogTitle>Block / Unblock Users</DialogTitle>
            <DialogDescription>
              Manage user access. Block users to restrict their participation or unblock them to restore access.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex-1 flex flex-col min-h-0">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-7 text-xs"
              />
            </div>
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {searchQuery.trim() ? "No users found matching your search." : "No users found."}
              </p>
            ) : (
              <ScrollArea className="flex-1 w-full rounded-md border">
                <div className="space-y-1.5 p-2.5">
                  {filteredUsers.map((user) => {
                    const isBlocked = isUserBlocked(user.username);
                    const blockedUserInfo = blockedUsers.find((bu) => bu.username === user.username);
                    return (
                      <div
                        key={user.username}
                        className="flex items-center justify-between p-2 rounded-lg border border-border bg-card"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-xs">{user.username}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {isBlocked ? `Blocked at ${blockedUserInfo?.blockedAt || "N/A"}` : "Active"}
                          </p>
                        </div>
                        {isBlocked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUnblockUser(user.username)}
                            className="gap-1 h-7 text-xs px-2"
                          >
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleBlockRequest(user.username)}
                            className="gap-1 h-7 text-xs px-2"
                          >
                            <Ban className="w-3 h-3" />
                            Block
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
          <div className="mt-4 flex justify-end border-t pt-4">
            <Button onClick={() => {
              setIsBlockUserDialogOpen(false);
              setSearchQuery("");
            }}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
      </footer>

      {/* Confirm Block Dialog */}
      <AlertDialog open={isConfirmBlockOpen} onOpenChange={setIsConfirmBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you wish to continue?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to block {selectedUserToBlock}. They will no longer be able to participate in the chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBlock}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}
