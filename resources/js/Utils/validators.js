/**
 * Form and input validation helpers.
 */

export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

export function isValidLRN(lrn) {
    const cleaned = String(lrn).replace(/\D/g, "");
    return cleaned.length === 12;
}

export function isValidImageFile(file, maxMB = 5) {
    if (!file) return { valid: false, error: "No file selected." };

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: "Only JPG, PNG, and WebP images are allowed." };
    }

    const maxBytes = maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return { valid: false, error: `Image size must be less than ${maxMB}MB.` };
    }

    return { valid: true, error: null };
}
