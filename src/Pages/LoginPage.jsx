import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getCurrentUser, login, register } from "./userService";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { formStyles as s } from "../styles/tailwind";
import Logo from '../assets/logo.png';

export default function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) navigate("/map");

        if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id:
                    "679464120912-56tkuk1hlkt9ntullhgmmgec9snuh9cs.apps.googleusercontent.com",
                callback: handleGoogleCallback,
                ux_mode: "popup" // 🔥 Forces popup mode (no FedCM)
            });

            window.google.accounts.id.renderButton(
                document.getElementById("google-signin"),
                { theme: "outline", size: "large" }
            );
        }
    }, [navigate]);

    const handleGoogleCallback = (response) => {
        const userObject = jwtDecode(response.credential);
        const email = userObject.email;
        const name = userObject.name;

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const existingUser = users.find((u) => u.email === email);

        if (!existingUser) {
            register({ email, password: null, name, profile: userObject, isSSO: true });
        } else {
            localStorage.setItem("currentUserEmail", email);
        }
        navigate("/map");
    };

    const validateEmail = (email) => {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!email) return "Email is required";
        if (!emailRegex.test(email)) return "Invalid email format";
        return "";
    };

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        return "";
    };

    const emailError = useMemo(() => validateEmail(email), [email]);
    const passwordError = useMemo(() => validatePassword(password), [password]);

    const showError = (field) => (touched[field] || submitted) && errors[field];

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);

        const finalErrors = { email: emailError, password: passwordError };
        setErrors(finalErrors);

        if (Object.values(finalErrors).some((err) => err)) return;

        const success = login(email, password);
        if (success) navigate("/map");
        else setErrors({ general: "Invalid email or password" });
    };

    return (
        <div className={s.container}>
            <div className={s.card}>
                <div className={s.center}>
                    <div className={s.centerWithGap}>
                        <img src={Logo} alt="Logo" className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">TripPlanner</h1>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 italic mt-1 mb-5">
                        Powered by <span className="text-green-600 font-semibold">OpenStreetMap</span>
                    </p>
                </div>
                
                {errors.general && <p className={s.errorGeneral}>{errors.general}</p>}

                <form onSubmit={handleSubmit} className={s.form}>
                    {/* Email */}
                    <div className="relative">
                        <label className={s.label}>
                            Email <span className={s.required}>*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors((prev) => ({ ...prev, email: "" }));
                            }}
                            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                            className={`${s.inputBase} ${showError("email") ? s.inputError : ""}`}
                        />
                        {(touched.email || submitted) && email && (
                            emailError
                                ? <XCircleIcon className={`${s.icon.invalid} ${s.inputIconRight}`} />
                                : <CheckCircleIcon className={`${s.icon.valid} ${s.inputIconRight}`} />
                        )}
                        {showError("email") && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <label className={s.label}>
                            Password <span className={s.required}>*</span>
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((prev) => ({ ...prev, password: "" }));
                            }}
                            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                            className={`${s.inputBase} ${showError("password") ? s.inputError : ""}`}
                        />
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowPassword(!showPassword)}
                            className={s.inputIconRight}
                        >
                            {showPassword ? <EyeSlashIcon className={s.icon.eye} /> : <EyeIcon className={s.icon.eye} />}
                        </button>
                        {showError("password") && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <button type="submit" className={s.buttonPrimary}>
                        Login
                    </button>
                </form>

                {/* Google Sign-in */}
                <div className={s.googleWrapper}>
                    <p className={s.googleText}>Or sign in with</p>
                    <div id="google-signin" className="flex justify-center" />
                </div>

                <p className={s.footer}>
                    Don&apos;t have an account?{" "}
                    <button className={s.link} onClick={() => navigate("/register")}>
                        Register
                    </button>
                </p>
            </div>
        </div>
    );
}
