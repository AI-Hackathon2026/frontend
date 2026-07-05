import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MarkdownContent } from "../../MarkdownContent";

interface Props {
  open: boolean;
  onClose: () => void;
  content: string;
}

export function RoutineInfoSheet({ open, onClose, content }: Props) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="routine-v2-sheet-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="routine-v2-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="routine-info-sheet-title"
      >
        <div className="routine-v2-sheet-handle" aria-hidden />
        <header className="routine-v2-sheet-header">
          <h2 id="routine-info-sheet-title">왜 이 루틴인가요?</h2>
          <button
            type="button"
            className="routine-v2-sheet-close"
            aria-label="닫기"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <div className="routine-v2-sheet-body">
          <MarkdownContent content={content} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
