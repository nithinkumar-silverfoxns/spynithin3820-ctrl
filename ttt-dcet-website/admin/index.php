<?php
require __DIR__ . '/inc/boot.php';
require_admin();
$stats = db_one("SELECT COUNT(*) total, SUM(status='new') fresh, SUM(type='demo') demos, SUM(created_at > NOW() - INTERVAL 7 DAY) week FROM enquiries");
$recent = db_all('SELECT id, type, status, name, phone, course, created_at FROM enquiries ORDER BY id DESC LIMIT 8');
$counts = [];
foreach (array_keys(entities()) as $t) $counts[$t] = (int) db_one("SELECT COUNT(*) c FROM `{$t}`")['c'];
admin_header('Dashboard', 'index.php');
?>
<div class="row g-3 mb-4">
  <?php foreach ([['New enquiries', $stats['fresh'] ?? 0], ['Last 7 days', $stats['week'] ?? 0], ['Demo bookings', $stats['demos'] ?? 0], ['All enquiries', $stats['total'] ?? 0]] as [$l, $v]): ?>
  <div class="col-6 col-lg-3"><div class="adm-card"><div class="adm-kpi"><?= (int) $v ?></div><div class="text-secondary small"><?= e($l) ?></div></div></div>
  <?php endforeach; ?>
</div>
<div class="row g-4">
  <div class="col-lg-8">
    <div class="adm-card">
      <div class="d-flex justify-content-between align-items-center mb-3"><h2 class="h6 m-0">Latest enquiries</h2><a href="<?= e(admin_url('enquiries.php')) ?>">View all →</a></div>
      <div class="table-responsive"><table class="table table-sm align-middle mb-0">
        <thead><tr><th>Name</th><th>Phone</th><th>Type</th><th>Course</th><th>Status</th><th>When</th></tr></thead>
        <tbody><?php foreach ($recent as $r): ?><tr><td><?= e($r['name']) ?></td><td><a href="<?= e(tel_link($r['phone'])) ?>"><?= e($r['phone']) ?></a></td><td><?= e($r['type']) ?></td><td class="small"><?= e($r['course']) ?></td><td><span class="badge st-<?= e($r['status']) ?>"><?= e($r['status']) ?></span></td><td class="small text-secondary"><?= e(date('d M, H:i', strtotime($r['created_at']))) ?></td></tr><?php endforeach; ?>
        <?php if (!$recent): ?><tr><td colspan="6" class="text-secondary">No enquiries yet.</td></tr><?php endif; ?></tbody>
      </table></div>
    </div>
  </div>
  <div class="col-lg-4">
    <div class="adm-card">
      <h2 class="h6 mb-3">Content</h2>
      <ul class="list-unstyled m-0">
        <?php foreach (entities() as $k => $d): ?><li class="d-flex justify-content-between py-1 border-bottom"><a href="<?= e(admin_url('content.php', ['e' => $k])) ?>"><?= e($d['label']) ?></a><span class="text-secondary"><?= $counts[$k] ?></span></li><?php endforeach; ?>
      </ul>
    </div>
  </div>
</div>
<?php admin_footer();
