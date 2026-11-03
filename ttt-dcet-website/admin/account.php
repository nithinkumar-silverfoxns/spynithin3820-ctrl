<?php
require __DIR__ . '/inc/boot.php';
$u = require_admin();
admin_post_guard();
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $me = db_one('SELECT * FROM admins WHERE id = ?', [$u['id']]);
    $new = (string) ($_POST['new'] ?? '');
    if (!password_verify((string) ($_POST['current'] ?? ''), $me['password_hash'])) flash('err', 'Current password is incorrect.');
    elseif (strlen($new) < 10) flash('err', 'New password must be at least 10 characters.');
    elseif ($new !== ($_POST['confirm'] ?? '')) flash('err', 'New passwords do not match.');
    else {
        db_exec('UPDATE admins SET password_hash = ? WHERE id = ?', [password_hash($new, PASSWORD_DEFAULT), $u['id']]);
        session_regenerate_id(true);
        flash('ok', 'Password changed.');
    }
    redirect('/admin/account.php');
}
admin_header('My account', 'account.php');
?>
<form class="adm-card" method="post" style="max-width:480px"><?= csrf_field() ?>
  <h2 class="h6 mb-3">Change password</h2>
  <label class="form-label" for="c">Current password</label><input class="form-control mb-3" id="c" name="current" type="password" required autocomplete="current-password">
  <label class="form-label" for="n">New password (min. 10 characters)</label><input class="form-control mb-3" id="n" name="new" type="password" required minlength="10" autocomplete="new-password">
  <label class="form-label" for="r">Repeat new password</label><input class="form-control mb-4" id="r" name="confirm" type="password" required minlength="10" autocomplete="new-password">
  <button class="btn btn-primary">Update password</button>
</form>
<?php admin_footer();
