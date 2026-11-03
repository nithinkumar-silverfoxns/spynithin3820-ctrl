<?php
declare(strict_types=1);

define('ROOT', dirname(__DIR__));

$GLOBALS['config'] = require ROOT . '/config/config.php';

date_default_timezone_set(config('app.timezone'));

if (config('app.env') === 'development') {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
}

require ROOT . '/app/helpers.php';
require ROOT . '/app/db.php';
require ROOT . '/app/content.php';
require ROOT . '/app/auth.php';

start_secure_session();
send_security_headers();

function config(string $key, $default = null)
{
    $node = $GLOBALS['config'];
    foreach (explode('.', $key) as $part) {
        if (!is_array($node) || !array_key_exists($part, $node)) {
            return $default;
        }
        $node = $node[$part];
    }
    return $node;
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE || PHP_SAPI === 'cli') {
        return;
    }
    session_name('ttt_sid');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => (config('app.base_path') ?: '') . '/',
        'secure'   => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}

function send_security_headers(): void
{
    if (headers_sent() || PHP_SAPI === 'cli') {
        return;
    }
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    if (is_https()) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }
    $cdn = config('app.asset_url') ? ' ' . config('app.asset_url') : '';
    header("Content-Security-Policy: default-src 'self'; "
        . "script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com{$cdn}; "
        . "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com{$cdn}; "
        . "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net{$cdn}; "
        . "img-src 'self' data: https://i.ytimg.com https://tttacademics.com{$cdn}; "
        . "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://www.google.com; "
        . "connect-src 'self'; media-src 'self' https:{$cdn}; "
        . "object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me; frame-ancestors 'self'");
}
