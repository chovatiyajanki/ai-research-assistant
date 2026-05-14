import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import API from "../../services/api"

export default function DocumentsList({ setDocId }){

    const [documents, setDocuments] = useState([]);
    
    const [selectedDoc, setSelectedDoc] =  useState(
        localStorage.getItem("doc_id")
    );

    // Fetch all uploaded documents
  
    const fetchDocuments = async () => {
        try{

            const token = localStorage.getItem("token");

            const res =  await API.get("/documents/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setDocuments(res.data);

        } catch (err) {
            console.error(err)
        }
    };
      useEffect(() => {

        fetchDocuments();

    }, []);

    // Select active document

    const selectDocument = (doc) => {

        localStorage.setItem("doc_id", doc.document_id);

        setSelectedDoc(doc.document_id);

        setDocId(doc.document_id)
    };

    // Delete Documents
    const deleteDocument =  async (document_id) => {
        
        const confirmDelete = window.confirm(
            "Delete This Document?"
        );

        if(!confirmDelete){
            return;
        }
        try {
            const token = localStorage.getItem("token");

            await API.delete(
                `/documents/${document_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Remove active Document If deleted 
            const activeDoc = localStorage.getItem("doc_id")

            if (activeDoc == document_id) {

                localStorage.removeItem("doc_id");

                setDocId(null);
            }
            
            // Refresh Documents
            fetchDocuments();   

        } catch (err) {

            console.error(err);

            alert("Error Deleting Document");
        }
    };

    return (
        <div className="bg-slate-900 text-white p-4 border-b border-slate-700">

            <h2 className="text-xl font-bold mb-4">
                Your Documents
            </h2>

            {documents.length === 0 ? (

                <p className="text-gray-400">
                    No documents Uploaded yet
                </p>
            ) : (
                documents.map((doc) => (

                    <div
                        key={doc.document_id}
                        onClick={() => selectDocument(doc)}
                        className={`flex items-center justify-between p-3 rounded mb-2 cursor-pointer transition ${
                            Number(selectedDoc) === doc.document_id
                            ? "bg-blue-600"
                            : "bg-slate-800 hover:bg-slate-700"
                        }`} 
                    >
                        {/* Document Name */}
                        <div
                            onClick={() =>
                                selectDocument(doc)
                            }
                            className="flex-1 cursor-pointer"
                        >
                            {doc.file_name}
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={() =>
                                deleteDocument(doc.document_id)
                            }
                            className="text-red-400 hover:text-red-600"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))
            )}
        </div>
    );
} 
