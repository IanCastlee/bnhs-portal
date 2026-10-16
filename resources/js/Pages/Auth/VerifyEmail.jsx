import React, { useState, useEffect, useRef } from "react";
import { useForm, Head, router, Link } from "@inertiajs/react";
import Button from "@/Components/Atoms/Button";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";
import AuthShowcasePanel from "@/Components/Organisms/Auth/AuthShowcasePanel";
import {
    ShieldCheck,
    Mail,
    ArrowRight,
    RefreshCw,
    LogOut,
    CheckCircle2,
    AlertCircle,
    KeyRound,
} from "lucide-react";

export default function VerifyEmail({
    email,
    maskedEmail,
    cooldownSeconds = 0,
    status = null,
}) {
    // 6-digit OTP state as array of 6 strings
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const [cooldown, setCooldown] = useState(cooldownSeconds);
    const [shake, setShake] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
    } = useForm({
        otp: "",
    });

    // Handle 60s countdown timer locally without full reloads
    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    // Keep data.otp synchronized with 6 individual boxes
    useEffect(() => {
        const fullOtp = otpDigits.join("");
        setData("otp", fullOtp);
        if (errors.otp && fullOtp.length > 0) {
            clearErrors("otp");
        }
    }, [otpDigits]);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleDigitChange = (index, value) => {
        // Accept only numeric characters
        const cleaned = value.replace(/\D/g, "");
        if (!cleaned && value !== "") return;

        const newDigits = [...otpDigits];

        if (cleaned.length > 1) {
            // If user typed/pasted multiple numbers into one field
            const chars = cleaned.slice(0, 6).split("");
            chars.forEach((char, i) => {
                if (index + i < 6) {
                    newDigits[index + i] = char;
                }
            });
            setOtpDigits(newDigits);
            const nextIdx = Math.min(index + chars.length, 5);
            inputRefs.current[nextIdx]?.focus();
            return;
        }

        newDigits[index] = cleaned;
        setOtpDigits(newDigits);

        // Auto-advance to next box
        if (cleaned && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otpDigits[index] && index > 0) {
                // If current box is empty, jump back to previous box and delete
                const newDigits = [...otpDigits];
                newDigits[index - 1] = "";
                setOtpDigits(newDigits);
                inputRefs.current[index - 1]?.focus();
            } else {
                const newDigits = [...otpDigits];
                newDigits[index] = "";
                setOtpDigits(newDigits);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pastedData) return;

        const newDigits = ["", "", "", "", "", ""];
        pastedData.split("").forEach((char, i) => {
            if (i < 6) newDigits[i] = char;
        });
        setOtpDigits(newDigits);

        const targetFocusIndex = Math.min(pastedData.length, 5);
        inputRefs.current[targetFocusIndex]?.focus();
    };

    const handleSubmitOtp = (e) => {
        e.preventDefault();
        const fullOtp = otpDigits.join("");

        if (fullOtp.length < 6) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        post("/verify-email/otp", {
            preserveScroll: true,
            onError: () => {
                setShake(true);
                setTimeout(() => setShake(false), 500);
            },
        });
    };

    const handleResend = () => {
        if (cooldown > 0) return;

        router.post("/verify-email/resend", {}, {
            preserveScroll: true,
            onSuccess: () => {
                setCooldown(60);
                setOtpDigits(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            },
        });
    };

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
            <Head title="Verify Email - Bulusan National High School" />
            <OfflineBanner />

            {/* Main Split Screen Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
                {/* 🌿 LEFT SIDE: Brand & Showcase */}
                <AuthShowcasePanel mode="login" />

                {/* 💻 RIGHT SIDE: Verification Interface */}
                <div className="lg:col-span-7 bg-slate-50 flex items-center justify-center p-4 sm:p-8 lg:p-12">
                    <div
                        className={`w-full max-w-lg transition-all duration-300 ${
                            shake ? "animate-shake" : ""
                        }`}
                    >
                        {/* Verification Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 relative">
                            {/* Card Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-50 mb-3">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Verify your email
                                </h2>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                    We sent a 6-digit security verification code to{" "}
                                    <span className="font-bold text-slate-800 underline decoration-emerald-500/50">
                                        {maskedEmail || email}
                                    </span>
                                </p>
                            </div>

                            {/* Resend Success Status Alert */}
                            {status && (
                                <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{status}</span>
                                </div>
                            )}

                            {/* Error Alert */}
                            {errors.otp && (
                                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Verification Error</p>
                                        <p className="text-[11px] mt-0.5">{errors.otp}</p>
                                    </div>
                                </div>
                            )}

                            {errors.resend && (
                                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{errors.resend}</span>
                                </div>
                            )}

                            {/* 6-Box OTP Form */}
                            <form onSubmit={handleSubmitOtp} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-center text-slate-700 mb-3 uppercase tracking-wider">
                                        Enter 6-Digit Code
                                    </label>

                                    {/* 6 OTP Input Boxes */}
                                    <div
                                        className="flex items-center justify-center gap-2 sm:gap-3"
                                        onPaste={handlePaste}
                                    >
                                        {otpDigits.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                ref={(el) => (inputRefs.current[idx] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={idx === 0 ? 6 : 1}
                                                value={digit}
                                                onChange={(e) => handleDigitChange(idx, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                                className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border transition-all duration-150 focus:outline-none focus:ring-3 bg-slate-50/60 ${
                                                    errors.otp
                                                        ? "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30"
                                                        : digit
                                                        ? "border-emerald-500 text-emerald-950 focus:border-emerald-600 focus:ring-emerald-500/20 bg-emerald-50/20"
                                                        : "border-slate-200 text-slate-900 focus:border-emerald-600 focus:ring-emerald-500/20 hover:border-slate-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-center text-slate-400 mt-2">
                                        Tip: You can paste all 6 digits directly into any box
                                    </p>
                                </div>

                                {/* Verify Button */}
                                <Button
                                    type="submit"
                                    variant="emerald"
                                    size="lg"
                                    loading={processing}
                                    disabled={processing || otpDigits.join("").length < 6}
                                    className="w-full py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-emerald-700/25 justify-center"
                                >
                                    <KeyRound className="w-4 h-4 mr-2" />
                                    <span>Verify &amp; Continue</span>
                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
                            </form>

                            {/* Resend and Actions Section */}
                            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
                                <div className="text-xs text-slate-600 text-center">
                                    Didn't receive the code?{" "}
                                    {cooldown > 0 ? (
                                        <span className="font-bold text-slate-400">
                                            Resend in {cooldown}s
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer inline-flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            <span>Resend Code</span>
                                        </button>
                                    )}
                                </div>

                                {/* Change Email / Log Out */}
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="text-xs text-slate-400 hover:text-rose-600 transition inline-flex items-center gap-1 font-medium cursor-pointer"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>Use another account / Log out</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-6 text-center text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} Bulusan National High School. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
