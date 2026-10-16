<?php

namespace App\Modules\Grading\Services;

/**
 * 🎓 15 YOE Senior Architecture: DepEd Order No. 8, s. 2015 Policy Standards
 * 
 * Implements:
 * 1. DepEd Official Transmutation Table
 * 2. General Average Computation & Academic Honors
 * 3. Learning Progress & Achievement Descriptors
 */
class DepEdGradingService
{
    /**
     * Official DepEd Transmutation Table (DO 8, s. 2015).
     * Maps initial grade (Raw/Weighted %) to transmuted grade.
     */
    public static function transmute(float $initialGrade): float
    {
        if ($initialGrade >= 100.00) return 100.00;
        if ($initialGrade >= 98.40) return 99.00;
        if ($initialGrade >= 96.80) return 98.00;
        if ($initialGrade >= 95.20) return 97.00;
        if ($initialGrade >= 93.60) return 96.00;
        if ($initialGrade >= 92.00) return 95.00;
        if ($initialGrade >= 90.40) return 94.00;
        if ($initialGrade >= 88.80) return 93.00;
        if ($initialGrade >= 87.20) return 92.00;
        if ($initialGrade >= 85.60) return 91.00;
        if ($initialGrade >= 84.00) return 90.00;
        if ($initialGrade >= 82.40) return 89.00;
        if ($initialGrade >= 80.80) return 88.00;
        if ($initialGrade >= 79.20) return 87.00;
        if ($initialGrade >= 77.60) return 86.00;
        if ($initialGrade >= 76.00) return 85.00;
        if ($initialGrade >= 74.40) return 84.00;
        if ($initialGrade >= 72.80) return 83.00;
        if ($initialGrade >= 71.20) return 82.00;
        if ($initialGrade >= 69.60) return 81.00;
        if ($initialGrade >= 68.00) return 80.00;
        if ($initialGrade >= 66.40) return 79.00;
        if ($initialGrade >= 64.80) return 78.00;
        if ($initialGrade >= 63.20) return 77.00;
        if ($initialGrade >= 61.60) return 76.00;
        if ($initialGrade >= 60.00) return 75.00;
        if ($initialGrade >= 56.00) return 74.00;
        if ($initialGrade >= 52.00) return 73.00;
        if ($initialGrade >= 48.00) return 72.00;
        if ($initialGrade >= 44.00) return 71.00;
        if ($initialGrade >= 40.00) return 70.00;
        if ($initialGrade >= 36.00) return 69.00;
        if ($initialGrade >= 32.00) return 68.00;
        if ($initialGrade >= 28.00) return 67.00;
        if ($initialGrade >= 24.00) return 66.00;
        if ($initialGrade >= 20.00) return 65.00;
        if ($initialGrade >= 16.00) return 64.00;
        if ($initialGrade >= 12.00) return 63.00;
        if ($initialGrade >= 8.00)  return 62.00;
        if ($initialGrade >= 4.00)  return 61.00;
        return 60.00;
    }

    /**
     * Compute Final Grade from Q1 to Q4 quarters.
     */
    public static function computeFinalGrade(?float $q1, ?float $q2, ?float $q3, ?float $q4): ?float
    {
        $quarters = array_filter([$q1, $q2, $q3, $q4], fn ($val) => !is_null($val));
        
        if (empty($quarters)) {
            return null;
        }

        $average = array_sum($quarters) / count($quarters);
        return round($average, 2);
    }

    /**
     * Get Remarks based on Final Grade.
     */
    public static function getRemarks(?float $finalGrade): ?string
    {
        if (is_null($finalGrade)) {
            return null;
        }

        return $finalGrade >= 75.00 ? 'PASSED' : 'FAILED';
    }

    /**
     * Get Learning Achievement Descriptor (DepEd Form 137/SF9).
     */
    public static function getDescriptor(?float $grade): ?string
    {
        if (is_null($grade)) return null;

        return match (true) {
            $grade >= 90.00 => 'Outstanding (O)',
            $grade >= 85.00 => 'Very Satisfactory (VS)',
            $grade >= 80.00 => 'Satisfactory (S)',
            $grade >= 75.00 => 'Fairly Satisfactory (FS)',
            default         => 'Did Not Meet Expectations (DNME)',
        };
    }

    /**
     * Check if student qualifies for DepEd Academic Honors.
     */
    public static function getHonorAward(float $generalAverage, array $allFinalGrades): ?string
    {
        // DepEd rule: No grade below 85 in any learning area
        foreach ($allFinalGrades as $grade) {
            if (is_null($grade) || $grade < 85.00) {
                return null;
            }
        }

        return match (true) {
            $generalAverage >= 98.00 => 'With Highest Honors',
            $generalAverage >= 95.00 => 'With High Honors',
            $generalAverage >= 90.00 => 'With Honors',
            default                  => null,
        };
    }
}
