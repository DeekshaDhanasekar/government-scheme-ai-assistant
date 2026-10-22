
import WelcomeScreen from "./WelcomeScreen";
import MessageList from "./MessageList";

export default function ChatWindow({ messages, loading, onPick }) {
  if (messages.length === 0) {
    return <WelcomeScreen onPick={onPick} />;
  }

  const items = messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    language: message.language || "English",
    sources: message.sources || [],
  }));

  return (
    <MessageList
      messages={items}
      isTyping={loading}
    />
  );
}
