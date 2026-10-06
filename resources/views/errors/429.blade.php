<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Traffic Limit Reached - Bulusan NHS Portal</title>
    @vite(['resources/css/app.css'])
</head>
<body class="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4 border border-amber-500/30">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>

        <span class="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            Status 429 • Traffic Protection
        </span>

        <h1 class="text-xl font-black text-white mt-1">Masyadong Mabilis ang Pag-click</h1>
        <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Naka-activate ang proteksyon ng portal laban sa bot traffic. Pakiusap maghintay ng ilang sandali bago mag-click muli.
        </p>

        <div class="my-6 p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-center gap-3">
            <span class="text-xs text-slate-400 font-medium">Subukan muli sa loob ng:</span>
            <span class="text-lg font-mono font-bold text-amber-400">{{ $retryAfter ?? 60 }}s</span>
        </div>

        <a href="/" class="inline-block w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md">
            Bumalik sa Portal
        </a>
    </div>
</body>
</html>
