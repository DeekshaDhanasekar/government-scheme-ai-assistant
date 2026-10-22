import { Landmark, Plus, Trash2, X } from "lucide-react";

export default function Sidebar({
  chats = [],
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onClose,
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-brand-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
              <Landmark size={16} className="text-white" />
            </span>
            <span className="font-serif text-base font-semibold text-white">
              Government AI
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-brand-300 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pb-3">
          <button
            onClick={onNewChat}
            className="flex w-full items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        <nav
          aria-label="Chat history"
          className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4"
        >
          {chats.length === 0 && (
            <p className="px-3 py-2 text-sm text-brand-300">No previous chats</p>
          )}
          {chats.map((chat) => {
            const active = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                className={`group relative flex items-center rounded-md ${
                  active ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                {active && (
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-saffron" />
                )}
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-brand-100"
                >
                  {chat.title}
                </button>
                <button
                  onClick={() => onDeleteChat(chat.id)}
                  aria-label={`Delete chat: ${chat.title}`}
                  className="mr-1 rounded p-1.5 text-brand-300 hover:bg-white/10 hover:text-white focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}