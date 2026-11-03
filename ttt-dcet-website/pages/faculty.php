<?php
page_meta([
    'title' => 'Faculty & Leadership | T.T.T Academy DCET Coaching',
    'description' => 'Learn DCET directly from textbook authors. Meet T.T.T Academy’s leadership — Chairman Dr. Savina J.P (B.E, M.E, Ph.D) — and the academic and administrative team.',
]);
$groups = ['leadership' => 'Leadership', 'dcet' => 'DCET faculty', 'administration' => 'Administration', 'academic' => 'Academic team'];
$by = [];
foreach (content('faculty') as $f) $by[$f['member_group']][] = $f;
$chair = $by['leadership'][0] ?? null;
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Faculty',
    'title' => 'Learn from the people who <span class="text-grad">wrote the book.</span>',
    'lead' => 'DCET classes at T.T.T are conducted by the authors of standard DCET textbooks — experienced, student-friendly teachers who reach out to every learner.',
    'crumbs' => ['Faculty' => null],
    'bg' => 'assets/img/why/teaching-methodology.webp',
]);
?>

<?php if ($chair): ?>
<section class="sec">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-5" data-reveal><div class="rounded-x overflow-hidden shadow-x" data-zoom><?= img($chair['photo'], $chair['name'], 'img-cover') ?></div></div>
      <div class="col-lg-7" data-reveal>
        <span class="eyebrow"><?= e($chair['role']) ?></span>
        <h2 class="sec-title display"><?= e($chair['name']) ?></h2>
        <p class="muted"><?= e($chair['qualification']) ?></p>
        <p style="font-size:1.08rem"><?= e($chair['bio']) ?></p>
        <div class="card-x mt-4" style="background:var(--bg-tint);border:0">
          <p class="mb-2" style="font-family:var(--ff-display);font-weight:600">“Special gratitude to Savin Sir and the dedicated team for their effective online coaching classes.”</p>
          <span class="small muted">— Santhrupth H R, DCET 2023 State 1st rank</span>
        </div>
      </div>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="sec-sm sec-dark">
  <div class="container-xl">
    <div class="row g-4" data-reveal="stagger">
      <div class="col-md-4"><div class="card-glass"><span class="mode-ic mb-3"><?= icon('book') ?></span><h3 class="h5">Textbook authors teach</h3><p class="muted mb-0 small">Learn directly from the creators of the reference material — unparalleled clarity.</p></div></div>
      <div class="col-md-4"><div class="card-glass"><span class="mode-ic mb-3"><?= icon('users') ?></span><h3 class="h5">Branch-wise mentoring</h3><p class="muted mb-0 small">Expert faculty for Branch 1 &amp; Branch 2 with targeted problem practice.</p></div></div>
      <div class="col-md-4"><div class="card-glass"><span class="mode-ic mb-3"><?= icon('shield') ?></span><h3 class="h5">Academic &amp; personal support</h3><p class="muted mb-0 small">Faculty trained to help students resolve both academic and personal difficulties.</p></div></div>
    </div>
  </div>
</section>

<?php foreach ($groups as $key => $label): if (empty($by[$key]) || ($key === 'leadership')) continue; ?>
<section class="sec<?= $key === 'administration' ? ' sec-soft' : '' ?>">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow"><?= e($label) ?></span><h2 class="sec-title-sm display"><?= $key === 'academic' ? 'Our academic team' : ($key === 'dcet' ? 'DCET subject experts' : 'Here to help you every day') ?></h2>
    <?php if ($key === 'academic'): ?><p class="muted">T.T.T’s academicians teach across our DCET, PU and foundation programmes.</p><?php endif; ?></div>
    <div class="row g-4" data-reveal="stagger">
      <?php foreach ($by[$key] as $f): ?>
      <div class="col-6 col-md-4 col-lg-3">
        <div class="member">
          <?php if ($f['photo']): ?><?= img($f['photo'], $f['name'], 'm-ph') ?><?php else: ?><span class="m-ph" aria-hidden="true"><?= e(mb_substr(preg_replace('/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/', '', $f['name']), 0, 1)) ?></span><?php endif; ?>
          <h3><?= e($f['name']) ?></h3>
          <div class="m-role"><?= e($f['role']) ?></div>
          <?php if ($f['qualification']): ?><div class="small muted"><?= e($f['qualification']) ?></div><?php endif; ?>
          <?php if ($f['bio'] && $key !== 'leadership'): ?><p><?= e($f['bio']) ?></p><?php endif; ?>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endforeach; ?>

<section class="sec sec-soft">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow">Management</span><h2 class="sec-title-sm display">The team behind T.T.T</h2></div>
    <div class="row g-4" data-reveal="stagger">
      <?php foreach (array_slice($by['leadership'] ?? [], 1) as $f): ?>
      <div class="col-md-4"><div class="member"><?= img($f['photo'], $f['name'], 'm-ph') ?><h3><?= e($f['name']) ?></h3><div class="m-role"><?= e($f['role']) ?></div><div class="small muted"><?= e($f['qualification']) ?></div></div></div>
      <?php endforeach; ?>
    </div>
    <div class="mt-4"><a class="link-arrow" href="<?= e(url('/about')) ?>">Read their messages <?= icon('arrow', 'ic ic-sm') ?></a></div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
