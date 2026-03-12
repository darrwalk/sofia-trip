"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type ChatMessage = {
  id: number;
  name: string;
  message: string;
  is_bot: number;
  created_at: string;
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr + "Z").getTime(); // SQLite stores UTC without Z
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<number>(0);

  // Load name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sofia-trip-voter");
    if (saved) setName(saved);
  }, []);

  // Save name to localStorage
  useEffect(() => {
    if (name.trim()) {
      localStorage.setItem("sofia-trip-voter", name.trim());
    }
  }, [name]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const url = initial || lastIdRef.current === 0
        ? "/api/chat"
        : `/api/chat?since=${encodeURIComponent(messages.length > 0 ? messages[messages.length - 1].created_at : "")}`;
      
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      
      if (initial) {
        setMessages(data.messages);
        lastIdRef.current = data.messages.length > 0 ? data.messages[data.messages.length - 1].id : 0;
        setLoaded(true);
        setTimeout(scrollToBottom, 100);
      } else if (data.messages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
          if (newMsgs.length === 0) return prev;
          lastIdRef.current = newMsgs[newMsgs.length - 1].id;
          return [...prev, ...newMsgs];
        });
        setTimeout(scrollToBottom, 100);
      }
    } catch {
      // silent fail on poll
    }
  }, [messages, scrollToBottom]);

  // Initial load
  useEffect(() => {
    fetchMessages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchMessages(false), 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!name.trim() || !text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: text.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        setText("");
        setTimeout(scrollToBottom, 100);
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
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-gray-200 p-4 mb-3">
        {!loaded ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet — be the first to say something! 💬
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.is_bot ? "items-start" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.is_bot
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm text-orange-600">
                      {msg.name}
                    </span>
                    {msg.is_bot ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                        ✨ AI
                      </span>
                    ) : null}
                    <span className="text-xs text-gray-400 ml-auto">
                      {relativeTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              onClick={handleSend}
              disabled={!name.trim() || !text.trim() || sending}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
