<?php
/** @var array $route */
$c = course($route['slug']);
if (!$c) {
    http_response_code(404);
    require ROOT . '/pages/404.php';
    return;
}
$latest = results()[0];
page_meta([
    'title' => $c['name'] . ' – DCET ' . $c['type_label'] . ' (' . $c['duration'] . ') | T.T.T Academy Bengaluru',
    'description' => $c['summary'],
    'image' => $c['image'] ?: 'assets/img/courses/admissions-open-2027.webp',
    'schema' => [[
        '@context' => 'https://schema.org', '@type' => 'Course',
        'name' => $c['name'] . ' – DCET ' . $c['type_label'],
        'description' => $c['summary'],
        'provider' => ['@type' => 'EducationalOrganization', 'name' => 'T.T.T Academy', 'sameAs' => abs_url('/')],
        'timeRequired' => 'P' . (int) $c['duration_months'] . 'M',
        'hasCourseInstance' => [['@type' => 'CourseInstance', 'courseMode' => ['Onsite', 'Online'], 'location' => 'Bengaluru, Karnataka']],
    ]],
]);
$others = array_filter(courses(), fn($x) => $x['slug'] !== $c['slug']);
require ROOT . '/templates/header.php';
?>

<section class="page-hero" style="--accent: <?= e($c['accent']) ?>">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="orb orb-a" aria-hidden="true" data-parallax="80"></div>
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-7">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="<?= e(url('/')) ?>">Home</a><span>/</span><a href="<?= e(url('/dcet-coaching')) ?>">DCET Coaching</a><span>/</span><span aria-current="page"><?= e($c['name']) ?></span></nav>
        <span class="eyebrow eyebrow-light mt-4"><?= e(setting('admission_year')) ?> · <?= e($c['type_label']) ?></span>
        <h1 class="display"><?= e($c['name']) ?> <span class="text-grad"><?= e($c['type_label']) ?></span></h1>
        <p class="lead-x"><?= e($c['tagline']) ?>. <?= e($c['summary']) ?></p>
        <div class="ph-actions d-flex flex-wrap gap-3 mt-4">
          <a class="btn-x btn-x-primary" href="#enquire">Book your DCET seat <?= icon('arrow', 'ic ic-sm') ?></a>
          <a class="btn-x btn-x-glass" href="<?= e(wa_link('Hi T.T.T Academy, I want details of the ' . $c['name'] . ' ' . $c['type_label'] . ' for DCET.')) ?>" target="_blank" rel="noopener"><?= icon('whatsapp', 'ic ic-sm') ?> Chat on WhatsApp</a>
        </div>
        <div class="fact-row">
          <div><b><?= e($c['duration']) ?></b><small>Course duration</small></div>
          <div><b>Offline + Online</b><small>Hybrid class system</small></div>
          <div><b>Recorded</b><small>Classes on any device</small></div>
          <div><b>Weekly</b><small>Mock tests</small></div>
        </div>
      </div>
      <div class="col-lg-5">
        <?php if ($c['image']): ?><div class="course-hero-card" data-tilt="6"><?= img($c['image'], $c['name'] . ' batch poster', '', ['loading' => 'eager']) ?></div><?php endif; ?>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-5" data-reveal>
        <span class="eyebrow">About the batch</span>
        <h2 class="sec-title-sm display">Your success blueprint</h2>
        <p><?= e($c['description']) ?></p>
        <h3 class="h5 mt-4">Who it’s built for</h3>
        <ul class="check-list mt-3"><?php foreach ($c['ideal_for'] as $x): ?><li><?= icon('check') ?><span><?= e($x) ?></span></li><?php endforeach; ?></ul>
      </div>
      <div class="col-lg-7">
        <span class="eyebrow" data-reveal>Course features</span>
        <h2 class="sec-title-sm display" data-reveal>What you get</h2>
        <div class="row g-3 mt-1" data-reveal="stagger">
          <?php foreach ($c['features'] as $i => $f): ?>
          <div class="col-sm-6"><div class="feature-tile"><span class="ft-n"><?= str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) ?></span><p><?= e($f) ?></p></div></div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec sec-soft">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-6" data-reveal>
        <span class="eyebrow">Batch blueprint</span>
        <h2 class="sec-title-sm display">Batch timings</h2>
        <p class="muted">Morning · Evening · Weekend — limited batch size, mentor support and doubt solving in every batch.</p>
        <?php foreach ($c['timings'] as $t): [$label, $time] = array_pad(array_map('trim', explode('|', $t, 2)), 2, ''); ?>
        <div class="timing"><strong><?= e($label) ?></strong><span><?= e($time) ?></span></div>
        <?php endforeach; ?>
      </div>
      <div class="col-lg-6" data-reveal>
        <span class="eyebrow">Study materials &amp; tests</span>
        <h2 class="sec-title-sm display">Your DCET toolkit</h2>
        <div class="row g-3 mt-2">
          <?php foreach ($c['materials'] as $m): ?>
          <div class="col-sm-6"><div class="card-x py-3 d-flex gap-3 align-items-center"><span class="b-icon" style="width:40px;height:40px;border-radius:12px"><?= icon('book', 'ic ic-sm') ?></span><span class="fw-semibold small"><?= e($m) ?></span></div></div>
          <?php endforeach; ?>
        </div>
        <div class="d-flex gap-3 align-items-center mt-4 p-3 rounded-x" style="background:#fff;border:1px solid var(--line)">
          <?= img('assets/img/courses/dcet-book-2027.webp', 'T.T.T DCET 2027 book', '', ['style' => 'width:90px;border-radius:10px']) ?>
          <div><strong style="font-family:var(--ff-display)">Scan &amp; get a discount</strong><p class="small muted mb-0">Buy the T.T.T DCET book, scan the QR on the cover, save the screenshot and show it at admission for an instant discount.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec sec-dark">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-6" data-reveal>
        <span class="eyebrow eyebrow-light">Proven track record</span>
        <h2 class="sec-title display">DCET <?= (int) $latest['year'] ?>: <span class="text-grad"><?= (int) $latest['below_2000'] ?> students</span> under rank 2000.</h2>
        <p class="lead-x">Including State <?= e(ordinal((int) $latest['best_rank'])) ?> rank, <?= (int) $latest['below_10'] ?> in the top 10 and <?= (int) $latest['below_100'] ?> in the top 100.</p>
        <a class="btn-x btn-x-glass" href="<?= e(url('/dcet-results')) ?>">See every year’s results <?= icon('arrow', 'ic ic-sm') ?></a>
      </div>
      <div class="col-lg-6" data-reveal>
        <div class="row g-3">
          <div class="col-6"><a href="<?= e(asset('assets/img/courses/prize-1st-rank.webp')) ?>" data-lightbox="prize" data-caption="DCET 2027 State 1st rank prize ₹1,00,000"><?= img('assets/img/courses/prize-1st-rank.webp', 'DCET 2027 State 1st rank holder prize of ₹1,00,000', 'rounded-x') ?></a></div>
          <div class="col-6"><a href="<?= e(asset('assets/img/courses/prize-2nd-rank.webp')) ?>" data-lightbox="prize" data-caption="DCET 2027 State 2nd rank prize ₹50,000"><?= img('assets/img/courses/prize-2nd-rank.webp', 'DCET 2027 State 2nd rank holder prize of ₹50,000', 'rounded-x') ?></a></div>
        </div>
        <p class="note-x mt-3 mb-0">Special cash prizes for T.T.T’s highest state achievers in <?= e(setting('admission_year')) ?>.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="enquire">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-5" data-reveal>
        <span class="eyebrow">Join <?= e($c['name']) ?></span>
        <h2 class="sec-title-sm display">Limited seats. Personal attention.</h2>
        <ol class="num-list mt-4">
          <li><span><strong>Admission counselling</strong><br><span class="muted small">Choose the right batch — Morning, Evening or Weekend.</span></span></li>
          <li><span><strong>Get your DCET book</strong><br><span class="muted small">Curated books covering theory, MCQs and previous year questions.</span></span></li>
          <li><span><strong>Scan for a discount</strong><br><span class="muted small">Unlock the QR admission discount from the book cover.</span></span></li>
          <li><span><strong>Access your Student Panel</strong><br><span class="muted small">Login, class schedule, test calendar and complete learning access.</span></span></li>
        </ol>
        <h3 class="h6 mt-5 mb-3">Other DCET batches</h3>
        <div class="d-flex flex-wrap gap-2"><?php foreach ($others as $o): ?><a class="btn-x btn-x-light btn-x-sm" href="<?= e(url('/dcet-coaching/' . $o['slug'])) ?>"><?= e($o['name']) ?> · <?= e($o['duration']) ?></a><?php endforeach; ?></div>
      </div>
      <div class="col-lg-7" data-reveal><?php partial('enquiry-form', ['type' => 'admission', 'course' => $c['name'], 'title' => 'Enquire about ' . $c['name']]); ?></div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
