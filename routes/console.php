<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Araw-araw tuwing 12:00 AM lilinisin ang mga lumang expired session files sa disk
Schedule::command('session:prune')->daily();
