"use client";

import { useEffect, useCallback, useState } from "react";
import { useSocket } from "./useSocket";
import { PRESENCE_HEARTBEAT_INTERVAL_MS } from "@/lib/utils/constants";

interface _UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: Date;
}

export function usePresence(userId: string) {
  const { isConnected, emit, on, off } = useSocket({ namespace: "/presence" });
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const sendHeartbeat = useCallback(() => {
    if (isConnected) {
      emit("heartbeat", { userId });
    }
  }, [emit, isConnected, userId]);

  useEffect(() => {
    if (!isConnected) return;

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, PRESENCE_HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isConnected, sendHeartbeat]);

  useEffect(() => {
    if (!isConnected) return;

    const handleOnline = (args: unknown) => {
      const { userId: uid } = args as { userId: string };
      setOnlineUsers((prev) => new Set(prev).add(uid));
    };

    const handleOffline = (args: unknown) => {
      const { userId: uid } = args as { userId: string };
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
    };

    const handleSync = (args: unknown) => {
      const { users } = args as { users: string[] };
      setOnlineUsers(new Set(users));
    };

    on("user:online", handleOnline);
    on("user:offline", handleOffline);
    on("presence:sync", handleSync);

    return () => {
      off("user:online", handleOnline);
      off("user:offline", handleOffline);
      off("presence:sync", handleSync);
    };
  }, [isConnected, on, off]);

  const isUserOnline = useCallback(
    (uid: string) => {
      return onlineUsers.has(uid);
    },
    [onlineUsers]
  );

  return {
    isConnected,
    onlineUsers: Array.from(onlineUsers),
    isUserOnline,
  };
}
