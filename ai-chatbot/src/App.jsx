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

// screen: "dashboard" | "lounge" | "chat"
export default function App() {
  const { user } = useAuth();

  const [apiKey, setApiKey] = useState(
    () => sessionStorage.getItem("anthropic_api_key") || ""
  );
  const [screen, setScreen] = useState("dashboard");
  const [activeChatbot, setActiveChatbot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // 공개 라운지에서 입장할 때: 방문자 자신의 API 키 입력 게이트
  const [pendingPublicBot, setPendingPublicBot] = useState(null);

  const enterChat = async (bot, key) => {
    const usedKey = key || apiKey;
    setActiveChatbot(bot);
    setHistory([]);
    setMessages([{ role: "ai", text: "…" }]);
    setScreen("chat");
    setSidebarOpen(false);
    try {
      const greeting = await generateGreeting(usedKey, bot);
      setMessages([{ role: "ai", text: greeting }]);
    } catch {
      setMessages([{ role: "ai", text: "..." }]);
    }
  };

  // ── 로딩 중 ──
  if (user === undefined) {
    return <div className="gate-overlay"><p style={{ color: "var(--text-muted)" }}>로딩 중...</p></div>;
  }

  // ── 비로그인 ──
  if (!user) return <AuthPage />;

  // ── 공개 라운지에서 챗봇 선택 후 API 키 입력 대기 ──
  if (pendingPublicBot) {
    return (
      <ApiKeyGate
        description={`"${pendingPublicBot.name}" 챗봇을 사용하려면 본인의 Anthropic API 키가 필요해요.`}
        onSubmit={(key) => {
          sessionStorage.setItem("anthropic_api_key", key);
          setApiKey(key);
          const bot = pendingPublicBot;
          setPendingPublicBot(null);
          enterChat(bot, key);
        }}
        onCancel={() => setPendingPublicBot(null)}
      />
    );
  }

  // ── 내 API 키 미입력 ──
  if (!apiKey) {
    return (
      <ApiKeyGate
        onSubmit={(key) => {
          sessionStorage.setItem("anthropic_api_key", key);
          setApiKey(key);
        }}
      />
    );
  }

  // ── 공개 라운지 ──
  if (screen === "lounge") {
    return (
      <PublicLounge
        onEnter={(bot) => {
          // 로그인 유저도 API 키 필요
          if (!apiKey) {
            setPendingPublicBot(bot);
          } else {
            enterChat(bot, apiKey);
          }
        }}
        onBack={() => setScreen("dashboard")}
      />
    );
  }

  // ── 대시보드 ──
  if (screen === "dashboard") {
    return (
      <Dashboard
        onSelectChatbot={(bot) => enterChat(bot)}
        onNewChatbot={() => {
          setActiveChatbot(null);
          setHistory([]);
          setMessages([]);
          setSidebarOpen(true);
          setScreen("chat");
        }}
        onLounge={() => setScreen("lounge")}
      />
    );
  }

  // ── 채팅 ──
  const character = activeChatbot || { name: "새 캐릭터", emoji: "🐱", personality: "" };

  const handleApply = async (newChar) => {
    try {
      let saved;
      if (activeChatbot?.id) {
        saved = await updateChatbot(activeChatbot.id, newChar);
      } else {
        saved = await createChatbot(newChar);
      }
      await enterChat(saved);
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
      {sidebarOpen && (
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
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
    </div>
  );
}
