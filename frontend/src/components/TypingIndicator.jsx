import { Landmark } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 animate-fade-in" role="status">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-800 text-white">
        <Landmark size={16} />
      </span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce-dot"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
        <span className="text-sm text-slate-500">Searching scheme documents</span>
      </div>
    </div>
  );
}