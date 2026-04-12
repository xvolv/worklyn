"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { useSocket } from "@/lib/socket";

type CommentAuthor = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
};

interface TaskCommentsProps {
  taskId: string;
  taskTitle: string;
  workspaceSlug: string;
  currentUserId: string;
  onClose: () => void;
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function TaskComments({
  taskId,
  taskTitle,
  workspaceSlug,
  currentUserId,
  onClose,
}: TaskCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { on } = useSocket();

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `/api/workspace/${workspaceSlug}/tasks/${taskId}/comments`
        );
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [taskId, workspaceSlug]);

  // Real-time comments
  useEffect(() => {
    const cleanup = on(`comment-added:${taskId}`, (comment: CommentItem) => {
      setComments((prev) => {
        if (prev.some((c) => c.id === comment.id)) return prev;
        return [...prev, comment];
      });
    });
    return cleanup;
  }, [taskId, on]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceSlug}/tasks/${taskId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: input.trim() }),
        }
      );
      if (res.ok) {
        setInput("");
      }
    } catch {
      // silent
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Slide-over */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-white shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              Comments
            </div>
            <h3 className="mt-0.5 truncate text-sm font-bold text-foreground">
              {taskTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground/20" />
              <p className="mt-3 text-sm font-semibold text-muted-foreground">
                No comments yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Be the first to comment on this task.
              </p>
            </div>
          ) : (
            comments.map((c, index) => {
              const isOwn = c.author.id === currentUserId;
              const isConsecutive = index > 0 && comments[index - 1].author.id === c.author.id && 
                (new Date(c.createdAt).getTime() - new Date(comments[index - 1].createdAt).getTime() < 120000);
              
              return (
                <div key={c.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} ${isConsecutive ? "mt-1" : "mt-4"}`}>
                  <div className={`flex max-w-[85%] gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className="w-8 shrink-0 flex justify-center">
                      {!isConsecutive && (
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${getAvatarColor(c.author.name)}`}
                        >
                          {getInitials(c.author.name)}
                        </div>
                      )}
                    </div>

                    <div className={`min-w-0 flex-1 flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                      {!isConsecutive && (
                        <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-sm font-semibold text-gray-800">
                            {c.author.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground/80">
                            {timeAgo(c.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`px-3.5 py-2 text-sm whitespace-pre-wrap break-words leading-relaxed rounded-2xl ${
                        isOwn 
                          ? "bg-indigo-600 text-white rounded-tr-[4px]" 
                          : "bg-gray-100 text-gray-900 rounded-tl-[4px]"
                      }`}>
                        {c.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
              rows={1}
              className="flex-1 resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
          <p className="mt-1.5 text-[11px] text-muted-foreground/60">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
