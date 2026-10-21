import http from "k6/http";
import { check, sleep } from "k6";

// -------------------------------------------------------------
// STRESS TEST SCENARIO: 150 Mag-aaral na Sabay-sabay Nagpapatala
// -------------------------------------------------------------
export const options = {
    scenarios: {
        enrollment_rush: {
            executor: "shared-iterations",
            vus: 10, // 10 concurrent applicant terminals
            iterations: 50, // 150 total students
            maxDuration: "2m",
        },
    },
    thresholds: {
        // Bawal lumampas sa 5% ang failure rate
        http_req_failed: ["rate<0.05"],
    },
};

const BASE_URL = "http://localhost:8000";

export default function () {
    // -------------------------------------------------------------
    // HAKBANG 1: Kumuha ng Registration Page at CSRF Token
    // -------------------------------------------------------------
    const registerPageRes = http.get(`${BASE_URL}/register`);
    check(registerPageRes, {
        "Register page reachable (200)": (r) => r.status === 200,
    });

    const jar = http.cookieJar();
    const cookies = jar.cookiesForURL(BASE_URL);
    const xsrfToken = cookies["XSRF-TOKEN"]
        ? decodeURIComponent(cookies["XSRF-TOKEN"][0])
        : "";

    // -------------------------------------------------------------
    // HAKBANG 2: Bumuo ng Unique DepEd LRN at Email para sa bawat Estudyante
    // -------------------------------------------------------------
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    const uniqueLrn = "10" + String(Date.now()).slice(-6) + randomSuffix;
    const uniqueEmail = `applicant_${Date.now()}_vu${__VU}_it${__ITER}@bnhs.test`;

    const registerPayload = JSON.stringify({
        first_name: "Juan",
        last_name: `Dela Cruz ${__ITER}`,
        middle_name: "Santos",
        email: uniqueEmail,
        lrn: uniqueLrn,
        phone_number: "09171234567",
        applying_level: 7,
        student_type: "NEW",
        password: "Password123!",
        password_confirmation: "Password123!",
    });

    // -------------------------------------------------------------
    // HAKBANG 3: I-submit ang Pre-Admission Form (POST /register)
    // -------------------------------------------------------------
    const headers = {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": xsrfToken,
        Accept: "application/json, text/plain, */*",
        "X-Forwarded-For": `192.168.1.${(__VU % 20) + 1}`,
    };

    // Huwag mag-auto-redirect para masukat ang eksaktong bilis ng registration creation
    const registerRes = http.post(`${BASE_URL}/register`, registerPayload, {
        headers: headers,
        redirects: 0,
    });

    // Sa Inertia / Laravel:
    // Ang 302 (Redirect sa verify-email) o 409 (Inertia Location Redirect) ay tagumpay na registration
    const isSuccess =
        registerRes.status === 302 ||
        registerRes.status === 409 ||
        registerRes.status === 200;

    check(registerRes, {
        "Student successfully registered (302/409/200)": () => isSuccess,
    });

    if (!isSuccess) {
        console.log(
            `[FAILED VU ${__VU}] Status: ${registerRes.status} | Body: ${registerRes.body.slice(0, 150)}`,
        );
    }

    sleep(0.3);
}
