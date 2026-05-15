import { Activity, Cpu, Ban, Star, Trash2, Search, MessageSquare, Radio, Share2, MoreVertical, ExternalLink, Pencil, X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { cn } from "@/lib/utils";
import type { ChatMessage, BlockedUser } from "./moderation/ChatModeration";

const managementModalContentClass =
  "flex w-[min(960px,calc(100vw-48px))] max-h-[calc(100vh-80px)] max-w-[min(960px,calc(100vw-48px))] flex-col gap-0 overflow-hidden p-6 sm:p-7 [&>button]:hidden";

const managementModalTitleClass = "text-xl font-bold tracking-tight text-foreground";

const managementModalDescriptionClass = "text-sm text-[#64748b] dark:text-muted-foreground";

const managementListScrollClass =
  "max-h-[420px] overflow-y-auto rounded-[10px] border border-[#e2e8f0] bg-muted/10 dark:border-border";

const managementEmptyStateClass =
  "flex min-h-[120px] max-h-40 flex-col items-center justify-center rounded-[10px] border border-dashed border-border/60 bg-muted/15 px-4 py-6 text-center";

const managementRowClass =
  "flex flex-col gap-2 rounded-[10px] border border-[#e2e8f0] bg-card px-3 py-2.5 shadow-sm dark:border-border sm:flex-row sm:items-start sm:justify-between sm:gap-3";

const managementIconBtnClass =
  "h-[30px] w-[30px] shrink-0 rounded-lg p-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground";

const managementIconBtnDangerClass =
  "h-[30px] w-[30px] shrink-0 rounded-lg p-0 text-destructive hover:bg-destructive/10 hover:text-destructive";

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
  commentsEnabled?: boolean;
  /** Opens the full moderation panel in a new tab (admin footer CTA). */
  onOpenModerationPanel?: () => void;
  socialDestinations: Array<{
    id: string;
    channelName: string;
    description: string;
    status: "ONLINE" | "OFFLINE";
    platform: "YouTube" | "Facebook";
    logo: string;
    logoColor: string;
    textColor: string;
    subText: string;
    subTextColor: string;
    isPublished: boolean;
  }>;
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
  commentsEnabled = true,
  onOpenModerationPanel,
  socialDestinations,
}: StatusBarProps) {
  const [isBlockUserDialogOpen, setIsBlockUserDialogOpen] = useState(false);
  const [isSelectedChatDialogOpen, setIsSelectedChatDialogOpen] = useState(false);
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

  // Filter blocked users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return blockedUsers;
    }
    const query = searchQuery.toLowerCase();
    return blockedUsers.filter((user) => user.username.toLowerCase().includes(query));
  }, [blockedUsers, searchQuery]);

  // Get selected messages
  const selectedMessages = useMemo(() => {
    return messages.filter((msg) => msg.isSelected);
  }, [messages]);

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

  const publishedDestinations = socialDestinations.filter((dest) => dest.isPublished);
  const publishedYoutubeChannels = publishedDestinations.filter((dest) => dest.platform === "YouTube");

  return (
    <Fragment>
      <footer className="h-9 border-t border-border/70 bg-card px-4 flex items-center justify-between text-xs">
      <div className="flex items-center gap-4">
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

        <div className="h-4 w-px bg-border mx-1" />

        {/* Output Stream Health - Non-clickable */}
        <TooltipProvider delayDuration={300}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-default opacity-70">
                <Activity className="w-3.5 h-3.5 text-muted-foreground" />
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

        <div className="h-4 w-px bg-border mx-1" />

        {/* Social Publish */}
        <Dialog open={isSocialPublishDialogOpen} onOpenChange={setIsSocialPublishDialogOpen}>
          <TooltipProvider delayDuration={300}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/50 rounded px-1.5 py-0.5 transition-colors">
                    <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="flex items-center gap-1">
                      {publishedYoutubeChannels.map((dest) => (
                        <span
                          key={dest.id}
                          className="text-xs font-semibold text-primary px-1.5 py-0.5 bg-primary/10 rounded"
                        >
                          {dest.channelName}
                        </span>
                      ))}
                      {publishedYoutubeChannels.length === 0 && (
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
                {socialDestinations.map((dest) => (
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
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-black">
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

      <div className="ml-auto flex items-center gap-4">
        {onOpenModerationPanel ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 rounded-md px-3 text-xs font-semibold"
              onClick={onOpenModerationPanel}
            >
              Moderation Panel
            </Button>
            <div className="h-4 w-px bg-border" />
          </>
        ) : null}

        <div className="flex items-center gap-3">
          {commentsEnabled && (
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
              <DialogContent className={managementModalContentClass}>
                <DialogHeader className="shrink-0 space-y-1.5 text-left">
                  <DialogTitle className={managementModalTitleClass}>Selected Chats</DialogTitle>
                  <DialogDescription className={managementModalDescriptionClass}>
                    Manage selected chat messages. Delete, unselect, or block users from here.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex min-h-0 flex-col">
                  {selectedMessages.length > 0 && (
                    <p className="mb-3 text-xs font-medium text-muted-foreground">
                      {selectedMessages.length} selected message{selectedMessages.length === 1 ? "" : "s"}
                    </p>
                  )}
                  {selectedMessages.length === 0 ? (
                    <div className={managementEmptyStateClass}>
                      <p className="text-sm font-medium text-foreground">No selected chats</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Select chat messages to manage them here.
                      </p>
                    </div>
                  ) : (
                    <div className={managementListScrollClass}>
                      <div className="flex flex-col gap-2 p-2">
                    {selectedMessages.map((msg) => {
                      const blocked = isUserBlocked(msg.username);
                      return (
                        <div
                          key={msg.id}
                          className={managementRowClass}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                              <span className="text-sm font-bold text-foreground">{msg.username}</span>
                              <span className="text-xs text-[#64748b] dark:text-muted-foreground">·</span>
                              <span className="text-xs tabular-nums text-[#64748b] dark:text-muted-foreground">
                                {msg.timestamp}
                              </span>
                              {blocked && (
                                <span className="rounded border border-destructive/25 bg-destructive/10 px-1.5 py-px text-[10px] font-semibold uppercase leading-none text-destructive">
                                  Blocked
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-snug text-[#334155] dark:text-foreground/90">
                              {msg.message}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center justify-end gap-1 sm:pt-0.5">
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className={managementIconBtnClass}
                                    onClick={() => onToggleSelect?.(msg.id)}
                                    aria-label="Unselect"
                                  >
                                    <Star className="h-4 w-4 fill-primary text-primary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Unselect</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className={cn(managementIconBtnClass, blocked && "opacity-40")}
                                    onClick={() => handleBlockRequest(msg.username)}
                                    disabled={blocked}
                                    aria-label="Block user"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">{blocked ? "Already blocked" : "Block user"}</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className={managementIconBtnDangerClass}
                                    onClick={() => handleDeleteFromSelectedChat(msg.id)}
                                    aria-label="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Delete</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="mt-4 shrink-0 justify-end border-t border-border/50 pt-4 sm:justify-end">
                  <Button
                    type="button"
                    className="h-9 px-4"
                    onClick={() => {
                      setIsSelectedChatDialogOpen(false);
                      setHasSelectedChatActions(false);
                    }}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {commentsEnabled && <div className="h-4 w-px bg-border mx-1" />}

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
            <DialogContent className={managementModalContentClass}>
              <DialogHeader className="shrink-0 space-y-1.5 text-left">
                <DialogTitle className={managementModalTitleClass}>Blocked Users</DialogTitle>
                <DialogDescription className={managementModalDescriptionClass}>
                  View and manage blocked users. Unblock users to restore participation.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex min-h-0 flex-col">
                <div className="relative mb-3 shrink-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search blocked users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 rounded-[10px] border-[#dbe3ef] bg-white pl-9 text-sm dark:border-border dark:bg-background"
                    aria-label="Search blocked users"
                  />
                </div>
                {filteredUsers.length === 0 ? (
                  <div className={managementEmptyStateClass}>
                    <p className="text-sm font-medium text-foreground">No blocked users</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {searchQuery.trim()
                        ? "No users match your search."
                        : "Blocked users will appear here."}
                    </p>
                  </div>
                ) : (
                  <div className={managementListScrollClass}>
                    <div className="flex flex-col gap-2 p-2">
                      {filteredUsers.map((user) => (
                        <div key={user.username} className={managementRowClass}>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground">{user.username}</p>
                            <p className="mt-0.5 text-xs text-[#64748b] dark:text-muted-foreground">
                              Blocked at {user.blockedAt || "N/A"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onUnblockUser(user.username)}
                            className="h-8 shrink-0 rounded-lg px-3 text-xs font-semibold"
                          >
                            Unblock
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4 shrink-0 justify-end border-t border-border/50 pt-4 sm:justify-end">
                <Button
                  type="button"
                  className="h-9 px-4"
                  onClick={() => {
                    setIsBlockUserDialogOpen(false);
                    setSearchQuery("");
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
