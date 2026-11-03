<?php
$u = require_student();
$student = db_one('SELECT name, batch, login_id FROM students WHERE id = ?', [$u['id']]);
$materials = db_all("SELECT id, title, description, category, access FROM materials WHERE is_active = 1 ORDER BY sort_order, id");
$cats = ['syllabus' => 'Syllabus', 'pyq' => 'Previous year papers', 'notes' => 'Notes', 'mock' => 'Mock tests', 'guide' => 'Guides & counselling'];
page_meta(['title' => 'My Dashboard | T.T.T Academy Student Zone', 'description' => 'T.T.T Academy student dashboard.']);
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Student zone',
    'title' => 'Hi ' . e(explode(' ', (string) $student['name'])[0]) . ', <span class="text-grad">keep climbing.</span>',
    'lead' => ($student['batch'] ? 'Batch: ' . $student['batch'] . '. ' : '') . 'Your study materials are below. Live classes, tests and results are in the TTT Student Panel.',
    'crumbs' => ['Student dashboard' => null],
    'actions' => '<a class="btn-x btn-x-primary" href="' . e(setting('student_panel')) . '" target="_blank" rel="noopener">Open TTT Student Panel ' . icon('external', 'ic ic-sm') . '</a><a class="btn-x btn-x-glass" href="' . e(url('/student/logout')) . '">' . icon('logout', 'ic ic-sm') . ' Log out</a>',
]);
?>
<section class="sec">
  <div class="container-xl">
    <div class="row g-4">
      <?php foreach ($materials as $m): ?>
      <div class="col-md-6 col-lg-4"><div class="card-x d-flex flex-column">
        <span class="chip align-self-start mb-3"><?= e($cats[$m['category']] ?? $m['category']) ?></span>
        <h3><?= e($m['title']) ?></h3><p class="muted small"><?= e($m['description']) ?></p>
        <a class="btn-x btn-x-dark btn-x-sm mt-auto align-self-start" href="<?= e(url('/student/download?id=' . (int) $m['id'])) ?>"><?= icon('download', 'ic ic-sm') ?> Download</a>
      </div></div>
      <?php endforeach; ?>
      <?php if (!$materials): ?><p class="muted">No materials have been published yet.</p><?php endif; ?>
    </div>
    <div class="row g-4 mt-4">
      <div class="col-md-4"><a class="tool-card" href="<?= e(url('/dcet-rank-predictor')) ?>"><span class="b-icon"><?= icon('calc') ?></span><h3>Rank predictor</h3><p>Estimate your DCET rank.</p></a></div>
      <div class="col-md-4"><a class="tool-card" href="<?= e(url('/college-cutoffs')) ?>"><span class="b-icon"><?= icon('building') ?></span><h3>College cutoffs</h3><p>Plan your counselling options.</p></a></div>
      <div class="col-md-4"><a class="tool-card" href="<?= e(url('/dcet-syllabus')) ?>"><span class="b-icon"><?= icon('book') ?></span><h3>Syllabus explorer</h3><p>Track subject-wise focus areas.</p></a></div>
    </div>
  </div>
</section>
<?php require ROOT . '/templates/footer.php';
