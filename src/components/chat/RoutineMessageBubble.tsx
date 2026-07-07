import { MarkdownContent } from "../MarkdownContent";
import type { RoutineChatMessage } from "../../types/routine-chat.types";

interface Props {
  message: RoutineChatMessage;
}

function formatMessageTime(createdAt?: string): string {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RoutineMessageBubble({ message }: Props) {
  const isUser = message.role === "USER";
  const time = formatMessageTime(message.createdAt);

  return (
    <div
      className={`routine-chat-bubble-row${isUser ? " is-user" : " is-ai"}`}
    >
      {!isUser && (
        <div className="routine-chat-bubble-avatar" aria-hidden>
          🤖
        </div>
      )}

      <div className={`routine-chat-bubble${isUser ? " is-user" : " is-ai"}`}>
        {isUser ? (
          message.text
        ) : (
          <MarkdownContent content={message.text} />
        )}
        {time && <div className="routine-chat-bubble-time">{time}</div>}
      </div>
    </div>
  );
}

export function RoutineChatTypingIndicator() {
  return (
    <div className="routine-chat-bubble-row is-ai">
      <div className="routine-chat-bubble-avatar" aria-hidden>
        🤖
      </div>
      <div className="routine-chat-bubble is-ai is-typing" aria-label="AI 응답 생성 중">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
