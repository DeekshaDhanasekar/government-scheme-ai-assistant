
import WelcomeScreen from "./WelcomeScreen";
import MessageList from "./MessageList";

export default function ChatWindow({ messages, loading, onPick }) {
  if (messages.length === 0) {
    return <WelcomeScreen onPick={onPick} />;
  }

  const items = messages.map((m, i) => ({
    id: m.id ?? i,
    role: m.role,
    content: m.content ?? m.text ?? "",
    sources: m.sources || [],
    language: m.language || "English",
  }));

  return (
    <MessageList
      messages={items}
      isTyping={loading}
    />
  );
}
