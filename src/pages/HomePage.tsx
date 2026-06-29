import { Link } from "react-router-dom";
import { HeAIthLogo } from "../components/HeAIthLogo";

export function HomePage() {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">Health + AI Platform</span>
          <h1 className="landing-title">
            <HeAIthLogo size="lg" />
          </h1>
          <p className="landing-tagline">AI가 만드는 건강의 미래</p>
          <p className="landing-desc">
            HeAIth는 AI 기반 건강 상담과 KNHANES 국민건강영양조사 데이터를
            결합하여, 개인 맞춤형 건강 인사이트를 제공합니다.
          </p>
          <div className="landing-hero-actions">
            <Link to="/login" className="primary-btn landing-cta-primary">
              무료로 시작하기
            </Link>
            <a href="#features" className="ghost-btn landing-cta-secondary">
              기능 살펴보기
            </a>
          </div>
        </div>
        <div className="landing-hero-visual" aria-hidden="true">
          <div className="landing-hero-ring" />
          <div className="landing-hero-core">
            <span className="landing-hero-icon">+</span>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section landing-features">
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

      <section className="landing-section landing-steps">
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
      </section>

      <section className="landing-section landing-cta-banner">
        <h2>지금 HeAIth와 함께 시작하세요</h2>
        <p>AI 기반 건강 관리의 새로운 경험을 만나보세요.</p>
        <Link to="/login" className="primary-btn landing-cta-primary">
          시작하기
        </Link>
      </section>

      <footer className="landing-footer">
        <HeAIthLogo size="sm" />
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
    </div>
  );
}
