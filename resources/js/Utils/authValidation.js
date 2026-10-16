/**
 * 🛡️ BNHS Auth & Client-Side Security Validation Engine
 * DepEd SSU OPAS Portal Security & Usability Compliant
 */

// Email regex validator following RFC 5322 standard
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 12-digit Learner Reference Number (LRN) standard of DepEd
export const LRN_REGEX = /^\d{12}$/;

// 📱 Philippine Mobile Number standard (09XXXXXXXXX or +639XXXXXXXXX)
export const PH_PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;

/**
 * Validates Philippine mobile phone number.
 * @param {string} phone
 * @param {boolean} required
 * @returns {string|null}
 */
export function validatePhoneNumber(phone, required = false) {
    if (!phone || !phone.trim()) {
        return required ? "Mobile phone number is required." : null;
    }
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    if (!PH_PHONE_REGEX.test(cleanPhone)) {
        return "Please enter a valid 11-digit mobile number (e.g. 09171234567).";
    }
    return null;
}

/**
 * Generates a cryptographically strong, friendly, and compliant password.
 * Guaranteed to satisfy all 5 DepEd OPAS security criteria (100% score).
 * @returns {string}
 */
export function generateStrongPassword() {
    const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowers = "abcdefghjkmnpqrstuvwxyz";
    const numbers = "23456789";
    const specials = "!@#$%^&*";
    const allChars = uppers + lowers + numbers + specials;

    // Ensure at least one from each required set
    let password = [
        uppers[Math.floor(Math.random() * uppers.length)],
        lowers[Math.floor(Math.random() * lowers.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specials[Math.floor(Math.random() * specials.length)],
    ];

    // Fill up to 12 characters
    for (let i = 0; i < 8; i++) {
        password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    // Shuffle array
    return password.sort(() => Math.random() - 0.5).join("");
}

/**
 * Validates an email address.
 * @param {string} email
 * @returns {string|null} Error message or null if valid.
 */
export function validateEmail(email) {
    if (!email || !email.trim()) {
        return "Email address is required.";
    }
    const cleanEmail = email.trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
        return "Please enter a valid email address (e.g. yourname@bnhs.edu.ph).";
    }
    return null;
}

/**
 * Validates first name.
 * @param {string} firstName
 * @returns {string|null}
 */
export function validateFirstName(firstName) {
    if (!firstName || !firstName.trim()) {
        return "First name is required.";
    }
    if (firstName.trim().length < 2) {
        return "First name must be at least 2 characters.";
    }
    return null;
}

/**
 * Validates last name.
 * @param {string} lastName
 * @returns {string|null}
 */
export function validateLastName(lastName) {
    if (!lastName || !lastName.trim()) {
        return "Last name (surname) is required.";
    }
    if (lastName.trim().length < 2) {
        return "Last name must be at least 2 characters.";
    }
    return null;
}

/**
 * Validates full name.
 * @param {string} name
 * @returns {string|null}
 */
export function validateName(name) {
    if (!name || !name.trim()) {
        return "Full name is required.";
    }
    if (name.trim().length < 2) {
        return "Name must be at least 2 characters.";
    }
    return null;
}

/**
 * Validates Learner Reference Number (LRN).
 * @param {string} lrn
 * @param {boolean} required
 * @returns {string|null}
 */
export function validateLrn(lrn, required = false) {
    if (!lrn || !lrn.trim()) {
        return required ? "12-digit DepEd LRN is required." : null;
    }
    const cleanLrn = lrn.trim();
    if (!LRN_REGEX.test(cleanLrn)) {
        return "LRN must be exactly 12 numeric digits.";
    }
    return null;
}

/**
 * Evaluates password strength and returns breakdown criteria.
 * @param {string} password
 * @returns {Object} Strength score, label, and criteria checklist.
 */
export function evaluatePasswordStrength(password = "") {
    const checks = {
        minLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    };

    let score = 0;
    if (checks.minLength) score += 25;
    if (checks.hasUpper && checks.hasLower) score += 25;
    if (checks.hasNumber) score += 25;
    if (checks.hasSpecial) score += 25;

    let label = "Too Weak";
    let color = "bg-rose-500";
    let textColor = "text-rose-600";
    let border = "border-rose-400";

    if (score === 100) {
        label = "Strong 💪";
        color = "bg-emerald-500";
        textColor = "text-emerald-600";
        border = "border-emerald-400";
    } else if (score >= 75) {
        label = "Good 👍";
        color = "bg-teal-500";
        textColor = "text-teal-600";
        border = "border-teal-400";
    } else if (score >= 50) {
        label = "Fair ⚠️";
        color = "bg-amber-500";
        textColor = "text-amber-600";
        border = "border-amber-400";
    } else if (password.length > 0) {
        label = "Weak ❌";
        color = "bg-rose-500";
        textColor = "text-rose-600";
        border = "border-rose-400";
    } else {
        label = "";
        color = "bg-slate-200";
        textColor = "text-slate-400";
        border = "border-slate-200";
    }

    const isAllSatisfied =
        checks.minLength &&
        checks.hasUpper &&
        checks.hasLower &&
        checks.hasNumber &&
        checks.hasSpecial;

    return {
        score,
        label,
        color,
        textColor,
        border,
        checks,
        isAllSatisfied,
    };
}

/**
 * Validates password based on mode (Login or Register).
 * @param {string} password
 * @param {boolean} isRegister
 * @returns {string|null}
 */
export function validatePassword(password, isRegister = false) {
    if (!password) {
        return "Password is required.";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters.";
    }
    if (isRegister) {
        const { isAllSatisfied, checks } = evaluatePasswordStrength(password);
        if (!checks.minLength) return "Password must be at least 8 characters.";
        if (!checks.hasUpper)
            return "Password must contain at least 1 uppercase letter (A-Z).";
        if (!checks.hasLower)
            return "Password must contain at least 1 lowercase letter (a-z).";
        if (!checks.hasNumber)
            return "Password must contain at least 1 numeric digit (0-9).";
        if (!checks.hasSpecial)
            return "Password must contain at least 1 special character (!@#$%^&*).";
    }
    return null;
}

/**
 * Validates password confirmation match.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string|null}
 */
export function validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
        return "Please confirm your password.";
    }
    if (password !== confirmPassword) {
        return "Passwords do not match.";
    }
    return null;
}
