<?php

namespace App\Modules\Grading\Enums;

enum GradeSubmissionStatus: string
{
    case DRAFT = 'DRAFT';
    case SUBMITTED_TO_ADVISER = 'SUBMITTED_TO_ADVISER';
    case SUBMITTED_TO_REGISTRAR = 'SUBMITTED_TO_REGISTRAR';
    case PUBLISHED = 'PUBLISHED';
}