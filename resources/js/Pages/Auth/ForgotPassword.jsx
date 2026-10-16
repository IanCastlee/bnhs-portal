import React, { useState, useEffect } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import Button from "@/Components/Atoms/Button";
import Input from "@/Components/Atoms/Input";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";
import AuthShowcasePanel from "@/Components/Organisms/Auth/AuthShowcasePanel";
import {
    Mail,
    KeyRound,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Send,
    ShieldCheck,
} from "lucide-react";
import { validateEmail } from "@/Utils/authValidation";

export default function ForgotPassword({ status }) {
    const [touched, setTouched] = useState(false);
    const [clientError, setClientError] = useState("");
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
    });

    useEffect(() => {
        if (touched) {
            const err = validateEmail(data.email);
            setClientError(err || "");
        }
    }, [data.email, touched]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched(true);

        const emailErr = validateEmail(data.email);
        if (emailErr) {
            setClientError(emailErr);
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        post("/forgot-password", {
            preserveScroll: true,
            onError: () => {
                setShake(true);
                setTimeout(() => setShake(false), 500);
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
            <Head title="Forgot Password - Bulusan National High School" />
            <OfflineBanner />

            {/* Split Screen Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
                {/* 🌿 LEFT SIDE: Brand Showcase */}
                <AuthShowcasePanel mode="login" />

                {/* 💻 RIGHT SIDE: Forgot Password Form */}
                <div className="lg:col-span-7 bg-slate-50 flex items-center justify-center p-6 sm:p-10 lg:p-12">
                    <div
                        className={`w-full max-w-lg transition-all duration-300 ${
                            shake ? "animate-shake" : ""
                        }`}
                    >
                        {/* Forgot Password Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80">
                            <div className="mb-6 pb-4 border-b border-slate-100">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50 mb-3">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    Forgot Password?
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    No worries! Enter your registered account email and we'll dispatch a secure recovery link.
                                </p>
                            </div>

                            {/* Success Status Alert */}
                            {status && (
                                <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3 animate-in fade-in duration-200 shadow-xs">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-emerald-950">Recovery Request Sent</p>
                                        <p className="text-[11px] mt-0.5 leading-relaxed text-emerald-800">
                                            {status}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Server Error Alert */}
                            {serverErrors.email && (
                                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700 animate-in fade-in duration-200">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Request Notice</p>
                                        <p className="text-[11px] mt-0.5">{serverErrors.email}</p>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                <Input
                                    id="email"
                                    type="email"
                                    label="Account Email Address"
                                    required
                                    icon={Mail}
                                    placeholder="you@bnhs.edu.ph"
                                    value={data.email}
                                    onChange={(e) => {
                                        setData("email", e.target.value);
                                        if (serverErrors.email) clearErrors("email");
                                    }}
                                    onBlur={() => setTouched(true)}
                                    error={Boolean((touched && clientError) || serverErrors.email)}
                                    errorMessage={(touched && clientError) || serverErrors.email}
                                />

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    variant="emerald"
                                    size="lg"
                                    loading={processing}
                                    disabled={processing}
                                    className="w-full py-3.5 mt-2 rounded-2xl font-extrabold text-sm shadow-lg shadow-emerald-700/25 justify-center"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    <span>Send Recovery Link</span>
                                </Button>

                                {/* Back to Login Link */}
                                <div className="pt-3 text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        <span>Back to Sign In</span>
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-center text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} Bulusan National High School. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
