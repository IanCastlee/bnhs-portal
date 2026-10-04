<?php

namespace App\Modules\Enrollment\Enums;

enum EnrollmentStatus: string
{
    case PENDING_REVIEW = 'PENDING_REVIEW';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
}