<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/app/bootstrap.php';
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

function admin_post_guard(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        return;
    }
    if (!verify_csrf()) {
        http_response_code(419);
        exit('Invalid or expired form token. Go back, refresh and try again.');
    }
}

function admin_url(string $file, array $q = []): string
{
    return url('/admin/' . $file) . ($q ? '?' . http_build_query($q) : '');
}

function admin_header(string $title, string $active = ''): void
{
    $u = current_user('admin');
    $nav = ['index.php' => ['Dashboard', 'chart'], 'enquiries.php' => ['Enquiries', 'mail'], 'students.php' => ['Students', 'users']];
    foreach (entities() as $k => $d) {
        $nav['content.php?e=' . $k] = [$d['label'], 'book'];
    }
    $nav['settings.php'] = ['Site settings', 'cpu'];
    $nav['account.php'] = ['My account', 'lock'];
    ?><!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?> · T.T.T Admin</title>
<link rel="icon" href="<?= e(asset('favicon.png')) ?>">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="<?= e(asset('admin/admin.css')) ?>" rel="stylesheet">
</head><body>
<?php if ($u): ?>
<div class="adm">
  <aside class="adm-side">
    <a class="adm-brand" href="<?= e(admin_url('index.php')) ?>"><img src="<?= e(asset('assets/img/brand/mark.webp')) ?>" alt="" width="36" height="36"> <span>T.T.T Admin</span></a>
    <nav>
      <?php foreach ($nav as $href => [$label, $ic]): ?>
      <a class="<?= $active === $href ? 'on' : '' ?>" href="<?= e(url('/admin/' . $href)) ?>"><?= icon($ic, 'ic') ?> <?= e($label) ?></a>
      <?php endforeach; ?>
    </nav>
    <div class="adm-side-foot">
      <a href="<?= e(url('/')) ?>" target="_blank" rel="noopener"><?= icon('external', 'ic') ?> View website</a>
      <form method="post" action="<?= e(admin_url('logout.php')) ?>"><?= csrf_field() ?><button type="submit"><?= icon('logout', 'ic') ?> Log out (<?= e($u['name']) ?>)</button></form>
    </div>
  </aside>
  <main class="adm-main">
    <h1 class="adm-title"><?= e($title) ?></h1>
    <?php if ($m = flash('ok')): ?><div class="alert alert-success"><?= e($m) ?></div><?php endif; ?>
    <?php if ($m = flash('err')): ?><div class="alert alert-danger"><?= e($m) ?></div><?php endif; ?>
<?php else: ?>
<div class="adm-auth">
<?php endif;
}

function admin_footer(): void
{
    echo current_user('admin') ? '</main></div>' : '</div>';
    echo '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous" defer></script>';
    echo '<script src="' . e(asset('admin/admin.js')) . '" defer></script></body></html>';
}

/**
 * Handle an uploaded image/PDF safely.
 * Images are validated by content (finfo) and re-encoded to WebP when GD supports it.
 * Returns the stored path ('uploads/public/…' or 'private:…') or null when nothing was uploaded.
 * @throws RuntimeException on invalid uploads
 */
function handle_upload(string $field, string $kind, bool $private = false): ?string
{
    if (empty($_FILES[$field]) || ($_FILES[$field]['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $f = $_FILES[$field];
    if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) {
        throw new RuntimeException('Upload failed (error ' . (int) $f['error'] . ').');
    }
    if ($f['size'] > config('security.upload_max_bytes')) {
        throw new RuntimeException('File is too large (max 20 MB).');
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $name = bin2hex(random_bytes(10));

    if ($kind === 'image') {
        $ok = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
        if (!isset($ok[$mime]) || !@getimagesize($f['tmp_name'])) {
            throw new RuntimeException('Please upload a JPG, PNG, WebP or GIF image.');
        }
        $dir = 'uploads/public/' . date('Y/m');
        @mkdir(ROOT . '/' . $dir, 0755, true);
        // Re-encode to WebP (strips metadata and any embedded payloads)
        if (function_exists('imagewebp') && function_exists('imagecreatefromstring')) {
            $im = @imagecreatefromstring((string) file_get_contents($f['tmp_name']));
            if ($im) {
                $w = imagesx($im);
                if ($w > 1800) {
                    $im2 = imagescale($im, 1800);
                    imagedestroy($im);
                    $im = $im2;
                }
                imagepalettetotruecolor($im);
                imagealphablending($im, true);
                imagesavealpha($im, true);
                $rel = $dir . '/' . $name . '.webp';
                imagewebp($im, ROOT . '/' . $rel, 82);
                imagedestroy($im);
                return $rel;
            }
        }
        $rel = $dir . '/' . $name . '.' . $ok[$mime];
        move_uploaded_file($f['tmp_name'], ROOT . '/' . $rel);
        return $rel;
    }

    if ($mime !== 'application/pdf') {
        throw new RuntimeException('Please upload a PDF file.');
    }
    if ($private) {
        move_uploaded_file($f['tmp_name'], ROOT . '/storage/private/' . $name . '.pdf');
        return 'private:' . $name . '.pdf';
    }
    $dir = 'uploads/public/' . date('Y/m');
    @mkdir(ROOT . '/' . $dir, 0755, true);
    $rel = $dir . '/' . $name . '.pdf';
    move_uploaded_file($f['tmp_name'], ROOT . '/' . $rel);
    return $rel;
}
