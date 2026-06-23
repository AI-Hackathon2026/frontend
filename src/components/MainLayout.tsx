import type { ReactNode } from "react";
import type { AppTab } from "../types";

interface MainLayoutProps {
  username: string;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onSignOut: () => void;
  children: ReactNode;
}

export function MainLayout({
  username,
  activeTab,
  onTabChange,
  onSignOut,
  children,
}: MainLayoutProps) {
  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="main-brand">
          <span className="auth-badge">2026 AI 경진대회</span>
        </div>

        <nav className="main-tabs" aria-label="주요 메뉴">
          <button
            type="button"
            className={activeTab === "chat" ? "active" : ""}
            onClick={() => onTabChange("chat")}
          >
            AI 챗봇
          </button>
          <button
            type="button"
            className={activeTab === "knhanes" ? "active" : ""}
            onClick={() => onTabChange("knhanes")}
          >
            KNHANES 건강통계
          </button>
        </nav>

        <div className="main-user">
          <span className="user-avatar">{username.charAt(0).toUpperCase()}</span>
          <span className="user-name">{username}</span>
          <button type="button" className="ghost-btn" onClick={onSignOut}>
            로그아웃
          </button>
        </div>
      </header>

      <div className="main-content">{children}</div>
    </div>
  );
}
