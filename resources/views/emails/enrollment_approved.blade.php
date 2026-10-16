<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admission Approved - Bulusan National High School</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
            font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
            margin: 0 0 20px;
        }
        .success-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-left: 4px solid #16a34a;
            border-radius: 10px;
            padding: 18px 20px;
            margin: 20px 0;
        }
        .success-title {
            font-size: 14px;
            font-weight: 700;
            color: #166534;
            margin-bottom: 6px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: #f8fafc;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        .info-table td {
            padding: 12px 16px;
            font-size: 13px;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-table tr:last-child td {
            border-bottom: none;
        }
        .info-label {
            color: #64748b;
            font-weight: 600;
            width: 40%;
        }
        .info-val {
            color: #0f172a;
            font-weight: 700;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: #ffffff !important;
            padding: 14px 32px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }
        .footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #64748b;
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
                <p>Online Pre-Admission &amp; Student Portal (OPAS)</p>
            </div>

            <!-- Content -->
            <div class="content">
                <p class="greeting">Mabuhay, {{ $studentName }}! 🎉</p>
                <p class="message">
                    Malugod naming ipinababatid na ang iyong aplikasyon para sa admission sa <strong>Bulusan National High School</strong> ay opisyal nang <strong>NA-APRUBAHAN (ENROLLED)</strong> ng Registrar Office para sa <strong>S.Y. {{ $schoolYear }}</strong>.
                </p>

                <div class="success-box">
                    <div class="success-title">✓ Opisyal na Enrolled</div>
                    <div style="font-size: 13px; color: #15803d; line-height: 1.5;">
                        Kumpleto at na-verify na ang iyong mga documentary requirements. Naitalaga ka na sa iyong opisyal na klase at seksyon.
                    </div>
                </div>

                <!-- Enrollment Summary Details -->
                <table class="info-table">
                    <tr>
                        <td class="info-label">Queue / Tracking No.</td>
                        <td class="info-val" style="font-family: monospace; color: #047857;">{{ $trackingNumber }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">DepEd LRN</td>
                        <td class="info-val" style="font-family: monospace;">{{ $lrn ?: 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Grade Level</td>
                        <td class="info-val">{{ $gradeLevel }}</td>
                    </tr>
                    @if(!empty($strand))
                    <tr>
                        <td class="info-label">SHS Strand</td>
                        <td class="info-val">{{ $strand }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="info-label">Assigned Section</td>
                        <td class="info-val" style="color: #065f46;">{{ $sectionName ?: 'To Be Announced' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Section Adviser</td>
                        <td class="info-val">{{ $adviserName ?: 'To Be Assigned' }}</td>
                    </tr>
                </table>

                <div class="button-container">
                    <a href="{{ $portalUrl }}" class="action-button" target="_blank">
                        Buksan ang Student Portal &amp; I-download ang BEEF Slip &rarr;
                    </a>
                </div>

                <p class="message" style="font-size: 12px; color: #64748b; margin-top: 24px;">
                    Maaari ka nang mag-log in sa iyong account upang makita ang iyong class schedule, school feed announcements, at ma-download ang iyong opisyal na <strong>DepEd Basic Education Enrollment Slip (Annex A)</strong>.
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p style="margin: 0 0 6px;"><strong>Bulusan National High School - Office of the Registrar</strong></p>
                <p style="margin: 0 0 6px;">San Jose, Bulusan, Sorsogon &bull; DepEd Region V &bull; SDO Sorsogon</p>
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">Ito ay automated notification mula sa BNHS Online Portal. Mangyaring huwag sagutin ang email na ito.</p>
            </div>
        </div>
    </div>
</body>
</html>
