import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bot,
    Check,
    FileText,
    Menu,
    Pencil,
    Send,
    Trash2,
    User,
    X,
} from "lucide-react";

import Upload from "../components/documents/Upload";
import Sidebar from "../components/sidebar/Sidebar";
import DocumentsList from "../components/documents/DocumentsList";

import {
    getDocHistory,
    askQuestionAPI,
    deleteHistory,
    updateChat,
} from "../services/chatServices";

const getErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;

    if (typeof detail === "string" && detail.includes("Vectorstore not found")) {
        return "This document index is missing on the backend. Delete this document and upload it again after Railway is redeployed with a persistent /data volume.";
    }

    return detail || fallback;
};

export default function Chat() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [docId, setDocId] = useState(() => localStorage.getItem("doc_id"));
    const [fileName, setFileName] = useState(() => localStorage.getItem("file_name") || "");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editChatId, setEditingChatId] = useState(null);
    const [editText, setEditText] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);
    const [documentsVersion, setDocumentsVersion] = useState(0);
    const bottomRef = useRef(null);

    useEffect(() => {
        const loadHistory = async () => {
            if (!docId) {
                setMessages([]);
                return;
            }

            try {
                const res = await getDocHistory(docId);
                const formatted = res.data.flatMap((chat) => [
                    {
                        id: chat.chat_id,
                        role: "user",
                        text: chat.chat_question,
                    },
                    {
                        id: chat.chat_id,
                        role: "ai",
                        text: chat.chat_answer,
                    },
                ]);

                setMessages(formatted);
            } catch (err) {
                console.error(err);
                setMessages([]);
            }
        };

        loadHistory();
    }, [docId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const askQuestion = async () => {
        if (!docId || !question.trim() || loading) return;

        const currentQuestion = question.trim();
        setQuestion("");
        setLoading(true);

        try {
            const res = await askQuestionAPI({
                doc_id: Number(docId),
                question: currentQuestion,
            });

            const chatId = res.data.chat_id;

            setMessages((prev) => [
                ...prev,
                {
                    id: chatId,
                    role: "user",
                    text: currentQuestion,
                },
                {
                    id: chatId,
                    role: "ai",
                    text: res.data.answer,
                },
            ]);
        } catch (err) {
            console.error(err);
            alert(getErrorMessage(err, "Error asking question"));
        } finally {
            setLoading(false);
        }
    };

    const clearChatHistory = async () => {
        if (!docId) return;
        if (!window.confirm("Clear chat history?")) return;

        try {
            await deleteHistory(docId);
            setMessages([]);
        } catch (err) {
            console.error(err);
            alert(getErrorMessage(err, "Error clearing chat"));
        }
    };

    const handleSave = async (chatId) => {
        if (!editText.trim()) return;

        setSaving(true);

        try {
            const res = await updateChat(chatId, {
                chat_question: editText.trim(),
            });

            setMessages((prev) =>
                prev.map((msg) => {
                    if (msg.id === chatId && msg.role === "user") {
                        return { ...msg, text: editText.trim() };
                    }

                    if (msg.id === chatId && msg.role === "ai") {
                        return {
                            ...msg,
                            text: res.data.chat.chat_answer,
                        };
                    }

                    return msg;
                })
            );

            setEditingChatId(null);
            setEditText("");
        } catch (err) {
            console.error(err);
            alert(getErrorMessage(err, "Error updating chat"));
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (msg) => {
        setEditingChatId(msg.id);
        setEditText(msg.text);
    };

    const cancelEdit = () => {
        setEditingChatId(null);
        setEditText("");
    };

    const handleUploaded = (document) => {
        if (document.doc_id) {
            setDocId(document.doc_id);
        }

        if (document.file_name) {
            setFileName(document.file_name);
        }

        setDocumentsVersion((version) => version + 1);
    };

    return (
        <div className="flex h-dvh overflow-hidden bg-slate-100 text-slate-950">
            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSidebar(false)}
                        className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 25,
                        }}
                        className="fixed left-0 top-0 z-40 h-full w-[300px] md:hidden"
                    >
                        <Sidebar docId={docId} setDocId={setDocId} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="hidden w-[300px] shrink-0 md:block">
                <Sidebar docId={docId} setDocId={setDocId} />
            </div>

            <main className="flex min-w-0 flex-1 flex-col">
                <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 md:hidden"
                            title="Open sidebar"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 sm:flex">
                            <FileText size={20} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-950">
                                {docId ? "Active Document" : "No Document Selected"}
                            </p>
                            <p className="max-w-[220px] truncate text-xs text-slate-500 sm:max-w-[420px]">
                                {docId ? fileName || `Document #${docId}` : "Upload or select a document to start."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={clearChatHistory}
                        disabled={!docId || messages.length === 0}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                </header>

                <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-1">
                    <section className="max-h-[38dvh] overflow-y-auto border-b border-slate-200 bg-slate-50 p-3 sm:p-4 lg:max-h-none lg:border-b-0 lg:border-r">
                        <div className="space-y-4">
                            <Upload onUploaded={handleUploaded} />
                            <DocumentsList
                                refreshKey={documentsVersion}
                                setDocId={setDocId}
                                setFileName={setFileName}
                            />
                        </div>
                    </section>

                    <section className="flex min-h-0 flex-col bg-white">
                        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
                            <div className="mx-auto max-w-4xl">
                                {messages.length === 0 ? (
                                    <div className="flex min-h-[260px] items-center justify-center sm:min-h-[420px]">
                                        <div className="max-w-md rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                            <Bot className="mx-auto mb-3 text-teal-600" size={34} />
                                            <h2 className="text-base font-semibold text-slate-950">
                                                Ready for document questions
                                            </h2>
                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                Select a document, then ask a direct question about its content.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((msg, index) => {
                                            const isUser = msg.role === "user";
                                            const isEditing = editChatId === msg.id && isUser;

                                            return (
                                                <motion.div
                                                    key={`${msg.role}-${msg.id}-${index}`}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.18 }}
                                                    className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                                                >
                                                    {!isUser && (
                                                        <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 sm:flex">
                                                            <Bot size={18} />
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`min-w-0 max-w-[92%] rounded-lg border px-4 py-3 shadow-sm sm:max-w-[78%] ${
                                                            isUser
                                                                ? "border-slate-800 bg-slate-900 text-white"
                                                                : "border-slate-200 bg-white text-slate-800"
                                                        }`}
                                                    >
                                                        <div className="mb-2 flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2 text-xs font-medium opacity-75">
                                                                {isUser ? <User size={14} /> : <Bot size={14} />}
                                                                {isUser ? "You" : "Assistant"}
                                                            </div>

                                                            {isUser && !isEditing && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => startEdit(msg)}
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                                                                    title="Edit question"
                                                                >
                                                                    <Pencil size={14} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {isEditing ? (
                                                            <div className="space-y-3">
                                                                <textarea
                                                                    value={editText}
                                                                    onChange={(e) => setEditText(e.target.value)}
                                                                    rows={3}
                                                                    className="w-full resize-none rounded-lg border border-slate-600 bg-slate-800 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-teal-400"
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelEdit}
                                                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-sm text-white/80 transition hover:bg-white/10"
                                                                    >
                                                                        <X size={15} />
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSave(msg.id)}
                                                                        disabled={saving}
                                                                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-500 px-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:opacity-60"
                                                                    >
                                                                        <Check size={15} />
                                                                        {saving ? "Saving" : "Save"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className={`prose prose-sm max-w-none overflow-x-auto break-words ${
                                                                    isUser
                                                                        ? "prose-invert prose-p:text-white"
                                                                        : "prose-slate"
                                                                }`}
                                                            >
                                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isUser && (
                                                        <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white sm:flex">
                                                            <User size={18} />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}

                                {loading && (
                                    <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                                        AI is thinking...
                                    </div>
                                )}

                                <div ref={bottomRef} />
                            </div>
                        </div>

                        <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
                            <div className="mx-auto flex max-w-4xl gap-2">
                                <textarea
                                    rows={1}
                                    value={question}
                                    onChange={(e) => {
                                        setQuestion(e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            askQuestion();
                                        }
                                    }}
                                    placeholder={docId ? "Ask about the selected document..." : "Select a document first..."}
                                    disabled={!docId}
                                    className="min-h-[46px] flex-1 resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                                />

                                <button
                                    type="button"
                                    onClick={askQuestion}
                                    disabled={!docId || loading || !question.trim()}
                                    className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Send question"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
