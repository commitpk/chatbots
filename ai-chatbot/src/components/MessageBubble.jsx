export default function MessageBubble({ msg, character }) {
  const isAI = msg.role === "ai";

  const aiAvatar = character.avatarUrl
    ? <img src={character.avatarUrl} alt="avatar" className="msg-avatar-img" />
    : (character.emoji || "🐱");

  // *행동지문* → (행동지문) 변환 + 이탤릭 스타일
  const formatText = (text) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        const inner = part.slice(1, -1);
        return <span key={i} className="action-text">({inner})</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`msg ${isAI ? "ai" : "user"}`}>
      <div className={`msg-avatar ${isAI ? "ai" : "user"}`}>
        {isAI ? aiAvatar : "👤"}
      </div>
      <div className="msg-bubble">
        {msg.text.split("\n").map((line, i, arr) => (
          <span key={i}>
            {formatText(line)}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}
