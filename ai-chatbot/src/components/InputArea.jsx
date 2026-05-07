import { useState, useRef } from "react";

export default function InputArea({ onSend, isLoading }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
    // 높이 리셋
    if (textareaRef.current) textareaRef.current.style.height = "40px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    const el = e.target;
    el.style.height = "40px";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="input-area">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
        disabled={isLoading}
      />
      <button className="send-btn" onClick={handleSend} disabled={isLoading || !text.trim()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
