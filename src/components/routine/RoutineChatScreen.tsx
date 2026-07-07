import { FormEvent, useEffect, useRef, useState } from "react";
import { STARTER_PROMPTS } from "../../constants/routine";
import { useRoutineChat } from "../../hooks/useRoutineChat";
import type { UpdatedRoutine } from "../../types/routine-chat.types";
import {
  RoutineChatTypingIndicator,
  RoutineMessageBubble,
} from "../chat/RoutineMessageBubble";

interface Props {
  chatId: string | null;
  routineSummary?: string;
  variant?: "page" | "popup";
  onClose: () => void;
  onRoutineUpdate: (routine: UpdatedRoutine) => void;
  onChatIdResolved?: (chatId: string) => void;
}

export function RoutineChatScreen({
  chatId,
  routineSummary = "",
  variant = "page",
  onClose,
  onRoutineUpdate,
  onChatIdResolved,
}: Props) {
  const [inputText, setInputText] = useState("");
  const [toast, setToast] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, loading, sending, error, sendMessage } = useRoutineChat({
    chatId,
    onRoutineUpdate: (routine) => {
      onRoutineUpdate(routine);
      setToast("루틴이 업데이트되었어요 ✅");
      window.setTimeout(() => setToast(""), 4000);
    },
    onChatIdResolved,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function onSend(event?: FormEvent) {
    event?.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText;
    setInputText("");
    await sendMessage(text);
  }

  return (
    <div className={`routine-chat${variant === "popup" ? " routine-chat--popup" : ""}`}>
      {variant === "page" ? (
        <header className="routine-chat-header routine-chat-header--v2">
          <button
            type="button"
            className="routine-chat-back-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ←
          </button>
          <div className="routine-chat-header-copy">
            <p className="routine-chat-header-title">AI 루틴 상담</p>
            {routineSummary && (
              <p className="routine-chat-header-subtitle">{routineSummary}</p>
            )}
          </div>
        </header>
      ) : (
        routineSummary && (
          <p className="routine-chat-popup-summary">{routineSummary}</p>
        )
      )}

      {toast && <div className="routine-toast">{toast}</div>}
      {error && <div className="banner-error">{error}</div>}

      <div className="routine-chat-messages">
        {loading && (
          <p className="routine-chat-loading">대화 내용을 불러오는 중...</p>
        )}

        {!loading && messages.length === 0 && (
          <div className="routine-chat-starters-empty">
            <p className="routine-chat-empty">
              루틴에 대해 무엇이든 물어보세요
            </p>
            <div className="routine-chat-starters routine-chat-starters--center">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="routine-starter-chip"
                  disabled={sending}
                  onClick={() => void sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <RoutineMessageBubble key={message.id} message={message} />
        ))}

        {sending && <RoutineChatTypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {messages.length > 0 && (
        <div className="routine-chat-starters">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="routine-starter-chip"
              disabled={sending}
              onClick={() => void sendMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form className="routine-chat-composer routine-chat-composer--v2" onSubmit={(e) => void onSend(e)}>
        <textarea
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSend();
            }
          }}
          placeholder="루틴에 대해 물어보거나 조정을 요청하세요..."
          rows={1}
          disabled={sending || loading}
        />
        <button
          type="submit"
          className="routine-chat-send-btn"
          disabled={sending || loading || !inputText.trim()}
          aria-label="전송"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
