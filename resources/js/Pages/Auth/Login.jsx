import React, { useState, useEffect } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { useSchoolSettings } from "@/Hooks/useSchoolSettings";
import Button from "@/Components/Atoms/Button";
import Input from "@/Components/Atoms/Input";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";
import AuthShowcasePanel from "@/Components/Organisms/Auth/AuthShowcasePanel";
import { Lock, Mail, CheckCircle2, XCircle, AlertCircle, School, ShieldCheck } from "lucide-react";
import { validateEmail, validatePassword } from "@/Utils/authValidation";

export default function Login() {
    const school = useSchoolSettings();
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
            <Head title={`Sign In - ${school.school_name}`} />
            <OfflineBanner />

            {/* Split Screen Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
                {/*  LEFT SIDE: Brand & Portal Showcase (Desktop) */}
                <AuthShowcasePanel mode="login" />

                {/* 💻 RIGHT SIDE: Login Form Panel */}
                <div className="lg:col-span-7 bg-slate-50 flex flex-col lg:items-center lg:justify-center p-0 sm:p-10 lg:p-12 min-h-screen">
                    {/* 📱 MOBILE GREEN HERO BANNER WITH HALF-VISIBLE BLURRED WATERMARK LOGO */}
                    <div className="lg:hidden relative overflow-hidden bg-gradient-to-br from-[#042219] via-[#0b4635] to-[#062d21] text-white px-5 pt-8 pb-14 shadow-lg">
                        {/* Ambient Glow */}
                        <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/15 blur-2xl" />

                        {/* Half-Visible Blurred Watermark Logo on Right Edge */}
                        {school.logo_url ? (
                            <img
                                src={school.logo_url}
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none select-none absolute -right-16 -bottom-10 w-52 h-52 object-contain opacity-20 blur-[2px]"
                            />
                        ) : (
                            <School
                                aria-hidden="true"
                                className="pointer-events-none select-none absolute -right-14 -bottom-10 w-48 h-48 text-emerald-300 opacity-15 blur-[2px]"
                            />
                        )}

                        {/* Foreground Mobile Branding */}
                        <div className="relative z-10 flex items-center gap-3.5">
                            {school.logo_url ? (
                                <img
                                    src={school.logo_url}
                                    alt={school.short_name}
                                    className="w-12 h-12 object-contain shrink-0 drop-shadow-md"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 border border-emerald-300/30 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                                    {school.initial}
                                </div>
                            )}
                            <div className="min-w-0 pr-8">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-300/25 text-emerald-200 text-[10px] font-semibold mb-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-300 shrink-0" />
                                    <span>Official Academic Portal</span>
                                </div>
                                <h1 className="text-sm font-black tracking-tight text-white uppercase leading-snug">
                                    {school.school_name}
                                </h1>
                                <p className="text-[11px] font-medium text-emerald-200/85 truncate mt-0.5">
                                    {school.tagline}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`w-full max-w-lg mx-auto flex-1 lg:flex-initial flex flex-col justify-between lg:justify-center px-4 sm:px-0 -mt-6 sm:mt-0 relative z-20 transition-all duration-300 ${
                            shake ? "animate-shake" : ""
                        }`}
                    >
                        {/* Login Card */}
                        <div className="bg-white rounded-3xl px-5 py-6 sm:p-8 shadow-xl shadow-slate-900/5 lg:shadow-slate-200/60 border border-slate-200/80">
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

                                <div className="pt-4 mt-2 border-t border-slate-100 text-center">
                                    <p className="text-xs text-slate-500">
                                        New student or transferee?{" "}
                                        <Link
                                            href="/register"
                                            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline underline-offset-4 transition-colors ml-1"
                                        >
                                            Apply / Register
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-center text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} {school.school_name}. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
