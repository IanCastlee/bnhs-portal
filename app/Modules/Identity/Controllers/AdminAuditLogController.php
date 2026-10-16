<?php

namespace App\Modules\Identity\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Enums\UserRole;
use App\Modules\Identity\Models\AuditLog;
use App\Modules\Identity\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuditLogController extends Controller
{
    /**
     * Display a listing of system and registrar audit activity logs.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->query('search', ''));
        $action = $request->query('action', 'ALL');
        $module = $request->query('module', 'ALL');
        $userId = $request->query('user_id');

        $query = AuditLog::with(['user:id,name,email,role,employee_id'])
            ->latest('id');

        // Action Filter
        if ($action !== 'ALL' && !empty($action)) {
            $query->where('action', $action);
        }

        // Module Filter
        if ($module !== 'ALL' && !empty($module)) {
            $query->where('module', $module);
        }

        // Staff / User Filter
        if (!empty($userId)) {
            $query->where('user_id', $userId);
        }

        // Search Filter (Description, IP Address, JSON properties)
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('employee_id', 'like', "%{$search}%");
                    });
            });
        }

        $logs = $query->paginate(20)->withQueryString();

        // Staff list for dropdown
        $staffMembers = User::whereIn('role', [UserRole::REGISTRAR, UserRole::ADMIN])
            ->select('id', 'name', 'email', 'role', 'employee_id')
            ->orderBy('name')
            ->get();

        // High-level telemetry stats
        $stats = [
            'totalLogs' => AuditLog::count(),
            'todayLogs' => AuditLog::whereDate('created_at', today())->count(),
            'enrollmentApprovals' => AuditLog::where('action', 'ENROLLMENT_APPROVED')->count(),
            'enrollmentRejections' => AuditLog::where('action', 'ENROLLMENT_REJECTED')->count(),
        ];

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'staffMembers' => $staffMembers,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'action' => $action,
                'module' => $module,
                'user_id' => $userId,
            ],
        ]);
    }
}
