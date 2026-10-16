<?php

namespace App\Modules\Identity\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    protected $table = 'audit_logs';

    protected $fillable = [
        'user_id',
        'action',
        'module',
        'description',
        'target_type',
        'target_id',
        'properties',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * The staff / registrar / admin user who initiated this action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * ⚡ Senior Architecture Helper: Record audit action with zero friction.
     */
    public static function record(
        string $action,
        string $description,
        ?Model $target = null,
        array $properties = [],
        string $module = 'ENROLLMENT',
        ?int $userId = null
    ): self {
        return self::create([
            'user_id'     => $userId ?? Auth::id(),
            'action'      => strtoupper($action),
            'module'      => strtoupper($module),
            'description' => $description,
            'target_type' => $target ? get_class($target) : null,
            'target_id'   => $target?->getKey(),
            'properties'  => !empty($properties) ? $properties : null,
            'ip_address'  => Request::ip(),
            'user_agent'  => Request::userAgent(),
        ]);
    }
}
