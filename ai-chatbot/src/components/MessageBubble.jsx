export default function MessageBubble({ msg, character }) {
  const isAI = msg.role === "ai";

  const aiAvatar = character.avatarUrl
    ? <img src={character.avatarUrl} alt="avatar" className="msg-avatar-img" />
    : (character.emoji || "🐱");

  return (
    <div className={`msg ${isAI ? "ai" : "user"}`}>
      <div className={`msg-avatar ${isAI ? "ai" : "user"}`}>
        {isAI ? aiAvatar : "👤"}
      </div>
      <div className="msg-bubble">
        {msg.text.split("\n").map((line, i, arr) => (
          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
        ))}
      </div>
    </div>
  );
}
