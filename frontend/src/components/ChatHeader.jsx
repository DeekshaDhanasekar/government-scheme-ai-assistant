import { Menu, ShieldCheck } from "lucide-react";
export default function ChatHeader({ title, onMenuClick }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open chat history"
          className="-ml-1.5 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-slate-900">
            {title || "New chat"}
          </h1>
          <p className="text-xs text-slate-500">Farmer schemes assistant</p>
        </div>
      </div>

      <div className="hidden items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 sm:flex">
        <ShieldCheck size={14} />
        Verified sources
      </div>
    </header>
  );
}