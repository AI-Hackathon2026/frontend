import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HeAIthLogo } from "../components/HeAIthLogo";

const PAGE_COUNT = 3;
const FADE_MS = 480;
const WHEEL_THRESHOLD = 36;

type FadePhase = "steady" | "out" | "in";

const PAGE_LABELS = ["메인", "핵심 기능", "이용 방법"];

export function HomePage() {
  const [page, setPage] = useState(0);
  const [fade, setFade] = useState<FadePhase>("in");
  const locked = useRef(false);
  const touchStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const goToPage = useCallback(
    (target: number) => {
      if (
        locked.current ||
        target === page ||
        target < 0 ||
        target >= PAGE_COUNT
      ) {
        return;
      }

      locked.current = true;
      setFade("out");

      window.setTimeout(() => {
        setPage(target);
        setFade("in");

        window.setTimeout(() => {
          setFade("steady");
          locked.current = false;
        }, FADE_MS);
      }, FADE_MS);
    },
    [page],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => setFade("steady"), FADE_MS);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;

      if (locked.current) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      goToPage(event.deltaY > 0 ? page + 1 : page - 1);
    }

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [goToPage, page]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        goToPage(page + 1);
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goToPage(page - 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToPage, page]);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartY.current = event.touches[0]?.clientY ?? 0;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const endY = event.changedTouches[0]?.clientY ?? 0;
    const delta = touchStartY.current - endY;
    if (Math.abs(delta) < 56) return;
    goToPage(delta > 0 ? page + 1 : page - 1);
  }

  return (
    <div
      ref={scrollRef}
      className="landing-scroll"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`landing-page landing-page--${fade}`}
        aria-live="polite"
      >
        {page === 0 && (
          <section className="landing-hero landing-panel">
            <div className="landing-hero-content">
              <span className="landing-badge">Health + AI Platform</span>
              <h1 className="landing-title">
                <HeAIthLogo size="lg" />
              </h1>
              <p className="landing-tagline">AI가 만드는 건강의 미래</p>
              <p className="landing-desc">
                HeAIth는 국민건강통계 데이터를 기반으로 <br />
                개인 맞춤형 건강 루틴과 AI 상담을 제공합니다.
              </p>
              <div className="landing-hero-actions">
                <Link to="/login" className="primary-btn landing-cta-primary">
                  무료로 시작하기
                </Link>
                <button
                  type="button"
                  className="ghost-btn landing-cta-secondary"
                  onClick={() => goToPage(1)}
                >
                  기능 살펴보기
                </button>
              </div>
            </div>
            <div className="landing-hero-visual" aria-hidden>
              <div className="landing-hero-ripples">
                <span className="landing-hero-ripple" />
                <span className="landing-hero-ripple" />
                <span className="landing-hero-ripple" />
              </div>
              <div className="landing-hero-core">
                <span className="landing-hero-icon">+</span>
              </div>
            </div>
          </section>
        )}

        {page === 1 && (
          <section className="landing-section landing-features landing-panel">
            <h2 className="landing-section-title">핵심 기능</h2>
            <p className="landing-section-subtitle">
              HeAIth가 제공하는 스마트 건강 서비스
            </p>
            <div className="landing-feature-grid">
              <article className="landing-feature-card">
                <div className="landing-feature-icon">🤖</div>
                <h3>AI 건강 챗봇</h3>
                <p>
                  최신 AI 모델과 대화하며 건강 관련 질문에 답변받고, 맞춤형
                  조언을 받아보세요.
                </p>
              </article>
              <article className="landing-feature-card">
                <div className="landing-feature-icon">📊</div>
                <h3>KNHANES 건강통계</h3>
                <p>
                  국민건강영양조사 데이터를 탐색하고, AI 기반 질의로 통계
                  인사이트를 확인하세요.
                </p>
              </article>
              <article className="landing-feature-card">
                <div className="landing-feature-icon">✨</div>
                <h3>맞춤형 인사이트</h3>
                <p>
                  개인화된 건강 정보와 데이터 기반 분석으로 더 나은 건강
                  결정을 내릴 수 있습니다.
                </p>
              </article>
            </div>
          </section>
        )}

        {page === 2 && (
          <section className="landing-section landing-steps landing-panel">
            <h2 className="landing-section-title">이용 방법</h2>
            <p className="landing-section-subtitle">3단계로 시작하세요</p>
            <ol className="landing-step-list">
              <li className="landing-step">
                <span className="landing-step-num">01</span>
                <div>
                  <h3>회원가입</h3>
                  <p>이메일로 간편하게 계정을 만드세요.</p>
                </div>
              </li>
              <li className="landing-step">
                <span className="landing-step-num">02</span>
                <div>
                  <h3>AI에게 질문</h3>
                  <p>건강 관련 궁금한 점을 AI 챗봇에게 물어보세요.</p>
                </div>
              </li>
              <li className="landing-step">
                <span className="landing-step-num">03</span>
                <div>
                  <h3>데이터 탐색</h3>
                  <p>KNHANES 통계로 더 깊은 건강 인사이트를 얻으세요.</p>
                </div>
              </li>
            </ol>

            <div className="landing-cta-banner">
              <h2>지금 HeAIth와 함께 시작하세요</h2>
              <p>AI 기반 건강 관리의 새로운 경험을 만나보세요.</p>
              <Link to="/login" className="primary-btn landing-cta-primary">
                시작하기
              </Link>
            </div>

            <footer className="landing-footer landing-footer--compact">
              <nav className="landing-footer-nav">
                <Link to="/login">사용자 로그인</Link>
                <Link to="/admin/login" className="landing-footer-admin">
                  관리자
                </Link>
              </nav>
              <p className="landing-footer-copy">
                &copy; 2026 HeAIth. All rights reserved.
              </p>
            </footer>
          </section>
        )}
      </div>

      <nav className="landing-scroll-nav" aria-label="페이지 이동">
        {PAGE_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            className={page === index ? "active" : ""}
            aria-label={label}
            aria-current={page === index ? "true" : undefined}
            onClick={() => goToPage(index)}
          >
            <span className="landing-scroll-nav-dot" />
          </button>
        ))}
      </nav>
    </div>
  );
}
