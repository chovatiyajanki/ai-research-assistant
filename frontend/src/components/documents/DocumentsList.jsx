import { useEffect, useState } from "react";
import { FileText, RefreshCw, Trash2 } from "lucide-react";

import API from "../../services/api";

export default function DocumentsList({ refreshKey = 0, setDocId, setFileName }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(localStorage.getItem("doc_id"));

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await API.get("/documents/");
            setDocuments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;

        const loadDocuments = async () => {
            try {
                const res = await API.get("/documents/");

                if (active) {
                    setDocuments(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadDocuments();

        return () => {
            active = false;
        };
    }, [refreshKey]);

    const selectDocument = (doc) => {
        localStorage.setItem("doc_id", doc.document_id);
        localStorage.setItem("file_name", doc.file_name);

        setSelectedDoc(doc.document_id);
        setFileName?.(doc.file_name);
        setDocId(doc.document_id);
    };

    const deleteDocument = async (documentId) => {
        if (!window.confirm("Delete this document?")) return;

        try {
            await API.delete(`/documents/${documentId}`);

            const activeDoc = localStorage.getItem("doc_id");

            if (activeDoc == documentId) {
                localStorage.removeItem("doc_id");
                localStorage.removeItem("file_name");
                setFileName?.("");
                setDocId(null);
                setSelectedDoc(null);
            }

            fetchDocuments();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "Error deleting document");
        }
    };

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-slate-950">
                        Documents
                    </h2>
                    <p className="text-xs text-slate-500">
                        {documents.length} uploaded
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchDocuments}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    title="Refresh documents"
                >
                    <RefreshCw size={15} />
                </button>
            </div>

            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                {loading ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                        Loading documents...
                    </div>
                ) : documents.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                        No documents uploaded yet.
                    </div>
                ) : (
                    documents.map((doc) => {
                        const active = Number(selectedDoc) === doc.document_id;

                        return (
                            <div
                                key={doc.document_id}
                                onClick={() => selectDocument(doc)}
                                className={`group flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition ${
                                    active
                                        ? "border-teal-300 bg-teal-50"
                                        : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                            >
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                        active
                                            ? "bg-teal-600 text-white"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <FileText size={17} />
                                </div>

                                <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                                    {doc.file_name}
                                </p>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteDocument(doc.document_id);
                                    }}
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                                    title="Delete document"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}
