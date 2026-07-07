import { useEffect, useRef, useState } from "react";

function streamStep(remaining: number): number {
  if (remaining > 800) return 6;
  if (remaining > 400) return 4;
  if (remaining > 150) return 3;
  if (remaining > 40) return 2;
  return 1;
}

function pauseForChar(char: string): number {
  if (char === "\n") return 48;
  if (".!?".includes(char)) return 28;
  if (",;:".includes(char)) return 14;
  return 0;
}

export function useStreamingText(
  fullText: string,
  enabled: boolean,
  onComplete?: () => void,
  onProgress?: () => void,
): { text: string; isComplete: boolean } {
  const [visibleLength, setVisibleLength] = useState(
    enabled ? 0 : fullText.length,
  );
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;

    if (!enabled) {
      setVisibleLength(fullText.length);
      return;
    }

    setVisibleLength(0);
    let index = 0;
    let timeoutId = 0;

    const tick = () => {
      const remaining = fullText.length - index;
      if (remaining <= 0) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return;
      }

      const step = streamStep(remaining);
      const nextIndex = Math.min(fullText.length, index + step);
      const lastChar = fullText[nextIndex - 1] ?? "";
      index = nextIndex;

      setVisibleLength(index);
      onProgress?.();

      const delay = 12 + pauseForChar(lastChar);
      timeoutId = window.setTimeout(tick, delay);
    };

    timeoutId = window.setTimeout(tick, 40);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fullText, enabled, onComplete, onProgress]);

  return {
    text: fullText.slice(0, visibleLength),
    isComplete: !enabled || visibleLength >= fullText.length,
  };
}
