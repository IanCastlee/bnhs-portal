<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your BNHS Account</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f1f5f9;
            padding: 40px 0;
        }
        .container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
            padding: 32px 30px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .header p {
            margin: 6px 0 0;
            font-size: 13px;
            color: #a7f3d0;
            font-weight: 500;
        }
        .content {
            padding: 36px 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 12px;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 24px;
        }
        .otp-container {
            background-color: #f0fdf4;
            border: 2px dashed #86efac;
            border-radius: 12px;
            padding: 24px 20px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-label {
            font-size: 11px;
            font-weight: 700;
            color: #166534;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 36px;
            font-weight: 900;
            letter-spacing: 8px;
            color: #064e3b;
            padding: 6px 0;
        }
        .otp-expiry {
            font-size: 12px;
            color: #15803d;
            margin-top: 8px;
            font-weight: 500;
        }
        .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 28px 0 20px;
        }
        .divider::before, .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #e2e8f0;
        }
        .divider span {
            padding: 0 12px;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .btn-magic {
            display: block;
            width: 100%;
            box-sizing: border-box;
            background-color: #059669;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 24px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            text-align: center;
            margin: 16px 0 24px;
        }
        .btn-magic:hover {
            background-color: #047857;
        }
        .security-notice {
            background-color: #f8fafc;
            border-left: 4px solid #059669;
            padding: 14px 16px;
            border-radius: 6px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.5;
            margin-top: 24px;
        }
        .footer {
            padding: 24px 32px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.5;
        }
        .footer a {
            color: #059669;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>Bulusan National High School</h1>
                <p>SSU Online Pre-Admission & Student Portal</p>
            </div>

            <!-- Body Content -->
            <div class="content">
                <div class="greeting">Mabuhay, {{ $user->name }}!</div>
                <p class="message">
                    Thank you for applying to Bulusan National High School. To secure your account and proceed with your online admission application, please verify your email address using the 6-digit code below:
                </p>

                <!-- 6-digit OTP Box -->
                <div class="otp-container">
                    <div class="otp-label">Your 6-Digit Verification Code</div>
                    <div class="otp-code">{{ $otp }}</div>
                    <div class="otp-expiry">&#9201; Valid for {{ $expiresInMinutes }} minutes only</div>
                </div>

                <!-- Magic Link Alternative -->
                <div class="divider">
                    <span>Or 1-Click Verification</span>
                </div>

                <p class="message" style="margin-bottom: 8px; font-size: 13px;">
                    If you're on the same device, click the button below to verify your account automatically without typing the code:
                </p>

                <a href="{{ $verificationUrl }}" class="btn-magic" target="_blank">
                    Verify Email Automatically
                </a>

                <!-- Security Advisory -->
                <div class="security-notice">
                    <strong>Security Notice:</strong> If you did not create an account on the BNHS Portal, please disregard this email. Never share your verification code or link with anyone.
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>&copy; {{ date('Y') }} Bulusan National High School. All rights reserved.<br>
                Department of Education &bull; Division of Sorsogon &bull; Region V<br>
                San Roque, Bulusan, Sorsogon</p>
            </div>
        </div>
    </div>
</body>
</html>
