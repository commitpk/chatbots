import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export default function PublicLounge({ onEnter, onBack }) {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // 비밀번호 입력 대상
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("chatbots")
        .select("id, user_id, name, alias, emoji, avatar_url, personality_keywords, personality_desc, background, speech_level, user_title, endings, habits, forbidden, sample_greeting, sample_warm, sample_flustered, sample_angry, sample_vulnerable, knowledge_knows, knowledge_not, sensitive_topic, user_position, char_view_user, default_mood, user_call_name, room_password, is_public")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (!error) setBots(data.map(b => ({
        id:                  b.id,
        user_id:             b.user_id,
        name:                b.name,
        alias:               b.alias,
        emoji:               b.emoji,
        avatarUrl:           b.avatar_url,
        personalityKeywords: b.personality_keywords,
        personalityDesc:     b.personality_desc,
        background:          b.background,
        speechLevel:         b.speech_level,
        userTitle:           b.user_title,
        endings:             b.endings,
        habits:              b.habits,
        forbidden:           b.forbidden,
        sampleGreeting:      b.sample_greeting,
        sampleWarm:          b.sample_warm,
        sampleFlustered:     b.sample_flustered,
        sampleAngry:         b.sample_angry,
        sampleVulnerable:    b.sample_vulnerable,
        knowledgeKnows:      b.knowledge_knows,
        knowledgeNot:        b.knowledge_not,
        sensitiveTopic:      b.sensitive_topic,
        userPosition:        b.user_position,
        charViewUser:        b.char_view_user,
        defaultMood:         b.default_mood,
        userCallName:        b.user_call_name,
        roomPassword:        b.room_password,
        isPublic:            b.is_public,
      })));
      setLoading(false);
    })();
  }, []);

  const handleCardClick = (bot) => {
    if (bot.room_password) {
      setSelected(bot);
      setPw("");
      setPwError("");
    } else {
      onEnter(bot);
    }
  };

  const handlePwSubmit = () => {
    if (pw === selected.room_password) {
      onEnter(selected);
      setSelected(null);
    } else {
      setPwError("비밀번호가 틀렸어요.");
    }
  };

  return (
    <div className="lounge-page">
      <div className="dash-header">
        <div className="dash-header-left">
          <button className="lounge-back-btn" onClick={onBack}>← 내 챗봇</button>
          <span className="dash-logo">🌐</span>
          <span className="dash-title">공개 챗봇 라운지</span>
        </div>
      </div>

      <div className="dash-body">
        {loading ? (
          <div className="dash-empty">불러오는 중...</div>
        ) : bots.length === 0 ? (
          <div className="dash-empty">
            <p>아직 공개된 챗봇이 없어요</p>
          </div>
        ) : (
          <div className="chatbot-grid">
            {bots.map((bot) => (
              <button key={bot.id} className="chatbot-card" onClick={() => handleCardClick(bot)}>
                <div className="chatbot-card-avatar">
                  {bot.avatar_url
                    ? <img src={bot.avatar_url} alt="avatar" className="chatbot-card-avatar-img" />
                    : (bot.emoji || "🐱")
                  }
                </div>
                <div className="chatbot-card-info">
                  <div className="chatbot-card-name">
                    {bot.name}
                    {bot.room_password && <span className="lock-icon"> 🔒</span>}
                  </div>
                  {bot.personality_keywords && (
                    <div className="chatbot-card-tone">{bot.personality_keywords}</div>
                  )}
                  {bot.personality_desc && (
                    <div className="chatbot-card-personality">{bot.personality_desc}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 비밀번호 모달 */
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-avatar">
              {selected.avatar_url
                ? <img src={selected.avatar_url} alt="avatar" className="modal-avatar-img" />
                : (selected.emoji || "🐱")
              }
            </div>
            <h2 className="modal-title">{selected.name}</h2>
            <p className="modal-desc">이 챗봇은 비밀번호가 필요해요.</p>
            <input
              type="password"
              className="gate-input"
              placeholder="비밀번호 입력"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePwSubmit()}
              autoFocus
            />
            {pwError && <p className="gate-error">{pwError}</p>}
            <button className="gate-btn" onClick={handlePwSubmit} disabled={!pw}>
              입장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
