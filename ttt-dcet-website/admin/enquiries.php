<?php
require __DIR__ . '/inc/boot.php';
require_admin();
admin_post_guard();
$statuses = ['new', 'contacted', 'enrolled', 'closed'];

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $id = (int) ($_POST['id'] ?? 0);
    if (($_POST['action'] ?? '') === 'update' && in_array($_POST['status'] ?? '', $statuses, true)) {
        db_exec('UPDATE enquiries SET status = ?, admin_note = ? WHERE id = ?', [$_POST['status'], mb_substr((string) ($_POST['admin_note'] ?? ''), 0, 2000), $id]);
        flash('ok', 'Enquiry updated.');
    } elseif (($_POST['action'] ?? '') === 'delete') {
        db_exec('DELETE FROM enquiries WHERE id = ?', [$id]);
        flash('ok', 'Enquiry deleted.');
    }
    redirect('/admin/enquiries.php?' . http_build_query(array_intersect_key($_GET, array_flip(['status', 'type', 'q', 'page']))));
}

$where = ['1=1'];
$params = [];
if (in_array($_GET['status'] ?? '', $statuses, true)) { $where[] = 'status = ?'; $params[] = $_GET['status']; }
if (in_array($_GET['type'] ?? '', ['admission', 'demo', 'contact'], true)) { $where[] = 'type = ?'; $params[] = $_GET['type']; }
if (($q = trim((string) ($_GET['q'] ?? ''))) !== '') { $where[] = '(name LIKE ? OR phone LIKE ? OR email LIKE ?)'; array_push($params, "%$q%", "%$q%", "%$q%"); }
$w = implode(' AND ', $where);

if (isset($_GET['export'])) {
    $rows = db_all("SELECT id, created_at, type, status, name, phone, email, course, branch, mode, diploma, preferred_date, slot, message, admin_note FROM enquiries WHERE $w ORDER BY id DESC", $params);
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="ttt-enquiries-' . date('Ymd-His') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, array_keys($rows[0] ?? ['id' => 0]));
    foreach ($rows as $r) {
        // Neutralise spreadsheet formula injection
        fputcsv($out, array_map(fn($v) => is_string($v) && preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v, $r));
    }
    exit;
}

$page = max(1, (int) ($_GET['page'] ?? 1));
$per = 25;
$total = (int) db_one("SELECT COUNT(*) c FROM enquiries WHERE $w", $params)['c'];
$rows = db_all("SELECT * FROM enquiries WHERE $w ORDER BY id DESC LIMIT $per OFFSET " . (($page - 1) * $per), $params);

admin_header('Enquiries', 'enquiries.php');
?>
<form class="adm-card d-flex flex-wrap gap-2 align-items-end mb-3" method="get">
  <div><label class="form-label small" for="fq">Search</label><input class="form-control form-control-sm" id="fq" name="q" value="<?= e($q) ?>" placeholder="Name, phone, email"></div>
  <div><label class="form-label small" for="fs">Status</label><select class="form-select form-select-sm" id="fs" name="status"><option value="">All</option><?php foreach ($statuses as $s): ?><option <?= ($_GET['status'] ?? '') === $s ? 'selected' : '' ?>><?= $s ?></option><?php endforeach; ?></select></div>
  <div><label class="form-label small" for="ft">Type</label><select class="form-select form-select-sm" id="ft" name="type"><option value="">All</option><?php foreach (['admission', 'demo', 'contact'] as $t): ?><option <?= ($_GET['type'] ?? '') === $t ? 'selected' : '' ?>><?= $t ?></option><?php endforeach; ?></select></div>
  <button class="btn btn-sm btn-primary">Filter</button>
  <a class="btn btn-sm btn-outline-secondary ms-auto" href="?<?= e(http_build_query(array_merge($_GET, ['export' => 1]))) ?>">Export CSV</a>
</form>
<p class="small text-secondary"><?= $total ?> enquiries</p>
<div class="d-grid gap-2">
<?php foreach ($rows as $r): ?>
  <details class="adm-card p-0">
    <summary class="d-flex flex-wrap gap-3 align-items-center p-3">
      <span class="badge st-<?= e($r['status']) ?>"><?= e($r['status']) ?></span>
      <strong><?= e($r['name']) ?></strong>
      <a href="<?= e(tel_link($r['phone'])) ?>"><?= e($r['phone']) ?></a>
      <span class="badge bg-light text-dark"><?= e($r['type']) ?></span>
      <span class="small text-secondary"><?= e($r['course']) ?></span>
      <span class="small text-secondary ms-auto"><?= e(date('d M Y, H:i', strtotime($r['created_at']))) ?></span>
    </summary>
    <div class="px-3 pb-3">
      <dl class="row small mb-3">
        <?php foreach (['email' => 'Email', 'branch' => 'Branch', 'mode' => 'Mode', 'diploma' => 'Diploma', 'preferred_date' => 'Demo date', 'slot' => 'Slot', 'message' => 'Message', 'source_page' => 'Page'] as $k => $l): if (!$r[$k]) continue; ?>
        <dt class="col-sm-2"><?= e($l) ?></dt><dd class="col-sm-10"><?= nl2br(e($r[$k])) ?></dd>
        <?php endforeach; ?>
      </dl>
      <div class="d-flex flex-wrap gap-2">
        <form method="post" class="d-flex flex-wrap gap-2 align-items-start flex-grow-1">
          <?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="action" value="update">
          <select class="form-select form-select-sm w-auto" name="status" aria-label="Status"><?php foreach ($statuses as $s): ?><option <?= $r['status'] === $s ? 'selected' : '' ?>><?= $s ?></option><?php endforeach; ?></select>
          <input class="form-control form-control-sm flex-grow-1" name="admin_note" value="<?= e($r['admin_note']) ?>" placeholder="Internal note" aria-label="Internal note">
          <button class="btn btn-sm btn-primary">Save</button>
          <a class="btn btn-sm btn-success" href="<?= e('https://wa.me/91' . $r['phone']) ?>" target="_blank" rel="noopener">WhatsApp</a>
        </form>
        <form method="post" data-confirm="Delete this enquiry permanently?"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="action" value="delete"><button class="btn btn-sm btn-outline-danger">Delete</button></form>
      </div>
    </div>
  </details>
<?php endforeach; ?>
<?php if (!$rows): ?><div class="adm-card text-secondary">No enquiries match.</div><?php endif; ?>
</div>
<?php if ($total > $per): ?>
<nav class="mt-3 d-flex gap-2"><?php for ($i = 1; $i <= ceil($total / $per); $i++): ?><a class="btn btn-sm <?= $i === $page ? 'btn-primary' : 'btn-outline-secondary' ?>" href="?<?= e(http_build_query(array_merge($_GET, ['page' => $i]))) ?>"><?= $i ?></a><?php endfor; ?></nav>
<?php endif; ?>
<?php admin_footer();
