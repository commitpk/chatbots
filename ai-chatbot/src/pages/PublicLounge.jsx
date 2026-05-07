import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export default function PublicLounge({ onEnter, onBack }) {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("chatbots")
        .select("id, user_id, name, alias, emoji, avatar_url, personality_keywords, personality_desc, background, speech_level, user_title, endings, habits, forbidden, sample_greeting, sample_warm, sample_flustered, sample_angry, sample_vulnerable, knowledge_knows, knowledge_not, sensitive_topic, user_position, char_view_user, default_mood, user_call_name, room_password, is_public")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (!error) setBots(data.map(b => ({
        id: b.id, user_id: b.user_id, name: b.name, alias: b.alias,
        emoji: b.emoji, avatarUrl: b.avatar_url,
        personalityKeywords: b.personality_keywords, personalityDesc: b.personality_desc,
        background: b.background, speechLevel: b.speech_level, userTitle: b.user_title,
        endings: b.endings, habits: b.habits, forbidden: b.forbidden,
        sampleGreeting: b.sample_greeting, sampleWarm: b.sample_warm,
        sampleFlustered: b.sample_flustered, sampleAngry: b.sample_angry,
        sampleVulnerable: b.sample_vulnerable, knowledgeKnows: b.knowledge_knows,
        knowledgeNot: b.knowledge_not, sensitiveTopic: b.sensitive_topic,
        userPosition: b.user_position, charViewUser: b.char_view_user,
        defaultMood: b.default_mood, userCallName: b.user_call_name,
        roomPassword: b.room_password, isPublic: b.is_public,
      })));
      setLoading(false);
    })();
  }, []);

  const filtered = bots.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.personalityKeywords || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.personalityDesc || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCardClick = (bot) => {
    if (bot.roomPassword) {
      setSelected(bot);
      setPw("");
      setPwError("");
    } else {
      onEnter(bot);
    }
  };

  const handlePwSubmit = () => {
    if (pw === selected.roomPassword) {
      onEnter(selected);
      setSelected(null);
    } else {
      setPwError("비밀번호가 틀렸어요.");
    }
  };

  return (
    <>
      <div className="lounge-page" style={{
        width: "100%",
        minHeight: "100dvh",
        background: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* 헤더 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 20px",
          background: "var(--bg)",
          borderBottom: "0.5px solid var(--border)",
        }}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              fontSize: 13,
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px 8px",
              fontFamily: "inherit",
            }}
          >
            ← 내 챗봇
          </button>
          <span style={{ fontSize: 20 }}>🌐</span>
          <span style={{ fontSize: 16, fontWeight: 500 }}>공개 챗봇 라운지</span>
        </div>

        {/* 검색창 + 봇 목록 */}
        <div style={{ maxWidth: 860, width: "100%", margin: "0 auto", padding: 24, display: "flex", flexDirection: "column", gap: 12, minHeight: 300 }}>
          <input
            type="search"
            placeholder="이름, 성격으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px",
              fontSize: 14,
              border: "0.5px solid var(--border-strong)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          {loading && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>불러오는 중...</p>}
          {!loading && bots.length === 0 && !search && (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>공개된 챗봇이 없어요</p>
          )}
          {filtered.length === 0 && !loading && search && (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 24 }}>검색 결과가 없어요</p>
          )}
          {filtered.map((bot) => (
            <button
              key={bot.id}
              onClick={() => handleCardClick(bot)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px",
                background: "var(--bg)",
                border: "0.5px solid var(--border)",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                fontFamily: "inherit",
                color: "inherit",
                WebkitTapHighlightColor: "rgba(127,119,221,0.15)",
                touchAction: "manipulation",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "var(--primary-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, flexShrink: 0, overflow: "hidden",
              }}>
                {bot.avatarUrl
                  ? <img src={bot.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : (bot.emoji || "🐱")
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3 }}>
                  {bot.name}{bot.roomPassword && " 🔒"}
                </div>
                {bot.personalityKeywords && (
                  <div style={{ fontSize: 11, color: "var(--primary)", marginBottom: 4 }}>{bot.personalityKeywords}</div>
                )}
                {bot.personalityDesc && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {bot.personalityDesc}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 비밀번호 모달 */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg)", borderRadius: 12,
              padding: "32px 24px", width: "100%", maxWidth: 360,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            }}
          >
            <div style={{ fontSize: 36 }}>{selected.emoji || "🐱"}</div>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>{selected.name}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>비밀번호가 필요해요.</p>
            <input
              type="password"
              className="gate-input"
              placeholder="비밀번호 입력"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePwSubmit()}
              autoFocus
              style={{ width: "100%" }}
            />
            {pwError && <p style={{ fontSize: 12, color: "#D85A30" }}>{pwError}</p>}
            <button className="gate-btn" onClick={handlePwSubmit} disabled={!pw} style={{ width: "100%" }}>
              입장하기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
