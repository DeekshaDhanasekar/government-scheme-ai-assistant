
import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({ messages, isTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto bg-white px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {messages.map((m, index) => (
          <MessageBubble
            key={m.id ?? `${m.role}-${index}`}
            role={m.role}
            content={m.content}
            sources={m.sources}
            language={m.language || "English"}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
