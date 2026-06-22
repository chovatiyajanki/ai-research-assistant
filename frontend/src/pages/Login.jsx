import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Lock, Mail, Sparkles } from "lucide-react";

import API from "../services/api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const res = await API.post("/auth/login", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const token = res.data.access_token;
            localStorage.setItem("token", token);
            API.defaults.headers.common.Authorization = `Bearer ${token}`;
            navigate("/chat");
        } catch (err) {
            console.error(err);
            const timeoutMessage = err.code === "ECONNABORTED"
                ? "Backend is taking too long to respond. Railway may be waking up; try again in a moment."
                : null;

            setError(
                timeoutMessage ||
                err?.response?.data?.detail ||
                err?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-dvh bg-slate-50 text-slate-950">
            <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px]">
                <section className="hidden bg-slate-950 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">AI Research Assistant</p>
                            <p className="text-xs text-slate-400">Document intelligence workspace</p>
                        </div>
                    </div>

                    <div className="max-w-xl">
                        <p className="mb-4 inline-flex rounded-lg border border-white/10 px-3 py-1 text-xs font-medium text-teal-200">
                            Research faster. Read smarter.
                        </p>
                        <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
                            Turn uploaded documents into useful answers.
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                            Upload PDFs, notes, reports, and images, then ask focused questions from one clean workspace.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <p className="text-2xl font-semibold text-teal-300">RAG</p>
                            <p className="mt-1 text-slate-400">Document-grounded answers</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <p className="text-2xl font-semibold text-teal-300">OCR</p>
                            <p className="mt-1 text-slate-400">Image text extraction</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <p className="text-2xl font-semibold text-teal-300">History</p>
                            <p className="mt-1 text-slate-400">Saved research chats</p>
                        </div>
                    </div>
                </section>

                <section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6">
                    <div className="w-full max-w-md">
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-teal-300">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">AI Research Assistant</p>
                                <p className="text-xs text-slate-500">Document intelligence workspace</p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6">
                                <h1 className="text-2xl font-semibold text-slate-950">
                                    Welcome back
                                </h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    Sign in to continue your research session.
                                </p>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleLogin();
                                }}
                                className="space-y-4"
                            >
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">
                                        Email
                                    </span>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        />
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">
                                        Password
                                    </span>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input
                                            type="password"
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        />
                                    </div>
                                </label>

                                <div className="flex justify-end">
                                    <Link to="/forgot-password" className="text-sm font-medium text-teal-700 hover:text-teal-800">
                                        Forgot password?
                                    </Link>
                                </div>

                                {error && (
                                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight size={17} />}
                                    {loading ? "Signing in" : "Login"}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-slate-600">
                                Do not have an account?{" "}
                                <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-800">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
