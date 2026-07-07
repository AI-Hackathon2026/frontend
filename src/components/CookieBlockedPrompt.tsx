import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  canUseFirstPartyCookies,
  isCrossOriginApi,
  verifyAuthSession,
} from "../utils/cookieSupport";
import {
  getMobilePlatform,
  isStandalonePwa,
  openInSystemBrowser,
  type MobilePlatform,
} from "../utils/pwa";

interface CookieBlockedPromptProps {
  open: boolean;
  onClose: () => void;
  /** Called after the user fixes settings and session verification succeeds. */
  onResolved?: () => void;
  reason?: "login" | "session";
}

function platformSteps(platform: MobilePlatform, crossOrigin: boolean): string[] {
  if (platform === "ios") {
    const steps = [
      "설정 앱 → Safari → \"모든 쿠키 차단\"을 끕니다.",
      "설정 앱 → Safari → \"크로스 웹사이트 추적 방지\"를 끕니다.",
    ];
    if (crossOrigin) {
      steps.push(
        "홈 화면 HeAIth 앱을 삭제한 뒤, Safari에서 사이트를 열고 \"홈 화면에 추가\"로 다시 설치합니다.",
      );
    }
    steps.push("Safari에서 로그인한 뒤 홈 화면 앱을 다시 실행합니다.");
    return steps;
  }

  if (platform === "android") {
    return [
      "Chrome → ⋮ → 설정 → 사이트 설정 → 쿠키",
      "\"타사 쿠키\" 또는 \"모든 쿠키 허용\"을 켭니다.",
      "Chrome에서 HeAIth 사이트를 연 뒤 다시 로그인합니다.",
      "필요하면 \"앱 설치\"로 PWA를 다시 추가합니다.",
    ];
  }

  return [
    "브라우저 설정에서 이 사이트의 쿠키를 허용합니다.",
    "시크릿/프라이빗 모드가 아닌 일반 창에서 다시 로그인합니다.",
    "로그인 후에도 문제가 있으면 Safari 또는 Chrome에서 사이트를 열어 주세요.",
  ];
}

export function CookieBlockedPrompt({
  open,
  onClose,
  onResolved,
  reason = "login",
}: CookieBlockedPromptProps) {
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  const platform = getMobilePlatform();
  const crossOrigin = isCrossOriginApi();
  const firstPartyBlocked = !canUseFirstPartyCookies();
  const steps = platformSteps(platform, crossOrigin);

  useEffect(() => {
    if (!open) {
      setCheckMessage(null);
      setChecking(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleRetry() {
    setChecking(true);
    setCheckMessage(null);

    const sessionOk = await verifyAuthSession();
    setChecking(false);

    if (sessionOk) {
      setCheckMessage("세션이 정상적으로 연결되었습니다.");
      onResolved?.();
      return;
    }

    if (firstPartyBlocked) {
      setCheckMessage("브라우저에서 쿠키가 아직 차단되어 있습니다.");
      return;
    }

    setCheckMessage(
      crossOrigin
        ? "로그인 쿠키가 아직 저장되지 않았습니다. 아래 안내에 따라 쿠키를 허용한 뒤 다시 로그인해 주세요."
        : "세션을 확인할 수 없습니다. 다시 로그인해 주세요.",
    );
  }

  const title =
    reason === "session"
      ? "로그인 세션이 유지되지 않습니다"
      : "쿠키 허용이 필요합니다";

  const intro =
    reason === "session"
      ? "앱에서 로그인 정보(쿠키)를 저장하지 못해 자동으로 로그아웃되었습니다."
      : "로그인은 성공했지만, PWA 앱에서 쿠키가 차단되어 세션을 유지할 수 없습니다.";

  return createPortal(
    <div
      className="modal-backdrop cookie-blocked-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="modal-card cookie-blocked-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-blocked-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="cookie-blocked-title" className="modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="cookie-blocked-body">
          <p className="cookie-blocked-intro">{intro}</p>

          {isStandalonePwa() && (
            <p className="cookie-blocked-note">
              홈 화면 앱(PWA)에서는 브라우저보다 쿠키 제한이 더 엄격할 수
              있습니다.
            </p>
          )}

          {firstPartyBlocked && (
            <p className="cookie-blocked-warning">
              이 기기에서 쿠키가 완전히 차단된 상태입니다. 아래 설정을 먼저
              변경해 주세요.
            </p>
          )}

          <ol className="cookie-blocked-steps">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          {checkMessage && (
            <p
              className={
                checkMessage.includes("정상")
                  ? "cookie-blocked-status cookie-blocked-status--ok"
                  : "cookie-blocked-status"
              }
            >
              {checkMessage}
            </p>
          )}

          <div className="cookie-blocked-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => openInSystemBrowser()}
            >
              Safari / Chrome에서 열기
            </button>
            <button
              type="button"
              className="ghost-btn"
              disabled={checking}
              onClick={() => void handleRetry()}
            >
              {checking ? "확인 중..." : "다시 확인"}
            </button>
            <button type="button" className="ghost-btn" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface PwaCookieHintProps {
  onOpenGuide: () => void;
}

/** Compact hint shown on auth screens inside the installed PWA. */
export function PwaCookieHint({ onOpenGuide }: PwaCookieHintProps) {
  if (!shouldShowPwaCookieHint()) return null;

  return (
    <div className="pwa-cookie-hint" role="note">
      <p>
        앱에서 로그인하려면 쿠키 허용이 필요할 수 있습니다.
      </p>
      <button type="button" className="pwa-cookie-hint-btn" onClick={onOpenGuide}>
        쿠키 설정 안내
      </button>
    </div>
  );
}

function shouldShowPwaCookieHint(): boolean {
  return isStandalonePwa() && (isCrossOriginApi() || !canUseFirstPartyCookies());
}
