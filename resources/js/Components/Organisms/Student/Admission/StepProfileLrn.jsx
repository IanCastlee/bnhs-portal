import React from "react";
import Button from "@/Components/Atoms/Button";
import { Check, CheckCircle2, ArrowRight } from "lucide-react";

export default function StepProfileLrn({ user, enrollment, onNext }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
            {/* Step Header */}
            <div className="pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                                Step 1: Learner Profile &amp; LRN
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verified ✓
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Personal information verified from registration
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        Full Learner Name
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                        {user?.name}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        DepEd 12-Digit LRN
                    </span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                        {user?.lrn ||
                            "Pending LIS Assignment (Optional for New)"}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        Applying Level & Track
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                        {enrollment?.grade_level?.name ||
                            enrollment?.gradeLevel?.name ||
                            "Grade 7"}{" "}
                        • {enrollment?.student_type || "NEW"}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        Registered Email & Mobile
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">
                        {user?.email}{" "}
                        {user?.phone_number ? `• ${user?.phone_number}` : ""}
                    </span>
                </div>
            </div>

            {/* Navigation: Reusable Button to Step 2 */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <Button
                    type="button"
                    variant="emerald"
                    size="md"
                    onClick={onNext}
                    className="w-full py-3.5 sm:w-auto"
                >
                    <span>Next: Household Info</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
            </div>
        </div>
    );
}
