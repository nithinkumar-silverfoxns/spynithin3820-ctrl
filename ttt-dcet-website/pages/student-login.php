<?php
if (current_user('student')) redirect('/student/dashboard');
$error = null;
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!verify_csrf()) {
        $error = 'Session expired. Please try again.';
    } elseif (!db()) {
        $error = 'Student login is temporarily unavailable. Please use the TTT Student Panel link below.';
    } else {
        $res = attempt_login('student', (string) ($_POST['login_id'] ?? ''), (string) ($_POST['password'] ?? ''));
        if ($res['ok']) redirect('/student/dashboard');
        $error = $res['error'];
    }
}
$error = $error ?? flash('error');
page_meta(['title' => 'Student Login | T.T.T Academy', 'description' => 'Log in to access T.T.T Academy DCET study materials.']);
header('X-Robots-Tag: noindex');
require ROOT . '/templates/header.php';
?>
<section class="page-hero" style="min-height:100svh;display:flex;align-items:center">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="orb orb-a" aria-hidden="true"></div>
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-6">
        <span class="eyebrow eyebrow-light">Student zone</span>
        <h1 class="display">Welcome back, <span class="text-grad">future topper.</span></h1>
        <p class="lead-x">Log in to download your batch study materials. Login details are shared by T.T.T Academy after admission confirmation.</p>
        <div class="d-flex flex-wrap gap-2 mt-4">
          <a class="btn-x btn-x-glass btn-x-sm" href="<?= e(setting('student_panel')) ?>" target="_blank" rel="noopener">TTT Student Panel (classes &amp; tests) <?= icon('external', 'ic ic-sm') ?></a>
          <a class="btn-x btn-x-glass btn-x-sm" href="<?= e(setting('app_android')) ?>" target="_blank" rel="noopener">T.T.T Live Learn app</a>
        </div>
      </div>
      <div class="col-lg-5 offset-lg-1">
        <form class="form-card form-x" method="post" action="<?= e(url('/student/login')) ?>" autocomplete="on">
          <h2 class="h4 mb-4">Student login</h2>
          <?= csrf_field() ?>
          <?php if ($error): ?><div class="form-status err" role="alert"><?= e($error) ?></div><?php endif; ?>
          <div class="mb-3"><label class="form-label" for="lid">Student ID or mobile number</label><input class="form-control" id="lid" name="login_id" required maxlength="80" autocomplete="username"></div>
          <div class="mb-4"><label class="form-label" for="pwd">Password</label><input class="form-control" id="pwd" name="password" type="password" required maxlength="200" autocomplete="current-password"></div>
          <button class="btn-x btn-x-primary w-100" type="submit">Log in <?= icon('arrow', 'ic ic-sm') ?></button>
          <p class="small muted mt-3 mb-0">Forgot your password? Contact the admission desk at <?= e(setting('phone_admission')) ?>.</p>
        </form>
      </div>
    </div>
  </div>
</section>
<?php require ROOT . '/templates/footer.php';
