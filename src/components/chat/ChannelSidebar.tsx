"use client";

import { useState } from "react";
import type { Channel } from "@/types/chat.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Hash, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannelId: string | null;
  onChannelSelect: (id: string) => void;
  onCreateChannel: () => void;
}

export function ChannelSidebar({
  channels,
  activeChannelId,
  onChannelSelect,
  onCreateChannel,
}: ChannelSidebarProps) {
  const [search, setSearch] = useState("");

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const publicChannels = filteredChannels.filter((c) => c.type === "GENERAL");
  const groupChannels = filteredChannels.filter((c) => c.type === "GROUP");
  const dmChannels = filteredChannels.filter((c) => c.type === "DIRECT");

  return (
    <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Channels</h2>
          <Button variant="ghost" size="icon" onClick={onCreateChannel}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-6">
          {/* Public Channels */}
          {publicChannels.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">
                Public
              </h3>
              <div className="space-y-1">
                {publicChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={() => onChannelSelect(channel.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group Channels */}
          {groupChannels.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">
                Groups
              </h3>
              <div className="space-y-1">
                {groupChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={() => onChannelSelect(channel.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Direct Messages */}
          {dmChannels.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">
                Direct Messages
              </h3>
              <div className="space-y-1">
                {dmChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={() => onChannelSelect(channel.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ChannelItem({
  channel,
  isActive,
  onClick,
}: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = channel.type === "DIRECT" ? MessageSquare : Hash;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{channel.name}</span>
      {channel.unreadCount && channel.unreadCount > 0 && (
        <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
          {channel.unreadCount}
        </span>
      )}
    </button>
  );
}
