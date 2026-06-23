import { useEffect, useRef, useState } from "react";
import type { Message } from "../types";

interface MessageListProps {
  messages: Message[];
  onEditMessage: (messageId: string, text: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

export function MessageList({
  messages,
  onEditMessage,
  onDeleteMessage,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function saveEdit(messageId: string) {
    if (!editText.trim()) return;
    await onEditMessage(messageId, editText.trim());
    setEditingId(null);
    setEditText("");
  }

  if (messages.length === 0) {
    return (
      <div className="message-empty">
        <p>메시지를 입력하여 AI와 대화를 시작하세요.</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => {
        const isUser = message.from === "USER";
        const isEditing = editingId === message.id;

        return (
          <div
            key={message.id}
            className={`message-row ${isUser ? "user" : "ai"}`}
          >
            <div className="message-meta">
              <span className="message-role">{isUser ? "나" : "AI"}</span>
              <time dateTime={message.createdAt}>
                {new Date(message.createdAt).toLocaleString("ko-KR")}
              </time>
            </div>

            {isEditing ? (
              <div className="message-edit">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                />
                <div className="message-actions">
                  <button type="button" onClick={() => saveEdit(message.id)}>
                    저장
                  </button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="message-bubble">{message.text}</div>
                {isUser && (
                  <div className="message-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(message.id);
                        setEditText(message.text);
                      }}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(message.id)}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
