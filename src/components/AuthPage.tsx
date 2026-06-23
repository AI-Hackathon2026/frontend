import { FormEvent, useState } from "react";
import { api, saveUsername } from "../api/client";

interface AuthPageProps {
  onAuthenticated: (username: string) => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailBlur() {
    if (mode !== "signup" || !email.trim()) return;
    setEmailHint("");
    try {
      const result = await api.checkEmail(email.trim());
      if (result.message.toLowerCase().includes("exists")) {
        setEmailHint("이미 사용 중인 이메일입니다.");
      }
    } catch {
      // ignore check failures
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const result = await api.signIn(email, password);
        saveUsername(result.username);
        onAuthenticated(result.username);
      } else {
        await api.signUp(email, username, password);
        const result = await api.signIn(email, password);
        saveUsername(result.username);
        onAuthenticated(result.username);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-badge">2026 AI 경진대회</div>
        <h1>AI 챗봇 참가 시스템</h1>
        <p className="auth-subtitle">
          회원가입 후 로그인하여 AI 챗봇과 KNHANES 건강통계를 이용하세요.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "signin" ? "active" : ""}
            onClick={() => setMode("signin")}
          >
            로그인
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailHint("");
              }}
              onBlur={() => void handleEmailBlur()}
              placeholder="user@example.com"
              required
              autoComplete="email"
            />
            {emailHint && <span className="field-hint warn">{emailHint}</span>}
          </label>

          {mode === "signup" && (
            <label>
              사용자 이름
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="홍길동"
                required
                autoComplete="username"
              />
            </label>
          )}

          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상"
              required
              minLength={7}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading
              ? "처리 중..."
              : mode === "signin"
                ? "로그인"
                : "회원가입 후 시작"}
          </button>
        </form>
      </div>
    </div>
  );
}
