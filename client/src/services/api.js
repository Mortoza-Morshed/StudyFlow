import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadDocument = async (file, text) => {
  if (text) {
    const response = await api.post("/documents", { text });
    return response.data;
  }

  if (file) {
    const formData = new FormData();
    formData.append("document", file);

    const response = await axios.post(`${API_BASE_URL}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  throw new Error("No file or text provided");
};

export const generateQuestions = async (text, count = 5, provider = "gemini") => {
  const response = await api.post("/questions/generate", { text, count, provider });
  return response.data;
};

export const checkAnswers = async (questions, userAnswers, documentId, title) => {
  const response = await api.post("/questions/check", {
    questions,
    userAnswers,
    documentId,
    title,
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

export const getQuizzes = async () => {
  const response = await api.get("/questions/history");
  return response.data;
};

export const getStats = async () => {
  const response = await api.get("/questions/stats");
  return response.data;
};

export default api;
