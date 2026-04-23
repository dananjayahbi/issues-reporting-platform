"use client";

import { useState, useMemo } from "react";
import { useChannels } from "@/hooks/useChat";
import { ChannelSidebar } from "@/components/chat/ChannelSidebar";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { CreateChannelDialog } from "@/components/chat/CreateChannelDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search } from "lucide-react";

export function ChatContainer() {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const channelParams = useMemo(
    () => (searchTerm ? { search: searchTerm } : {}),
    [searchTerm]
  );
  const { data: channelsData, isLoading } = useChannels(channelParams);

  const channels = channelsData?.channels || [];
  const selectedChannel = channels.find((ch) => ch.id === selectedChannelId);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="space-y-4 p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Messages</h2>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Channel
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <ChannelSidebar
              channels={channels}
              activeChannelId={selectedChannelId}
              onChannelSelect={handleChannelSelect}
              onCreateChannel={() => setCreateDialogOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                # {selectedChannel.name}
              </h3>
              {selectedChannel.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedChannel.description}
                </p>
              )}
            </div>

            <MessageList channelId={selectedChannel.id} />

            <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <MessageInput channelId={selectedChannel.id} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Select a channel to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Dialog */}
      <CreateChannelDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
