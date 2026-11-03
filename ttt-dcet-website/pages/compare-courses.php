<?php
page_meta([
    'title' => 'Compare DCET Batches: Pratigna vs Jnana vs Pragathi | T.T.T Academy',
    'description' => 'Side-by-side comparison of T.T.T Academy’s DCET batches — Pratigna (12-month long term), Jnana (6-month short term) and Pragathi (2-month crash course).',
]);
$cs = courses();
$rows = [
    'Duration' => fn($c) => e($c['duration']),
    'Batch type' => fn($c) => e($c['type_label']),
    'Best for' => fn($c) => e($c['ideal_for'][0] ?? ''),
    'Offline classes' => fn($c) => true,
    'Online live classes' => fn($c) => true,
    'Recorded classes' => fn($c) => (bool) preg_grep('/record/i', $c['features']),
    'Classes by DCET book authors' => fn($c) => (bool) preg_grep('/author/i', $c['features']),
    'AI-based attendance' => fn($c) => (bool) preg_grep('/attendance/i', $c['features']),
    'Weekly mock tests' => fn($c) => (bool) preg_grep('/mock/i', array_merge($c['features'], $c['materials'])),
    'Previous year papers & solutions' => fn($c) => (bool) preg_grep('/previous year/i', array_merge($c['features'], $c['materials'])),
    'Seat matrix & cutoff PDF' => fn($c) => (bool) preg_grep('/seat matrix/i', array_merge($c['features'], $c['materials'])),
    'Counselling sessions' => fn($c) => (bool) preg_grep('/counselling/i', $c['features']),
    'Batch timings' => fn($c) => implode('<br>', array_map(fn($t) => e(trim(explode('|', $t)[0])), $c['timings'])),
];
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Course comparison',
    'title' => 'Pratigna, Jnana or Pragathi? <span class="text-grad">Compare.</span>',
    'lead' => 'All three batches share the same T.T.T DNA — textbook-author faculty, hybrid classes and regular testing. The difference is how much runway you have.',
    'crumbs' => ['DCET Coaching' => '/dcet-coaching', 'Compare' => null],
]);
?>

<section class="sec">
  <div class="container-xl">
    <div class="table-scroll" data-reveal>
      <table class="table-x cmp mb-0 bg-white">
        <caption class="visually-hidden">Comparison of DCET batches</caption>
        <thead><tr><th scope="col">Feature</th><?php foreach ($cs as $c): ?><th scope="col"><span style="font-family:var(--ff-display);font-size:1.4rem;color:<?= e($c['accent']) ?>"><?= e($c['name']) ?></span><br><span class="chip"><?= e($c['duration']) ?></span></th><?php endforeach; ?></tr></thead>
        <tbody>
          <?php foreach ($rows as $label => $fn): ?>
          <tr><th scope="row"><?= e($label) ?></th><?php foreach ($cs as $c): $v = $fn($c); ?><td><?= $v === true ? '<span class="yes">' . icon('check') . '<span class="visually-hidden">Yes</span></span>' : ($v === false ? '<span class="no">—<span class="visually-hidden">Not listed</span></span>' : $v) ?></td><?php endforeach; ?></tr>
          <?php endforeach; ?>
          <tr><th scope="row"></th><?php foreach ($cs as $c): ?><td><a class="btn-x btn-x-dark btn-x-sm" href="<?= e(url('/dcet-coaching/' . $c['slug'])) ?>">View <?= e($c['name']) ?></a></td><?php endforeach; ?></tr>
        </tbody>
      </table>
    </div>
    <p class="note-x mt-3">“—” means the feature is not listed for that batch in its published course details; ask our admission team for the latest.</p>
  </div>
</section>

<section class="sec sec-dark">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow eyebrow-light">Quick guide</span><h2 class="sec-title-sm display">Which batch should you choose?</h2></div>
    <div class="row g-4" data-reveal="stagger">
      <div class="col-md-4"><div class="card-glass"><h3 class="h5">You have about a year</h3><p class="muted">Choose <strong class="text-white">Pratigna</strong> for full syllabus depth, shortcuts and a long runway of tests.</p></div></div>
      <div class="col-md-4"><div class="card-glass"><h3 class="h5">You have about six months</h3><p class="muted">Choose <strong class="text-white">Jnana</strong> — structured, tracked, with free Crash Course entry after 6th sem.</p></div></div>
      <div class="col-md-4"><div class="card-glass"><h3 class="h5">The exam is ~50 days away</h3><p class="muted">Choose <strong class="text-white">Pragathi</strong> for intensive revision, shortcuts and weekly OMR mocks.</p></div></div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
