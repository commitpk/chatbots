import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import InputArea from "./InputArea";

export default function ChatWindow({
  character, messages, isLoading,
  onSend, onReset,
  sidebarOpen, onToggleSidebar,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="chat-area">
      <div className="chat-header">
        {/* 사이드바 토글 버튼: 내 챗봇일 때만 표시 */}
        {onToggleSidebar && (
          <button
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            title={sidebarOpen ? "설정 닫기" : "설정 열기"}
          >
            {sidebarOpen ? "◀" : "☰"}
          </button>
        )}

        <div className="header-avatar">
          {character.avatarUrl
            ? <img src={character.avatarUrl} alt="avatar" className="header-avatar-img" />
            : (character.emoji || "🐱")
          }
        </div>
        <div className="header-info">
          <div className="char-name">{character.name || "새 캐릭터"}</div>
          <div className="char-status"><span className="status-dot" /> 온라인</div>
        </div>
        <button className="reset-btn" onClick={onReset}>대화 초기화</button>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} character={character} />
        ))}
        {isLoading && (
          <div className="msg ai">
            <div className="msg-avatar ai">
              {character.avatarUrl
                ? <img src={character.avatarUrl} alt="avatar" className="msg-avatar-img" />
                : (character.emoji || "🐱")
              }
            </div>
            <div className="typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <InputArea onSend={onSend} isLoading={isLoading} />
    </div>
  );
}
