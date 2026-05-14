import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { motion, AnimatePresence } from "framer-motion";

import { FaUserCircle } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import { HiMenu, HiX } from "react-icons/hi";

import Upload from "../components/documents/Upload";
import Sidebar from "../components/sidebar/Sidebar";
import DocumentsList from "../components/documents/DocumentsList";

import {
    getDocHistory,
    askQuestionAPI,
    deleteHistory,
    updateChat,
} from "../services/chatServices";

const useBackend =
    import.meta.env.VITE_USE_BACKEND === "true";

export default function Chat() {

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);

    const [docId, setDocId] = useState(null);
    const [fileName, setFileName] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editChatId, setEditingChatId] =
        useState(null);

    const [editText, setEditText] = useState("");

    const [showSidebar, setShowSidebar] =
        useState(false);

    const bottomRef = useRef(null);

    // =========================
    // MOCK DATA
    // =========================

    const mockMessages = [
        {
            id: 1,
            role: "ai",
            text: "👋 Welcome to AI Research Assistant",
        },
        {
            id: 2,
            role: "user",
            text: "What can you do?",
        },
        {
            id: 3,
            role: "ai",
            text:
                "I can help summarize documents, answer questions, and assist with AI research.",
        },
    ];

    // =========================
    // LOAD DOCUMENT
    // =========================

    useEffect(() => {

        const storedId =
            localStorage.getItem("doc_id");

        const storedFile =
            localStorage.getItem("file_name");

        if (storedId) setDocId(storedId);

        if (storedFile) setFileName(storedFile);

    }, []);

    // =========================
    // LOAD CHAT HISTORY
    // =========================

    useEffect(() => {

        // MOCK MODE
        if (!useBackend) {

            setMessages(mockMessages);

            return;
        }

        // REAL BACKEND
        const loadHistory = async () => {

            if (!docId) return;

            try {

                const res =
                    await getDocHistory(docId);

                const formatted =
                    res.data.flatMap((chat) => [
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
            }
        };

        loadHistory();

    }, [docId]);

    // =========================
    // AUTO SCROLL
    // =========================

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages, loading]);

    // =========================
    // ASK QUESTION
    // =========================

    const askQuestion = async () => {

        if (!question.trim())
            return;

        const currentQuestion = question;

        setQuestion("");

        setLoading(true);

        try {

            // MOCK MODE
            if (!useBackend) {

                setTimeout(() => {

                    setMessages((prev) => [

                        ...prev,

                        {
                            id: Date.now(),
                            role: "user",
                            text: currentQuestion,
                        },

                        {
                            id: Date.now() + 1,
                            role: "ai",
                            text:
                                "This is a mock AI response because backend is not deployed yet.",
                        },
                    ]);

                    setLoading(false);

                }, 1000);

                return;
            }

            // REAL BACKEND
            if (!docId) return;

            const res =
                await askQuestionAPI({
                    doc_id: Number(docId),
                    question: currentQuestion,
                });

            const chatId =
                res.data.chat_id;

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

            alert("Error asking question");

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // CLEAR CHAT
    // =========================

    const clearChatHistory = async () => {

        if (!useBackend) {

            setMessages([]);

            return;
        }

        if (!docId) return;

        if (
            !window.confirm(
                "Clear Chat History?"
            )
        ) return;

        try {

            await deleteHistory(docId);

            setMessages([]);

        } catch (err) {

            console.error(err);
        }
    };

    // =========================
    // SAVE EDIT
    // =========================

    const handleSave = async (chatId) => {

        if (!editText.trim()) return;

        setSaving(true);

        try {

            // MOCK MODE
            if (!useBackend) {

                setMessages((prev) =>
                    prev.map((msg) => {

                        if (
                            msg.id === chatId &&
                            msg.role === "user"
                        ) {

                            return {
                                ...msg,
                                text: editText,
                            };
                        }

                        return msg;
                    })
                );

                setEditingChatId(null);

                setEditText("");

                return;
            }

            // REAL BACKEND
            const res =
                await updateChat(chatId, {
                    chat_question: editText,
                });

            setMessages((prev) =>
                prev.map((msg) => {

                    if (
                        msg.id === chatId &&
                        msg.role === "user"
                    ) {

                        return {
                            ...msg,
                            text: editText,
                        };
                    }

                    if (
                        msg.id === chatId &&
                        msg.role === "ai"
                    ) {

                        return {
                            ...msg,
                            text:
                                res.data.chat
                                    .chat_answer,
                        };
                    }

                    return msg;
                })
            );

            setEditingChatId(null);

            setEditText("");

        } catch (err) {

            console.error(err);

        } finally {

            setSaving(false);
        }
    };

    return (

        <div
            className="
                flex
                min-h-screen
                bg-gradient-to-br
                from-slate-100
                via-white
                to-blue-100
                overflow-hidden
            "
        >

            {/* OVERLAY */}
            <AnimatePresence>

                {showSidebar && (

                    <motion.div

                        initial={{ opacity: 0 }}

                        animate={{ opacity: 1 }}

                        exit={{ opacity: 0 }}

                        onClick={() =>
                            setShowSidebar(false)
                        }

                        className="
                            fixed
                            inset-0
                            bg-black/40
                            z-30
                            md:hidden
                        "
                    />

                )}

            </AnimatePresence>

            {/* MOBILE SIDEBAR */}
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

                        className="
                            fixed
                            top-0
                            left-0
                            z-40
                            h-full
                            w-[280px]
                            md:hidden
                        "
                    >

                        <Sidebar
                            docId={docId}
                            setDocId={setDocId}
                        />

                    </motion.div>

                )}

            </AnimatePresence>

            {/* DESKTOP SIDEBAR */}
            <div className="hidden md:block w-[280px] shrink-0">

                <Sidebar
                    docId={docId}
                    setDocId={setDocId}
                />

            </div>

            {/* MAIN */}
            <div
                className="
                    flex
                    flex-col
                    flex-1
                    min-w-0
                "
            >

                {/* HEADER */}
                <div
                    className="
                        sticky
                        top-0
                        z-20
                        bg-white/85
                        backdrop-blur-xl
                        border-b
                        px-3
                        sm:px-4
                        py-3
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        "
                    >

                        {/* LEFT */}
                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                min-w-0
                            "
                        >

                            {/* MOBILE MENU */}
                            <button
                                onClick={() =>
                                    setShowSidebar(
                                        !showSidebar
                                    )
                                }
                                className="
                                    md:hidden
                                    flex
                                    items-center
                                    justify-center
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-white/70
                                    border
                                    shadow-md
                                "
                            >

                                {showSidebar ? (
                                    <HiX size={22} />
                                ) : (
                                    <HiMenu size={22} />
                                )}

                            </button>

                            {/* DOCUMENT */}
                            <div className="min-w-0">

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                    "
                                >
                                    AI Research Assistant
                                </p>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                    "
                                >
                                    Mock Mode Enabled
                                </p>

                            </div>

                        </div>

                        {/* CLEAR */}
                        <button
                            onClick={
                                clearChatHistory
                            }
                            className="
                                bg-red-500
                                hover:bg-red-600
                                text-white
                                px-4
                                py-2
                                rounded-xl
                                text-sm
                            "
                        >
                            Clear Chat
                        </button>

                    </div>

                </div>

                {/* UPLOAD SECTION */}
                <div
                    className="
                        bg-white/70
                        border-b
                        p-3
                    "
                >

                    <div className="max-w-5xl mx-auto space-y-6">

                        <Upload />

                        <DocumentsList
                            setDocId={setDocId}
                        />

                    </div>

                </div>

                {/* CHAT AREA */}
                <div
                    className="
                        flex-1
                        overflow-y-auto
                        px-2
                        py-3
                        sm:px-4
                        lg:px-6
                    "
                >

                    <div className="max-w-5xl mx-auto">

                        {messages.map((msg, index) => (

                            <motion.div

                                key={`${msg.role}-${msg.id}`}

                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}

                                transition={{
                                    delay:
                                        index * 0.03,
                                }}

                                className={`mb-5 flex ${
                                    msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >

                                <div
                                    className={`
                                        w-fit
                                        max-w-[95%]
                                        sm:max-w-[85%]
                                        lg:max-w-[70%]
                                        rounded-3xl
                                        p-4
                                        shadow-lg
                                        break-words
                                        ${
                                            msg.role === "user"
                                                ? "bg-blue-600 text-white"
                                                : "bg-white border"
                                        }
                                    `}
                                >

                                    {/* LABEL */}
                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            text-xs
                                            opacity-70
                                            mb-3
                                        "
                                    >

                                        {msg.role ===
                                        "user" ? (
                                            <>
                                                <FaUserCircle />
                                                <span>
                                                    You
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <BsRobot />
                                                <span>
                                                    AI Assistant
                                                </span>
                                            </>
                                        )}

                                    </div>

                                    {/* MESSAGE */}
                                    <div
                                        className="
                                            prose
                                            prose-sm
                                            max-w-none
                                        "
                                    >

                                        <ReactMarkdown>
                                            {msg.text}
                                        </ReactMarkdown>

                                    </div>

                                </div>

                            </motion.div>

                        ))}

                        {/* LOADING */}
                        {loading && (

                            <div className="text-gray-500 italic text-sm">
                                AI is thinking...
                            </div>

                        )}

                        <div ref={bottomRef} />

                    </div>

                </div>

                {/* INPUT */}
                <div
                    className="
                        sticky
                        bottom-0
                        z-20
                        bg-white/90
                        border-t
                        p-3
                    "
                >

                    <div
                        className="
                            max-w-5xl
                            mx-auto
                            flex
                            flex-col
                            sm:flex-row
                            gap-2
                        "
                    >

                        <textarea
                            rows={1}

                            value={question}

                            onChange={(e) => {

                                setQuestion(
                                    e.target.value
                                );

                                e.target.style.height =
                                    "auto";

                                e.target.style.height =
                                    `${e.target.scrollHeight}px`;
                            }}

                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter" &&
                                    !e.shiftKey
                                ) {

                                    e.preventDefault();

                                    askQuestion();
                                }
                            }}

                            placeholder="Ask anything..."

                            className="
                                flex-1
                                border
                                rounded-2xl
                                p-4
                                resize-none
                                outline-none
                            "
                        />

                        <button
                            onClick={askQuestion}

                            disabled={loading}

                            className="
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                px-6
                                py-3
                                rounded-2xl
                                font-semibold
                            "
                        >

                            {loading
                                ? "Thinking..."
                                : "Send"}

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}