import { useState } from "react";
import { supabase } from "../utils/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("가입 확인 이메일을 보냈어요! 메일함을 확인해주세요 📬");
      }
    } catch (e) {
      const msg = e.message?.includes("Invalid login")
        ? "이메일 또는 비밀번호가 틀렸어요."
        : e.message?.includes("already registered")
        ? "이미 가입된 이메일이에요. 로그인해주세요."
        : e.message?.includes("Password should be")
        ? "비밀번호는 6자 이상이어야 해요."
        : e.message || "오류가 발생했어요. 다시 시도해주세요.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="gate-overlay">
      <div className="gate-card">
        <div className="gate-icon">🤖</div>
        <h1 className="gate-title">나만의 AI 캐릭터 챗봇</h1>

        {/* 탭 */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(""); setMessage(""); }}
          >
            로그인
          </button>
          <button
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
          >
            회원가입
          </button>
        </div>

        <div className="gate-field">
          <input
            type="email"
            className="gate-input"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <input
            type="password"
            className="gate-input"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {error   && <p className="gate-error">{error}</p>}
          {message && <p className="gate-success">{message}</p>}
        </div>

        <button
          className="gate-btn"
          onClick={handleSubmit}
          disabled={loading || !email || !password}
        >
          {loading ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
        </button>
      </div>
    </div>
  );
}
