"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { RECONNECT_DELAY_MS, MAX_RECONNECT_ATTEMPTS } from "@/lib/utils/constants";

type SocketEventHandler = (...args: unknown[]) => void;

interface UseSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const {
    namespace = "/",
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Map<string, Set<SocketEventHandler>>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(namespace, {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY_MS,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      onConnect?.();
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on("connect_error", (error) => {
      reconnectAttemptsRef.current++;
      onError?.(new Error(error.message));
    });

    // Apply registered handlers
    handlersRef.current.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        socket.on(event, handler);
      });
    });

    socketRef.current = socket;
  }, [namespace, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback((event: string, ...args: unknown[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args);
    }
  }, []);

  const on = useCallback((event: string, handler: SocketEventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event: string, handler?: SocketEventHandler) => {
    if (handler) {
      handlersRef.current.get(event)?.delete(handler);
      socketRef.current?.off(event, handler);
    } else {
      handlersRef.current.get(event)?.clear();
      socketRef.current?.off(event);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
