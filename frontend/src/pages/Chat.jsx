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

    // LOAD DOCUMENT
    useEffect(() => {

        const storedId =
            localStorage.getItem("doc_id");

        const storedFile =
            localStorage.getItem("file_name");

        if (storedId) setDocId(storedId);

        if (storedFile) setFileName(storedFile);

    }, []);

    // LOAD HISTORY
    useEffect(() => {

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

    // AUTO SCROLL
    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages, loading]);

    // ASK QUESTION
    const askQuestion = async () => {

        if (!docId || !question.trim())
            return;

        const currentQuestion = question;

        setQuestion("");

        setLoading(true);

        try {

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

    // CLEAR CHAT
    const clearChatHistory = async () => {

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

    // SAVE EDIT
    const handleSave = async (chatId) => {

        if (!editText.trim()) return;

        setSaving(true);

        try {

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
                {docId && (

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

                                {/* MOBILE MENU BUTTON */}
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
                                        backdrop-blur-md
                                        border
                                        border-white/40
                                        shadow-md
                                        hover:bg-white
                                        active:scale-95
                                        transition-all
                                        shrink-0
                                    "
                                >

                                    <motion.div
                                        animate={{
                                            rotate:
                                                showSidebar
                                                    ? 90
                                                    : 0,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                    >

                                        {showSidebar ? (
                                            <HiX
                                                size={22}
                                                className="
                                                    text-slate-700
                                                "
                                            />
                                        ) : (
                                            <HiMenu
                                                size={22}
                                                className="
                                                    text-slate-700
                                                "
                                            />
                                        )}

                                    </motion.div>

                                </button>

                                {/* DOCUMENT INFO */}
                                <div className="min-w-0">

                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        Active Document
                                    </p>

                                    <p
                                        className="
                                            text-xs
                                            sm:text-sm
                                            text-gray-500
                                            truncate
                                            max-w-[180px]
                                            sm:max-w-[300px]
                                        "
                                    >
                                        {fileName}
                                    </p>

                                </div>

                            </div>

                            {/* CLEAR CHAT */}
                            <button
                                onClick={
                                    clearChatHistory
                                }
                                className="
                                    bg-red-500
                                    hover:bg-red-600
                                    text-white
                                    px-3
                                    sm:px-4
                                    py-2
                                    rounded-xl
                                    text-xs
                                    sm:text-sm
                                    font-medium
                                    shadow-sm
                                    transition-all
                                    shrink-0
                                "
                            >
                                Clear Chat
                            </button>

                        </div>

                    </div>

                )}

                {/* UPLOAD SECTION */}
                <div
                    className="
                        bg-white/70
                        backdrop-blur-md
                        border-b
                        p-3
                        sm:p-4
                        overflow-x-hidden
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
                        overflow-x-hidden
                        px-2
                        py-3
                        sm:px-4
                        lg:px-6
                    "
                >

                    <div className="max-w-5xl mx-auto">

                        {messages.length === 0 ? (

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    text-center
                                    text-gray-500
                                    mt-24
                                    px-4
                                "
                            >
                                Upload a document and ask
                                questions
                            </div>

                        ) : (

                            messages.map((msg, index) => (

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

                                    className={`mb-5 flex ${msg.role === "user"
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
                                            overflow-hidden
                                            break-words
                                            ${msg.role === "user"
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
                                                break-words
                                                overflow-x-auto
                                                prose-pre:max-w-full
                                                prose-pre:overflow-x-auto
                                            "
                                        >

                                            <ReactMarkdown>
                                                {msg.text}
                                            </ReactMarkdown>

                                        </div>

                                        {/* EDIT */}
                                        {msg.role ===
                                            "user" && (

                                                <button
                                                    onClick={() => {

                                                        setEditingChatId(
                                                            msg.id
                                                        );

                                                        setEditText(
                                                            msg.text
                                                        );
                                                    }}
                                                    className="
                                                        text-yellow-300
                                                        text-xs
                                                        mt-3
                                                    "
                                                >
                                                    Edit
                                                </button>

                                            )}

                                    </div>

                                </motion.div>

                            ))
                        )}

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
                        backdrop-blur-md
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
                                overflow-hidden
                                min-h-[55px]
                                max-h-[180px]
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                                text-base
                                sm:text-sm
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
                                shadow-lg
                                w-full
                                sm:w-auto
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