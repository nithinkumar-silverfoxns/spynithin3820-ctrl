<?php
require __DIR__ . '/inc/boot.php';
require_admin();
admin_post_guard();
$labels = [
    'admission_year' => 'Admission banner label (e.g. DCET 2027)', 'phone_primary' => 'Primary phone', 'phone_admission' => 'Admission phone',
    'whatsapp' => 'WhatsApp number (with country code, digits only)', 'email' => 'Public email', 'email_branches' => 'Branch email', 'address' => 'Head office address',
    'prize_first' => 'Cash prize — State 1st rank', 'prize_second' => 'Cash prize — State 2nd rank',
    'hero_video' => 'Home hero background video (MP4 URL or uploads/… path; leave empty for photo slideshow)',
    'instagram' => 'Instagram URL', 'youtube' => 'YouTube URL', 'linkedin' => 'LinkedIn URL', 'app_android' => 'Android app URL', 'app_ios' => 'iOS app URL',
    'student_panel' => 'External TTT Student Panel URL', 'publications' => 'T.T.T Publications URL',
];
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $bad = [];
    foreach ($labels as $k => $l) {
        $v = trim(mb_substr((string) ($_POST[$k] ?? ''), 0, 1000));
        $isUrl = in_array($k, ['instagram', 'youtube', 'linkedin', 'app_android', 'app_ios', 'student_panel', 'publications'], true);
        if ($isUrl && $v !== '' && !preg_match('#^https://#', $v)) { $bad[] = $l; continue; }
        if ($k === 'hero_video' && $v !== '' && !preg_match('#^(https://|uploads/)#', $v)) { $bad[] = $l; continue; }
        if ($k === 'whatsapp') $v = preg_replace('/\D+/', '', $v);
        db_exec('INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)', [$k, $v]);
    }
    $bad ? flash('err', 'Not saved (must be https:// links): ' . implode(', ', $bad)) : flash('ok', 'Settings saved.');
    redirect('/admin/settings.php');
}
$s = settings();
admin_header('Site settings', 'settings.php');
?>
<form class="adm-card" method="post"><?= csrf_field() ?>
  <div class="row g-3">
  <?php foreach ($labels as $k => $l): ?>
    <div class="col-md-6"><label class="form-label" for="s_<?= e($k) ?>"><?= e($l) ?></label><input class="form-control" id="s_<?= e($k) ?>" name="<?= e($k) ?>" value="<?= e($s[$k] ?? '') ?>"></div>
  <?php endforeach; ?>
  </div>
  <button class="btn btn-primary mt-4">Save settings</button>
</form>
<?php admin_footer();
