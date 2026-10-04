<?php

namespace App\Modules\Identity\Enums;

enum UserRole: string
{
    case ADMIN = 'ADMIN';
    case REGISTRAR = 'REGISTRAR';
    case TEACHER = 'TEACHER';
    case STUDENT = 'STUDENT';
}