import { Activity, Cpu, Ban, Star, Trash2, Search, MessageSquare, HelpCircle, Heart, Users, Radio, Share2, MoreVertical, ExternalLink, Pencil, X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useMemo, Fragment } from "react";
import { useToast } from "@/hooks/use-toast";
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
  const [isSocialPublishDialogOpen, setIsSocialPublishDialogOpen] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  const [hasSelectedChatActions, setHasSelectedChatActions] = useState(false);
  const { toast } = useToast();

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
      setHasSelectedChatActions(true);
    }
    setIsConfirmBlockOpen(false);
    setSelectedUserToBlock(null);
  };

  const handleDeleteFromSelectedChat = (messageId: string) => {
    onDeleteMessage?.(messageId);
    setHasSelectedChatActions(true);
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

  // Mock social publish destinations for status bar
  const socialDestinations = [
    { id: "1", name: "YouTube", isPublished: true },
    { id: "2", name: "Facebook", isPublished: true },
    { id: "3", name: "Twitter", isPublished: false },
  ];

  const publishedCount = socialDestinations.filter(d => d.isPublished).length;

  // Detailed social publish destinations for dialog
  const detailedSocialDestinations = [
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
    },
  ];

  return (
    <Fragment>
      <footer className="h-9 border-t border-border bg-card/50 backdrop-blur-sm px-4 flex items-center justify-between text-xs">
      <div className="flex items-center gap-3">
        {/* Input Stream Health - Non-clickable */}
        <TooltipProvider delayDuration={300}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-default opacity-70">
                <Radio className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${healthColor[inputData.streamHealth]}`}>
                  {healthText[inputData.streamHealth]}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Input Stream Health</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="h-4 w-px bg-border" />

        {/* Output Stream Health - Non-clickable */}
        <TooltipProvider delayDuration={300}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-default opacity-70">
                <Radio className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${healthColor[outputData.streamHealth]}`}>
                  {healthText[outputData.streamHealth]}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Output Stream Health</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="h-4 w-px bg-border" />

        {/* Social Publish */}
        <Dialog open={isSocialPublishDialogOpen} onOpenChange={setIsSocialPublishDialogOpen}>
          <TooltipProvider delayDuration={300}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/50 rounded px-1.5 py-0.5 transition-colors">
                    <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="flex items-center gap-1">
                      {socialDestinations.filter(d => d.isPublished).map((dest) => (
                        <span
                          key={dest.id}
                          className="text-xs font-semibold text-primary px-1.5 py-0.5 bg-primary/10 rounded"
                        >
                          {dest.name}
                        </span>
                      ))}
                      {publishedCount === 0 && (
                        <span className="text-xs text-muted-foreground">No destinations</span>
                      )}
                    </div>
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Social Publish</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-base font-semibold uppercase tracking-wide">Social Publish</DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              {/* Header Controls */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="auto-publish"
                      checked={autoPublish}
                      onCheckedChange={(checked) => setAutoPublish(checked === true)}
                      className="rounded-none h-4 w-4"
                    />
                    <label
                      htmlFor="auto-publish"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Auto Publish
                    </label>
                  </div>
                  <button className="text-sm text-destructive hover:text-destructive/80 transition-colors">
                    Unpublish All
                  </button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full"
                  onClick={() => {
                    toast({
                      title: "Add Social Destination",
                      description: "Feature coming soon",
                    });
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Social Destinations List */}
              <div className="space-y-3">
                {detailedSocialDestinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Profile Picture/Logo */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 ${dest.logoColor} rounded-lg flex items-center justify-center relative overflow-hidden`}>
                        <span className={`text-lg font-bold ${dest.textColor}`}>{dest.logo}</span>
                        {dest.subText && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                            <span className={`text-[8px] ${dest.subTextColor} font-medium`}>{dest.subText}</span>
                          </div>
                        )}
                        {/* Platform Icon Overlay */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-lg flex items-center justify-center bg-white">
                          {dest.platform === "YouTube" ? (
                            <div className="w-3 h-3 bg-red-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">▶</span>
                            </div>
                          ) : (
                            <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">f</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Channel Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-foreground">{dest.channelName}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">{dest.status}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <ExternalLink className="w-3 h-3 mr-2" />
                                Visit channel
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="w-3 h-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <X className="w-3 h-3 mr-2" />
                                Unpublish
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{dest.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Selected Chat Button */}
        <Dialog open={isSelectedChatDialogOpen} onOpenChange={(open) => {
          setIsSelectedChatDialogOpen(open);
          if (!open) {
            setHasSelectedChatActions(false);
          }
        }}>
          <TooltipProvider delayDuration={300}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
          <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-md relative flex items-center justify-center hover:bg-accent hover:border-accent-foreground/20 transition-all cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5" />
              {selectedMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] px-1 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full text-center leading-none">
                  {selectedMessages.length}
                </span>
              )}
            </Button>
          </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Selected Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col [&>button]:hidden">
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
                              onClick={() => handleDeleteFromSelectedChat(msg.id)}
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
              <Button onClick={() => {
                setIsSelectedChatDialogOpen(false);
                setHasSelectedChatActions(false);
              }}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Messages Summary */}
        <TooltipProvider delayDuration={300}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
        <Button
          variant="outline"
          size="sm"
                  className="h-8 w-8 p-0 rounded-md relative flex items-center justify-center cursor-default opacity-70"
          disabled
        >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="absolute -top-1 -right-1 min-w-[18px] px-1 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full text-center leading-none">
            {totalChatMessages}
          </span>
        </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Q&A Summary - Non-clickable */}
        <TooltipProvider delayDuration={300}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
        <Button
          variant="outline"
          size="sm"
                  className="h-8 w-8 p-0 rounded-md relative flex items-center justify-center cursor-default opacity-70"
          disabled
        >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="absolute -top-1 -right-1 min-w-[18px] px-1 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full text-center leading-none">
            {qaCount}
          </span>
        </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Q&A</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Reactions Summary - Non-clickable */}
        <TooltipProvider delayDuration={300}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
        <Button
          variant="outline"
          size="sm"
                  className="h-8 w-8 p-0 rounded-md relative flex items-center justify-center cursor-default opacity-70"
          disabled
        >
                  <Heart className="w-3.5 h-3.5" />
                  <span className="absolute -top-1 -right-1 min-w-[18px] px-1 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full text-center leading-none">
            {reactionsCount}
          </span>
        </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total reactions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Active Users Button */}
        <Dialog open={isActiveUsersDialogOpen} onOpenChange={setIsActiveUsersDialogOpen}>
          <TooltipProvider delayDuration={300}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
          <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md relative flex items-center justify-center hover:bg-accent hover:border-accent-foreground/20 transition-all cursor-pointer">
                    <Users className="w-3.5 h-3.5" />
                    <span className="absolute -top-1 -right-1 min-w-[18px] px-1 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full text-center leading-none">
                3
              </span>
            </Button>
          </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Active Users</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col [&>button]:hidden">
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
          <TooltipProvider delayDuration={300}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
        <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md relative flex items-center justify-center hover:bg-accent hover:border-accent-foreground/20 transition-all cursor-pointer">
                    <Ban className="w-3.5 h-3.5" />
            {blockedUsers.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] px-1 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full text-center leading-none">
                {blockedUsers.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Block User</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full flex flex-col [&>button]:hidden">
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
            }}>Close</Button>
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
