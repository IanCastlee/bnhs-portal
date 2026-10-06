import React from "react";
import { useForm, Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import FormField from "@/Components/Molecules/FormField";
import Badge from "@/Components/Atoms/Badge";
import { Lock, Mail, Sparkles, UserCheck } from "lucide-react";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post("/login");
    };

    // ⚡ 1-Click Quick Demo Login Switcher para sa Evaluation / Testing
    const setDemoCredentials = (email) => {
        setData({
            email: email,
            password: "password123",
            remember: true,
        });
    };

    return (
        <GuestLayout>
            <Head title="Login to Portal" />

            <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-slate-200/80">
                <div className="mb-6 pb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">
                        Sign In to Your Account
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Select a portal role or enter your credentials below
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <FormField
                        label="Email Address"
                        id="email"
                        type="email"
                        placeholder="you@bnhs.edu.ph"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        error={errors.email}
                        required
                    />

                    <FormField
                        label="Password"
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        error={errors.password}
                        required
                    />

                    <div className="flex items-center justify-between text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            Remember me
                        </label>
                        <a
                            href="#"
                            className="font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                            Forgot password?
                        </a>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        loading={processing}
                        className="w-full py-2.5 mt-2"
                    >
                        <Lock className="w-4 h-4 mr-1" />
                        Sign In to Portal
                    </Button>
                </form>

                {/* 🌟 1-Click Quick Demo Switcher */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Quick Demo Login (1-Click Fill):
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setDemoCredentials("admin@bnhs.edu.ph")
                            }
                            className="p-2 text-left rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 transition text-xs group cursor-pointer"
                        >
                            <span className="font-bold text-red-700 block group-hover:underline">
                                👑 Admin
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                                admin@bnhs.edu.ph
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setDemoCredentials("registrar@bnhs.edu.ph")
                            }
                            className="p-2 text-left rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition text-xs group cursor-pointer"
                        >
                            <span className="font-bold text-blue-700 block group-hover:underline">
                                📋 Registrar
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                                registrar@bnhs.edu.ph
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setDemoCredentials("teacher@bnhs.edu.ph")
                            }
                            className="p-2 text-left rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition text-xs group cursor-pointer"
                        >
                            <span className="font-bold text-emerald-700 block group-hover:underline">
                                👨‍🏫 Teacher
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                                teacher@bnhs.edu.ph
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setDemoCredentials("student@bnhs.edu.ph")
                            }
                            className="p-2 text-left rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition text-xs group cursor-pointer"
                        >
                            <span className="font-bold text-amber-700 block group-hover:underline">
                                🎓 Student
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                                student@bnhs.edu.ph
                            </span>
                        </button>
                    </div>
                </div>
            </Card>
        </GuestLayout>
    );
}
