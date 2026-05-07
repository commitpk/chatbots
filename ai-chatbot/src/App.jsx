import { useState } from "react";
import { useAuth } from "./utils/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ApiKeyGate from "./components/ApiKeyGate";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { buildSystemPrompt } from "./utils/prompt";
import { sendMessageToAPI } from "./utils/api";
import { createChatbot, updateChatbot } from "./utils/chatbotDB";

/**
 * 캐릭터 말투로 첫 인사를 API에서 생성
 */
async function generateGreeting(apiKey, character) {
  const systemPrompt = buildSystemPrompt(character);
  const reply = await sendMessageToAPI(apiKey, systemPrompt, [
    {
      role: "user",
      content: "__SYSTEM__: 지금 대화가 시작됐습니다. 캐릭터로서 자연스러운 첫 인사를 한 마디만 해주세요. 설명 없이 대사만 출력하세요.",
    },
  ]);
  return reply;
}

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

  // 채팅 화면 진입 — 첫 인사를 API로 생성
  const enterChat = async (bot) => {
    setActiveChatbot(bot);
    setHistory([]);
    setMessages([{ role: "ai", text: "…" }]); // 로딩 placeholder
    setScreen("chat");

    try {
      const greeting = await generateGreeting(apiKey, bot);
      setMessages([{ role: "ai", text: greeting }]);
    } catch {
      setMessages([{ role: "ai", text: `...` }]);
    }
  };

  if (user === undefined) {
    return <div className="gate-overlay"><p style={{ color: "var(--text-muted)" }}>로딩 중...</p></div>;
  }
  if (!user) return <AuthPage />;

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

  if (screen === "dashboard") {
    return (
      <Dashboard
        onSelectChatbot={(bot) => enterChat(bot)}
        onNewChatbot={() => {
          setActiveChatbot(null);
          setHistory([]);
          setMessages([]);
          setScreen("chat");
        }}
      />
    );
  }

  const character = activeChatbot || {
    name: "새 캐릭터",
    emoji: "🐱",
    personality: "",
  };

  const handleApply = async (newChar) => {
    try {
      let saved;
      if (activeChatbot?.id) {
        saved = await updateChatbot(activeChatbot.id, newChar);
      } else {
        saved = await createChatbot(newChar);
      }
      await enterChat(saved);
      setSidebarOpen(false);
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
      const msg = e.message?.includes("401")
        ? "API 키가 유효하지 않아요."
        : e.message?.includes("429")
        ? "요청이 너무 많아요. 잠깐 후 다시 시도해줘!"
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
          onKeyReset={() => {
            sessionStorage.removeItem("anthropic_api_key");
            setApiKey("");
          }}
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
