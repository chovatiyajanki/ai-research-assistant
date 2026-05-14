import { useEffect, useState } from "react";

import API from "../../services/api";

export default function Sidebar({
    docId,
    setDocId,
}) {

    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {

        try {

            const res = await API.get("/history/");

            setHistory(res.data);

        } catch (err) {

            console.error(err);
        }
    };

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("doc_id");

        localStorage.removeItem("file_name");

        window.location.href = "/login";
    };

    const handleSelectChat = (chat) => {

        localStorage.setItem(
            "doc_id",
            chat.document_id
        );

        setDocId(chat.document_id);
    };

    return (

        <div
            className="
                w-full
                bg-slate-950
                text-white
                p-4
                flex
                flex-col
                h-full
            "
        >

            <h1
                className="
                    text-2xl
                    sm:text-3xl
                    font-bold
                    mb-6
                "
            >
                Chat History
            </h1>

            <div className="flex-1 overflow-y-auto">

                {history.length === 0 ? (

                    <p className="text-gray-400">
                        No Chat History
                    </p>

                ) : (

                    history.map((chat) => (

                        <div
                            key={chat.chat_id}
                            onClick={() =>
                                handleSelectChat(chat)
                            }
                            className={`
                                p-3
                                rounded-xl
                                mb-3
                                cursor-pointer
                                transition
                                ${
                                    Number(docId) ===
                                    Number(chat.document_id)
                                        ? "bg-blue-600"
                                        : "bg-slate-800 hover:bg-slate-700"
                                }
                            `}
                        >

                            <p
                                className="
                                    font-semibold
                                    text-sm
                                    break-words
                                "
                            >
                                Q: {chat.chat_question}
                            </p>

                            <p
                                className="
                                    text-sm
                                    text-gray-300
                                    mt-2
                                    line-clamp-3
                                    break-words
                                "
                            >
                                A: {chat.chat_answer}
                            </p>

                        </div>

                    ))
                )}

            </div>

            <button
                onClick={handleLogout}
                className="
                    mt-4
                    bg-red-600
                    hover:bg-red-700
                    py-3
                    rounded-xl
                    transition
                "
            >
                Logout
            </button>

        </div>
    );
}