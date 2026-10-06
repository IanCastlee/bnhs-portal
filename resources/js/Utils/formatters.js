/**
 * Format 12-digit DepEd Learner Reference Number (LRN).
 */
export function formatLRN(lrn) {
    if (!lrn) return "N/A";
    const cleaned = String(lrn).replace(/\D/g, "");
    if (cleaned.length === 12) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
    }
    return lrn;
}

/**
 * Format Grade remarks and return color classes.
 */
export function formatGradeRemarks(grade) {
    if (grade === null || grade === undefined || grade === "") {
        return { label: "PENDING", color: "text-slate-400 bg-slate-100 border-slate-200" };
    }
    const num = parseFloat(grade);
    if (num >= 75) {
        return { label: "PASSED", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    }
    return { label: "FAILED", color: "text-rose-700 bg-rose-50 border-rose-200" };
}

/**
 * Format byte size to readable string (e.g. 1.2 MB).
 */
export function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
