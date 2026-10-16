<?php

namespace App\Modules\Identity\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ⚡ Admin Queue & Background Jobs Monitor Controller
 * 
 * Provides an administrative dashboard to inspect, retry, and clear
 * queued background tasks, post-approval workflows, and notifications.
 */
class AdminQueueMonitorController extends Controller
{
    /**
     * Display the Queue & Background Jobs Monitor Dashboard.
     */
    public function index(Request $request): Response
    {
        $tab = $request->query('tab', 'failed');
        $search = trim($request->query('search', ''));

        $pendingCount = DB::table('jobs')->count();
        $failedCount = DB::table('failed_jobs')->count();
        $failedLast24h = DB::table('failed_jobs')
            ->where('failed_at', '>=', now()->subHours(24))
            ->count();

        // Default to failed tab if there are failed jobs, otherwise pending
        if (!in_array($tab, ['failed', 'pending'])) {
            $tab = $failedCount > 0 ? 'failed' : 'pending';
        }

        // 1. Failed Jobs Query
        $failedJobsQuery = DB::table('failed_jobs')->latest('id');
        if (!empty($search)) {
            $failedJobsQuery->where(function ($q) use ($search) {
                $q->where('queue', 'like', "%{$search}%")
                    ->orWhere('payload', 'like', "%{$search}%")
                    ->orWhere('exception', 'like', "%{$search}%");
            });
        }
        $failedJobs = $failedJobsQuery->paginate(15, ['*'], 'failed_page')->withQueryString();

        // Transform failed jobs for secure and readable UI display
        $failedJobs->getCollection()->transform(function ($job) {
            $rawPayload = $job->payload ?? '';
            $exception = $job->exception ?? '';
            $firstLine = strtok($exception, "\n");
            if (strlen($firstLine) > 160) {
                $firstLine = substr($firstLine, 0, 160) . '...';
            }

            return [
                'id'              => $job->id,
                'uuid'            => $job->uuid,
                'connection'      => $job->connection,
                'queue'           => $job->queue,
                'display_name'    => $this->formatDisplayName($rawPayload),
                'summary'         => $this->extractPayloadSummary($rawPayload),
                'exception_short' => $firstLine ?: 'An unexpected queue exception occurred.',
                'exception_full'  => $exception,
                'failed_at'       => $job->failed_at,
            ];
        });

        // 2. Pending Jobs Query
        $pendingJobsQuery = DB::table('jobs')->orderBy('id', 'asc');
        if (!empty($search)) {
            $pendingJobsQuery->where(function ($q) use ($search) {
                $q->where('queue', 'like', "%{$search}%")
                    ->orWhere('payload', 'like', "%{$search}%");
            });
        }
        $pendingJobs = $pendingJobsQuery->paginate(15, ['*'], 'pending_page')->withQueryString();

        // Transform pending jobs for UI display
        $pendingJobs->getCollection()->transform(function ($job) {
            $rawPayload = $job->payload ?? '';

            return [
                'id'           => $job->id,
                'queue'        => $job->queue,
                'attempts'     => $job->attempts,
                'reserved_at'  => $job->reserved_at ? date('Y-m-d H:i:s', $job->reserved_at) : null,
                'available_at' => $job->available_at ? date('Y-m-d H:i:s', $job->available_at) : null,
                'created_at'   => date('Y-m-d H:i:s', $job->created_at),
                'display_name' => $this->formatDisplayName($rawPayload),
                'summary'      => $this->extractPayloadSummary($rawPayload),
            ];
        });

        return Inertia::render('Admin/QueueJobs/Index', [
            'tab'             => $tab,
            'search'          => $search,
            'pendingCount'    => $pendingCount,
            'failedCount'     => $failedCount,
            'failedLast24h'   => $failedLast24h,
            'queueConnection' => config('queue.default', 'database'),
            'failedJobs'      => $failedJobs,
            'pendingJobs'     => $pendingJobs,
        ]);
    }

    /**
     * Retry a single failed queue job by ID or UUID.
     */
    public function retry(Request $request, string $id): RedirectResponse
    {
        try {
            Artisan::call('queue:retry', ['id' => [$id]]);

            AuditLog::record(
                'QUEUE_JOB_RETRIED',
                "Admin retried failed background job ID: {$id}",
                null,
                ['job_id' => $id],
                'QUEUE',
                Auth::id()
            );

            return back()->with('success', "Job #{$id} has been requeued for execution.");
        } catch (\Throwable $e) {
            return back()->withErrors(['queue' => "Failed to retry job: {$e->getMessage()}"]);
        }
    }

    /**
     * Retry all failed queue jobs in the quarantine.
     */
    public function retryAll(): RedirectResponse
    {
        try {
            Artisan::call('queue:retry', ['id' => ['all']]);

            AuditLog::record(
                'QUEUE_ALL_RETRIED',
                "Admin retried all failed queue jobs in quarantine",
                null,
                [],
                'QUEUE',
                Auth::id()
            );

            return back()->with('success', 'All failed background jobs have been requeued.');
        } catch (\Throwable $e) {
            return back()->withErrors(['queue' => "Failed to retry all jobs: {$e->getMessage()}"]);
        }
    }

    /**
     * Permanently remove a specific failed job from the quarantine.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        try {
            Artisan::call('queue:forget', ['id' => $id]);

            AuditLog::record(
                'QUEUE_JOB_DELETED',
                "Admin permanently removed failed background job ID: {$id}",
                null,
                ['job_id' => $id],
                'QUEUE',
                Auth::id()
            );

            return back()->with('success', "Job #{$id} has been removed from quarantine.");
        } catch (\Throwable $e) {
            return back()->withErrors(['queue' => "Failed to remove job: {$e->getMessage()}"]);
        }
    }

    /**
     * Flush all failed queue jobs permanently.
     */
    public function flush(): RedirectResponse
    {
        try {
            Artisan::call('queue:flush');

            AuditLog::record(
                'QUEUE_FLUSHED',
                "Admin purged all failed background jobs from quarantine",
                null,
                [],
                'QUEUE',
                Auth::id()
            );

            return back()->with('success', 'All quarantined failed jobs have been cleared.');
        } catch (\Throwable $e) {
            return back()->withErrors(['queue' => "Failed to clear failed jobs: {$e->getMessage()}"]);
        }
    }

    /**
     * Cancel / Delete a pending job that hasn't executed yet.
     */
    public function deletePending(Request $request, int $id): RedirectResponse
    {
        try {
            $deleted = DB::table('jobs')->where('id', $id)->delete();

            if ($deleted) {
                AuditLog::record(
                    'PENDING_JOB_CANCELLED',
                    "Admin cancelled pending queue job ID: {$id}",
                    null,
                    ['job_id' => $id],
                    'QUEUE',
                    Auth::id()
                );

                return back()->with('success', "Pending job #{$id} was successfully cancelled.");
            }

            return back()->with('info', "Pending job #{$id} was already processed or removed.");
        } catch (\Throwable $e) {
            return back()->withErrors(['queue' => "Failed to cancel pending job: {$e->getMessage()}"]);
        }
    }

    /**
     * Map internal class and command names into user-friendly labels.
     */
    private function formatDisplayName(?string $rawPayload): string
    {
        if (empty($rawPayload)) {
            return 'Queued Background Job';
        }

        $decoded = json_decode($rawPayload, true);
        $displayName = $decoded['displayName'] ?? ($decoded['data']['commandName'] ?? null);

        if (!$displayName) {
            return 'Queued Task';
        }

        return match ($displayName) {
            'App\Jobs\ProcessEnrollmentApprovalJob' => 'Post-Approval Workflow (Grades Ledger Provisioning)',
            'App\Notifications\EnrollmentApprovedNotification' => 'Student Enrollment Approval Notice (Email & In-App)',
            'App\Notifications\EnrollmentRejectedNotification' => 'Student Enrollment Returned / Resubmission Notice (Email & In-App)',
            'App\Notifications\StudentSectionAssignedNotification' => 'Student Class Section Assignment Notice (Email & In-App)',
            'App\Notifications\TeacherAdviserAssignedNotification' => 'Faculty Class Adviser Designation Notice (Email & In-App)',
            'App\Notifications\SectionAdviserUpdatedNotification' => 'Section Adviser Updated Notice (Email & In-App)',
            default => class_basename($displayName),
        };
    }

    /**
     * Safely extract identifying information from payload without deserializing.
     */
    private function extractPayloadSummary(?string $rawPayload): ?string
    {
        if (empty($rawPayload)) {
            return null;
        }

        if (preg_match('/tracking_number.*?s:\d+:"([^"]+)"/', $rawPayload, $m)) {
            return 'Ticket: ' . $m[1];
        }

        if (preg_match('/BNHS-\d{4}-Q\d+/', $rawPayload, $m)) {
            return 'Ticket: ' . $m[0];
        }

        return null;
    }
}
