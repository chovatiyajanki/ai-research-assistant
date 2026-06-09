import axios from "axios";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const apiBaseURL = (
    import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

const API = axios.create({
    baseURL: apiBaseURL,
    timeout: 30000,
});

export const LONG_REQUEST_TIMEOUT = 180000;

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;
});

API.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem("token");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default API;
