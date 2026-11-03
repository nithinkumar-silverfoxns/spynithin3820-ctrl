<?php
$stats = headline_stats();
$results = results();
$latest = $results[0];
page_meta([
    'title' => 'Your DCET Rank Starts Here | T.T.T Academy — DCET Coaching in Bengaluru',
    'description' => 'T.T.T Academy: DCET State 1st rank in 2023 & 2025, ' . $latest['below_100'] . ' students under rank 100 and ' . $latest['below_2000'] . ' under rank 2000 in DCET ' . $latest['year'] . '. Pratigna (12 months), Jnana (6 months) & Pragathi (2 months) batches — online & offline.',
    'body_class' => 'page-home',
]);
page_script('assets/js/hero-3d.js');

$heroToppers = [];
foreach (featured_toppers() as $t) {
    if (count($heroToppers) < 4 && $t['rank_no'] <= 3) $heroToppers[] = $t;
}
foreach (featured_toppers() as $t) {
    if (count($heroToppers) >= 4) break;
    if (!in_array($t, $heroToppers, true)) $heroToppers[] = $t;
}
$achievers = array_values(array_filter(toppers(), static fn($t) => $t['photo'] !== ''));
usort($achievers, static fn($a, $b) => [-$a['year'], $a['rank_no']] <=> [-$b['year'], $b['rank_no']]);
$admissions = content('admissions');
$campus = array_slice(content('gallery', ['category' => 'campus']), 0, 6);
$classes = array_slice(content('gallery', ['category' => 'classes']), 0, 6);
$heroSlides = ['assets/img/gallery/12.webp', 'assets/img/gallery/14.webp', 'assets/img/campus/classroom-students.webp', 'assets/img/gallery/15.webp'];
$heroVideo = setting('hero_video');

require ROOT . '/templates/header.php';
?>

<!-- ============ HERO ============ -->
<section class="hero" aria-labelledby="heroTitle">
  <div class="hero-media" aria-hidden="true">
    <?php if ($heroVideo): ?>
      <video autoplay muted loop playsinline preload="metadata" poster="<?= e(asset($heroSlides[0])) ?>"><source src="<?= e(media_url($heroVideo)) ?>" type="video/mp4"></video>
    <?php else: foreach ($heroSlides as $i => $s): ?>
      <?= img($s, '', '', ['loading' => $i === 0 ? 'eager' : 'lazy', 'fetchpriority' => $i === 0 ? 'high' : null]) ?>
    <?php endforeach; endif; ?>
  </div>
  <canvas id="hero3d" aria-hidden="true"></canvas>
  <div class="formula-layer" aria-hidden="true"></div>

  <div class="container-xl">
    <div class="row align-items-center g-5">
      <div class="col-lg-7">
        <span class="hero-badge"><b>DCET <?= (int) $latest['year'] ?></b> State <?= e(ordinal((int) $latest['best_rank'])) ?> rank · <?= (int) $latest['below_2000'] ?> students under rank 2000</span>
        <h1 class="hero-title display" id="heroTitle">
          <span class="line"><span>Your DCET <span class="text-grad">Rank</span></span></span>
          <span class="line"><span>Starts Here.</span></span>
        </h1>
        <p class="hero-sub">Learn smarter. Practice better. Achieve your engineering dreams with T.T.T Academy.</p>
        <div class="hero-actions">
          <a class="btn-x btn-x-primary" href="<?= e(url('/admission')) ?>">Apply for Admission <?= icon('arrow', 'ic ic-sm') ?></a>
          <a class="btn-x btn-x-glass" href="<?= e(url('/dcet-coaching')) ?>">Explore DCET Programs</a>
          <a class="btn-x btn-x-glass" href="<?= e(url('/demo-classes')) ?>"><?= icon('play', 'ic ic-sm') ?> Watch Demo Classes</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><div class="num"><span data-count="1" data-suffix="st">1st</span></div><div class="lbl">State rank in DCET <?= e(implode(' & ', $stats['first_years'])) ?></div></div>
          <div class="hero-stat"><div class="num" data-count="<?= (int) $latest['below_100'] ?>"><?= (int) $latest['below_100'] ?></div><div class="lbl">Students in the state top 100 · <?= (int) $latest['year'] ?></div></div>
          <div class="hero-stat"><div class="num" data-count="<?= (int) $latest['below_500'] ?>"><?= (int) $latest['below_500'] ?></div><div class="lbl">Students under rank 500 · <?= (int) $latest['year'] ?></div></div>
          <div class="hero-stat"><div class="num" data-count="<?= (int) $latest['below_2000'] ?>"><?= (int) $latest['below_2000'] ?></div><div class="lbl">Students under rank 2000 · <?= (int) $latest['year'] ?></div></div>
        </div>
      </div>
      <div class="col-lg-5 d-none d-lg-block">
        <div class="hero-stack" aria-label="Recent DCET state rank holders from T.T.T Academy">
          <?php foreach ($heroToppers as $i => $t): ?>
          <figure class="hero-card m-0">
            <div class="hc-img"><?= img($t['photo'], $t['name'] . ', DCET ' . $t['year'], '', ['loading' => 'eager']) ?></div>
            <figcaption class="hc-body">
              <span><span class="hc-name d-block"><?= e($t['name']) ?></span><span class="hc-meta">DCET <?= (int) $t['year'] ?> · <?= e($t['score']) ?></span></span>
              <span class="rank-badge"><b><?= (int) $t['rank_no'] ?><sup><?= e(substr(ordinal((int) $t['rank_no']), -2)) ?></sup></b><small>State</small></span>
            </figcaption>
          </figure>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>
  <div class="scroll-cue d-none d-md-block" aria-hidden="true"></div>
</section>

<!-- ============ COLLEGE MARQUEE ============ -->
<div class="marquee" aria-label="Engineering colleges our students joined">
  <div class="marquee-track">
    <?php for ($k = 0; $k < 2; $k++): foreach ($admissions as $a): ?>
      <span class="marquee-item"<?= $k ? ' aria-hidden="true"' : '' ?>><span class="n"><?= (int) $a['students'] ?></span> students · <?= e($a['college']) ?><span class="dot"></span></span>
    <?php endforeach; endfor; ?>
  </div>
</div>

<!-- ============ RESULTS AT A GLANCE ============ -->
<section class="sec sec-dark" aria-labelledby="glanceTitle">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="container-xl">
    <div class="row g-5 align-items-end mb-5">
      <div class="col-lg-7" data-reveal>
        <span class="eyebrow eyebrow-light">Verified results · <?= min(result_years()) ?>–<?= max(result_years()) ?></span>
        <h2 class="sec-title display" id="glanceTitle">Rank holders, <span class="text-grad">every single year.</span></h2>
        <p class="lead-x mb-0">Every number below comes from T.T.T Academy’s official DCET result announcements. Pick a year to see how deep our results run.</p>
      </div>
      <div class="col-lg-5 text-lg-end" data-reveal>
        <a class="btn-x btn-x-glass" href="<?= e(url('/dcet-results')) ?>">Open the full results dashboard <?= icon('arrow', 'ic ic-sm') ?></a>
      </div>
    </div>
    <div class="kpi-grid" data-reveal="stagger">
      <?php foreach (array_slice($results, 0, 4) as $r): ?>
      <div class="kpi">
        <div class="small-caps" style="color: var(--blue-2)">DCET <?= (int) $r['year'] ?></div>
        <div class="k-num mt-2">State <span data-count="<?= (int) $r['best_rank'] ?>" data-suffix="<?= e(substr(ordinal((int) $r['best_rank']), -2)) ?>"><?= e(ordinal((int) $r['best_rank'])) ?></span></div>
        <div class="k-lbl"><?= (int) $r['below_100'] ?> students under rank 100 · <?= (int) $r['below_500'] ?> under rank 500</div>
        <?php if ($r['below_2000']): ?><div class="k-foot"><?= (int) $r['below_2000'] ?> students under rank 2000</div><?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ============ COURSES ============ -->
<section class="sec" aria-labelledby="coursesTitle">
  <div class="container-xl">
    <div class="sec-head center" data-reveal>
      <span class="eyebrow">DCET <?= e(preg_replace('/\D/', '', setting('admission_year'))) ?> programs</span>
      <h2 class="sec-title display" id="coursesTitle">Three paths. <span class="text-grad-blue">One goal: your rank.</span></h2>
      <p class="lead-x">Start a year early, six months out, or in the final 50 days — every batch is taught by DCET textbook authors, online and offline, with recorded classes and regular mock tests.</p>
    </div>
    <div class="course-rail" data-reveal="stagger">
      <?php foreach (courses() as $c) partial('course-card', ['c' => $c]); ?>
    </div>
    <div class="text-center mt-5" data-reveal>
      <a class="link-arrow" href="<?= e(url('/compare-courses')) ?>">Not sure which batch fits? Compare all three side by side <?= icon('arrow', 'ic ic-sm') ?></a>
    </div>
  </div>
</section>

<!-- ============ ACHIEVERS (cinematic horizontal) ============ -->
<section class="sec-dark ach-wrap" data-h-scroll aria-labelledby="achTitle" style="padding: clamp(72px, 9vw, 120px) 0;">
  <div class="ach-track">
    <div class="ach-intro">
      <span class="eyebrow eyebrow-light">T.T.T Achievers</span>
      <h2 class="sec-title display" id="achTitle">Faces behind the <span class="text-grad">state ranks.</span></h2>
      <p class="lead-x">Real T.T.T students. Real ranks. From State 1st in 2023 and 2025 to top-10 finishes every year since.</p>
      <div class="d-flex gap-2 flex-wrap mt-3">
        <a class="btn-x btn-x-primary btn-x-sm" href="<?= e(url('/our-toppers')) ?>">Meet all our toppers <?= icon('arrow', 'ic ic-sm') ?></a>
      </div>
      <p class="note-x mt-4 mb-0 d-lg-none">Swipe to see more →</p>
    </div>
    <?php foreach ($achievers as $t): ?>
    <article class="ach-card">
      <div class="a-img"><?= img($t['photo'], $t['name'] . ', DCET ' . $t['year'] . ' state rank ' . $t['rank_no']) ?></div>
      <?php if ($t['score']): ?><span class="a-score"><?= e($t['score']) ?></span><?php endif; ?>
      <span class="rank-badge"><b><?= (int) $t['rank_no'] ?><sup><?= e(substr(ordinal((int) $t['rank_no']), -2)) ?></sup></b><small>State</small></span>
      <div class="a-body">
        <div class="a-year">DCET <?= (int) $t['year'] ?></div>
        <div class="a-name"><?= e($t['name']) ?></div>
        <div class="a-col"><?= e($t['diploma_college']) ?></div>
      </div>
    </article>
    <?php endforeach; ?>
  </div>
</section>

<!-- ============ WHY TTT (bento) ============ -->
<section class="sec" aria-labelledby="whyTitle">
  <div class="container-xl">
    <div class="row g-4 align-items-end mb-5">
      <div class="col-lg-7" data-reveal>
        <span class="eyebrow">Why T.T.T</span>
        <h2 class="sec-title display" id="whyTitle">A system built around how toppers actually prepare.</h2>
      </div>
      <div class="col-lg-5" data-reveal>
        <p class="lead-x mb-0">Since 2013, we have refined one method: strong fundamentals, research-based material, relentless testing — and teachers who wrote the DCET textbooks.</p>
      </div>
    </div>
    <div class="bento" data-reveal="stagger">
      <figure class="b-photo b-span-7 b-wide-m m-0"><?= img('assets/img/why/teaching-methodology.webp', 'Faculty teaching on a smart board at T.T.T Academy', 'img-cover') ?><figcaption class="b-cap"><h3>Taught by DCET textbook authors</h3><p>Starting from the very basics and strengthening every student at fundamentals.</p></figcaption></figure>
      <div class="b-text b-span-5"><span class="b-icon"><?= icon('book') ?></span><div><h3>Research-based study material</h3><p>Structured material for theory and MCQs — including the official T.T.T DCET Book.</p></div></div>
      <div class="b-text b-dark b-span-5"><span class="b-icon"><?= icon('test') ?></span><div><h3>Weekly tests, OMR mocks</h3><p>Chapter tests every week, monthly grand tests and full DCET simulations.</p></div></div>
      <figure class="b-photo b-span-4 m-0"><?= img('assets/img/why/test-system.webp', 'Students writing a mock test', 'img-cover') ?><figcaption class="b-cap"><h3>Real exam conditions</h3></figcaption></figure>
      <div class="b-text b-span-4"><span class="b-icon"><?= icon('cpu') ?></span><div><h3>AI attendance &amp; Student Panel</h3><p>Face-tracking attendance, online tests, instant results and analytics.</p></div></div>
      <figure class="b-photo b-span-4 m-0"><?= img('assets/img/why/doubt-clearing.webp', 'Doubt clearing session', 'img-cover') ?><figcaption class="b-cap"><h3>Doubt clearing sessions</h3></figcaption></figure>
      <figure class="b-photo b-span-6 m-0"><?= img('assets/img/why/smart-applications.webp', 'Smart classroom application', 'img-cover') ?><figcaption class="b-cap"><h3>Smart classrooms</h3><p>Smart boards, AC classrooms and CCTV-secured campus.</p></figcaption></figure>
      <div class="b-text b-span-6"><span class="b-icon"><?= icon('users') ?></span><div><h3>Feedback &amp; mentoring</h3><p>Limited batch sizes, branch-wise mentoring and regular parent interaction — with extra support for slow learners and meritorious students alike.</p></div></div>
    </div>
  </div>
</section>

<!-- ============ HYBRID LEARNING ============ -->
<section class="sec sec-dark" aria-labelledby="hybridTitle">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-5" data-reveal>
        <span class="eyebrow eyebrow-light">Learn your way</span>
        <h2 class="sec-title display" id="hybridTitle">Classroom, live online or recorded — <span class="text-grad">you never miss a class.</span></h2>
        <p class="lead-x">Our Hybrid Class System gives every student complete freedom to learn anytime, anywhere — with outstation students welcome.</p>
        <div class="ratio-photo mt-4" data-zoom><?= img('assets/img/gallery/41.webp', 'Smart classroom at T.T.T Academy', 'img-cover') ?></div>
      </div>
      <div class="col-lg-7">
        <div class="row g-3" data-reveal="stagger">
          <div class="col-sm-6"><div class="mode-card"><span class="mode-ic"><?= icon('users') ?></span><h3>Offline classroom</h3><ul><li>Face-to-face interaction with faculty</li><li>Instant doubt solving, focused environment</li><li>Disciplined, structured study routine</li></ul></div></div>
          <div class="col-sm-6"><div class="mode-card"><span class="mode-ic"><?= icon('video') ?></span><h3>Online live classes</h3><ul><li>Join from any location</li><li>Real-time chat &amp; doubt clearing</li><li>Class reminders + calendar scheduling</li></ul></div></div>
          <div class="col-sm-6"><div class="mode-card"><span class="mode-ic"><?= icon('play') ?></span><h3>Recorded classes 24×7</h3><ul><li>Missed a class? Watch anytime</li><li>Pause, rewind &amp; rewatch for revision</li><li>Available after every live session (if recorded)</li></ul></div></div>
          <div class="col-sm-6"><div class="mode-card"><span class="mode-ic"><?= icon('home') ?></span><h3>PG for outstation students</h3><ul><li>Separate boys &amp; girls PG near the academy</li><li>Hassle-free onboarding for parents &amp; students</li></ul></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ STUDENT VOICES ============ -->
<section class="sec sec-soft" aria-labelledby="voicesTitle">
  <div class="container-xl">
    <?php $t0 = content('testimonials')[0] ?? null; ?>
    <div class="row g-5 align-items-center mb-5">
      <div class="col-lg-7" data-reveal>
        <span class="eyebrow">In their own words</span>
        <?php if ($t0): ?>
        <blockquote class="quote-hero mt-3 mb-4" id="voicesTitle">“<?= e(mb_strimwidth($t0['quote'], 0, 230, '…')) ?>”</blockquote>
        <div class="q-who d-flex align-items-center gap-3"><?= img($t0['photo'], $t0['name'], 'q-avatar') ?><span><span class="q-name d-block"><?= e($t0['name']) ?></span><span class="q-title"><?= e($t0['title']) ?></span></span></div>
        <?php endif; ?>
      </div>
      <div class="col-lg-5" data-reveal>
        <?php $v = videos('topper')[0] ?? null; if ($v) partial('video-card', ['v' => $v]); ?>
      </div>
    </div>
    <div class="row g-4" data-reveal="stagger">
      <?php foreach (array_slice(videos('testimonial'), 0, 3) as $v): ?>
      <div class="col-md-4"><?php partial('video-card', ['v' => $v]); ?></div>
      <?php endforeach; ?>
    </div>
    <div class="text-center mt-5"><a class="btn-x btn-x-light" href="<?= e(url('/student-testimonials')) ?>">More student stories <?= icon('arrow', 'ic ic-sm') ?></a></div>
  </div>
</section>

<!-- ============ TOOLS ============ -->
<section class="sec" aria-labelledby="toolsTitle">
  <div class="container-xl">
    <div class="sec-head" data-reveal>
      <span class="eyebrow">Free DCET tools</span>
      <h2 class="sec-title display" id="toolsTitle">Plan every step — from marks to college seat.</h2>
    </div>
    <div class="row g-4" data-reveal="stagger">
      <div class="col-md-6 col-lg-3"><a class="tool-card" href="<?= e(url('/dcet-rank-predictor')) ?>"><span class="b-icon"><?= icon('calc') ?></span><h3>DCET rank predictor</h3><p>Enter your CGPA and expected DCET marks to estimate your rank range.</p><span class="link-arrow">Predict my rank <?= icon('arrow', 'ic ic-sm') ?></span></a></div>
      <div class="col-md-6 col-lg-3"><a class="tool-card" href="<?= e(url('/college-cutoffs')) ?>"><span class="b-icon"><?= icon('building') ?></span><h3>College cutoffs</h3><p>DCET 2026 round-1 cutoff ranks for Karnataka’s top 50 engineering colleges.</p><span class="link-arrow">Explore cutoffs <?= icon('arrow', 'ic ic-sm') ?></span></a></div>
      <div class="col-md-6 col-lg-3"><a class="tool-card" href="<?= e(url('/dcet-syllabus')) ?>"><span class="b-icon"><?= icon('compass') ?></span><h3>Syllabus explorer</h3><p>All five DCET subjects, marks weightage and what to focus on.</p><span class="link-arrow">Open syllabus <?= icon('arrow', 'ic ic-sm') ?></span></a></div>
      <div class="col-md-6 col-lg-3"><a class="tool-card" href="<?= e(url('/study-materials')) ?>"><span class="b-icon"><?= icon('download') ?></span><h3>Previous year papers</h3><p>Download the DCET syllabus &amp; PYQ book and rank-holder guides.</p><span class="link-arrow">Get materials <?= icon('arrow', 'ic ic-sm') ?></span></a></div>
    </div>
  </div>
</section>

<!-- ============ CAMPUS STRIP ============ -->
<section class="sec-sm sec-soft overflow-hidden" aria-labelledby="campusTitle">
  <div class="container-xl mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3" data-reveal>
    <div><span class="eyebrow">Inside T.T.T</span><h2 class="sec-title-sm display" id="campusTitle">Classrooms designed for focus.</h2></div>
    <a class="link-arrow" href="<?= e(url('/gallery')) ?>">View the full gallery <?= icon('arrow', 'ic ic-sm') ?></a>
  </div>
  <div class="strip mb-3" data-scroll-x="-1">
    <?php foreach (array_merge($campus, $classes) as $g): ?><a href="<?= e(asset($g['image'])) ?>" data-lightbox="home" data-caption="<?= e($g['title']) ?>"><?= img($g['image'], $g['title']) ?></a><?php endforeach; ?>
  </div>
</section>

<!-- ============ PRIZE + ENQUIRY ============ -->
<section class="sec" aria-labelledby="prizeTitle">
  <div class="container-xl">
    <div class="row g-5 align-items-stretch">
      <div class="col-lg-6" data-reveal>
        <div class="prize h-100 d-flex flex-column justify-content-between">
          <div>
            <span class="eyebrow eyebrow-light">Excellence rewards · <?= e(setting('admission_year')) ?></span>
            <h2 class="sec-title-sm display text-white" id="prizeTitle">Special cash prizes for our state toppers.</h2>
            <p class="lead-x" style="color: rgba(255,255,255,.7)">To celebrate your hard work, T.T.T Academy rewards its highest state achievers with direct cash incentives — in addition to your rank glory.</p>
          </div>
          <div class="row g-3 mt-3">
            <div class="col-6"><div class="prize-amt"><?= e(setting('prize_first')) ?></div><div class="small mt-2" style="color: rgba(255,255,255,.75)">State 1st rank</div></div>
            <div class="col-6"><div class="prize-amt"><?= e(setting('prize_second')) ?></div><div class="small mt-2" style="color: rgba(255,255,255,.75)">State 2nd rank</div></div>
          </div>
        </div>
      </div>
      <div class="col-lg-6" data-reveal>
        <?php partial('enquiry-form', ['type' => 'admission']); ?>
      </div>
    </div>
  </div>
</section>

<!-- ============ FAQ ============ -->
<section class="sec sec-soft pt-0" aria-labelledby="faqTitle" style="padding-top: clamp(56px, 7vw, 88px) !important;">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-4" data-reveal>
        <span class="eyebrow">Questions</span>
        <h2 class="sec-title-sm display" id="faqTitle">Parents and students often ask…</h2>
        <a class="link-arrow mt-2" href="<?= e(url('/faq')) ?>">See all FAQs <?= icon('arrow', 'ic ic-sm') ?></a>
      </div>
      <div class="col-lg-8" data-reveal>
        <div class="accordion faq-x" id="homeFaq">
          <?php foreach (array_slice(faqs(), 0, 6) as $i => $f): ?>
          <div class="accordion-item">
            <h3 class="accordion-header"><button class="accordion-button<?= $i ? ' collapsed' : '' ?>" type="button" data-bs-toggle="collapse" data-bs-target="#hf<?= $i ?>" aria-expanded="<?= $i ? 'false' : 'true' ?>" aria-controls="hf<?= $i ?>"><?= e($f['question']) ?></button></h3>
            <div id="hf<?= $i ?>" class="accordion-collapse collapse<?= $i ? '' : ' show' ?>" data-bs-parent="#homeFaq"><div class="accordion-body"><?= e($f['answer']) ?></div></div>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
