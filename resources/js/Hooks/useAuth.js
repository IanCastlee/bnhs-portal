import { usePage } from "@inertiajs/react";

export function useAuth() {
    const { auth } = usePage().props;
    const user = auth?.user || null;

    return {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        isRegistrar: user?.role === "REGISTRAR",
        isTeacher: user?.role === "TEACHER",
        isStudent: user?.role === "STUDENT",
        role: user?.role,
    };
}
