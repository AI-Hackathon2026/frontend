import { Outlet, Link, useLocation } from "react-router-dom";
import { HeAIthLogo } from "./HeAIthLogo";

export function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="public-layout">
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-orb mesh-orb--1" />
        <div className="mesh-orb mesh-orb--2" />
        <div className="mesh-orb mesh-orb--3" />
        <div className="mesh-grid" />
      </div>

      <header className="public-header">
        <Link to="/" className="public-header-brand">
          <HeAIthLogo size="sm" />
        </Link>
        <nav className="public-header-nav">
          {!isHome && (
            <Link to="/" className="public-nav-link">
              홈
            </Link>
          )}
          <Link
            to="/login"
            className={`public-nav-link ${location.pathname === "/login" ? "active" : ""}`}
          >
            로그인
          </Link>
          <Link to="/login" className="primary-btn public-nav-cta">
            시작하기
          </Link>
        </nav>
      </header>

      <main className="public-main">
        <Outlet />
      </main>
    </div>
  );
}
