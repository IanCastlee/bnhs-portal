<?php

namespace App\Modules\Enrollment\Traits;

use Illuminate\Support\Facades\Auth;

trait AuthorizesGradeLevel
{
    /**
     * Verify that the registrar is assigned to the requested grade level.
     * Admin users bypass this check.
     */
    protected function authorizeGradeLevel(int $gradeLevelId): void
    {
        $user = Auth::user();
        if ($user && $user->isRegistrar()) {
            $assignedIds = $user->assignedGradeLevels()->pluck('grade_levels.id')->toArray();
            if (!empty($assignedIds) && !in_array($gradeLevelId, $assignedIds)) {
                abort(403, 'Hindi ka awtorisadong mag-section sa Grade Level na ito.');
            }
        }
    }
}
