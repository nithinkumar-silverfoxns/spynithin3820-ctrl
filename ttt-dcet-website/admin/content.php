<?php
require __DIR__ . '/inc/boot.php';
require_admin();
admin_post_guard();
$key = (string) ($_GET['e'] ?? '');
$def = entities()[$key] ?? null;
if (!$def) { http_response_code(404); exit('Unknown content type'); }

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $id = (int) ($_POST['id'] ?? 0);
    if (($_POST['action'] ?? '') === 'delete') {
        db_exec("DELETE FROM `{$key}` WHERE id = ?", [$id]);
        flash('ok', $def['singular'] . ' deleted.');
    } elseif (($_POST['action'] ?? '') === 'toggle') {
        db_exec("UPDATE `{$key}` SET is_active = 1 - is_active WHERE id = ?", [$id]);
        flash('ok', 'Visibility updated.');
    }
    redirect('/admin/content.php?' . http_build_query(['e' => $key, 'q' => $_GET['q'] ?? '']));
}

$q = trim((string) ($_GET['q'] ?? ''));
$params = [];
$where = '1=1';
if ($q !== '') {
    $searchCols = array_filter($def['list'], fn($c) => in_array($def['fields'][$c]['type'] ?? '', ['text', 'select'], true));
    if ($searchCols) {
        $where = '(' . implode(' OR ', array_map(fn($c) => "`$c` LIKE ?", $searchCols)) . ')';
        $params = array_fill(0, count($searchCols), "%$q%");
    }
}
$rows = db_all("SELECT * FROM `{$key}` WHERE $where ORDER BY {$def['order']} LIMIT 500", $params);
admin_header($def['label'], 'content.php?e=' . $key);
?>
<div class="d-flex flex-wrap gap-2 mb-3">
  <a class="btn btn-primary" href="<?= e(admin_url('edit.php', ['e' => $key])) ?>">+ Add <?= e(strtolower($def['singular'])) ?></a>
  <form class="d-flex gap-2 ms-auto" method="get"><input type="hidden" name="e" value="<?= e($key) ?>"><input class="form-control form-control-sm" name="q" value="<?= e($q) ?>" placeholder="Search…" aria-label="Search"><button class="btn btn-sm btn-outline-secondary">Search</button></form>
</div>
<?php if (in_array($key, ['toppers', 'testimonials', 'rankers', 'results'], true)): ?>
<div class="alert alert-warning small">Only publish verified achievements and genuine testimonials, with the student’s consent. Names and ranks must match official results.</div>
<?php endif; ?>
<div class="adm-card p-0"><div class="table-responsive"><table class="table align-middle mb-0">
  <thead><tr><?php foreach ($def['list'] as $c): ?><th><?= e($def['fields'][$c]['label']) ?></th><?php endforeach; ?><th>Visible</th><th class="text-end">Actions</th></tr></thead>
  <tbody>
  <?php foreach ($rows as $r): ?>
    <tr>
      <?php foreach ($def['list'] as $c): ?><td><?= e(mb_strimwidth((string) $r[$c], 0, 70, '…')) ?></td><?php endforeach; ?>
      <td><form method="post" class="d-inline"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="action" value="toggle"><button class="btn btn-sm <?= $r['is_active'] ? 'btn-success' : 'btn-outline-secondary' ?>"><?= $r['is_active'] ? 'Yes' : 'No' ?></button></form></td>
      <td class="text-end text-nowrap">
        <a class="btn btn-sm btn-outline-primary" href="<?= e(admin_url('edit.php', ['e' => $key, 'id' => $r['id']])) ?>">Edit</a>
        <form method="post" class="d-inline" data-confirm="Delete this item permanently?"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="action" value="delete"><button class="btn btn-sm btn-outline-danger">Delete</button></form>
      </td>
    </tr>
  <?php endforeach; ?>
  <?php if (!$rows): ?><tr><td colspan="<?= count($def['list']) + 2 ?>" class="text-secondary p-3">Nothing here yet.</td></tr><?php endif; ?>
  </tbody>
</table></div></div>
<?php admin_footer();
