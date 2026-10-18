import React, { useState } from "react";
import { Head, router, usePage, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import useSchoolSettings from "@/Hooks/useSchoolSettings";
import AdmissionBanner from "@/Components/Organisms/Student/Admission/AdmissionBanner";
import AdmissionStepper from "@/Components/Organisms/Student/Admission/AdmissionStepper";
import StepProfileLrn from "@/Components/Organisms/Student/Admission/StepProfileLrn";
import StepHouseholdInfo from "@/Components/Organisms/Student/Admission/StepHouseholdInfo";
import StepPhysicalRequirements from "@/Components/Organisms/Student/Admission/StepPhysicalRequirements";
import StepSectioningStatus from "@/Components/Organisms/Student/Admission/StepSectioningStatus";
import AdmissionPrintSlip from "@/Components/Organisms/Student/Admission/AdmissionPrintSlip";
import Card from "@/Components/Atoms/Common/Card";
import Badge from "@/Components/Atoms/Common/Badge";
import Button from "@/Components/Atoms/Common/Button";
import {
    Sparkles,
    GraduationCap,
    CheckCircle2,
    ArrowRight,
    Award,
    FileText,
    Calendar,
    Clock,
    Layers,
    Loader2,
} from "lucide-react";

export default function Admission({
    enrollment = null,
    previousEnrollment = null,
    promotedGradeLevel = null,
    isOldStudent = false,
    prefilledHousehold = {},
    activeSchoolYear = null,
    queuePosition = null,
}) {
    const { auth } = usePage().props;
    const school = useSchoolSettings();
    const user = auth?.user || enrollment?.student;

    const [isReEnrolling, setIsReEnrolling] = useState(false);

    const isPending = enrollment
        ? enrollment.status === "PENDING_REVIEW"
        : false;
    const isApproved = enrollment ? enrollment.status === "APPROVED" : false;
    const trackingNo = enrollment?.tracking_number || "BNHS-2027-Q0001";

    // 📋 Step Completion States (15 YOE Clean Architecture: Online Form + Onsite Hard Copy)
    const isStep1Complete = true; // Always verified upon registration
    const isStep2Complete = Boolean(
        (enrollment?.guardian_name || prefilledHousehold?.guardian_name) &&
        (enrollment?.address || prefilledHousehold?.address)
    );
    const isStep3Complete = isStep2Complete; // Unlocked once household form is saved
    const isStep4Complete = isApproved;

    // 🎯 Wizard Active Step State (1 to 4)
    const initialStep = !isStep2Complete ? 2 : isApproved ? 4 : 3;
    const [activeStep, setActiveStep] = useState(initialStep);

    // 📋 Step 2: Household Form State (Pre-filled from previous enrollment for Old Students)
    const [householdData, setHouseholdData] = useState({
        guardian_name: enrollment?.guardian_name || prefilledHousehold?.guardian_name || "",
        guardian_contact: enrollment?.guardian_contact || prefilledHousehold?.guardian_contact || "",
        address: enrollment?.address || prefilledHousehold?.address || "",
        previous_school: enrollment?.previous_school || prefilledHousehold?.previous_school || "",
        general_average: enrollment?.general_average || prefilledHousehold?.general_average || "",
        four_ps_number: enrollment?.four_ps_number || prefilledHousehold?.four_ps_number || "",
    });
    const [isSavingHousehold, setIsSavingHousehold] = useState(false);
    const [saveHouseholdSuccess, setSaveHouseholdSuccess] = useState(false);

    const handleSaveHousehold = (e, advanceToStep3 = false) => {
        if (e) e.preventDefault();
        setIsSavingHousehold(true);
        setSaveHouseholdSuccess(false);

        router.post("/student/admission/household", householdData, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsSavingHousehold(false);
                setSaveHouseholdSuccess(true);
                if (advanceToStep3) {
                    setActiveStep(3);
                }
                setTimeout(() => setSaveHouseholdSuccess(false), 3000);
            },
            onError: () => {
                setIsSavingHousehold(false);
            },
        });
    };

    const handleConfirmReEnroll = (e) => {
        e.preventDefault();
        setIsReEnrolling(true);

        router.post("/student/admission/re-enroll", {}, {
            preserveScroll: true,
            onFinish: () => setIsReEnrolling(false),
        });
    };

    // Calculate completion metrics
    let completedStepsCount = 0;
    if (isStep1Complete) completedStepsCount += 1;
    if (isStep2Complete) completedStepsCount += 1;
    if (isStep3Complete) completedStepsCount += 1;
    if (isStep4Complete) completedStepsCount += 1;

    const progressPercentage = Math.round((completedStepsCount / 4) * 100);

    const stepsMeta = [
        {
            id: 1,
            name: "Profile & LRN",
            shortName: "Profile",
            completed: isStep1Complete,
            statusLabel: "Verified",
        },
        {
            id: 2,
            name: "Household Info",
            shortName: "Household",
            completed: isStep2Complete,
            statusLabel: isStep2Complete ? "Completed" : "In Progress",
        },
        {
            id: 3,
            name: "Requirements Slip",
            shortName: "Hard Copy",
            completed: isStep3Complete,
            statusLabel: "Onsite Submission",
        },
        {
            id: 4,
            name: "Sectioning",
            shortName: "Sectioning",
            completed: isStep4Complete,
            statusLabel: isStep4Complete ? "Enrolled" : "In Queue",
        },
    ];

    return (
        <StudentLayout title="Online Admission & BEEF Hub">
            <Head title={`DepEd BEEF Admission - ${school.short_name}`} />

            {/* 🖥️ INTERACTIVE SCREEN UI (Hidden when printing) */}
            <div className="print:hidden space-y-4 sm:space-y-6 w-full pb-16">
                {/* 🌟 SCENARIO A: OLD STUDENT FAST-TRACK RE-ENROLLMENT CARD (When not yet enrolled in active S.Y.) */}
                {!enrollment && previousEnrollment ? (
                    <div className="animate-fadeIn">
                        {/* LAYER 1 (z-10): Welcome Banner */}
                        <div className="-mx-2.5 -mt-3.5 sm:mx-0 sm:mt-0 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] rounded-none sm:rounded-3xl p-5 pb-12 sm:p-8 text-white shadow-xl relative z-10 overflow-hidden">
                            {/* Half-Visible Blurred School Logo Watermark on Right Edge */}
                            {school.logo_url ? (
                                <img
                                    src={school.logo_url}
                                    alt=""
                                    aria-hidden="true"
                                    className="pointer-events-none select-none absolute -right-14 -bottom-6 w-52 h-52 object-contain opacity-25 blur-[2px] rotate-[-10deg] sm:w-64 sm:h-64 sm:-right-12 sm:-bottom-8 sm:opacity-15 sm:blur-[1px]"
                                />
                            ) : (
                                <GraduationCap
                                    aria-hidden="true"
                                    className="pointer-events-none select-none absolute -right-12 -bottom-6 w-48 h-48 text-emerald-300 opacity-15 blur-[2px] rotate-[-12deg]"
                                />
                            )}
                            <div className="relative z-10 space-y-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    DepEd SSU Early Re-Enrollment Portal
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black">
                                    Mabuhay muli, {user?.name}! 👋
                                </h2>
                                <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                    Binubuksan na ng {school.short_name} ang opisyal na Re-Enrollment para sa bagong <strong>School Year {activeSchoolYear?.name || "2027-2028"}</strong>.
                                </p>
                            </div>
                        </div>

                        {/* LAYER 2 (z-20): Overlapping Content Sheet */}
                        <div className="relative z-20 -mt-6 sm:mt-6 -mx-2.5 sm:mx-0 px-3.5 pt-5 sm:p-0 rounded-t-3xl sm:rounded-none bg-[#f4f7fa] sm:bg-transparent shadow-[0_-6px_20px_rgba(0,0,0,0.08)] sm:shadow-none">
                        <Card className="rounded-3xl border border-emerald-200/90 p-6 sm:p-8 bg-emerald-50/50 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-200/70">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded">
                                            Academic Standing Status
                                        </span>
                                        <h3 className="text-lg font-black text-slate-900 mt-0.5">
                                            Promoted to {promotedGradeLevel?.name || "Grade 8"}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Completed {previousEnrollment.grade_level?.name || "Grade 7"} in S.Y. {previousEnrollment.academic_year?.name || "2026-2027"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-2xs self-start sm:self-auto">
                                    <Award className="w-5 h-5 text-emerald-600" />
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Previous GWA</span>
                                        <span className="font-mono font-black text-slate-900 text-sm">{previousEnrollment.general_average || "88.75"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                                <div className="p-4 rounded-2xl bg-white border border-emerald-200/70 shadow-2xs space-y-1">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">DepEd LRN</span>
                                    <p className="font-mono font-bold text-slate-900 text-sm">{user?.lrn || "109283746501"}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-white border border-emerald-200/70 shadow-2xs space-y-1">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Target School Year</span>
                                    <p className="font-bold text-emerald-800 text-sm">S.Y. {activeSchoolYear?.name || "2027-2028"}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-white border border-emerald-200/70 shadow-2xs space-y-1">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Document Records</span>
                                    <p className="font-bold text-emerald-700 text-xs flex items-center gap-1.5 pt-0.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Complete on File</span>
                                    </p>
                                </div>
                            </div>

                            {/* Action Form */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                                    Dahil ikaw ay continuing student ng {school.short_name}, hindi mo na kailangang mag-upload muli ng PSA at Form 137. I-click lamang ang button sa kanan upang kumpirmahin ang iyong pagpasok sa <strong>{promotedGradeLevel?.name || "Grade 8"}</strong>.
                                </p>

                                <Button
                                    type="button"
                                    variant="emerald"
                                    size="lg"
                                    loading={isReEnrolling}
                                    disabled={isReEnrolling}
                                    onClick={handleConfirmReEnroll}
                                    className="w-full sm:w-auto font-black shadow-md justify-center px-6 py-3.5 text-sm"
                                >
                                    {isReEnrolling ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            <span>Submitting Re-Enrollment...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirm Re-Enrollment for {promotedGradeLevel?.name || "Grade 8"}</span>
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                        </div>
                    </div>
                ) : (
                    /* 🌟 SCENARIO B: STANDARD 4-STEP ADMISSION WIZARD (New / In-Progress Applications) */
                    <div className="sm:space-y-6">
                        <AdmissionBanner
                            enrollment={enrollment}
                            queuePosition={queuePosition}
                            trackingNo={trackingNo}
                            isPending={isPending}
                            isApproved={isApproved}
                            onPrint={() => window.print()}
                        />

                        {/* 📱 LAYER 2 (z-20): Overlapping Rounded Content Sheet on Mobile */}
                        <div className="relative z-20 -mt-6 sm:mt-0 -mx-2.5 sm:mx-0 px-3.5 pt-5 pb-2 sm:p-0 bg-[#f4f7fa] sm:bg-transparent rounded-t-3xl sm:rounded-none shadow-[0_-6px_20px_rgba(0,0,0,0.08)] sm:shadow-none space-y-4 sm:space-y-6">
                            <AdmissionStepper
                                stepsMeta={stepsMeta}
                                activeStep={activeStep}
                                setActiveStep={setActiveStep}
                                progressPercentage={progressPercentage}
                                completedStepsCount={completedStepsCount}
                            />

                            {activeStep === 1 && (
                                <StepProfileLrn
                                    user={user}
                                    enrollment={enrollment}
                                    onNext={() => setActiveStep(2)}
                                />
                            )}

                            {activeStep === 2 && (
                                <StepHouseholdInfo
                                    householdData={householdData}
                                    setHouseholdData={setHouseholdData}
                                    isSavingHousehold={isSavingHousehold}
                                    saveHouseholdSuccess={saveHouseholdSuccess}
                                    isStep2Complete={isStep2Complete}
                                    isOldStudent={isOldStudent}
                                    isApproved={isApproved}
                                    onSubmit={(e) => {
                                        if (isApproved) {
                                            setActiveStep(3);
                                        } else {
                                            handleSaveHousehold(e, true);
                                        }
                                    }}
                                    onBack={() => setActiveStep(1)}
                                />
                            )}

                            {activeStep === 3 && (
                                <StepPhysicalRequirements
                                    enrollment={enrollment}
                                    trackingNo={trackingNo}
                                    queuePosition={queuePosition}
                                    isApproved={isApproved}
                                    onPrintSlip={() => window.print()}
                                    onBack={() => setActiveStep(2)}
                                    onNext={() => setActiveStep(4)}
                                />
                            )}

                            {activeStep === 4 && (
                                <StepSectioningStatus
                                    isApproved={isApproved}
                                    queuePosition={queuePosition}
                                    trackingNo={trackingNo}
                                    enrollment={enrollment}
                                    onBack={() => setActiveStep(3)}
                                    onGoToHousehold={() => setActiveStep(2)}
                                    onPrint={() => window.print()}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 🖨️ OFFICIAL PRINTABLE DEPED BEEF ENROLLMENT SLIP */}
            {enrollment && (
                <AdmissionPrintSlip
                    user={user}
                    enrollment={enrollment}
                    trackingNo={trackingNo}
                    queuePosition={queuePosition}
                    isApproved={isApproved}
                />
            )}
        </StudentLayout>
    );
}
