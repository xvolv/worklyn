"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare, ArrowDown } from "lucide-react";
import { useSocket } from "@/lib/socket";

type MessageAuthor = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  author: MessageAuthor;
};

interface WorkspaceChatProps {
  workspaceSlug: string;
  workspaceId: string;
  workspaceName: string;
  currentUserId: string;
}

const avatarColors = [
  "bg-indigo-600", "bg-amber-500", "bg-rose-500", "bg-emerald-500",
  "bg-sky-500", "bg-purple-500", "bg-teal-500", "bg-slate-700",
];

function getAvatarColor(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function shouldShowDateSeparator(
  messages: ChatMessage[],
  index: number
): boolean {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt).toDateString();
  const curr = new Date(messages[index].createdAt).toDateString();
  return prev !== curr;
}

function isConsecutive(messages: ChatMessage[], index: number): boolean {
  if (index === 0) return false;
  const prev = messages[index - 1];
  const curr = messages[index];
  if (prev.author.id !== curr.author.id) return false;
  const timeDiff =
    new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
  return timeDiff < 120000; // 2 minutes
}

export default function WorkspaceChat({
  workspaceSlug,
  workspaceId,
  workspaceName,
  currentUserId,
}: WorkspaceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { on } = useSocket();

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/workspace/${workspaceSlug}/chat`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [workspaceSlug]);

  // Real-time messages
  useEffect(() => {
    const cleanup = on(`chat:${workspaceId}`, (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });
    return cleanup;
  }, [workspaceId, on]);

  // Auto-scroll on new messages
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initial scroll to bottom
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [loading]);

  // Track scroll position for "scroll down" button
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    setShowScrollDown(!isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      await fetch(`/api/workspace/${workspaceSlug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } catch {
      setInput(content); // restore on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-4xl flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <MessageSquare className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            {workspaceName} Chat
          </h1>
          <p className="text-xs text-muted-foreground">
            Team conversation • {messages.length} messages
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto px-6 py-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">
              No messages yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start the conversation with your team.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {messages.map((msg, i) => {
              const showDate = shouldShowDateSeparator(messages, i);
              const consecutive = isConsecutive(messages, i);
              const isOwn = msg.author.id === currentUserId;

              return (
                <div key={msg.id}>
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex items-center gap-3 py-4">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}

                  {/* Message */}
                  <div
                    className={`group flex w-full ${isOwn ? "justify-end" : "justify-start"} ${
                      consecutive ? "mt-1" : "mt-4"
                    }`}
                  >
                    <div className={`flex max-w-[75%] gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar or spacer */}
                      <div className="w-8 shrink-0 flex justify-center">
                        {!consecutive && (
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${getAvatarColor(msg.author.name)}`}
                          >
                            {getInitials(msg.author.name)}
                          </div>
                        )}
                      </div>

                      <div className={`min-w-0 flex-1 flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                        {!consecutive && (
                          <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                            <span className="text-sm font-semibold text-gray-800">
                              {msg.author.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground/80">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`relative px-4 py-2.5 text-sm whitespace-pre-wrap break-words leading-relaxed rounded-2xl ${
                          isOwn 
                            ? "bg-indigo-600 text-white rounded-tr-[4px]" 
                            : "bg-gray-100 text-gray-900 rounded-tl-[4px]"
                        }`}>
                          {msg.content}
                          
                          {/* Hover timestamp for consecutive */}
                          {consecutive && (
                            <span className={`hidden absolute top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/60 group-hover:block shrink-0 ${isOwn ? "right-full mr-2" : "left-full ml-2"}`}>
                              {formatTime(msg.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />

        {/* Scroll to bottom */}
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-4 left-1/2 -translate-x-1/2 flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-xs font-semibold text-foreground shadow-lg hover:bg-muted"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            New messages
          </button>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${workspaceName}...`}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-white shadow-sm hover:bg-gray-900 disabled:opacity-40"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground/50">
          Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
