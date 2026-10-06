export const USER_ROLES = {
    ADMIN: "ADMIN",
    REGISTRAR: "REGISTRAR",
    TEACHER: "TEACHER",
    STUDENT: "STUDENT",
};

export const ROLE_CONFIG = {
    [USER_ROLES.ADMIN]: {
        label: "Administrator",
        badgeColor: "bg-red-500/10 text-red-600 border-red-200",
        dashboardRoute: "/admin/dashboard",
        iconName: "Shield",
    },
    [USER_ROLES.REGISTRAR]: {
        label: "Registrar Office",
        badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
        dashboardRoute: "/registrar/dashboard",
        iconName: "FileCheck",
    },
    [USER_ROLES.TEACHER]: {
        label: "Faculty / Adviser",
        badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        dashboardRoute: "/teacher/dashboard",
        iconName: "Users",
    },
    [USER_ROLES.STUDENT]: {
        label: "Student",
        badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200",
        dashboardRoute: "/student/dashboard",
        iconName: "GraduationCap",
    },
};
