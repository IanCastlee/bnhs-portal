<?php

namespace App\Modules\Academic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\Strand;
use App\Modules\Academic\Models\Subject;
use App\Modules\Identity\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubjectController extends Controller
{
    /**
     * Display a listing of subjects per grade level and strand.
     */
    public function index(Request $request): Response
    {
        $gradeLevels = GradeLevel::getCached();
        $strands = Strand::getCached();

        $selectedGradeLevelId = $request->query('grade_level_id');
        $selectedStrandId = $request->query('strand_id');
        $search = $request->query('search');

        $query = Subject::with(['gradeLevel:id,level,name,category', 'strand:id,code,name,track'])
            ->withCount('sectionSubjects');

        if ($selectedGradeLevelId) {
            $query->where('grade_level_id', $selectedGradeLevelId);
        }

        if ($selectedStrandId) {
            $query->where('strand_id', $selectedStrandId);
        }

        if ($search) {
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], trim($search));
            $query->where(function ($q) use ($escaped) {
                $q->where('code', 'like', "%{$escaped}%")
                  ->orWhere('name', 'like', "%{$escaped}%");
            });
        }

        // Cache total subject stats under the 'curriculum' Redis tag
        $stats = Subject::getCachedStats();

        $subjects = $query->orderBy('grade_level_id')
            ->orderBy('strand_id')
            ->orderBy('code')
            ->get();

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
            'gradeLevels' => $gradeLevels,
            'strands' => $strands,
            'stats' => $stats,
            'filters' => [
                'grade_level_id' => $selectedGradeLevelId ? (int) $selectedGradeLevelId : null,
                'strand_id' => $selectedStrandId ? (int) $selectedStrandId : null,
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created subject in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'grade_level_id' => ['required', 'exists:grade_levels,id'],
            'strand_id' => ['nullable', 'exists:strands,id'],
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'semester' => ['required', 'string', 'in:Full Year,1st Semester,2nd Semester,Summer'],
        ]);

        // Normalize code & name
        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['name'] = trim($validated['name']);

        // Validate uniqueness within the same grade level and strand
        $exists = Subject::where('grade_level_id', $validated['grade_level_id'])
            ->where('code', $validated['code'])
            ->when($validated['strand_id'], fn ($q, $strId) => $q->where('strand_id', $strId))
            ->when(!$validated['strand_id'], fn ($q) => $q->whereNull('strand_id'))
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'code' => 'Mayroon nang subject na may ganitong code sa piniling Grade Level at Strand.',
            ]);
        }

        $subject = DB::transaction(function () use ($validated) {
            $created = Subject::create($validated);

            AuditLog::record(
                'SUBJECT_CREATED',
                "Created subject {$created->code} ({$created->name}) for Grade Level ID {$created->grade_level_id}",
                $created,
                $created->toArray(),
                'CURRICULUM'
            );

            return $created;
        });

        DB::afterCommit(fn () => Subject::clearCurriculumCache());

        return back()->with('success', "Matagumpay na naidagdag ang subject na {$subject->code} ({$subject->name}).");
    }

    /**
     * Update the specified subject in storage.
     */
    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $validated = $request->validate([
            'grade_level_id' => ['required', 'exists:grade_levels,id'],
            'strand_id' => ['nullable', 'exists:strands,id'],
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'semester' => ['required', 'string', 'in:Full Year,1st Semester,2nd Semester,Summer'],
        ]);

        // Normalize code & name
        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['name'] = trim($validated['name']);

        // Validate uniqueness excluding current subject
        $exists = Subject::where('grade_level_id', $validated['grade_level_id'])
            ->where('code', $validated['code'])
            ->where('id', '!=', $subject->id)
            ->when($validated['strand_id'], fn ($q, $strId) => $q->where('strand_id', $strId))
            ->when(!$validated['strand_id'], fn ($q) => $q->whereNull('strand_id'))
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'code' => 'Mayroon nang ibang subject na may ganitong code sa piniling Grade Level at Strand.',
            ]);
        }

        DB::transaction(function () use ($subject, $validated) {
            $oldData = $subject->toArray();
            $subject->update($validated);

            AuditLog::record(
                'SUBJECT_UPDATED',
                "Updated subject {$subject->code} ({$subject->name})",
                $subject,
                ['old' => $oldData, 'new' => $subject->toArray()],
                'CURRICULUM'
            );
        });

        DB::afterCommit(fn () => Subject::clearCurriculumCache());

        return back()->with('success', "Matagumpay na na-update ang subject na {$subject->code}.");
    }

    /**
     * Remove the specified subject from storage.
     */
    public function destroy(Subject $subject): RedirectResponse
    {
        // Safety guard: Check if used in section_subjects or has existing grades
        $sectionSubjectsCount = $subject->sectionSubjects()->count();
        $gradesCount = $subject->grades()->count();

        if ($sectionSubjectsCount > 0 || $gradesCount > 0) {
            return back()->with('error', "Hindi maaaring burahin ang subject na {$subject->code} dahil nakatalaga na ito sa {$sectionSubjectsCount} klase at may {$gradesCount} umiiral na marka sa database.");
        }

        DB::transaction(function () use ($subject) {
            $deletedInfo = $subject->toArray();
            $code = $subject->code;
            $name = $subject->name;

            $subject->delete();

            AuditLog::record(
                'SUBJECT_DELETED',
                "Deleted subject {$code} ({$name})",
                null,
                $deletedInfo,
                'CURRICULUM'
            );
        });

        DB::afterCommit(fn () => Subject::clearCurriculumCache());

        return back()->with('success', "Matagumpay na nabura ang subject na {$subject->code}.");
    }
}
