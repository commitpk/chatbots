import { useState } from "react";

export default function ApiKeyGate({ onSubmit, onCancel, description }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setError("올바른 Anthropic API 키 형식이 아니에요. (sk-ant-로 시작해야 해요)");
      return;
    }

    setLoading(true);
    setError("");

    // 키 유효성 간단 검증 — 실제 API 호출로 확인
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": trimmed,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 10,
          messages: [{ role: "user", content: "hi" }],
        }),
      });

      if (res.status === 401) {
        setError("유효하지 않은 API 키예요. 다시 확인해주세요.");
        setLoading(false);
        return;
      }

      // 401 아니면 일단 통과 (429, 500 등은 키 자체 문제 아님)
      onSubmit(trimmed);
    } catch {
      setError("네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
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
        <p className="gate-desc">
          {description || "시작하려면 Anthropic API 키를 입력하세요."}
          <br />
          키는 브라우저에만 저장되며 서버로 전송되지 않아요.
        </p>

        <div className="gate-field">
          <input
            type="password"
            className="gate-input"
            placeholder="sk-ant-..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {error && <p className="gate-error">{error}</p>}
        </div>

        <button
          className="gate-btn"
          onClick={handleSubmit}
          disabled={loading || !key.trim()}
        >
          {loading ? "확인 중..." : "시작하기 →"}
        </button>

        {onCancel && (
          <button className="key-reset-btn" style={{width:"100%"}} onClick={onCancel}>← 돌아가기</button>
        )}
        <a
          className="gate-link"
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
        >
          API 키 발급받기 ↗
        </a>
      </div>
    </div>
  );
}
