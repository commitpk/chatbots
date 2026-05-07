import { useState, useEffect } from "react";
import { saveBotApiKey } from "../utils/api";
import { supabase } from "../utils/supabase";
import AvatarUploader from "./AvatarUploader";

const SECTIONS = ["캐릭터", "말투", "대사 샘플", "세계관", "모드"];

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
            <Field label="아바타 이미지">
              <AvatarUploader
                avatarUrl={form.avatarUrl}
                onUpload={(url) => setForm((f) => ({ ...f, avatarUrl: url }))}
              />
            </Field>

            <Field label="이름 / 애칭" required>
              <input
                className="field-input"
                placeholder="이름"
                value={form.name}
                onChange={set("name")}
              />
              <input
                className="field-input"
                style={{ marginTop: 6 }}
                placeholder="애칭 (선택)"
                value={form.alias}
                onChange={set("alias")}
              />
            </Field>

            <Field label="출처">
              <textarea
                className="field-input field-textarea"
                placeholder="원작명 또는 세계관"
                value={form.source}
                onChange={set("source")}
              />
            </Field>

            <Field label="외형">
              <textarea
                className="field-input field-textarea"
                placeholder="외모, 옷차림, 분위기"
                value={form.appearance}
                onChange={set("appearance")}
              />
            </Field>

            <Field label="성격 키워드">
              <input
                className="field-input"
                placeholder="냉정함, 책임감, 다정함 (쉼표 구분)"
                value={form.personalityKeywords}
                onChange={set("personalityKeywords")}
              />
            </Field>

            <Field label="성격 서술">
              <textarea
                className="field-input field-textarea tall"
                placeholder="어떤 상황에서 어떻게 행동하는지 서술"
                value={form.personalityDesc}
                onChange={set("personalityDesc")}
              />
            </Field>

            <Field label="배경 / 과거사">
              <textarea
                className="field-input field-textarea tall"
                placeholder="나이, 현재 상황, 중요한 과거 사건"
                value={form.background}
                onChange={set("background")}
              />
            </Field>

            <Field label="감정 표현 방식">
              <textarea
                className="field-input field-textarea"
                placeholder="기쁠 때, 화날 때, 슬플 때 반응 방식"
                value={form.emotionStyle || ""}
                onChange={set("emotionStyle")}
              />
            </Field>
          </>
        )}

        {/* ── 말투 탭 ── */}
        {tab === 1 && (
          <>
            <p className="tab-desc">💬 말투 설정이 정확할수록 캐릭터가 살아납니다.</p>

            <Field label="반말 / 존댓말">
              <input
                className="field-input"
                placeholder="항상 반말 / 존댓말 / 상대에 따라 다름"
                value={form.speechLevel}
                onChange={set("speechLevel")}
              />
            </Field>

            <Field label="자주 쓰는 어미">
              <input
                className="field-input"
                placeholder="~군, ~지, ~다, ~거든"
                value={form.endings}
                onChange={set("endings")}
              />
            </Field>

            <Field label="말버릇 / 추임새">
              <textarea
                className="field-input field-textarea"
                placeholder="자주 쓰는 말버릇이나 추임새"
                value={form.habits}
                onChange={set("habits")}
              />
            </Field>

            <Field label="상대 부르는 호칭">
              <input
                className="field-input"
                placeholder="이름 / 너 / 당신 등"
                value={form.userTitle}
                onChange={set("userTitle")}
              />
            </Field>

            <Field label="신체 언어 / 행동 습관">
              <textarea
                className="field-input field-textarea"
                placeholder="생각할 때, 긴장할 때 등 자주 하는 행동"
                value={form.bodyLanguage || ""}
                onChange={set("bodyLanguage")}
              />
            </Field>

            <Field label="절대 쓰지 않는 표현">
              <textarea
                className="field-input field-textarea"
                placeholder="이모지 금지, 인터넷 용어 금지, 먼저 사과 안 함"
                value={form.forbidden}
                onChange={set("forbidden")}
              />
            </Field>
          </>
        )}

        {/* ── 대사 샘플 탭 ── */}
        {tab === 2 && (
          <>
            <p className="tab-desc">📝 원작 대사나 직접 쓴 샘플이 많을수록 말투가 정확해집니다. 상황별로 최대한 구체적으로!</p>

            <Field label="평범한 인사 / 일상 대화">
              <textarea
                className="field-input field-textarea"
                placeholder="인사나 일상 대화 대사"
                value={form.sampleGreeting}
                onChange={set("sampleGreeting")}
              />
            </Field>

            <Field label="따뜻하거나 감동적인 순간">
              <textarea
                className="field-input field-textarea"
                placeholder="따뜻하거나 고마운 순간의 대사"
                value={form.sampleWarm}
                onChange={set("sampleWarm")}
              />
            </Field>

            <Field label="당황하거나 곤란한 순간">
              <textarea
                className="field-input field-textarea"
                placeholder="당황하거나 곤란할 때의 대사"
                value={form.sampleFlustered}
                onChange={set("sampleFlustered")}
              />
            </Field>

            <Field label="화나거나 단호한 순간">
              <textarea
                className="field-input field-textarea"
                placeholder="화나거나 단호할 때의 대사"
                value={form.sampleAngry}
                onChange={set("sampleAngry")}
              />
            </Field>

            <Field label="취약하거나 속마음이 새는 순간">
              <textarea
                className="field-input field-textarea"
                placeholder="속마음이 드러나는 순간의 대사"
                value={form.sampleVulnerable}
                onChange={set("sampleVulnerable")}
              />
            </Field>

            <Field label="추가 대사 샘플 (원작 명대사 등)">
              <textarea
                className="field-input field-textarea tall"
                placeholder="원작 명대사나 추가 대사 자유 입력"
                value={form.extraSamples || ""}
                onChange={set("extraSamples")}
              />
            </Field>
          </>
        )}

        {/* ── 세계관 탭 ── */}
        {tab === 3 && (
          <>
            <p className="tab-desc">🌍 세계관 지식 범위를 설정하면 몰입감이 높아집니다.</p>

            <Field label="알고 있는 것">
              <textarea
                className="field-input field-textarea"
                placeholder="직업 지식, 아는 인물, 경험한 사건 등"
                value={form.knowledgeKnows}
                onChange={set("knowledgeKnows")}
              />
            </Field>

            <Field label="모르는 것 / 말하면 안 되는 것">
              <textarea
                className="field-input field-textarea"
                placeholder="현대 기술, 원작 이후 사건, 금지 언급 등"
                value={form.knowledgeNot}
                onChange={set("knowledgeNot")}
              />
            </Field>

            <Field label="민감한 주제">
              <textarea
                className="field-input field-textarea"
                placeholder="가족, 죽음 등 조심히 다룰 주제"
                value={form.sensitiveTopic}
                onChange={set("sensitiveTopic")}
              />
            </Field>

            <Field label="캐릭터의 선 (절대 하지 않을 것)">
              <textarea
                className="field-input field-textarea"
                placeholder="절대 하지 않는 말이나 행동"
                value={form.characterLine || ""}
                onChange={set("characterLine")}
              />
            </Field>
          </>
        )}

        {/* ── 모드 탭 ── */}
        {tab === 4 && (
          <>
            <p className="tab-desc">🎭 역극 모드로 동작합니다. 유저와의 관계를 설정해주세요.</p>

            <Field label="유저의 포지션">
              <textarea
                className="field-input field-textarea"
                placeholder="원작 캐릭터 / 드림캐 / 불특정"
                value={form.userPosition}
                onChange={set("userPosition")}
              />
            </Field>

            <Field label="캐릭터가 유저를 어떻게 보는지">
              <textarea
                className="field-input field-textarea"
                placeholder="오래된 전우, 보호 대상, 라이벌 등"
                value={form.charViewUser}
                onChange={set("charViewUser")}
              />
            </Field>

            <Field label="유저 호칭">
              <input
                className="field-input"
                placeholder="이름 / 너 / 선배 등"
                value={form.userCallName}
                onChange={set("userCallName")}
              />
            </Field>

            <Field label="기본 분위기">
              <input
                className="field-input"
                placeholder="진지한 역극 / 일상 대화 / 감성적"
                value={form.defaultMood}
                onChange={set("defaultMood")}
              />
            </Field>

            <Field label="시작 시점 / 상황 설정">
              <textarea
                className="field-input field-textarea"
                placeholder="퇴근 후 사무실, 첫 만남, 특정 화 이후 등"
                value={form.startSetting || ""}
                onChange={set("startSetting")}
              />
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
              placeholder="비밀번호 (비우면 자유 입장)"
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
        {label}{required && <span style={{ color: "#D85A30" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function BotKeyRegistrar({ isSaved, characterId }) {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isSaved) {
    return <p className="field-label" style={{ color: "var(--text-hint)" }}>저장 후 API 키를 등록할 수 있어요.</p>;
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
      <button className="apply-btn" style={{ marginTop: 0 }} onClick={handleSave} disabled={loading || !key.trim()}>
        {loading ? "저장 중..." : "🔐 키 등록"}
      </button>
      {status === "saved" && <p style={{ fontSize: 12, color: "var(--green)" }}>✓ 등록됐어요! 로그인한 방문자는 키 없이 대화 가능해요.</p>}
      {status === "error" && <p style={{ fontSize: 12, color: "#D85A30" }}>저장 실패. 다시 시도해줘요.</p>}
    </div>
  );
}
