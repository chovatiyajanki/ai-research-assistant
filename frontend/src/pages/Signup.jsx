import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import API from "../services/api";

const Signup = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (
            formData.password !==
            formData.confirmpassword
        ) {

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

            alert("Account created successfully");

            navigate("/login");

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.detail ||
                "Signup failed"
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
                from-purple-100
                via-white
                to-blue-100
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
                        Create Account
                    </h1>

                    <p className="text-gray-500 mt-2 text-sm">
                        Join your AI Assistant platform
                    </p>

                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    {/* FULL NAME */}
                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                mb-2
                                text-gray-700
                            "
                        >
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
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
                            required
                        />

                    </div>

                    {/* EMAIL */}
                    <div>

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
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
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
                            required
                        />

                    </div>

                    {/* PASSWORD */}
                    <div>

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
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
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
                            required
                        />

                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                mb-2
                                text-gray-700
                            "
                        >
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmpassword"
                            placeholder="Confirm password"
                            value={formData.confirmpassword}
                            onChange={handleChange}
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
                            required
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
                            "
                        >
                            {error}
                        </motion.p>

                    )}

                    {/* BUTTON */}
                    <motion.button

                        whileHover={{
                            scale: 1.02,
                        }}

                        whileTap={{
                            scale: 0.98,
                        }}

                        type="submit"

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
                            ? "Creating..."
                            : "Sign Up"}

                    </motion.button>

                </form>

                {/* LOGIN LINK */}
                <p
                    className="
                        text-center
                        mt-6
                        text-sm
                        text-gray-600
                    "
                >

                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="
                            text-blue-600
                            font-semibold
                            hover:underline
                        "
                    >
                        Login
                    </Link>

                </p>

            </motion.div>

        </div>
    );
};

export default Signup;