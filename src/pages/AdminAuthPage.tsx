import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveUsername } from "../api/client";
import { AuthForm } from "../components/AuthForm";
import { HeAIthLogo } from "../components/HeAIthLogo";
import { verifyIsAdmin } from "../utils/authRole";

export function AdminAuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.signIn(email, password);
      const isAdmin = await verifyIsAdmin();
      if (!isAdmin) {
        await api.signOut();
        setError("관리자 권한이 없습니다.");
        return;
      }
      saveUsername(result.username);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-split auth-split--admin">
      <div className="auth-split-brand">
        <HeAIthLogo size="lg" />
        <div className="auth-admin-shield" aria-hidden="true">
          <span>🛡</span>
        </div>
        <p className="auth-split-tagline">관리자 전용 포털</p>
        <p className="auth-split-desc">
          시스템 파일 및 데이터를 관리합니다.
        </p>
      </div>

      <div className="auth-split-form">
        <div className="auth-card auth-card--glass">
          <span className="auth-badge auth-badge--admin">Admin</span>
          <h1>관리자 로그인</h1>
          <p className="auth-subtitle">
            관리자 계정으로 HeAIth 시스템에 접속하세요.
          </p>

          <AuthForm
            mode="signin"
            email={email}
            username=""
            password={password}
            error={error}
            emailHint=""
            loading={loading}
            onEmailChange={setEmail}
            onUsernameChange={() => {}}
            onPasswordChange={setPassword}
            onEmailBlur={() => {}}
            onSubmit={(e) => void handleSubmit(e)}
            submitLabel="관리자 로그인"
          />

          <p className="auth-footer-link">
            일반 사용자이신가요?{" "}
            <Link to="/login">사용자 로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
