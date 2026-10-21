import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. STRESS TEST CONFIGURATION
export const options = {
    stages: [
        { duration: '10s', target: 5 },  // Umpisa: 5 sabay-sabay na requests
        { duration: '20s', target: 10 }, // Sustained: 10 concurrent requests
        { duration: '10s', target: 0 },  // Cooldown pabalik sa 0
    ],
    thresholds: {
        // 95% ng requests ay dapat mas mabilis sa 1 segundo
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = 'http://localhost:8000';

// -------------------------------------------------------------
// SETUP FUNCTION: Mag-login NANG ISANG BESES LANG
// Kukunin ang authenticated session cookies bago magsimula ang stress test
// para hindi tamaan ang Login Rate Limiter (5 logins/min).
// -------------------------------------------------------------
export function setup() {
    // 1. Kumuha ng CSRF token
    const loginPageRes = http.get(`${BASE_URL}/login`);
    const jar = http.cookieJar();
    const cookies = jar.cookiesForURL(BASE_URL);
    const xsrfToken = cookies['XSRF-TOKEN'] ? decodeURIComponent(cookies['XSRF-TOKEN'][0]) : '';

    // 2. Mag-login
    const loginPayload = JSON.stringify({
        email: 'teacher@bnhs.edu.ph',
        password: 'password123',
    });

    const loginRes = http.post(`${BASE_URL}/login`, loginPayload, {
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': xsrfToken,
            'Accept': 'application/json',
        },
    });

    console.log(`[SETUP] Login status: ${loginRes.status}`);

    // Ibalik ang cookies para gamitin ng lahat ng Virtual Users (VUs)
    return {
        xsrfToken: xsrfToken,
    };
}

export default function (data) {
    // -------------------------------------------------------------
    // HAKBANG 1: Subukan ang Teacher Dashboard & Advisory Loading
    // -------------------------------------------------------------
    const dashboardRes = http.get(`${BASE_URL}/teacher/dashboard`, {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        },
    });

    check(dashboardRes, {
        'Teacher Dashboard OK (200 o 302)': (r) => r.status === 200 || r.status === 302,
    });

    // -------------------------------------------------------------
    // HAKBANG 2: Batch Save ng Grades para sa 45 Estudyante
    // -------------------------------------------------------------
    const sampleGrades = [];
    for (let i = 1; i <= 45; i++) {
        sampleGrades.push({
            student_id: i,
            q1: 85,
            q2: 88,
            q3: 90,
            q4: 87,
        });
    }

    const savePayload = JSON.stringify({
        grades: sampleGrades,
    });

    const jar = http.cookieJar();
    const currentCookies = jar.cookiesForURL(BASE_URL);
    const currentXsrf = currentCookies['XSRF-TOKEN'] ? decodeURIComponent(currentCookies['XSRF-TOKEN'][0]) : data.xsrfToken;

    const saveRes = http.post(
        `${BASE_URL}/teacher/sections/1/subjects/1/grades/save`,
        savePayload,
        {
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': currentXsrf,
                'Accept': 'application/json',
                'X-Inertia': 'true',
            },
        }
    );

    check(saveRes, {
        'Batch save grades response (200 o 302)': (r) => r.status === 200 || r.status === 302,
    });

    // Pahinga ng 1 segundo bago mag-request muli
    sleep(1);
}
