import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Lock, ShieldCheck, Sparkles, XCircle } from "lucide-react";

import { resetPassword } from "../services/authService";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const passwordRules = useMemo(() => [
        { label: "8 to 72 characters", valid: password.length >= 8 && password.length <= 72 },
        { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "One lowercase letter", valid: /[a-z]/.test(password) },
        { label: "One number", valid: /\d/.test(password) },
        { label: "One special character", valid: /[^A-Za-z0-9]/.test(password) },
        { label: "No spaces", valid: password.length > 0 && !/\s/.test(password) },
    ], [password]);
    const passwordIsValid = passwordRules.every((rule) => rule.valid);
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!token) {
            setError("Password reset token is missing");
            return;
        }

        if (!passwordIsValid) {
            setError("Password does not meet the security requirements");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const res = await resetPassword(token, password);
            setSuccess(res.data.message || "Password reset successfully");
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.detail || err?.message || "Could not reset password");
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
                            <p className="text-xs text-slate-400">Secure password reset</p>
                        </div>
                    </div>

                    <div className="max-w-xl">
                        <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
                            Choose a new password.
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                            Use a strong password to protect your documents, questions, and saved research history.
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
                                <h1 className="text-2xl font-semibold text-slate-950">Reset password</h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    Enter and confirm your new account password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            maxLength={72}
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        />
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                                        {passwordRules.map((rule) => {
                                            const Icon = rule.valid ? CheckCircle2 : XCircle;

                                            return (
                                                <div key={rule.label} className={`flex items-center gap-2 text-xs ${rule.valid ? "text-teal-700" : "text-slate-500"}`}>
                                                    <Icon size={14} />
                                                    <span>{rule.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            maxLength={72}
                                            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        />
                                    </div>
                                </label>

                                {error && (
                                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {error}
                                    </p>
                                )}

                                {success && (
                                    <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                                        {success}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
                                    {loading ? "Saving password" : "Reset password"}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
