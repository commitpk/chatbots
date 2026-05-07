import { useState } from "react";
import { useAuth } from "./utils/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import PublicLounge from "./pages/PublicLounge";
import ApiKeyGate from "./components/ApiKeyGate";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { buildSystemPrompt } from "./utils/prompt";
import { sendMessageToAPI } from "./utils/api";
import { createChatbot, updateChatbot } from "./utils/chatbotDB";

async function generateGreeting(apiKey, character) {
  const reply = await sendMessageToAPI(apiKey, buildSystemPrompt(character), [
    {
      role: "user",
      content: "__SYSTEM__: 지금 대화가 시작됐습니다. 캐릭터로서 자연스러운 첫 인사를 한 마디만 해주세요. 설명 없이 대사만 출력하세요.",
    },
  ]);
  return reply;
}

export default function App() {
  const { user, isAdmin } = useAuth();

  const [apiKey, setApiKey] = useState(
    () => sessionStorage.getItem("anthropic_api_key") || ""
  );
  const [screen, setScreen] = useState("dashboard");
  const [activeChatbot, setActiveChatbot] = useState(null);
  const [isOwner, setIsOwner] = useState(false); // 내가 만든 챗봇인지 여부
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingPublicBot, setPendingPublicBot] = useState(null);

  // owner: 내 대시보드에서 입장 시 true, 공개 라운지에서 남의 봇 입장 시 false
  const enterChat = async (bot, key, owner = true) => {
    const usedKey = key || apiKey;

    // API 키 없으면 그 때 입력 요청
    if (!usedKey) {
      setPendingPublicBot({ ...bot, _owner: owner });
      return;
    }

    setActiveChatbot(bot);
    setIsOwner(owner);
    setHistory([]);
    setMessages([{ role: "ai", text: "…" }]);
    setScreen("chat");
    setSidebarOpen(owner);
    try {
      const greeting = await generateGreeting(usedKey, bot);
      setMessages([{ role: "ai", text: greeting }]);
    } catch {
      setMessages([{ role: "ai", text: "..." }]);
    }
  };

  if (user === undefined) {
    return <div className="gate-overlay"><p style={{ color: "var(--text-muted)" }}>로딩 중...</p></div>;
  }
  if (!user) return <AuthPage />;

  if (pendingPublicBot) {
    return (
      <ApiKeyGate
        description={`"${pendingPublicBot.name}"와 대화하려면 Anthropic API 키가 필요해요. 키는 브라우저에만 저장되며 서버로 전송되지 않아요.`}
        onSubmit={(key) => {
          sessionStorage.setItem("anthropic_api_key", key);
          setApiKey(key);
          const bot = pendingPublicBot;
          const owner = bot._owner ?? (bot.user_id === user.id);
          setPendingPublicBot(null);
          enterChat(bot, key, owner);
        }}
        onCancel={() => setPendingPublicBot(null)}
      />
    );
  }

  // API 키는 선택 사항 — 없어도 대시보드/라운지 탐색 가능
  // 실제 대화 시도 시 enterChat 내부에서 요청

  if (screen === "lounge") {
    return (
      <PublicLounge
        onEnter={(bot) => {
          // 본인이 만든 공개 봇인지 확인
          const owner = bot.user_id === user.id;
          if (!apiKey) {
            setPendingPublicBot(bot);
          } else {
            enterChat(bot, apiKey, owner);
          }
        }}
        onBack={() => setScreen("dashboard")}
      />
    );
  }

  if (screen === "dashboard") {
    return (
      <Dashboard
        // admin은 모든 봇 수정 가능, 일반 유저는 본인 봇만
        onSelectChatbot={(bot) => enterChat(bot, apiKey, isAdmin || bot.user_id === user.id)}
        onNewChatbot={() => {
          setActiveChatbot(null);
          setIsOwner(true);
          setHistory([]);
          setMessages([]);
          setSidebarOpen(true);
          setScreen("chat");
        }}
        onLounge={() => setScreen("lounge")}
      />
    );
  }

  // 채팅 화면
  const character = activeChatbot || { name: "새 캐릭터", emoji: "🐱", personality: "" };

  const handleApply = async (newChar) => {
    if (!isOwner) {
      alert("본인이 만든 챗봇만 수정할 수 있어요.");
      return;
    }
    try {
      let saved;
      if (activeChatbot?.id) {
        saved = await updateChatbot(activeChatbot.id, newChar);
      } else {
        saved = await createChatbot(newChar);
      }
      await enterChat(saved, apiKey, true);
    } catch (e) {
      alert("저장 중 오류가 발생했어요: " + e.message);
    }
  };

  const handleSend = async (text) => {
    if (isLoading || !text.trim()) return;
    const newHistory = [...history, { role: "user", content: text }];
    setMessages((prev) => [...prev, { role: "user", text }]);
    setHistory(newHistory);
    setIsLoading(true);
    try {
      const reply = await sendMessageToAPI(apiKey, buildSystemPrompt(character), newHistory);
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e.message?.includes("401") ? "API 키가 유효하지 않아요."
        : e.message?.includes("429") ? "요청이 너무 많아요. 잠깐 후 다시 시도해줘!"
        : "앗, 오류가 생겼어! 잠깐 후에 다시 시도해줘 😢";
      setMessages((prev) => [...prev, { role: "ai", text: msg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setHistory([]);
    setMessages([{ role: "ai", text: "…" }]);
    try {
      const greeting = await generateGreeting(apiKey, character);
      setMessages([{ role: "ai", text: greeting }]);
    } catch {
      setMessages([{ role: "ai", text: "..." }]);
    }
  };

  return (
    <div className="app-container">
      {/* 사이드바: 내 챗봇(isOwner)일 때만 열 수 있음 */}
      {sidebarOpen && isOwner && (
        <Sidebar
          character={character}
          onApply={handleApply}
          onKeyReset={() => { sessionStorage.removeItem("anthropic_api_key"); setApiKey(""); }}
          onBack={() => setScreen("dashboard")}
          isSaved={!!activeChatbot?.id}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <ChatWindow
        character={character}
        messages={messages}
        isLoading={isLoading}
        onSend={handleSend}
        onReset={handleReset}
        sidebarOpen={sidebarOpen && isOwner}
        onToggleSidebar={isOwner ? () => setSidebarOpen((v) => !v) : null}
        onHome={() => setScreen("dashboard")}
      />
    </div>
  );
}
