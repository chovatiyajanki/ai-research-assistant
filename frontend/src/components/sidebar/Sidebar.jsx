import { useEffect, useState } from "react";
import { Clock3, LogOut, MessageSquareText, Sparkles } from "lucide-react";

import API from "../../services/api";

export default function Sidebar({ docId, setDocId }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        let active = true;

        const loadHistory = async () => {
            try {
                const res = await API.get("/history/");

                if (active) {
                    setHistory(res.data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        loadHistory();

        return () => {
            active = false;
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("doc_id");
        localStorage.removeItem("file_name");
        window.location.href = "/login";
    };

    const handleSelectChat = (chat) => {
        localStorage.setItem("doc_id", chat.document_id);
        setDocId(chat.document_id);
    };

    return (
        <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-slate-950 text-white">
            <div className="border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500 text-slate-950">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold">
                            AI Research
                        </h1>
                        <p className="text-xs text-slate-400">
                            Assistant Workspace
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 px-5 pb-3 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Clock3 size={14} />
                Recent Chats
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
                {history.length === 0 ? (
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-4 text-sm text-slate-400">
                        No chat history yet.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {history.map((chat) => {
                            const active = Number(docId) === Number(chat.document_id);

                            return (
                                <button
                                    key={chat.chat_id}
                                    type="button"
                                    onClick={() => handleSelectChat(chat)}
                                    className={`w-full rounded-lg border p-3 text-left transition ${
                                        active
                                            ? "border-teal-400/60 bg-teal-500/15"
                                            : "border-white/10 bg-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                                        <MessageSquareText size={14} />
                                        Document #{chat.document_id}
                                    </div>
                                    <p className="line-clamp-2 text-sm font-medium text-slate-100">
                                        {chat.chat_question}
                                    </p>
                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                                        {chat.chat_answer}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="border-t border-white/10 p-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white/10 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
