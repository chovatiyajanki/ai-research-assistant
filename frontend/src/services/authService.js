import API from "./api";

export const requestPasswordReset = (email) =>
    API.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
    API.post("/auth/reset-password", { token, password });

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");   
}
