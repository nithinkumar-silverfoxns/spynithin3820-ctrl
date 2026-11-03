<?php
require __DIR__ . '/inc/boot.php';
require_admin();
admin_post_guard();
$newPass = null;

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $action = $_POST['action'] ?? '';
    $id = (int) ($_POST['id'] ?? 0);
    $gen = fn() => substr(str_replace(['+', '/', '='], '', base64_encode(random_bytes(12))), 0, 12);
    if ($action === 'create') {
        $login = strtolower(trim((string) ($_POST['login_id'] ?? '')));
        $name = trim((string) ($_POST['name'] ?? ''));
        if (!preg_match('/^[a-z0-9._@-]{4,80}$/', $login) || mb_strlen($name) < 2) {
            flash('err', 'Enter a name and a login ID (4–80 chars: letters, numbers, . _ @ -).');
        } elseif (db_one('SELECT id FROM students WHERE login_id = ?', [$login])) {
            flash('err', 'That login ID is already in use.');
        } else {
            $pass = $gen();
            db_exec('INSERT INTO students (login_id, name, phone, email, batch, password_hash) VALUES (?,?,?,?,?,?)', [$login, mb_substr($name, 0, 120), mb_substr((string) ($_POST['phone'] ?? ''), 0, 15) ?: null, mb_substr((string) ($_POST['email'] ?? ''), 0, 120) ?: null, mb_substr((string) ($_POST['batch'] ?? ''), 0, 120) ?: null, password_hash($pass, PASSWORD_DEFAULT)]);
            $newPass = [$login, $pass];
        }
    } elseif ($action === 'reset' && $id) {
        $pass = $gen();
        db_exec('UPDATE students SET password_hash = ? WHERE id = ?', [password_hash($pass, PASSWORD_DEFAULT), $id]);
        $newPass = [db_one('SELECT login_id FROM students WHERE id = ?', [$id])['login_id'] ?? '', $pass];
    } elseif ($action === 'toggle' && $id) {
        db_exec('UPDATE students SET is_active = 1 - is_active WHERE id = ?', [$id]);
        flash('ok', 'Student access updated.');
    } elseif ($action === 'delete' && $id) {
        db_exec('DELETE FROM students WHERE id = ?', [$id]);
        flash('ok', 'Student removed.');
    }
    if (!$newPass) redirect('/admin/students.php');
}
$rows = db_all('SELECT * FROM students ORDER BY id DESC LIMIT 1000');
$batches = array_map(fn($c) => $c['name'] . ' – ' . $c['type_label'], courses());
admin_header('Students', 'students.php');
?>
<?php if ($newPass): ?><div class="alert alert-success">Login for <strong><?= e($newPass[0]) ?></strong> — temporary password: <code class="fs-6"><?= e($newPass[1]) ?></code><br><span class="small">Share it with the student securely. It will not be shown again.</span></div><?php endif; ?>
<form class="adm-card mb-4" method="post">
  <?= csrf_field() ?><input type="hidden" name="action" value="create">
  <h2 class="h6 mb-3">Add student login</h2>
  <div class="row g-2">
    <div class="col-md-3"><input class="form-control" name="name" placeholder="Student name *" required aria-label="Student name"></div>
    <div class="col-md-2"><input class="form-control" name="login_id" placeholder="Login ID *" required aria-label="Login ID"></div>
    <div class="col-md-2"><input class="form-control" name="phone" placeholder="Mobile" aria-label="Mobile"></div>
    <div class="col-md-2"><input class="form-control" name="email" type="email" placeholder="Email" aria-label="Email"></div>
    <div class="col-md-2"><select class="form-select" name="batch" aria-label="Batch"><option value="">Batch…</option><?php foreach ($batches as $b): ?><option><?= e($b) ?></option><?php endforeach; ?></select></div>
    <div class="col-md-1"><button class="btn btn-primary w-100">Add</button></div>
  </div>
</form>
<div class="adm-card p-0"><div class="table-responsive"><table class="table align-middle mb-0">
  <thead><tr><th>Name</th><th>Login ID</th><th>Batch</th><th>Last login</th><th>Active</th><th class="text-end">Actions</th></tr></thead>
  <tbody>
  <?php foreach ($rows as $r): ?>
  <tr><td><?= e($r['name']) ?><div class="small text-secondary"><?= e($r['phone']) ?></div></td><td><code><?= e($r['login_id']) ?></code></td><td class="small"><?= e($r['batch']) ?></td><td class="small text-secondary"><?= $r['last_login_at'] ? e(date('d M Y H:i', strtotime($r['last_login_at']))) : '—' ?></td>
    <td><form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="toggle"><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><button class="btn btn-sm <?= $r['is_active'] ? 'btn-success' : 'btn-outline-secondary' ?>"><?= $r['is_active'] ? 'Yes' : 'No' ?></button></form></td>
    <td class="text-end text-nowrap">
      <form method="post" class="d-inline" data-confirm="Generate a new password for this student?"><?= csrf_field() ?><input type="hidden" name="action" value="reset"><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><button class="btn btn-sm btn-outline-primary">Reset password</button></form>
      <form method="post" class="d-inline" data-confirm="Remove this student login?"><?= csrf_field() ?><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><button class="btn btn-sm btn-outline-danger">Delete</button></form>
    </td></tr>
  <?php endforeach; ?>
  <?php if (!$rows): ?><tr><td colspan="6" class="text-secondary p-3">No students yet.</td></tr><?php endif; ?>
  </tbody>
</table></div></div>
<?php admin_footer();
