<?php
declare(strict_types=1);

/** HTML-escape. */
function e($value): string
{
    return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Site-relative URL honouring the configured base path. */
function url(string $path = ''): string
{
    $path = '/' . ltrim($path, '/');
    return (config('app.base_path') ?: '') . ($path === '/' ? '/' : $path);
}

/** Absolute URL (for canonical / OG tags). */
function abs_url(string $path = ''): string
{
    $base = config('app.url');
    if (!$base) {
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $base = (is_https() ? 'https://' : 'http://') . $host;
    }
    if (preg_match('#^https?://#', $path)) {
        return $path;
    }
    return $base . url($path);
}

/** Asset URL with optional CDN origin and cache-busting version. */
function asset(string $path): string
{
    $path = ltrim($path, '/');
    $file = ROOT . '/' . $path;
    $v = is_file($file) ? '?v=' . substr(md5((string) filemtime($file)), 0, 8) : '';
    $cdn = config('app.asset_url');
    return ($cdn ?: (config('app.base_path') ?: '')) . '/' . $path . $v;
}

/** Resolve an image reference that may be a local asset path, an upload, or an absolute URL. */
function media_url(?string $path): string
{
    if (!$path) {
        return '';
    }
    if (preg_match('#^https?://#', $path)) {
        return $path;
    }
    return asset($path);
}

/**
 * Responsive, lazy-loaded <img>. Width/height are read from the file so the
 * browser reserves space (no layout shift).
 */
function img(?string $path, string $alt, string $class = '', array $attrs = []): string
{
    if (!$path) {
        return '';
    }
    static $dims = [];
    $local = ROOT . '/' . ltrim($path, '/');
    if (!isset($dims[$path]) && !preg_match('#^https?://#', $path) && is_file($local)) {
        $info = @getimagesize($local);
        $dims[$path] = $info ? [$info[0], $info[1]] : null;
    }
    $attrs += ['loading' => 'lazy', 'decoding' => 'async'];
    if (!empty($dims[$path])) {
        $attrs += ['width' => $dims[$path][0], 'height' => $dims[$path][1]];
    }
    $html = '<img src="' . e(media_url($path)) . '" alt="' . e($alt) . '"';
    if ($class !== '') {
        $html .= ' class="' . e($class) . '"';
    }
    foreach ($attrs as $k => $v) {
        if ($v === null || $v === false) {
            continue;
        }
        $html .= ' ' . e($k) . '="' . e($v) . '"';
    }
    return $html . '>';
}

function redirect(string $to, int $code = 302): never
{
    header('Location: ' . (preg_match('#^https?://#', $to) ? $to : url($to)), true, $code);
    exit;
}

function json_response(array $data, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* ---------- CSRF ---------- */

function csrf_token(): string
{
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): bool
{
    $sent = $_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    return is_string($sent) && !empty($_SESSION['_csrf']) && hash_equals($_SESSION['_csrf'], $sent);
}

/* ---------- Flash messages ---------- */

function flash(string $key, ?string $message = null): ?string
{
    if ($message !== null) {
        $_SESSION['_flash'][$key] = $message;
        return null;
    }
    $msg = $_SESSION['_flash'][$key] ?? null;
    unset($_SESSION['_flash'][$key]);
    return $msg;
}

function client_ip(): string
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 45);
}

/* ---------- Page meta (title / description / canonical / schema) ---------- */

function page_meta(?array $set = null): array
{
    static $meta = [
        'title'       => "T.T.T Academy | Karnataka's No.1 DCET Coaching Centre, Bengaluru",
        'description' => 'DCET coaching in Bengaluru by T.T.T Academy — State 1st rank in DCET 2023 & 2025, 437 students under 2000 rank in DCET 2026. Pratigna, Jnana & Pragathi batches, online & offline.',
        'image'       => 'assets/img/courses/admissions-open-2027.webp',
        'path'        => '/',
        'schema'      => [],
        'body_class'  => '',
    ];
    if ($set !== null) {
        $meta = array_merge($meta, $set);
    }
    return $meta;
}

/* ---------- Contact helpers ---------- */

function setting(string $key, string $default = ''): string
{
    $all = settings();
    return isset($all[$key]) && $all[$key] !== '' ? (string) $all[$key] : $default;
}

function wa_link(string $text = ''): string
{
    $num = preg_replace('/\D+/', '', setting('whatsapp', '919986869955'));
    return 'https://wa.me/' . $num . ($text !== '' ? '?text=' . rawurlencode($text) : '');
}

function tel_link(string $phone): string
{
    return 'tel:+' . ltrim(preg_replace('/\D+/', '', $phone), '+');
}

function ordinal(int $n): string
{
    $s = ['th', 'st', 'nd', 'rd'];
    $v = $n % 100;
    return $n . ($s[($v - 20) % 10] ?? $s[$v] ?? $s[0]);
}

/** Queue a page-specific script (local asset path) to load after the core bundle. */
function page_script(string $src, bool $module = false): void
{
    $GLOBALS['page_scripts'][] = ['src' => $src, 'module' => $module];
}

/** Render a template partial with local variables. */
function partial(string $name, array $vars = []): void
{
    extract($vars, EXTR_SKIP);
    require ROOT . '/templates/partials/' . $name . '.php';
}

function youtube_thumb(string $id): string
{
    return 'https://i.ytimg.com/vi/' . rawurlencode($id) . '/hqdefault.jpg';
}

/** Simple inline SVG icon set (stroke icons, 24px grid). */
function icon(string $name, string $class = 'ic'): string
{
    static $p = [
        'arrow'    => '<path d="M5 12h14M13 6l6 6-6 6"/>',
        'play'     => '<path d="M8 5.5v13l11-6.5z"/>',
        'phone'    => '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
        'whatsapp' => '<path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.6z"/><path d="M9 9.5c.3 2 2.4 4.2 4.5 4.6l1.2-1.2 1.8.9c-.3 1-1.2 1.7-2.2 1.6-3.3-.3-6.6-3.6-6.8-6.8 0-1 .6-1.9 1.6-2.2l.9 1.8z"/>',
        'mail'     => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
        'pin'      => '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
        'check'    => '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
        'clock'    => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        'book'     => '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
        'test'     => '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
        'video'    => '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
        'users'    => '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
        'trophy'   => '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/>',
        'chart'    => '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
        'calc'     => '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
        'compass'  => '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
        'download' => '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
        'lock'     => '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        'calendar' => '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
        'building' => '<path d="M4 21V5l8-2v18M12 7l8 2v12M8 9h.01M8 13h.01M8 17h.01M16 13h.01M16 17h.01M2 21h20"/>',
        'sparkle'  => '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
        'menu'     => '<path d="M4 7h16M4 12h16M4 17h16"/>',
        'close'    => '<path d="M6 6l12 12M18 6L6 18"/>',
        'search'   => '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
        'star'     => '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
        'shield'   => '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
        'cpu'      => '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
        'home'     => '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
        'quote'    => '<path d="M7 7h4v4c0 3-1.5 5-4 6M14 7h4v4c0 3-1.5 5-4 6"/>',
        'chevron'  => '<path d="M9 6l6 6-6 6"/>',
        'external' => '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
        'logout'   => '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10"/>',
        'instagram'=> '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
        'youtube'  => '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9v6l5-3z"/>',
        'linkedin' => '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7h.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    ];
    return '<svg class="' . e($class) . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' . ($p[$name] ?? '') . '</svg>';
}
