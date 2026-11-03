<?php
/**
 * Serves study materials. Public materials redirect to their URL; student-only
 * materials require login. Uploaded private files live in storage/private (not web-accessible).
 */
$id = (int) ($_GET['id'] ?? 0);
$m = db() ? db_one('SELECT * FROM materials WHERE id = ? AND is_active = 1', [$id]) : null;
if (!$m) {
    http_response_code(404);
    require ROOT . '/pages/404.php';
    return;
}
if ($m['access'] === 'students') {
    require_student();
}
$file = (string) $m['file'];
if (preg_match('#^https?://#', $file)) {
    redirect($file);
}
if (str_starts_with($file, 'private:')) {
    $path = realpath(ROOT . '/storage/private/' . basename(substr($file, 8)));
    if (!$path || !str_starts_with($path, realpath(ROOT . '/storage/private')) || !is_file($path)) {
        http_response_code(404);
        exit('File not found.');
    }
    header('Content-Type: application/pdf');
    header('Content-Length: ' . filesize($path));
    header('Content-Disposition: attachment; filename="' . preg_replace('/[^A-Za-z0-9._-]+/', '-', $m['title']) . '.pdf"');
    header('Cache-Control: private, no-store');
    header('X-Content-Type-Options: nosniff');
    readfile($path);
    exit;
}
redirect('/' . ltrim($file, '/'));
