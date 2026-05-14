import { useRef, useState } from "react";

import {
    FiUploadCloud,
    FiFileText,
} from "react-icons/fi";

import API from "../../services/api";

export default function Upload() {

    const [file, setFile] = useState(null);

    const [loading, setLoading] =
        useState(false);

    const [content, setContent] =
        useState("");

    const [dragging, setDragging] =
        useState(false);

    const inputRef = useRef(null);

    const handleFileChange = (selectedFile) => {

        if (!selectedFile) return;

        setFile(selectedFile);
    };

    const uploadFile = async () => {

        if (!file) {

            alert("Please select a file");

            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("file", file);

            const res = await API.post(
                "/documents/upload",
                formData
            );

            if (res.data.doc_id) {

                localStorage.setItem(
                    "doc_id",
                    res.data.doc_id
                );
            }

            if (res.data.file_name) {

                localStorage.setItem(
                    "file_name",
                    res.data.file_name
                );
            }

            setContent(
                res.data.content || ""
            );

            alert(
                "File uploaded successfully"
            );

            window.location.reload();

        } catch (err) {

            console.error(err);

            alert("Upload failed");

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="w-full">

            <div

                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}

                onDragLeave={() =>
                    setDragging(false)
                }

                onDrop={(e) => {
                    e.preventDefault();

                    setDragging(false);

                    handleFileChange(
                        e.dataTransfer.files[0]
                    );
                }}

                onClick={() =>
                    inputRef.current.click()
                }

                className={`
                    w-full
                    rounded-3xl
                    border-2
                    border-dashed
                    transition-all
                    duration-300
                    cursor-pointer
                    p-5
                    sm:p-8
                    text-center
                    backdrop-blur-md
                    shadow-lg
                    min-h-[180px]
                    sm:min-h-[220px]
                    flex
                    flex-col
                    justify-center
                    items-center
                    ${
                        dragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white/70"
                    }
                `}
            >

                <FiUploadCloud
                    className="
                        text-4xl
                        sm:text-5xl
                        md:text-6xl
                        text-blue-600
                        mb-4
                    "
                />

                <h2
                    className="
                        text-xl
                        sm:text-2xl
                        font-bold
                        mb-2
                    "
                >
                    Upload Document
                </h2>

                <p
                    className="
                        text-gray-500
                        text-sm
                        sm:text-base
                        px-2
                    "
                >
                    Drag & Drop PDF, TXT, JPG,
                    PNG files here
                </p>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        uploadFile();
                    }}

                    disabled={loading}

                    className="
                        mt-6
                        bg-blue-600
                        hover:bg-blue-700
                        disabled:opacity-50
                        text-white
                        px-6
                        py-3
                        rounded-2xl
                        shadow-md
                        transition
                        w-full
                        sm:w-auto
                    "
                >

                    {loading
                        ? "Uploading..."
                        : "Upload File"}

                </button>

                <input
                    ref={inputRef}
                    type="file"
                    hidden
                    accept="
                        .pdf,
                        .txt,
                        .png,
                        .jpg,
                        .jpeg
                    "
                    onChange={(e) =>
                        handleFileChange(
                            e.target.files[0]
                        )
                    }
                />

            </div>

        </div>
    );
}