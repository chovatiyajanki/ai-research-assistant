import { useRef, useState } from "react";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";

import API, { LONG_REQUEST_TIMEOUT } from "../../services/api";

const MIN_UPLOAD_SIZE = 1 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".png", ".jpg", ".jpeg"];
const RECOVERY_POLL_ATTEMPTS = 12;
const RECOVERY_POLL_INTERVAL_MS = 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Upload({ onUploaded }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    const handleFileChange = (selectedFile) => {
        if (!selectedFile) return;

        const extension = selectedFile.name
            .slice(selectedFile.name.lastIndexOf("."))
            .toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            alert("Unsupported file type. Upload PDF, TXT, PNG, JPG, or JPEG files.");
            return;
        }

        if (selectedFile.size < MIN_UPLOAD_SIZE) {
            alert("File too small. Minimum upload size is 1 MB.");
            return;
        }

        if (selectedFile.size > MAX_UPLOAD_SIZE) {
            alert("File too large. Maximum upload size is 50 MB.");
            return;
        }

        setFile(selectedFile);
    };

    const uploadFile = async () => {
        if (!file) {
            alert("Please select a file");
            return;
        }

        const selectedFileName = file.name;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("file", file);

            const res = await API.post("/documents/upload", formData, {
                timeout: LONG_REQUEST_TIMEOUT,
            });

            if (res.data.doc_id) {
                localStorage.setItem("doc_id", res.data.doc_id);
            }

            if (res.data.file_name) {
                localStorage.setItem("file_name", res.data.file_name);
            }

            setFile(null);
            onUploaded?.(res.data);
        } catch (err) {
            console.error(err);

            if (!err.response?.data?.detail) {
                const recoveredDocument = await recoverCompletedUpload(selectedFileName);

                if (recoveredDocument) {
                    localStorage.setItem("doc_id", recoveredDocument.document_id);
                    localStorage.setItem("file_name", recoveredDocument.file_name);
                    setFile(null);
                    onUploaded?.({
                        doc_id: recoveredDocument.document_id,
                        file_name: recoveredDocument.file_name,
                    });
                    return;
                }
            }

            alert(err.response?.data?.detail || "Upload failed. Please check Railway logs and try again.");
        } finally {
            setLoading(false);
        }
    };

    const recoverCompletedUpload = async (fileName) => {
        for (let attempt = 0; attempt < RECOVERY_POLL_ATTEMPTS; attempt += 1) {
            await wait(RECOVERY_POLL_INTERVAL_MS);

            try {
                const res = await API.get("/documents/");
                const matchedDocument = [...res.data]
                    .reverse()
                    .find((document) => document.file_name === fileName);

                if (matchedDocument) {
                    return matchedDocument;
                }
            } catch (pollError) {
                console.error(pollError);
            }
        }

        return null;
    };

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-slate-950">
                        Document Upload
                    </h2>
                    <p className="text-xs text-slate-500">
                        PDF, TXT, PNG, JPG from 1 MB to 50 MB
                    </p>
                </div>

                {file && (
                    <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Remove selected file"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFileChange(e.dataTransfer.files[0]);
                }}
                onClick={() => inputRef.current.click()}
                className={`flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center transition ${
                    dragging
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white"
                }`}
            >
                <UploadCloud className="mb-3 text-teal-600" size={34} />
                <p className="text-sm font-medium text-slate-900">
                    Drop a file here or browse
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    Scanned PDFs, photos, and image text are processed with OCR.
                </p>

                <input
                    ref={inputRef}
                    type="file"
                    hidden
                    accept=".pdf,.txt,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                />
            </div>

            {file && (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <FileText className="shrink-0 text-slate-500" size={18} />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                            {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={uploadFile}
                disabled={loading || !file}
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                {loading ? "Processing" : "Upload"}
            </button>
        </section>
    );
}
