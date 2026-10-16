import React from "react";
import { useOnlineStatus } from "@/Hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
    const isOnline = useOnlineStatus();

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed top-0 right-0 sm:l-0 z-[9999] bg-linear-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 py-2.5 shadow-2xl flex lg:w-auto items-center justify-center gap-2 text-xs font-bold pointer-events-auto border-b border-rose-400/40">
            <WifiOff className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
            <span>
                WALANG INTERNET CONNECTION: Nakadiskonekta ang iyong WiFi o
                Mobile Data.
            </span>
        </div>
    );
}
