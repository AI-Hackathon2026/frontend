import { FormEvent, useEffect, useRef, useState } from "react";
import { api, withAuthRetry } from "../../api/client";
import { STARTER_PROMPTS } from "../../constants/routine";
import { MarkdownContent } from "../MarkdownContent";
import { TypingIndicator } from "../TypingIndicator";
import type { RoutineChatMessage } from "../../types";

interface Props {
  routineId: string;
  chatId: string;
  onBack: () => void;
  onRoutineUpdated: () => void;
}

interface DisplayMessage {
  id: string;
  role: "USER" | "AI";
  text: string;
}

export function RoutineChatScreen({
  chatId,
  onBack,
  onRoutineUpdated,
}: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    withAuthRetry(() => api.getRoutineChatMessages(chatId))
      .then((data) => {
        setMessages(
          data.map((m: RoutineChatMessage) => ({
            id: m.id,
            role: m.role,
            text: m.text,
          })),
        );
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "메시지를 불러올 수 없습니다.",
        );
      })
      .finally(() => setLoading(false));
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const tempId = `temp-${Date.now()}`;
    setInput("");
    setSending(true);
    setError("");
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "USER", text },
    ]);

    try {
      const response = await withAuthRetry(() =>
        api.sendRoutineChatMessage(chatId, text),
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "AI",
          text: response.aiResponse,
        },
      ]);
      if (response.routineUpdated) {
        setToast("루틴이 업데이트되었습니다 ✅");
        onRoutineUpdated();
        window.setTimeout(() => setToast(""), 4000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "메시지 전송 실패");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="routine-gate">
        <div className="spinner" />
        <p>채팅 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="routine-chat">
      <header className="routine-chat-header">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← 루틴으로
        </button>
        <h2>AI 건강 멘토</h2>
      </header>

      {toast && <div className="routine-toast">{toast}</div>}
      {error && <div className="banner-error">{error}</div>}

      <div className="routine-chat-messages">
        {messages.length === 0 && (
          <p className="muted routine-chat-empty">
            루틴에 대해 궁금한 점을 물어보세요.
          </p>
        )}
        {messages.map((msg) => {
          const isUser = msg.role === "USER";
          const isRoutineCard =
            !isUser && msg.id === messages.find((m) => m.role === "AI")?.id;
          return (
            <div
              key={msg.id}
              className={`message-row ${isUser ? "user" : "ai"}`}
            >
              <div className="message-meta">
                <span className="message-role">{isUser ? "나" : "AI"}</span>
              </div>
              <div
                className={`message-bubble${isRoutineCard ? " routine-chat-routine-card" : ""}`}
              >
                {isUser ? msg.text : <MarkdownContent content={msg.text} />}
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="message-row ai">
            <div className="message-meta">
              <span className="message-role">AI</span>
            </div>
            <div className="message-bubble">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="routine-chat-starters">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="routine-starter-chip"
            disabled={sending}
            onClick={() => setInput(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className="routine-chat-composer" onSubmit={(e) => void handleSend(e)}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          rows={2}
          disabled={sending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !sending) {
              e.preventDefault();
              void handleSend(e);
            }
          }}
        />
        <button type="submit" className="primary-btn" disabled={!input.trim() || sending}>
          전송
        </button>
      </form>
    </div>
  );
}
