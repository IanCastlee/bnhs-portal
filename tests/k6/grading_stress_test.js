import http from "k6/http";
import { check, sleep } from "k6";

// 1. CONFIGURATION NG STRESS TEST
export const options = {
    stages: [
        { duration: "30s", target: 10 }, // Ramp-up: 10 guro sa unang 30 segundo
        { duration: "1m", target: 30 }, // Peak: 30 sabay-sabay na guro sa loob ng 1 minuto
        { duration: "30s", target: 50 }, // Stress test: Biglang aabot sa 50 guro
        { duration: "30s", target: 0 }, // Ramp-down: Bababa pabalik sa 0
    ],
    thresholds: {
        // Dapat 95% ng requests ay matatapos nang mas mabilis sa 500ms
        http_req_duration: ["p(95)<500"],
        // Dapat mas mababa sa 1% ang error o failure rate
        http_req_failed: ["rate<0.01"],
    },
};

const BASE_URL = "http://localhost:8000"; // O ang URL ng iyong local server

export default function () {
    // A. Kumuha ng session at CSRF token sa Login page
    const loginPageRes = http.get(`${BASE_URL}/login`);
    check(loginPageRes, {
        "Login page loaded": (r) => r.status === 200,
    });

    // Kunin ang XSRF-TOKEN mula sa cookies
    const jar = http.cookieJar();
    const cookies = jar.cookiesForURL(BASE_URL);
    const xsrfToken = cookies["XSRF-TOKEN"]
        ? decodeURIComponent(cookies["XSRF-TOKEN"][0])
        : "";

    // B. Mag-login bilang Teacher
    const loginPayload = JSON.stringify({
        email: "teacher@bnhs.edu.ph",
        password: "password123",
    });

    const loginHeaders = {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": xsrfToken,
        Accept: "application/json",
    };

    const loginRes = http.post(`${BASE_URL}/login`, loginPayload, {
        headers: loginHeaders,
    });
    check(loginRes, {
        "Login successful": (r) => r.status === 200 || r.status === 302,
    });

    // C. Subukang i-save ang Grades ng 45 estudyante (Simulasyon ng Batch Save)
    // Tandaan: Palitan ang section ID (1) at subject ID (1) ayon sa iyong database
    const gradeRows = [];
    for (let i = 1; i <= 45; i++) {
        gradeRows.push({
            student_id: i,
            q1: 85 + (i % 10),
            q2: 88,
            q3: 90,
            q4: 87,
        });
    }

    const saveGradesPayload = JSON.stringify({
        grades: gradeRows,
    });

    const saveHeaders = {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": xsrfToken,
        Accept: "application/json",
        "X-Inertia": "true", // Upang sagutin bilang Inertia request
    };

    const saveRes = http.post(
        `${BASE_URL}/teacher/sections/1/subjects/1/grades/save`,
        saveGradesPayload,
        { headers: saveHeaders },
    );

    check(saveRes, {
        "Save grades success (200 o 302)": (r) =>
            r.status === 200 || r.status === 302,
    });

    // Magpahinga ang bawat virtual user ng 1 hanggang 2 segundo bago umulit
    sleep(1);
}
