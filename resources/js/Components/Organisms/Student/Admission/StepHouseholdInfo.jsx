import React from "react";
import Button from "@/Components/Atoms/Common/Button";
import Input from "@/Components/Atoms/Common/Input";
import {
    Check,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    School,
    Info,
    Lock,
} from "lucide-react";

export default function StepHouseholdInfo({
    householdData,
    setHouseholdData,
    isSavingHousehold,
    saveHouseholdSuccess,
    isStep2Complete,
    isOldStudent = false,
    isApproved = false,
    onSubmit,
    onBack,
}) {
    return (
        <div className="bg-white rounded-2xl border-2 border-emerald-300/80 p-5 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
            {/* Step Header */}
            <div className="pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <span
                        className={`w-8 h-8 rounded-xl text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            isStep2Complete ? "bg-emerald-600" : "bg-amber-500"
                        }`}
                    >
                        {isStep2Complete ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                            "2"
                        )}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                                Step 2: Household &amp; Guardian Information
                            </h3>
                            {isStep2Complete && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {isApproved
                                        ? "Verified & Locked ✓"
                                        : "Saved ✓"}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            DepEd Basic Education Enrollment Form (Annex A)
                            Requirements
                        </p>
                    </div>
                </div>
            </div>

            {/* 🔒 Approved / Record Locked Notice */}
            {isApproved ? (
                <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold text-slate-900">
                            Opisyal nang Naka-enroll (Record Locked):
                        </span>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            Naka-lock na ang iyong impormasyon para sa
                            kasalukuyang School Year dahil opisyal nang
                            na-verify at na-approve ng Registrar. Para sa
                            anumang opisyal na pagbabago, mangyaring
                            makipag-ugnayan sa Registrar's Office.
                        </p>
                    </div>
                </div>
            ) : isOldStudent ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">
                            Continuing Bulusan NHS Student:
                        </span>
                        <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                            Awtomatikong naka-prefill ang iyong impormasyon at
                            verified GWA mula sa iyong nakaraang record. I-edit
                            lamang ang contact o address kung may nagbago.
                        </p>
                    </div>
                </div>
            ) : null}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            * Parent / Legal Guardian Full Name
                        </label>
                        <Input
                            value={householdData.guardian_name}
                            disabled={isApproved}
                            readOnly={isApproved}
                            onChange={(e) =>
                                setHouseholdData({
                                    ...householdData,
                                    guardian_name: e.target.value,
                                })
                            }
                            placeholder="Hal. Elena Hilda Co"
                            required
                            className={`h-11 text-sm  font-medium ${isApproved ? "bg-slate-100 text-slate-700 cursor-not-allowed" : ""}`}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            * Guardian Mobile / Emergency Contact Number
                        </label>
                        <Input
                            value={householdData.guardian_contact}
                            disabled={isApproved}
                            readOnly={isApproved}
                            onChange={(e) =>
                                setHouseholdData({
                                    ...householdData,
                                    guardian_contact: e.target.value,
                                })
                            }
                            placeholder="Hal. 0918-765-4321"
                            required
                            className={`h-11 text-sm  font-mono font-medium ${isApproved ? "bg-slate-100 text-slate-700 cursor-not-allowed" : ""}`}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        * Complete Permanent Home Address
                    </label>
                    <textarea
                        value={householdData.address}
                        disabled={isApproved}
                        readOnly={isApproved}
                        onChange={(e) =>
                            setHouseholdData({
                                ...householdData,
                                address: e.target.value,
                            })
                        }
                        placeholder="House No., Street/Purok, Barangay, Bayan, Lalawigan"
                        required
                        rows={2}
                        className={`w-full rounded-xl border border-slate-300 p-3 text-sm  font-medium ${
                            isApproved
                                ? "bg-slate-100 text-slate-700 cursor-not-allowed border-slate-200"
                                : "focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        }`}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>Previous School</span>
                            {(isOldStudent || isApproved) && (
                                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Locked
                                </span>
                            )}
                        </label>
                        <Input
                            value={householdData.previous_school}
                            readOnly={isOldStudent || isApproved}
                            disabled={isOldStudent || isApproved}
                            onChange={(e) =>
                                setHouseholdData({
                                    ...householdData,
                                    previous_school: e.target.value,
                                })
                            }
                            placeholder="Bulusan National High School"
                            className={`h-11 text-sm font-medium ${
                                isOldStudent || isApproved
                                    ? "bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed"
                                    : ""
                            }`}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>Last General Average (GWA)</span>
                            {(isOldStudent || isApproved) && (
                                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />{" "}
                                    DepEd Verified
                                </span>
                            )}
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={householdData.general_average}
                            readOnly={isOldStudent || isApproved}
                            disabled={isOldStudent || isApproved}
                            onChange={(e) =>
                                setHouseholdData({
                                    ...householdData,
                                    general_average: e.target.value,
                                })
                            }
                            placeholder="88.75"
                            className={`h-11 text-sm font-mono font-black ${
                                isOldStudent || isApproved
                                    ? "bg-emerald-50 text-emerald-950 border-emerald-200 cursor-not-allowed"
                                    : ""
                            }`}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            4Ps Household ID (Optional)
                        </label>
                        <Input
                            value={householdData.four_ps_number}
                            disabled={isApproved}
                            readOnly={isApproved}
                            onChange={(e) =>
                                setHouseholdData({
                                    ...householdData,
                                    four_ps_number: e.target.value,
                                })
                            }
                            placeholder="056201001-1234567"
                            className={`h-11 text-sm font-mono ${isApproved ? "bg-slate-100 text-slate-700 cursor-not-allowed" : ""}`}
                        />
                    </div>
                </div>

                {/* Action Buttons: Responsive Back + Save & Next using reusable Button */}
                <div className="flex items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={onBack}
                        className="w-auto shrink-0 px-5 py-3.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Button>

                    <div className="flex flex-1 items-center gap-2">
                        {saveHouseholdSuccess && (
                            <span className="text-xs font-bold text-emerald-700 hidden sm:inline-flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                            </span>
                        )}

                        <Button
                            type="submit"
                            variant="emerald"
                            size="md"
                            loading={isSavingHousehold}
                            disabled={isSavingHousehold}
                            className="flex-1 w-full py-3.5"
                        >
                            <span>
                                {isApproved ? "Next: Documents" : "Save & Next"}
                            </span>
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
