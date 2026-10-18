import React, { useState, useEffect } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import Button from "@/Components/Atoms/Button";
import Input from "@/Components/Atoms/Input";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";
import AuthShowcasePanel from "@/Components/Organisms/Auth/AuthShowcasePanel";
import PasswordStrengthMeter from "@/Components/Organisms/Auth/PasswordStrengthMeter";
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    AlertCircle,
    KeyRound,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";
import {
    validatePassword,
    validateConfirmPassword,
    evaluatePasswordStrength,
} from "@/Utils/authValidation";

export default function ResetPassword({ token, email }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        token: token || "",
        email: email || "",
        password: "",
        password_confirmation: "",
    });

    const passwordStrength = evaluatePasswordStrength(data.password || "");

    useEffect(() => {
        const errors = {};
        if (touched.password) {
            const err = validatePassword(data.password, true);
            if (err) errors.password = err;
        }
        if (touched.password_confirmation) {
            const err = validateConfirmPassword(
                data.password,
                data.password_confirmation,
            );
            if (err) errors.password_confirmation = err;
        }
        setClientErrors(errors);
    }, [data.password, data.password_confirmation, touched]);

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
        const passErr = validatePassword(data.password, true);
        if (passErr) errors.password = passErr;

        const confirmErr = validateConfirmPassword(
            data.password,
            data.password_confirmation,
        );
        if (confirmErr) errors.password_confirmation = confirmErr;

        setTouched({ password: true, password_confirmation: true });
        setClientErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateAll()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        post("/reset-password", {
            preserveScroll: true,
            onError: () => {
                setShake(true);
                setTimeout(() => setShake(false), 500);
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
            <Head title="Reset Password - Bulusan National High School" />
            <OfflineBanner />

            {/* Split Screen Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
                {/* 🌿 LEFT SIDE: Brand Showcase */}
                <AuthShowcasePanel mode="login" />

                {/* 💻 RIGHT SIDE: Reset Password Form */}
                <div className="lg:col-span-7 bg-slate-50 flex items-center justify-center p-6 sm:p-10 lg:p-12">
                    <div
                        className={`w-full max-w-lg transition-all duration-300 ${
                            shake ? "animate-shake" : ""
                        }`}
                    >
                        {/* Reset Password Card */}
                        <div className="bg-white lg:rounded-3xl px-2 py-6 sm:p-8 lg:shadow-xl lg:shadow-slate-200/60 lg:border lg:border-slate-200/80">
                            {" "}
                            <div className="mb-6 pb-4 border-b border-slate-100">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50 mb-3">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-extrabold text-slate-900">
                                    Create New Password
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Your new password must be at least 8
                                    characters and include uppercase, numbers,
                                    and symbols.
                                </p>
                            </div>
                            {/* Global Error Alert */}
                            {serverErrors &&
                                Object.keys(serverErrors).length > 0 && (
                                    <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700 animate-in fade-in duration-200">
                                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">
                                                Reset Error
                                            </p>
                                            <p className="text-[11px] mt-0.5">
                                                {serverErrors.email ||
                                                    serverErrors.password ||
                                                    "An error occurred during password reset."}
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
                                {/* Email (Read-only / Prefilled) */}
                                <Input
                                    id="email"
                                    type="email"
                                    label="Account Email Address"
                                    icon={Mail}
                                    value={data.email}
                                    readOnly
                                    disabled
                                />

                                {/* New Password Field */}
                                <div>
                                    <Input
                                        id="password"
                                        type="password"
                                        label="New Password"
                                        required
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
                                    {/* Password Strength Meter */}
                                    <div className="mt-2">
                                        <PasswordStrengthMeter
                                            strength={passwordStrength}
                                        />
                                    </div>
                                </div>

                                {/* Confirm New Password Field */}
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    label="Confirm New Password"
                                    required
                                    icon={Lock}
                                    placeholder="••••••••"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        handleChange(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() =>
                                        handleBlur("password_confirmation")
                                    }
                                    error={Boolean(
                                        (touched.password_confirmation &&
                                            clientErrors.password_confirmation) ||
                                        serverErrors.password_confirmation,
                                    )}
                                    errorMessage={
                                        (touched.password_confirmation &&
                                            clientErrors.password_confirmation) ||
                                        serverErrors.password_confirmation
                                    }
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
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    <span>Reset Password &amp; Sign In</span>
                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
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
