<?php
page_meta([
    'title' => 'About T.T.T Academy | Technical Teaching & Training Academy, Bengaluru',
    'description' => 'T.T.T Academy (Technical Teaching & Training Academy), run by JPS Educational & Charitable Trust since 2013 — premier DCET coaching in Peenya, T-Dasarahalli and Magadi Road, Bengaluru.',
]);
$leaders = content('faculty', ['member_group' => 'leadership']);
$stats = headline_stats();
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'About T.T.T Academy',
    'title' => 'We lay the foundation. <span class="text-grad">You take the rank.</span>',
    'lead' => 'We guide students by laying a firm foundation in their academics, which leads them to take their own decisions.',
    'crumbs' => ['About' => null],
    'bg' => 'assets/img/gallery/39.webp',
]);
?>

<section class="sec">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-6" data-reveal>
        <div class="ratio-photo shadow-x" data-zoom><?= img('assets/img/why/about-ttt.webp', 'Collage of T.T.T Academy campus, classrooms and students', 'img-cover') ?></div>
      </div>
      <div class="col-lg-6" data-reveal>
        <span class="eyebrow">Our institution</span>
        <h2 class="sec-title-sm display">Technical Teaching &amp; Training Academy</h2>
        <p>T.T.T Academy is a premier coaching institute for D-CET, K-CET, NEET-UG, Science &amp; Commerce (11th and 12th) and foundation courses from 8th to 10th (State / CBSE / ICSE). The institute is known for its entrance exam preparation, which consistently yields the best outcomes.</p>
        <p>We place great emphasis on laying a solid foundation of knowledge and concepts, and on giving every student individual attention. Our highly skilled and experienced faculty are committed to the whole achievement of their students — academic, social and cultural.</p>
        <p class="mb-0">Established in 2013 and run by <strong>JPS Educational &amp; Charitable Trust</strong>, the academy offers the best academic environment, structured teaching, excellent study material, consistent motivation, smart-board technology, parent interaction and regular tests and exams.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec-sm sec-dark">
  <div class="container-xl">
    <div class="kpi-grid" data-reveal="stagger">
      <div class="kpi"><div class="k-num" data-count="2013">2013</div><div class="k-lbl">Year established</div></div>
      <div class="kpi"><div class="k-num" data-count="3">3</div><div class="k-lbl">Branches in Bengaluru</div></div>
      <div class="kpi"><div class="k-num"><?= count($stats['first_years']) ?>×</div><div class="k-lbl">DCET State 1st rank (<?= e(implode(', ', $stats['first_years'])) ?>)</div></div>
      <div class="kpi"><div class="k-num" data-count="<?= $stats['total_top100'] ?>"><?= $stats['total_top100'] ?></div><div class="k-lbl">DCET top-100 ranks across <?= $stats['years_tracked'] ?> result years</div></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="sec-head center" data-reveal>
      <span class="eyebrow">Strategy · Vision · Mission</span>
      <h2 class="sec-title display">What drives us</h2>
    </div>
    <div class="row g-4" data-reveal="stagger">
      <div class="col-md-4"><div class="card-x"><span class="b-icon mb-3"><?= icon('compass') ?></span><h3>Strategy</h3><p class="muted mb-0">We guide students by laying a firm foundation in their academics which lead them to take their own decisions.</p></div></div>
      <div class="col-md-4"><div class="card-x"><span class="b-icon mb-3"><?= icon('sparkle') ?></span><h3>Vision</h3><p class="muted mb-0">To impart exceptional knowledge to the young minds of our nation.</p></div></div>
      <div class="col-md-4"><div class="card-x"><span class="b-icon mb-3"><?= icon('trophy') ?></span><h3>Mission</h3><p class="muted mb-0">To deliver excellent teaching and encourage deserving students to reach their goal.</p></div></div>
    </div>
    <div class="row g-4 mt-2" data-reveal="stagger">
      <div class="col-lg-6"><div class="card-x"><h3 class="mb-3">Objectives</h3><ol class="num-list"><li>To deliver excellent teaching to students.</li><li>To provide free education to meritorious students.</li><li>To encourage deserving students for higher education.</li><li>To bring quality education to low-income areas of our nation.</li></ol></div></div>
      <div class="col-lg-6"><div class="card-x"><h3 class="mb-3">Academy highlights</h3><ul class="check-list"><li><?= icon('check') ?>Regular tests</li><li><?= icon('check') ?>Consistent motivation</li><li><?= icon('check') ?>Best academic environment</li><li><?= icon('check') ?>Structured teaching with smart applications</li><li><?= icon('check') ?>Air-conditioned classrooms with CCTV surveillance</li><li><?= icon('check') ?>Support for slow learners and meritorious students alike</li></ul></div></div>
    </div>
  </div>
</section>

<section class="sec sec-soft">
  <div class="container-xl">
    <div class="sec-head" data-reveal>
      <span class="eyebrow">Management</span>
      <h2 class="sec-title display">Messages from our leadership</h2>
    </div>
    <div class="d-grid gap-4">
      <?php foreach ($leaders as $l): ?>
      <article class="leader" data-reveal>
        <?= img($l['photo'], $l['name']) ?>
        <div>
          <span class="badge-soft"><?= e($l['role']) ?></span>
          <h3 class="h2 display mt-3 mb-1"><?= e($l['name']) ?></h3>
          <?php if ($l['qualification']): ?><p class="muted mb-3"><?= e($l['qualification']) ?></p><?php endif; ?>
          <p class="mb-0" style="font-size:1.05rem"><?= e($l['bio']) ?></p>
        </div>
      </article>
      <?php endforeach; ?>
    </div>
    <p class="note-x mt-4">Trustees: Mr. Sadananda J P (B.E), Mr. Mahesh J S, Mrs. Vanitha J S, Mrs. Chaitra P S (B.E, M.Tech), Mrs. Vinutha M R (B.E, M.Tech).</p>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow">Our branches</span><h2 class="sec-title-sm display">Three campuses across Bengaluru</h2></div>
    <div class="row g-4" data-reveal="stagger">
      <?php foreach (content('branches') as $b): ?>
      <div class="col-md-4"><div class="card-x"><h3><?= e($b['name']) ?></h3><p class="muted"><?= e($b['address']) ?></p><a href="<?= e(tel_link(explode('/', $b['phone'])[0])) ?>" class="link-arrow"><?= icon('phone', 'ic ic-sm') ?> <?= e($b['phone']) ?></a></div></div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
