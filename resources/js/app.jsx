import "../css/app.css";
import { createRoot } from "react-dom/client";
import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ToastProvider } from "./Context/ToastContext";

const appName = import.meta.env.VITE_APP_NAME || "BNHS Portal";

// 🛡️ Global Interceptor: Handle 419 Page Expired (Session Timeout) & 401 Unauthorized
router.on("invalid", (event) => {
    const status = event.detail.response?.status;
    if (status === 419 || status === 401) {
        event.preventDefault();
        window.location.href = "/login?expired=1";
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ToastProvider>
                <App {...props} />
            </ToastProvider>,
        );
    },
    progress: {
        color: "#10b981",

        showSpinner: false,
        delay: 250, // Lalabas lamang ang loading bar kung lumampas sa 250ms ang request
    },
});
