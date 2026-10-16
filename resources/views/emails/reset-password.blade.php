<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your BNHS Account Password</title>
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
        .btn-reset {
            display: block;
            width: 100%;
            box-sizing: border-box;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 15px;
            text-align: center;
            margin: 24px 0;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }
        .expiry-notice {
            background-color: #fefce8;
            border: 1px solid #fef08a;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            color: #854d0e;
            margin: 16px 0 24px;
            text-align: center;
            font-weight: 500;
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
                    We received a request to reset the password for your Bulusan National High School portal account. You can reset your password by clicking the button below:
                </p>

                <!-- Reset Button -->
                <a href="{{ $resetUrl }}" class="btn-reset" target="_blank">
                    Reset Your Password
                </a>

                <!-- Expiry Note -->
                <div class="expiry-notice">
                    &#9201; This password reset link will expire in <strong>{{ $expiresInMinutes }} minutes</strong>.
                </div>

                <!-- Security Advisory -->
                <div class="security-notice">
                    <strong>Security Alert:</strong> If you did not request a password reset, no further action is required; your password will remain unchanged. Never forward or share this link with anyone.
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
