import { useState, useEffect } from "react";
import { saveBotApiKey } from "../utils/api";
import { supabase } from "../utils/supabase";
import AvatarUploader from "./AvatarUploader";

const SECTIONS = ["캐릭터","말투","대사 샘플","세계관","모드"];

const DEFAULT = {
  name: "", alias: "", emoji: "🐱", avatarUrl: "",
  source: "", appearance: "",
  personalityKeywords: "", personalityDesc: "", background: "",
  speechLevel: "", userTitle: "", endings: "", habits: "", forbidden: "",
  sampleGreeting: "", sampleWarm: "", sampleFlustered: "", sampleAngry: "", sampleVulnerable: "",
  knowledgeKnows: "", knowledgeNot: "", sensitiveTopic: "",
  userPosition: "", charViewUser: "", defaultMood: "", userCallName: "",
  isPublic: false, roomPassword: "",
};

export default function Sidebar({ character, onApply, onKeyReset, onBack, isSaved, onClose }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ ...DEFAULT, ...character });

  useEffect(() => {
    setForm({ ...DEFAULT, ...character });
  }, [character.id]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleApply = () => {
    if (!form.name.trim()) { alert("캐릭터 이름을 입력해주세요!"); return; }
    onApply(form);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top-row">
        <span className="sidebar-section-label">캐릭터 설정</span>
        <button className="sidebar-close-btn" onClick={onClose} title="설정 닫기">✕</button>
      </div>

      <div className="section-tabs">
        {SECTIONS.map((s, i) => (
          <button
            key={s}
            className={`section-tab ${tab === i ? "active" : ""}`}
            onClick={() => setTab(i)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="tab-content">

        {/* ── 캐릭터 탭 ── */}
        {tab === 0 && (
          <>
            {/* 아바타 업로더 */}
            <Field label="아바타 이미지">
              <AvatarUploader
                avatarUrl={form.avatarUrl}
                onUpload={(url) => setForm((f) => ({ ...f, avatarUrl: url }))}
              />
            </Field>

            <Field label="1. 캐릭터 이름 / 애칭" required>
              <input className="field-input" placeholder="본명" value={form.name} onChange={set("name")} />
              <input className="field-input" style={{marginTop:6}} placeholder="애칭 (선택)" value={form.alias} onChange={set("alias")} />
            </Field>
            <Field label="2. 캐릭터 출처">
              <textarea className="field-input field-textarea" placeholder="원작 작품명, 위키 링크 / 자캐일 경우 세계관 정보" value={form.source} onChange={set("source")} />
            </Field>
            <Field label="3. 외형 묘사">
              <textarea className="field-input field-textarea" placeholder="외모, 옷차림, 분위기 등" value={form.appearance} onChange={set("appearance")} />
            </Field>
            <Field label="4. 성격 키워드 (5개 이상)">
              <input className="field-input" placeholder="예: 냉정함, 책임감, 은근한 유머" value={form.personalityKeywords} onChange={set("personalityKeywords")} />
            </Field>
            <Field label="5. 성격 서술">
              <textarea className="field-input field-textarea tall" placeholder="키워드를 풀어서 설명. 일화나 구체적 장면이 있으면 더 좋습니다." value={form.personalityDesc} onChange={set("personalityDesc")} />
            </Field>
            <Field label="6. 배경 / 과거사">
              <textarea className="field-input field-textarea tall" placeholder="중요한 사건, 현재 시점, 나이, 특이점 등" value={form.background} onChange={set("background")} />
            </Field>
          </>
        )}

        {/* ── 말투 탭 ── */}
        {tab === 1 && (
          <>
            <Field label="1. 반말 / 존댓말">
              <input className="field-input" placeholder="예: 기본 반말, 처음엔 존댓말" value={form.speechLevel} onChange={set("speechLevel")} />
            </Field>
            <Field label="2. 상대 호칭">
              <input className="field-input" placeholder="예: 평소엔 이름, 감정 격해지면 '너'" value={form.userTitle} onChange={set("userTitle")} />
            </Field>
            <Field label="3. 자주 쓰는 어미">
              <input className="field-input" placeholder='예: "~군", "~다", "~거든"' value={form.endings} onChange={set("endings")} />
            </Field>
            <Field label="4. 말버릇 / 추임새">
              <textarea className="field-input field-textarea" placeholder={'예: "아니……" 문장 시작, 말줄임표 자주 씀'} value={form.habits} onChange={set("habits")} />
            </Field>
            <Field label="5. 절대 쓰지 않는 표현">
              <textarea className="field-input field-textarea" placeholder="예: 이모지 금지, 인터넷 용어 금지" value={form.forbidden} onChange={set("forbidden")} />
            </Field>
          </>
        )}

        {/* ── 대사 샘플 탭 ── */}
        {tab === 2 && (
          <>
            <p className="tab-desc">💬 대사 샘플은 캐릭터 말투의 기준이 됩니다. 최대한 구체적으로!</p>
            <Field label="1. 평범한 인사 / 일상">
              <textarea className="field-input field-textarea" placeholder={'예: "……오늘도 무사히 돌아왔군. 고맙다."'} value={form.sampleGreeting} onChange={set("sampleGreeting")} />
            </Field>
            <Field label="2. 감동 / 따뜻한 순간">
              <textarea className="field-input field-textarea" value={form.sampleWarm} onChange={set("sampleWarm")} />
            </Field>
            <Field label="3. 당황 / 곤란한 순간">
              <textarea className="field-input field-textarea" value={form.sampleFlustered} onChange={set("sampleFlustered")} />
            </Field>
            <Field label="4. 화남 / 단호한 순간">
              <textarea className="field-input field-textarea" value={form.sampleAngry} onChange={set("sampleAngry")} />
            </Field>
            <Field label="5. 부드럽고 취약한 순간">
              <textarea className="field-input field-textarea" value={form.sampleVulnerable} onChange={set("sampleVulnerable")} />
            </Field>
          </>
        )}

        {/* ── 세계관 탭 ── */}
        {tab === 3 && (
          <>
            <Field label="1. 알고 있는 것">
              <textarea className="field-input field-textarea" placeholder="캐릭터가 자연스럽게 말해도 되는 지식" value={form.knowledgeKnows} onChange={set("knowledgeKnows")} />
            </Field>
            <Field label="2. 모르는 것">
              <textarea className="field-input field-textarea" placeholder="알 수 없는 것, 말하면 안 되는 것" value={form.knowledgeNot} onChange={set("knowledgeNot")} />
            </Field>
            <Field label="3. 민감한 주제">
              <textarea className="field-input field-textarea" placeholder="조심히 다뤄야 하는 것" value={form.sensitiveTopic} onChange={set("sensitiveTopic")} />
            </Field>
          </>
        )}

        {/* ── 모드 탭 ── */}
        {tab === 4 && (
          <>
            <p className="tab-desc">🎭 기본적으로 역극 모드로 동작합니다.</p>
            <Field label="1. 유저의 포지션">
              <textarea className="field-input field-textarea" placeholder="예: 원작 특정 캐릭터 / 드림캐 / 불특정" value={form.userPosition} onChange={set("userPosition")} />
            </Field>
            <Field label="2. 캐릭터가 유저를 어떻게 보는지">
              <textarea className="field-input field-textarea" placeholder="예: 오랜 전우, 보호해야 할 존재" value={form.charViewUser} onChange={set("charViewUser")} />
            </Field>
            <Field label="3. 기본 분위기">
              <input className="field-input" placeholder="예: 진지한 역극, 일상 대화, 감성적" value={form.defaultMood} onChange={set("defaultMood")} />
            </Field>
            <Field label="4. 유저 호칭">
              <input className="field-input" placeholder="캐릭터가 유저를 뭐라고 부르는지" value={form.userCallName} onChange={set("userCallName")} />
            </Field>
          </>
        )}
      </div>

      {/* 공개 설정 */}
      <div className="public-setting-box">
        <label className="public-toggle-row">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
          />
          <span>공개 라운지에 공개</span>
        </label>
        {form.isPublic && (
          <>
            <input
              className="field-input"
              type="password"
              placeholder="비밀번호 설정 (선택 — 비우면 자유 입장)"
              value={form.roomPassword}
              onChange={(e) => setForm((f) => ({ ...f, roomPassword: e.target.value }))}
            />
            <BotKeyRegistrar isSaved={isSaved} characterId={form.id} />
          </>
        )}
      </div>

      <button className="apply-btn" onClick={handleApply}>
        {isSaved ? "✓ 저장하기" : "✓ 만들고 저장하기"}
      </button>
      <button className="key-reset-btn" onClick={onKeyReset}>🔑 API 키 변경</button>
    </aside>
  );
}

function Field({ label, children, required }) {
  return (
    <div className="field-group">
      <label className="field-label">
        {label}{required && <span style={{color:"#D85A30"}}> *</span>}
      </label>
      {children}
    </div>
  );
}

function BotKeyRegistrar({ isSaved, characterId }) {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState(""); // "saved" | "error" | ""
  const [loading, setLoading] = useState(false);

  if (!isSaved) {
    return <p className="field-label" style={{color:"var(--text-hint)"}}>저장 후 API 키를 등록할 수 있어요.</p>;
  }

  const handleSave = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setStatus("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await saveBotApiKey(session.access_token, characterId, key.trim());
      setStatus("saved");
      setKey("");
    } catch (e) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="field-label">방문자용 API 키 등록</label>
      <input
        className="field-input"
        type="password"
        placeholder="sk-ant-... (방문자 대신 사용될 키)"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <button className="apply-btn" style={{marginTop:0}} onClick={handleSave} disabled={loading || !key.trim()}>
        {loading ? "저장 중..." : "🔐 키 등록"}
      </button>
      {status === "saved" && <p style={{fontSize:12, color:"var(--green)"}}>✓ 등록됐어요! 로그인한 방문자는 키 없이 대화 가능해요.</p>}
      {status === "error" && <p style={{fontSize:12, color:"#D85A30"}}>저장 실패. 다시 시도해줘요.</p>}
    </div>
  );
}
