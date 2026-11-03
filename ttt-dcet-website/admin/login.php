<?php
require __DIR__ . '/inc/boot.php';
if (current_user('admin')) redirect('/admin/index.php');
$error = null;
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!verify_csrf()) $error = 'Session expired — please try again.';
    elseif (!db()) $error = 'Database is not configured. Run database/install.php first.';
    else {
        $r = attempt_login('admin', (string) ($_POST['username'] ?? ''), (string) ($_POST['password'] ?? ''));
        if ($r['ok']) redirect('/admin/index.php');
        $error = $r['error'];
    }
}
admin_header('Admin login');
?>
<form class="adm-card adm-login" method="post" autocomplete="on">
  <img src="<?= e(asset('assets/img/brand/mark.webp')) ?>" alt="T.T.T Academy" width="56" height="56">
  <h1 class="h4 mt-3 mb-1">T.T.T Academy admin</h1>
  <p class="text-secondary small mb-4">Manage enquiries, toppers, results and site content.</p>
  <?= csrf_field() ?>
  <?php if ($error): ?><div class="alert alert-danger py-2"><?= e($error) ?></div><?php endif; ?>
  <label class="form-label" for="u">Username</label>
  <input class="form-control mb-3" id="u" name="username" required autocomplete="username" maxlength="60" autofocus>
  <label class="form-label" for="p">Password</label>
  <input class="form-control mb-4" id="p" name="password" type="password" required autocomplete="current-password" maxlength="200">
  <button class="btn btn-primary w-100" type="submit">Log in</button>
</form>
<?php admin_footer();
