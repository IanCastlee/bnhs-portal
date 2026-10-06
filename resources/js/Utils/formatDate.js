/**
 * Format ISO date strings into clean, readable formats.
 */
export function formatDate(dateString, options = {}) {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const defaultOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...options,
    };

    return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
}

/**
 * Format date into relative time (e.g. "Just now", "5 mins ago", "Yesterday").
 */
export function formatRelativeTime(dateString) {
    if (!dateString) return "Just now";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 172800) return "Yesterday";

    return formatDate(dateString);
}
