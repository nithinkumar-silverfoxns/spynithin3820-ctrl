<?php
/**
 * T.T.T Academy DCET website — configuration.
 *
 * Do NOT edit secrets here. Copy config/config.local.example.php to
 * config/config.local.php (git-ignored) or set environment variables.
 */
declare(strict_types=1);

$local = is_file(__DIR__ . '/config.local.php') ? require __DIR__ . '/config.local.php' : [];

$env = static function (string $key, $default = null) use ($local) {
    if (array_key_exists($key, $local)) {
        return $local[$key];
    }
    $v = getenv($key);
    return $v === false ? $default : $v;
};

return [
    'app' => [
        'name'      => 'T.T.T Academy',
        'tagline'   => "Karnataka's trusted DCET coaching centre",
        // Public base URL without trailing slash, e.g. https://dcet.tttacademics.com
        'url'       => rtrim((string) $env('APP_URL', ''), '/'),
        // Sub-folder the site is served from ('' when at the domain root, '/ttt' when in a folder)
        'base_path' => rtrim((string) $env('APP_BASE_PATH', ''), '/'),
        // Optional CDN origin for /assets (e.g. https://cdn.example.com). Empty = same origin.
        'asset_url' => rtrim((string) $env('ASSET_URL', ''), '/'),
        'env'       => (string) $env('APP_ENV', 'production'),
        'timezone'  => 'Asia/Kolkata',
    ],
    'db' => [
        'host'    => (string) $env('DB_HOST', '127.0.0.1'),
        'port'    => (int) $env('DB_PORT', 3306),
        'name'    => (string) $env('DB_NAME', 'ttt_dcet'),
        'user'    => (string) $env('DB_USER', 'ttt_dcet'),
        'pass'    => (string) $env('DB_PASS', ''),
        'charset' => 'utf8mb4',
    ],
    'mail' => [
        // Where new admission enquiries are notified (leave empty to disable)
        'notify_to' => (string) $env('MAIL_NOTIFY_TO', ''),
        'from'      => (string) $env('MAIL_FROM', 'no-reply@tttacademics.com'),
    ],
    'security' => [
        // Max enquiries from one IP per hour
        'enquiry_rate_limit' => (int) $env('ENQUIRY_RATE_LIMIT', 6),
        // Failed logins allowed per 15 minutes per IP+username
        'login_max_attempts' => (int) $env('LOGIN_MAX_ATTEMPTS', 5),
        'upload_max_bytes'   => 20 * 1024 * 1024,
    ],
];
