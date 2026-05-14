import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import API from "../services/api";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const useBackend =
        import.meta.env.VITE_USE_BACKEND === "true";

    const handleLogin = async () => {

        if (!email || !password) {

            setError("Please fill all fields");

            return;
        }

        try {

            setLoading(true);

            setError("");

            // =========================
            // REAL BACKEND LOGIN
            // =========================

            if (useBackend) {

                const formData = new URLSearchParams();

                formData.append("username", email);

                formData.append("password", password);

                const res = await API.post(
                    "/auth/login",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",
                        },
                    }
                );

                localStorage.setItem(
                    "token",
                    res.data.access_token
                );

                API.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${res.data.access_token}`;

            }

            // =========================
            // MOCK LOGIN MODE
            // =========================

            else {

                localStorage.setItem(
                    "token",
                    "demo-token"
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        email,
                    })
                );
            }

            navigate("/chat");

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Login failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div
            className="
                min-h-screen
                flex
                items-center
                justify-center
                bg-gradient-to-br
                from-blue-100
                via-white
                to-purple-100
                px-4
            "
        >

            <motion.div

                initial={{
                    opacity: 0,
                    y: 40,
                    scale: 0.95,
                }}

                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                }}

                transition={{
                    duration: 0.5,
                }}

                className="
                    w-full
                    max-w-md
                    backdrop-blur-lg
                    bg-white/70
                    border
                    border-white/30
                    shadow-2xl
                    rounded-3xl
                    p-6
                    sm:p-8
                "
            >

                {/* TITLE */}
                <div className="text-center mb-8">

                    <h1
                        className="
                            text-3xl
                            sm:text-4xl
                            font-bold
                            text-gray-800
                        "
                    >
                        Welcome Back
                    </h1>

                    <p className="text-gray-500 mt-2 text-sm">
                        Login to your AI Assistant
                    </p>

                </div>

                {/* EMAIL */}
                <div className="mb-4">

                    <label
                        className="
                            block
                            text-sm
                            font-medium
                            mb-2
                            text-gray-700
                        "
                    >
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        className="
                            w-full
                            border
                            border-gray-300
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            transition
                        "
                    />

                </div>

                {/* PASSWORD */}
                <div className="mb-4">

                    <label
                        className="
                            block
                            text-sm
                            font-medium
                            mb-2
                            text-gray-700
                        "
                    >
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        className="
                            w-full
                            border
                            border-gray-300
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            transition
                        "
                    />

                </div>

                {/* ERROR */}
                {error && (

                    <motion.p

                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}

                        className="
                            text-red-500
                            text-sm
                            mb-4
                        "
                    >
                        {error}
                    </motion.p>

                )}

                {/* LOGIN BUTTON */}
                <motion.button

                    whileHover={{
                        scale: 1.02,
                    }}

                    whileTap={{
                        scale: 0.98,
                    }}

                    onClick={handleLogin}

                    disabled={loading}

                    className="
                        w-full
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        py-3
                        rounded-xl
                        font-semibold
                        transition
                        shadow-lg
                    "
                >

                    {loading
                        ? "Logging in..."
                        : "Login"}

                </motion.button>

                {/* SIGNUP LINK */}
                <p
                    className="
                        text-center
                        mt-6
                        text-sm
                        text-gray-600
                    "
                >

                    Don&apos;t have an account?{" "}

                    <Link
                        to="/signup"
                        className="
                            text-blue-600
                            font-semibold
                            hover:underline
                        "
                    >
                        Sign up
                    </Link>

                </p>

            </motion.div>

        </div>
    );
}