import API from "./api";

// Get document chat history
export const getDocHistory = (docId) =>
  API.get(`/chat/history/${docId}`);

// Ask question
export const askQuestionAPI = (data) =>
  API.post("/chat/ask", data);

// Delete history
export const deleteHistory = (docId) =>
  API.delete(`/chat/history/${docId}`);

// Edit chat
export const updateChat = (chatId, data) =>
  API.patch(`/chat/${chatId}`, data);