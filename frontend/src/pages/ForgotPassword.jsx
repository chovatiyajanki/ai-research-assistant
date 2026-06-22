import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, Mail, Sparkles } from "lucide-react";

import { requestPasswordReset } from "../services/authService";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resetUrl, setResetUrl] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setResetUrl("");

        if (!email.trim()) {
            setError("Enter your email address");
            return;
        }

        try {
            setLoading(true);
            const res = await requestPasswordReset(email.trim());
            setMessage(res.data.message || "Check your email for the reset link.");
            setResetUrl(res.data.reset_url || "");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.detail || err?.message || "Could not start password reset");
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
                            <p className="text-xs text-slate-400">Account recovery</p>
                        </div>
                    </div>

                    <div className="max-w-xl">
                        <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
                            Reset access to your research workspace.
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                            Generate a secure reset link, set a new password, and continue working with your documents.
                        </p>
                    </div>
                </section>

                <section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6">
                    <div className="w-full max-w-md">
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
                                <ArrowLeft size={16} />
                                Back to login
                            </Link>

                            <div className="mb-6">
                                <h1 className="text-2xl font-semibold text-slate-950">Forgot password</h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    Enter your account email to generate a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        />
                                    </div>
                                </label>

                                {error && (
                                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {error}
                                    </p>
                                )}

                                {message && (
                                    <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                                        <p>{message}</p>
                                        {resetUrl && (
                                            <Link to={resetUrl} className="mt-2 inline-flex font-semibold text-teal-900 hover:text-teal-700">
                                                Open reset form
                                            </Link>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight size={17} />}
                                    {loading ? "Generating link" : "Generate reset link"}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
