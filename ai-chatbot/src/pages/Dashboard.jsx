import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { fetchChatbots, deleteChatbot } from "../utils/chatbotDB";

export default function Dashboard({ onSelectChatbot, onNewChatbot }) {
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email || ""));
    loadChatbots();
  }, []);

  const loadChatbots = async () => {
    setLoading(true);
    try { setChatbots(await fetchChatbots()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("이 챗봇을 삭제할까요?")) return;
    await deleteChatbot(id);
    setChatbots((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div className="dash-header-left">
          <span className="dash-logo">🤖</span>
          <span className="dash-title">내 챗봇</span>
        </div>
        <div className="dash-header-right">
          <span className="dash-email">{userEmail}</span>
          <button className="dash-logout-btn" onClick={() => supabase.auth.signOut()}>로그아웃</button>
        </div>
      </div>

      <div className="dash-body">
        {loading ? (
          <div className="dash-empty">불러오는 중...</div>
        ) : chatbots.length === 0 ? (
          <div className="dash-empty">
            <p>아직 만든 챗봇이 없어요</p>
            <p className="dash-empty-sub">아래 버튼으로 첫 번째 챗봇을 만들어보세요!</p>
          </div>
        ) : (
          <div className="chatbot-grid">
            {chatbots.map((bot) => (
              <div key={bot.id} className="chatbot-card" onClick={() => onSelectChatbot(bot)}>
                {/* 아바타 */}
                <div className="chatbot-card-avatar">
                  {bot.avatarUrl
                    ? <img src={bot.avatarUrl} alt="avatar" className="chatbot-card-avatar-img" />
                    : (bot.emoji || "🐱")
                  }
                </div>
                <div className="chatbot-card-info">
                  <div className="chatbot-card-name">{bot.name}</div>
                  {bot.personalityKeywords && (
                    <div className="chatbot-card-tone">{bot.personalityKeywords}</div>
                  )}
                  {bot.personalityDesc && (
                    <div className="chatbot-card-personality">{bot.personalityDesc}</div>
                  )}
                </div>
                <button className="chatbot-card-delete" onClick={(e) => handleDelete(e, bot.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
        <button className="new-chatbot-btn" onClick={onNewChatbot}>+ 새 챗봇 만들기</button>
      </div>
    </div>
  );
}
