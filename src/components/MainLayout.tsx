import type { ReactNode } from "react";
import type { AppTab } from "../types";

interface MainLayoutProps {
  username: string;
  activeTab: AppTab;
  isAdmin: boolean;
  onTabChange: (tab: AppTab) => void;
  onSignOut: () => void;
  children: ReactNode;
}

export function MainLayout({
  username,
  activeTab,
  isAdmin,
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
          {!isAdmin && (
            <>
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
            </>
          )}
          {isAdmin && (
            <button
              type="button"
              className="admin-tab-btn active"
            >
              📁 파일 관리
            </button>
          )}
        </nav>

        <div className="main-user">
          <span className="user-avatar">{username.charAt(0).toUpperCase()}</span>
          <span className="user-name">{username}</span>
          {isAdmin && <span className="admin-badge">관리자</span>}
          <button type="button" className="ghost-btn" onClick={onSignOut}>
            로그아웃
          </button>
        </div>
      </header>

      <div className="main-content">{children}</div>
    </div>
  );
}
