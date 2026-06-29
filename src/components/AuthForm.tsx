import { FormEvent } from "react";

export type AuthMode = "signin" | "signup";

interface AuthFormProps {
  mode: AuthMode;
  email: string;
  username: string;
  password: string;
  error: string;
  emailHint: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onEmailBlur: () => void;
  onSubmit: (event: FormEvent) => void;
  submitLabel?: string;
}

export function AuthForm({
  mode,
  email,
  username,
  password,
  error,
  emailHint,
  loading,
  onEmailChange,
  onUsernameChange,
  onPasswordChange,
  onEmailBlur,
  onSubmit,
  submitLabel,
}: AuthFormProps) {
  const defaultSubmitLabel =
    mode === "signin" ? "로그인" : "회원가입 후 시작";

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <label>
        이메일
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={onEmailBlur}
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
            onChange={(e) => onUsernameChange(e.target.value)}
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
          onChange={(e) => onPasswordChange(e.target.value)}
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
        {loading ? "처리 중..." : (submitLabel ?? defaultSubmitLabel)}
      </button>
    </form>
  );
}
