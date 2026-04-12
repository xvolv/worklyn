"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io({
      transports: ["websocket", "polling"],
    });
  }
  return globalSocket;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();

    return () => {
      // Don't disconnect the global socket on unmount
    };
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    const socket = getSocket();
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    getSocket().emit(event, data);
  }, []);

  return { on, emit, socket: socketRef };
}
