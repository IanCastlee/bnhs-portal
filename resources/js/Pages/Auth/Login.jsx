import React, { useState, useEffect } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import Button from "@/Components/Atoms/Button";
import Input from "@/Components/Atoms/Input";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";
import AuthShowcasePanel from "@/Components/Organisms/Auth/AuthShowcasePanel";
import { Lock, Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { validateEmail, validatePassword } from "@/Utils/authValidation";

export default function Login() {
    const [touched, setTouched] = useState({});
    const [clientErrors, setClientErrors] = useState({});
    const [shake, setShake] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors: serverErrors,
        clearErrors,
    } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    // Real-time client-side validation
    useEffect(() => {
        const errors = {};
        if (touched.email) {
            const err = validateEmail(data.email);
            if (err) errors.email = err;
        }
        if (touched.password) {
            const err = validatePassword(data.password, false);
            if (err) errors.password = err;
        }
        setClientErrors(errors);
    }, [data.email, data.password, touched]);

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleChange = (field, value) => {
        setData(field, value);
        if (serverErrors[field]) {
            clearErrors(field);
        }
    };

    const validateAll = () => {
        const errors = {};
        const allTouched = { email: true, password: true };

        const emailErr = validateEmail(data.email);
        if (emailErr) errors.email = emailErr;

        const passErr = validatePassword(data.password, false);
        if (passErr) errors.password = passErr;

        setTouched(allTouched);
        setClientErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 🛡️ Client-side validation guard
        if (!validateAll()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        post("/login", {
            onError: () => {
                setShake(true);
                setTimeout(() => setShake(false), 500);
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
            <Head title="Sign In - Bulusan National High School" />
            <OfflineBanner />

            {/* Split Screen Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
                {/*  LEFT SIDE: Brand & Portal Showcase */}
                <AuthShowcasePanel mode="login" />

                {/* 💻 RIGHT SIDE: Login Form Panel */}
                <div className="lg:col-span-7 bg-slate-50 flex items-center justify-center p-6 sm:p-10 lg:p-12">
                    <div
                        className={`w-full max-w-lg transition-all duration-300 ${
                            shake ? "animate-shake" : ""
                        }`}
                    >
                        {/* Login Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80">
                            {/* Title */}
                            <div className="mb-6 pb-4 border-b border-slate-100">
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    Account Authentication
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Enter your registered credentials to access
                                    your portal
                                </p>
                            </div>

                            {/* ⏳ Session Expired Alert Notice */}
                            {typeof window !== "undefined" &&
                                new URLSearchParams(window.location.search).get(
                                    "expired",
                                ) === "1" && (
                                    <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 animate-in fade-in duration-200">
                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-amber-950">
                                                Nawalang-bisa ang Iyong Session
                                                (Session Expired)
                                            </p>
                                            <p className="text-[11px] mt-0.5 text-amber-800 leading-relaxed">
                                                Dahil sa matagal na kawalan ng
                                                aktibidad, kusang nag-expire ang
                                                iyong login session para sa
                                                seguridad. Paki-log in muli.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* Server Global Error */}
                            {(serverErrors.email || serverErrors.password) && (
                                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700 animate-in fade-in duration-200">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">
                                            Authentication Notice
                                        </p>
                                        <p className="text-[11px] mt-0.5">
                                            {serverErrors.email ||
                                                serverErrors.password}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                                noValidate
                            >
                                {/* Email Field */}
                                <Input
                                    id="email"
                                    type="email"
                                    label="Email Address"
                                    required
                                    icon={Mail}
                                    placeholder="you@bnhs.edu.ph"
                                    value={data.email}
                                    onChange={(e) =>
                                        handleChange("email", e.target.value)
                                    }
                                    onBlur={() => handleBlur("email")}
                                    error={Boolean(
                                        (touched.email && clientErrors.email) ||
                                        serverErrors.email,
                                    )}
                                    // errorMessage={
                                    //     (touched.email && clientErrors.email) ||
                                    //     serverErrors.email
                                    // }
                                    // rightElement={
                                    //     (touched.email && clientErrors.email) ||
                                    //     serverErrors.email ? (
                                    //         <XCircle className="w-4 h-4 text-rose-500" />
                                    //     ) : touched.email &&
                                    //       !clientErrors.email &&
                                    //       data.email.trim().length > 0 ? (
                                    //         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    //     ) : null
                                    // }
                                />
                                {/* Password Field */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label
                                            htmlFor="password"
                                            className="block text-xs font-bold text-slate-700"
                                        >
                                            Password{" "}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        icon={Lock}
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) =>
                                            handleChange(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                        onBlur={() => handleBlur("password")}
                                        error={Boolean(
                                            (touched.password &&
                                                clientErrors.password) ||
                                            serverErrors.password,
                                        )}
                                        errorMessage={
                                            (touched.password &&
                                                clientErrors.password) ||
                                            serverErrors.password
                                        }
                                    />
                                </div>
                                {/* Remember me */}
                                <div className="flex items-center justify-between text-xs pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    "remember",
                                                    e.target.checked,
                                                )
                                            }
                                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="font-medium">
                                            Remember my login session
                                        </span>
                                    </label>
                                </div>
                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    variant="emerald"
                                    size="lg"
                                    loading={processing}
                                    disabled={processing}
                                    className="w-full py-3.5 mt-2 rounded-2xl font-extrabold text-sm shadow-lg shadow-emerald-700/25 justify-center"
                                >
                                    <span>Sign In</span>
                                </Button>

                                <div className="flex flex-col justify-center items-center">
                                    <span className="text-slate-600 font-normal  text-sm">
                                        New student or transferee?
                                    </span>
                                    <Link
                                        href="/register"
                                        className="flex-1  py-2.5 px-4 rounded-xl text-xs font-bold text-blue-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>Apply / Register</span>
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-center text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} Bulusan National
                            High School. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
