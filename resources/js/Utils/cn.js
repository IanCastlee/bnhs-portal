/**
 * Utility for combining Tailwind CSS class names conditionally.
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
