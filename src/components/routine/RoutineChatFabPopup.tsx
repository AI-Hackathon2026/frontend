import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { UpdatedRoutine } from "../../types/routine-chat.types";
import { AvatarSvg } from "../avatar/AvatarSvg";
import { RoutineChatScreen } from "./RoutineChatScreen";

interface Props {
  chatId: string | null;
  routineSummary?: string;
  avatarLevel?: number;
  onRoutineUpdate: (routine: UpdatedRoutine) => void;
  onChatIdResolved?: (chatId: string) => void;
}

export function RoutineChatFabPopup({
  chatId,
  routineSummary = "",
  avatarLevel = 1,
  onRoutineUpdate,
  onChatIdResolved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [resolvedChatId, setResolvedChatId] = useState<string | null>(chatId);

  useEffect(() => {
    setResolvedChatId(chatId);
  }, [chatId]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleChatIdResolved(id: string) {
    setResolvedChatId(id);
    onChatIdResolved?.(id);
  }

  return (
    <>
      <button
        type="button"
        className="chat-fab"
        aria-label="AI 루틴 상담 열기"
        onClick={() => setOpen(true)}
      >
        <span className="chat-fab-glow" aria-hidden />
        <span className="chat-fab-avatar" aria-hidden>
          <AvatarSvg level={avatarLevel} size={48} />
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="chat-popup-overlay"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div
              className="chat-popup-panel chat-popup-panel--routine"
              role="dialog"
              aria-modal="true"
              aria-label="AI 루틴 상담"
            >
              <header className="chat-popup-header">
                <div className="chat-popup-header-brand">
                  <span>AI 루틴 상담</span>
                </div>
                <button
                  type="button"
                  className="chat-popup-close"
                  aria-label="닫기"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </header>
              <div className="chat-popup-body chat-popup-body--routine">
                <RoutineChatScreen
                  chatId={resolvedChatId}
                  routineSummary={routineSummary}
                  variant="popup"
                  onClose={() => setOpen(false)}
                  onRoutineUpdate={onRoutineUpdate}
                  onChatIdResolved={handleChatIdResolved}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
