
import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import WelcomeScreen from "./components/WelcomeScreen";
import AuthPage from "./components/AuthPage";

const API_URL = "http://127.0.0.1:8000/ask";
const STORAGE_KEY = "govai_chats";

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Tamil", label: "தமிழ் (Tamil)" },
  { value: "Hindi", label: "हिन्दी (Hindi)" },
];

const createChat = () => ({
  id: crypto.randomUUID(),
  title: "New Chat",
  messages: [],
  createdAt: Date.now(),
});

export default function App() {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("govai_auth")) || null;
    } catch {
      return null;
    }
  });

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState("English");

  const activeRequestId = useRef(null);

  useEffect(() => {
    if (!auth?.user?.id) {
      setChats([]);
      setActiveChatId(null);
      return;
    }

    // Temporary per-user browser storage.
    // The next step will move this to the backend database.
    const key = `${STORAGE_KEY}_${auth.user.id}`;

    try {
      const saved = localStorage.getItem(key);
      const parsed = saved ? JSON.parse(saved) : [];
      const initialChats = Array.isArray(parsed) ? parsed : [];
      const availableChats =
        initialChats.length > 0 ? initialChats : [createChat()];

      setChats(availableChats);
      setActiveChatId(availableChats[0].id);
    } catch (error) {
      console.error("Could not load chats:", error);
      const fresh = createChat();
      setChats([fresh]);
      setActiveChatId(fresh.id);
    }
  }, [auth?.user?.id]);

  useEffect(() => {
    if (!auth?.user?.id) return;

    localStorage.setItem(
      `${STORAGE_KEY}_${auth.user.id}`,
      JSON.stringify(chats)
    );
  }, [auth?.user?.id, chats]);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ?? chats[0];

  const updateChat = useCallback((id, updater) => {
    setChats((previous) =>
      previous.map((chat) => (chat.id === id ? updater(chat) : chat))
    );
  }, []);

  const handleLogin = (data) => {
    // Store only the session token and basic user details.
    // Never store the user's password.
    const nextAuth = {
      access_token: data.access_token,
      user: data.user,
    };

    sessionStorage.setItem("govai_auth", JSON.stringify(nextAuth));
    setAuth(nextAuth);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("govai_auth");
    activeRequestId.current = null;
    setAuth(null);
    setChats([]);
    setActiveChatId(null);
    setIsTyping(false);
  };

  const handleNewChat = () => {
    const chat = createChat();
    setChats((previous) => [chat, ...previous]);
    setActiveChatId(chat.id);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (id) => {
    setChats((previous) => {
      const next = previous.filter((chat) => chat.id !== id);

      if (next.length === 0) {
        const fresh = createChat();
        setActiveChatId(fresh.id);
        return [fresh];
      }

      if (id === activeChatId) {
        setActiveChatId(next[0].id);
      }

      return next;
    });
  };

  const fetchBotReply = async (question, selectedLanguage) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.access_token}`,
      },
      body: JSON.stringify({
        question,
        language: selectedLanguage,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`RAG API error (${response.status}): ${detail}`);
    }

    const data = await response.json();
    return data.answer;
  };

  const handleSend = async (text) => {
    const question = text.trim();
    if (!question || !activeChat || isTyping || !auth) return;

    const chatId = activeChat.id;
    const requestId = crypto.randomUUID();
    const selectedLanguage = language;

    activeRequestId.current = requestId;

    const userMsg = {
      role: "user",
      content: question,
      id: crypto.randomUUID(),
    };

    updateChat(chatId, (chat) => ({
      ...chat,
      title:
        chat.messages.length === 0
          ? question.slice(0, 40)
          : chat.title,
      messages: [...chat.messages, userMsg],
    }));

    setIsTyping(true);

    let answer;

    try {
      answer = await fetchBotReply(question, selectedLanguage);
    } catch (error) {
      console.error("Failed to fetch RAG answer:", error);
      answer =
        "I couldn't connect to the Government Scheme RAG backend. " +
        "Please check that FastAPI is running and try again.";
    }

    updateChat(chatId, (chat) => ({
      ...chat,
      messages: [
        ...chat.messages,
        {
          role: "assistant",
          content: answer,
          id: crypto.randomUUID(),
          language: selectedLanguage,
        },
      ],
    }));

    if (activeRequestId.current === requestId) {
      setIsTyping(false);
    }
  };

  if (!auth) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={activeChat?.title ?? "Government Scheme AI Assistant"}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
          <span className="text-sm text-slate-600">
            Welcome, {auth.user.name}
          </span>

          <div className="flex items-center gap-3">
            <label
              htmlFor="response-language"
              className="text-sm font-medium text-slate-600"
            >
              Response language
            </label>

            <select
              id="response-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="max-w-[190px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {LANGUAGES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>

        {activeChat?.messages.length === 0 ? (
          <WelcomeScreen onPick={handleSend} />
        ) : (
          <MessageList
            messages={activeChat?.messages ?? []}
            isTyping={isTyping}
          />
        )}

        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}
