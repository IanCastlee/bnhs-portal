<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admission Update - Bulusan National High School</title>
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
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
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
            color: #cbd5e1;
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
        .warning-box {
            background-color: #fff7ed;
            border: 1px solid #fed7aa;
            border-left: 4px solid #ea580c;
            border-radius: 10px;
            padding: 18px 20px;
            margin: 20px 0;
        }
        .warning-title {
            font-size: 14px;
            font-weight: 700;
            color: #9a3412;
            margin-bottom: 6px;
        }
        .remarks-content {
            font-size: 14px;
            color: #7c2d12;
            font-weight: 600;
            line-height: 1.5;
            background-color: #ffedd5;
            padding: 12px 14px;
            border-radius: 8px;
            margin-top: 8px;
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
                <p>Office of the Registrar &bull; Admission Notice</p>
            </div>

            <!-- Content -->
            <div class="content">
                <p class="greeting">Kumusta, {{ $studentName }}!</p>
                <p class="message">
                    Ipinagbibigay-alam ng Registrar Office na ang iyong aplikasyon para sa admission sa <strong>Bulusan National High School</strong> (Ticket: <strong>{{ $trackingNumber }}</strong>) ay pansamantalang <strong>IBINALIK PARA SA PAGWAWASTO (RETURNED / RESUBMISSION REQUIRED)</strong>.
                </p>

                <div class="warning-box">
                    <div class="warning-title">⚠️ Dahilan / Remarks mula sa Registrar:</div>
                    <div class="remarks-content">
                        &ldquo;{{ $remarks }}&rdquo;
                    </div>
                </div>

                <!-- Ticket details -->
                <table class="info-table">
                    <tr>
                        <td class="info-label">Queue / Tracking No.</td>
                        <td class="info-val" style="font-family: monospace; color: #b45309;">{{ $trackingNumber }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Grade Level Applied</td>
                        <td class="info-val">{{ $gradeLevel }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Status</td>
                        <td class="info-val" style="color: #dc2626;">Kailangan ng Pagwawasto / Re-upload</td>
                    </tr>
                </table>

                <div class="button-container">
                    <a href="{{ $portalUrl }}" class="action-button" target="_blank">
                        Mag-log in sa Portal at I-update ang Dokumento &rarr;
                    </a>
                </div>

                <p class="message" style="font-size: 12px; color: #64748b; margin-top: 24px;">
                    <strong>Ano ang susunod mong gagawin?</strong><br>
                    Mag-log in sa iyong account gamit ang button sa itaas, pumunta sa <strong>Documents Step</strong>, i-upload ang tamang kopya ayon sa remarks ng Registrar, at i-resubmit ang iyong aplikasyon.
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
