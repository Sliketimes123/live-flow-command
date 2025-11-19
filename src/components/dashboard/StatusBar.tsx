import { Activity, Cpu, Ban, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}: StatusBarProps) {
  const [isBlockUserDialogOpen, setIsBlockUserDialogOpen] = useState(false);
  const [isSelectedChatDialogOpen, setIsSelectedChatDialogOpen] = useState(false);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedUserToBlock, setSelectedUserToBlock] = useState<string | null>(null);

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

  // Get selected messages
  const selectedMessages = useMemo(() => {
    return messages.filter((msg) => msg.isSelected);
  }, [messages]);

  return (
    <Fragment>
      <footer className="h-12 border-t border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between text-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Publishing:</span>
          <span
            className={`px-2 py-1 rounded border font-medium ${healthColor[publishingHealth]}`}
          >
            {healthText[publishingHealth]}
          </span>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{bitrate}</span> kbps
          </span>
          <span>
            <span className="font-semibold text-foreground">{fps}</span> FPS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">CPU:</span>
          <span className="font-semibold text-foreground">{cpuUsage}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Selected Chat Button */}
        <Dialog open={isSelectedChatDialogOpen} onOpenChange={setIsSelectedChatDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Star className="w-4 h-4" />
              Selected Chat
              {selectedMessages.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {selectedMessages.length}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Selected Chats</DialogTitle>
              <DialogDescription>
                Manage selected chat messages. You can delete, unselect, or block users from here.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {selectedMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No chats are currently selected.
                </p>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {selectedMessages.map((msg) => {
                      const blocked = isUserBlocked(msg.username);
                      return (
                        <div
                          key={msg.id}
                          className="flex items-start justify-between p-3 rounded-lg border border-border bg-card gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">{msg.username}</span>
                              <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                              {blocked && (
                                <span className="text-xs text-destructive font-medium">(Blocked)</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => onDeleteMessage?.(msg.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => onToggleSelect?.(msg.id)}
                              title="Unselect"
                            >
                              <Star className="w-4 h-4 text-primary fill-primary" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => handleBlockRequest(msg.username)}
                              title="Block user"
                              disabled={blocked}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsSelectedChatDialogOpen(false)}>Apply</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Block User Button */}
        <Dialog open={isBlockUserDialogOpen} onOpenChange={setIsBlockUserDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Ban className="w-4 h-4" />
            Block User
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Block / Unblock Users</DialogTitle>
            <DialogDescription>
              Manage user access. Block users to restrict their participation or unblock them to restore access.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {allUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No users found.
              </p>
            ) : (
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-2 pr-4">
                  {allUsers.map((user) => {
                    const isBlocked = isUserBlocked(user.username);
                    const blockedUserInfo = blockedUsers.find((bu) => bu.username === user.username);
                    return (
                      <div
                        key={user.username}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{user.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {isBlocked ? `Blocked at ${blockedUserInfo?.blockedAt || "N/A"}` : "Active"}
                          </p>
                        </div>
                        {isBlocked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUnblockUser(user.username)}
                            className="gap-2"
                          >
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleBlockRequest(user.username)}
                            className="gap-2"
                          >
                            <Ban className="w-4 h-4" />
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
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsBlockUserDialogOpen(false)}>Apply</Button>
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
