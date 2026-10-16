import React from "react";
import { Clock, Check } from "lucide-react";

export default function AdmissionStepper({
    stepsMeta,
    activeStep,
    setActiveStep,
    progressPercentage,
    completedStepsCount,
}) {
    const isStepAccessible = (targetStep) => {
        if (targetStep <= 2) return true;
        if (targetStep === 3) return Boolean(stepsMeta[1]?.completed);
        if (targetStep === 4) return Boolean(stepsMeta[2]?.completed); // Must have 4/4 docs completed
        return true;
    };

    const handleStepClick = (targetStep) => {
        if (!isStepAccessible(targetStep)) return;
        setActiveStep(targetStep);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            {/* Header: Title & Completion % Badge */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                        Admission Progress Stepper
                    </h3>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                    {progressPercentage}% Completed ({completedStepsCount}/4)
                </span>
            </div>

            {/* 🖥️ DESKTOP HORIZONTAL STEPPER (md and up) */}
            <div className="hidden md:flex items-center justify-between w-full px-6 py-2">
                {stepsMeta.map((s, idx) => {
                    const isActive = activeStep === s.id;
                    const isDone = s.completed;
                    const isAccessible = isStepAccessible(s.id);

                    return (
                        <React.Fragment key={s.id}>
                            <button
                                type="button"
                                onClick={() => handleStepClick(s.id)}
                                disabled={!isAccessible}
                                className={`flex flex-col items-center group focus:outline-hidden relative z-10 shrink-0 ${
                                    isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                                }`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shadow-xs transition-all duration-200 ring-4 ${
                                        isDone
                                            ? "bg-emerald-600 text-white ring-emerald-50 group-hover:bg-emerald-700"
                                            : isActive
                                              ? "bg-amber-500 text-white ring-amber-100 scale-110 shadow-md"
                                              : "bg-slate-200 text-slate-600 ring-slate-50 group-hover:bg-slate-300"
                                    }`}
                                >
                                    {isDone ? (
                                        <Check className="w-4 h-4 stroke-[3]" />
                                    ) : (
                                        s.id
                                    )}
                                </div>

                                <div className="text-center mt-2 max-w-[130px]">
                                    <p
                                        className={`text-xs font-bold transition-colors truncate ${
                                            isActive
                                                ? "text-slate-950 font-black"
                                                : isDone
                                                  ? "text-emerald-800"
                                                  : "text-slate-500"
                                        }`}
                                    >
                                        {s.id}. {s.name}
                                    </p>
                                    <p
                                        className={`text-[10px] font-semibold ${
                                            isDone
                                                ? "text-emerald-600 font-bold"
                                                : isActive
                                                  ? "text-amber-600 font-bold"
                                                  : "text-slate-400"
                                        }`}
                                    >
                                        {s.statusLabel}
                                    </p>
                                </div>
                            </button>

                            {/* Horizontal Line between nodes */}
                            {idx < stepsMeta.length - 1 && (
                                <div className="flex-1 h-0.5 mx-3 bg-slate-200 mb-6 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${
                                            activeStep > s.id ||
                                            (isDone && s.id < activeStep)
                                                ? "bg-emerald-600 w-full"
                                                : "w-0"
                                        }`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* 📱 MOBILE VERTICAL STEPPER (Centered Line & Compact Bullet Circles) */}
            <div className="md:hidden flex flex-col space-y-0 px-2 py-1">
                {stepsMeta.map((s, idx) => {
                    const isActive = activeStep === s.id;
                    const isDone = s.completed;
                    const isAccessible = isStepAccessible(s.id);
                    const isLast = idx === stepsMeta.length - 1;

                    return (
                        <div key={s.id} className="flex items-start">
                            {/* Left Column: 100% Centered Circle + Vertical Line */}
                            <div className="flex flex-col items-center shrink-0 w-6">
                                <button
                                    type="button"
                                    onClick={() => handleStepClick(s.id)}
                                    disabled={!isAccessible}
                                    className={`w-5.5 h-5.5 rounded-full font-black text-[10px] flex items-center justify-center transition-all duration-200 shadow-2xs ${
                                        isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                    } ${
                                        isDone
                                            ? "bg-emerald-600 text-white ring-2 ring-emerald-100"
                                            : isActive
                                              ? "bg-amber-500 text-white ring-2 ring-amber-300 scale-110 shadow-xs"
                                              : "bg-slate-200 text-slate-600"
                                    }`}
                                >
                                    {isDone ? (
                                        <Check className="w-3 h-3 stroke-[3]" />
                                    ) : (
                                        s.id
                                    )}
                                </button>

                                {/* Vertical connecting line below circle */}
                                {!isLast && (
                                    <div className="w-0.5 h-6 my-1 rounded-full bg-slate-200 overflow-hidden">
                                        <div
                                            className={`w-full h-full transition-all duration-500 ${
                                                activeStep > s.id ||
                                                (isDone && s.id < activeStep)
                                                    ? "bg-emerald-600"
                                                    : "bg-slate-200"
                                            }`}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Step Label & Status Pill */}
                            <button
                                type="button"
                                onClick={() => handleStepClick(s.id)}
                                disabled={!isAccessible}
                                className={`flex-1 flex items-center justify-between pl-3 pb-2 text-left group focus:outline-hidden ${
                                    isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                                }`}
                            >
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`text-xs leading-snug ${
                                            isActive
                                                ? "font-black text-slate-950"
                                                : isDone
                                                  ? "font-bold text-slate-800"
                                                  : "font-medium text-slate-500"
                                        }`}
                                    >
                                        {s.id}. {s.name}
                                    </p>
                                    <p
                                        className={`text-[10px] ${
                                            isActive
                                                ? "text-amber-600 font-bold"
                                                : isDone
                                                  ? "text-emerald-600 font-semibold"
                                                  : "text-slate-400"
                                        }`}
                                    >
                                        {s.statusLabel}
                                    </p>
                                </div>

                                <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                                        isDone
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : isActive
                                              ? "bg-amber-50 text-amber-800 border border-amber-300 font-black"
                                              : "bg-slate-100 text-slate-400"
                                    }`}
                                >
                                    {isDone
                                        ? "Done ✓"
                                        : isActive
                                          ? "Current"
                                          : "Pending"}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
