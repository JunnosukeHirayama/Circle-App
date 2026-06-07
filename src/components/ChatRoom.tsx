"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { sendMessage } from "@/app/actions/chat";
import { Avatar } from "@/components/ui";
import { cn, clockTime } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  createdAt: string;
};

export function ChatRoom({
  roomId,
  currentUserId,
  initialMessages,
}: {
  roomId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to the room's SSE stream.
  useEffect(() => {
    const es = new EventSource(`/api/chat/${roomId}/stream`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.type === "connected") return;
        if (!data?.id) return;
        setMessages((prev) =>
          prev.some((m) => m.id === data.id) ? prev : [...prev, data as ChatMessage],
        );
      } catch {
        /* ignore malformed frame */
      }
    };
    return () => es.close();
  }, [roomId]);

  // Keep scrolled to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");
    const fd = new FormData();
    fd.set("roomId", roomId);
    fd.set("content", content);
    await sendMessage(fd);
    setSending(false);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="scroll-soft flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-stone-400">
            まだメッセージがありません。あいさつから始めましょう👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={cn("flex items-end gap-2", mine ? "flex-row-reverse" : "flex-row")}
            >
              {!mine && <Avatar name={m.senderName} image={m.senderImage} size={32} />}
              <div className={cn("max-w-[75%]", mine ? "items-end" : "items-start")}>
                {!mine && <p className="mb-0.5 px-1 text-xs text-stone-400">{m.senderName}</p>}
                <div
                  className={cn(
                    "whitespace-pre-wrap break-words rounded-3xl px-4 py-2.5 text-sm leading-relaxed",
                    mine
                      ? "rounded-br-md bg-amber-400 text-amber-950"
                      : "rounded-bl-md bg-white text-stone-700 ring-1 ring-stone-100",
                  )}
                >
                  {m.content}
                </div>
                <p className={cn("mt-0.5 px-1 text-[10px] text-stone-400", mine ? "text-right" : "text-left")}>
                  {clockTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-stone-100 bg-white px-4 py-3 sm:px-6"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力..."
          className="h-11 flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 text-sm focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-400 text-amber-950 transition hover:bg-amber-300 disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
