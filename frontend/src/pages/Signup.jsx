import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    Loader2,
    Lock,
    Mail,
    ShieldCheck,
    Sparkles,
    User,
    XCircle,
} from "lucide-react";

import API from "../services/api";

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const password = formData.password;
    const confirmPassword = formData.confirmpassword;
    const passwordRules = [
        {
            label: "8 to 72 characters",
            valid: password.length >= 8 && password.length <= 72,
        },
        {
            label: "One uppercase letter",
            valid: /[A-Z]/.test(password),
        },
        {
            label: "One lowercase letter",
            valid: /[a-z]/.test(password),
        },
        {
            label: "One number",
            valid: /\d/.test(password),
        },
        {
            label: "One special character",
            valid: /[^A-Za-z0-9]/.test(password),
        },
        {
            label: "No spaces",
            valid: password.length > 0 && !/\s/.test(password),
        },
    ];
    const passwordIsValid = passwordRules.every((rule) => rule.valid);
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

    const handleChange = (e) => {
        if (e.target.name === "password" || e.target.name === "confirmpassword") {
            setError("");
        }

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordIsValid) {
            setError("Password does not meet the security requirements");
            return;
        }

        if (formData.password !== formData.confirmpassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            await API.post("/auth/signup", {
                user_name: formData.name,
                user_email: formData.email,
                password: formData.password,
            });

            navigate("/login");
        } catch (err) {
            console.error(err);
            const timeoutMessage = err.code === "ECONNABORTED"
                ? "Backend is taking too long to respond. Railway may be waking up; try again in a moment."
                : null;

            setError(
                timeoutMessage ||
                err?.response?.data?.detail ||
                err?.message ||
                "Signup failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-dvh bg-slate-50 text-slate-950">
            <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,1fr)_500px]">
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
                            Secure research workspace
                        </p>
                        <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
                            Create an account for document-grounded research.
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                            Keep uploaded documents, chat history, and answers tied to your own workspace with protected access.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <p className="text-2xl font-semibold text-teal-300">Files</p>
                            <p className="mt-1 text-slate-400">Private document library</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <p className="text-2xl font-semibold text-teal-300">Chats</p>
                            <p className="mt-1 text-slate-400">Saved research threads</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <p className="text-2xl font-semibold text-teal-300">Access</p>
                            <p className="mt-1 text-slate-400">User-owned data</p>
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
                                    Create account
                                </h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    Start a secure document research workspace.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">
                                        Full name
                                    </span>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                            required
                                        />
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">
                                        Email
                                    </span>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                            required
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
                                            name="password"
                                            placeholder="Create password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                            maxLength={72}
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                            required
                                        />
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                                        {passwordRules.map((rule) => {
                                            const Icon = rule.valid ? CheckCircle2 : XCircle;

                                            return (
                                                <div
                                                    key={rule.label}
                                                    className={`flex items-center gap-2 text-xs ${
                                                        rule.valid ? "text-teal-700" : "text-slate-500"
                                                    }`}
                                                >
                                                    <Icon size={14} />
                                                    <span>{rule.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">
                                        Confirm password
                                    </span>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input
                                            type="password"
                                            name="confirmpassword"
                                            placeholder="Confirm password"
                                            value={formData.confirmpassword}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                            maxLength={72}
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                            required
                                        />
                                    </div>

                                    {confirmPassword.length > 0 && (
                                        <p
                                            className={`mt-2 flex items-center gap-2 text-xs ${
                                                passwordsMatch ? "text-teal-700" : "text-red-600"
                                            }`}
                                        >
                                            {passwordsMatch ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                                        </p>
                                    )}
                                </label>

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
                                    {loading ? "Creating account" : "Sign up"}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-slate-600">
                                Already have an account?{" "}
                                <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
