
import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import WelcomeScreen from "./components/WelcomeScreen";
import AuthPage from "./components/AuthPage";

const API_BASE = "http://127.0.0.1:8000";
const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Tamil", label: "தமிழ் (Tamil)" },
  { value: "Hindi", label: "हिन्दी (Hindi)" },
];

const createMessageId = () => crypto.randomUUID();

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
  const [loadingChats, setLoadingChats] = useState(false);

  const activeRequestId = useRef(null);
  const authRef = useRef(auth);
  const chatsRef = useRef(chats);
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const apiRequest = useCallback(async (path, options = {}) => {
    const currentAuth = authRef.current;

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(currentAuth?.access_token
          ? { Authorization: `Bearer ${currentAuth.access_token}` }
          : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `API error (${response.status}): ${detail || response.statusText}`
      );
    }

    if (response.status === 204) return null;
    return response.json();
  }, []);

  // Load conversations from SQLite whenever the logged-in user changes.
  useEffect(() => {
    let cancelled = false;

    const loadChats = async () => {
      if (!auth?.user?.id) {
        setChats([]);
        setActiveChatId(null);
        setLoadingChats(false);
        return;
      }

      setLoadingChats(true);

      try {
        const savedChats = await apiRequest("/chats");

        if (cancelled) return;

        if (savedChats.length > 0) {
          setChats(savedChats);
          setActiveChatId(savedChats[0].id);
        } else {
          const newChat = await apiRequest("/chats", {
            method: "POST",
            body: JSON.stringify({ title: "New Chat" }),
          });

          if (cancelled) return;

          setChats([newChat]);
          setActiveChatId(newChat.id);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Could not load chats:", error);
          setChats([]);
          setActiveChatId(null);
          alert(
            "Could not load your saved chats. Check that the FastAPI backend is running, then refresh."
          );
        }
      } finally {
        if (!cancelled) setLoadingChats(false);
      }
    };

    loadChats();

    return () => {
      cancelled = true;
    };
  }, [auth?.user?.id, apiRequest]);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ?? chats[0];

  const updateChat = useCallback((id, updater) => {
    setChats((previous) =>
      previous.map((chat) => (chat.id === id ? updater(chat) : chat))
    );
  }, []);

  const handleLogin = (data) => {
    const nextAuth = {
      access_token: data.access_token,
      user: data.user,
    };

    sessionStorage.setItem("govai_auth", JSON.stringify(nextAuth));
    authRef.current = nextAuth;
    setAuth(nextAuth);
  };

  const handleLogout = () => {
    activeRequestId.current = null;
    sessionStorage.removeItem("govai_auth");
    authRef.current = null;
    setAuth(null);
    setChats([]);
    chatsRef.current = [];
    setActiveChatId(null);
    activeChatIdRef.current = null;
    setIsTyping(false);
  };

  const handleNewChat = async () => {
    try {
      const chat = await apiRequest("/chats", {
        method: "POST",
        body: JSON.stringify({ title: "New Chat" }),
      });

      setChats((previous) => [chat, ...previous]);
      setActiveChatId(chat.id);
      setSidebarOpen(false);
    } catch (error) {
      console.error("Could not create chat:", error);
      alert("Could not create a new chat. Please try again.");
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await apiRequest(`/chats/${id}`, { method: "DELETE" });

      const remaining = chatsRef.current.filter((chat) => chat.id !== id);
      let nextChats = remaining;

      if (remaining.length === 0) {
        const newChat = await apiRequest("/chats", {
          method: "POST",
          body: JSON.stringify({ title: "New Chat" }),
        });
        nextChats = [newChat];
      }

      setChats(nextChats);

      if (activeChatIdRef.current === id) {
        setActiveChatId(nextChats[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Could not delete chat:", error);
      alert("Could not delete this chat. Please try again.");
    }
  };

  const saveMessage = async (chatId, message) => {
    await apiRequest(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        role: message.role,
        content: message.content,
        language: message.language || "English",
        client_id: message.id,
      }),
    });
  };

  const fetchBotReply = async (question, selectedLanguage) => {
    const response = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authRef.current?.access_token}`,
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
    const currentChat = chatsRef.current.find(
      (chat) => chat.id === activeChatIdRef.current
    );

    if (
      !question ||
      !currentChat ||
      isTyping ||
      !authRef.current
    ) {
      return;
    }

    // Prevent requests using an obsolete login session.
    const requestAuth = authRef.current;
    const chatId = currentChat.id;
    const requestId = createMessageId();
    const selectedLanguage = language;

    activeRequestId.current = requestId;
    setIsTyping(true);

    const userMessage = {
      id: createMessageId(),
      role: "user",
      content: question,
      language: selectedLanguage,
    };

    // Display the question immediately.
    updateChat(chatId, (chat) => ({
      ...chat,
      title:
        chat.messages.length === 0
          ? question.slice(0, 40)
          : chat.title,
      messages: [...chat.messages, userMessage],
    }));

    try {
      // Save the user's message before requesting the AI response.
      await saveMessage(chatId, userMessage);

      if (
        activeRequestId.current !== requestId ||
        authRef.current !== requestAuth
      ) {
        return;
      }

      let answer;

      try {
        answer = await fetchBotReply(question, selectedLanguage);
      } catch (error) {
        console.error("Failed to fetch RAG answer:", error);
        answer =
          "I couldn't connect to the Government Scheme RAG backend. " +
          "Please check that FastAPI is running and try again.";
      }

      if (
        activeRequestId.current !== requestId ||
        authRef.current !== requestAuth
      ) {
        return;
      }

      const assistantMessage = {
        id: createMessageId(),
        role: "assistant",
        content: answer,
        language: selectedLanguage,
      };

      // Save the response too, so both messages survive a refresh.
      await saveMessage(chatId, assistantMessage);

      if (
        activeRequestId.current !== requestId ||
        authRef.current !== requestAuth
      ) {
        return;
      }

      updateChat(chatId, (chat) => ({
        ...chat,
        title:
          chat.title === "New Chat"
            ? question.slice(0, 40)
            : chat.title,
        messages: [...chat.messages, assistantMessage],
      }));
    } catch (error) {
      console.error("Could not save chat message:", error);

      if (authRef.current === requestAuth) {
        alert(
          "Your message could not be saved to the database. Please check the backend connection before continuing."
        );
      }
    } finally {
      if (activeRequestId.current === requestId) {
        activeRequestId.current = null;
        setIsTyping(false);
      }
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

        {loadingChats ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Loading your saved conversations...
          </div>
        ) : !activeChat || activeChat.messages.length === 0 ? (
          <WelcomeScreen onPick={handleSend} />
        ) : (
          <MessageList
            messages={activeChat.messages}
            isTyping={isTyping}
          />
        )}

        <ChatInput
          onSend={handleSend}
          disabled={isTyping || loadingChats || !activeChat}
        />
      </div>
    </div>
  );
}
