<?php
page_meta([
    'title' => 'DCET Coaching in Bengaluru 2027 | Exam Pattern, Eligibility & Batches | T.T.T Academy',
    'description' => 'Everything about DCET 2027 — KEA exam pattern (100 MCQs, 3 hours, no negative marking), subjects, exam centres, application steps, documents — and T.T.T Academy’s Pratigna, Jnana & Pragathi coaching batches.',
]);
$syl = content('syllabus');
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'DCET Coaching · ' . setting('admission_year'),
    'title' => 'Enter as a learner. <span class="text-grad">Step out among the toppers.</span>',
    'lead' => 'DCET is your gateway from diploma to 2nd year B.E./B.Tech in Karnataka. Here is everything you need to know — and how T.T.T gets you rank-ready.',
    'crumbs' => ['DCET Coaching' => null],
    'actions' => '<a class="btn-x btn-x-primary" href="' . e(url('/admission')) . '">Reserve your seat ' . icon('arrow', 'ic ic-sm') . '</a><a class="btn-x btn-x-glass" href="' . e(url('/compare-courses')) . '">Compare batches</a>',
]);
?>

<section class="sec">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-5" data-reveal>
        <span class="eyebrow">What is DCET?</span>
        <h2 class="sec-title-sm display">Diploma Common Entrance Test</h2>
        <p>DCET is conducted by the <strong>Karnataka Examinations Authority (KEA)</strong> for diploma holders seeking <strong>lateral entry (direct 2nd year)</strong> into B.E./B.Tech programmes, and for 1st-year architecture, at day and evening engineering institutes across Karnataka.</p>
        <p class="mb-0">It is the gateway for diploma students — final year or completed — to join Karnataka’s top engineering colleges.</p>
      </div>
      <div class="col-lg-7" data-reveal>
        <div class="row g-3">
          <?php foreach ([['Conducting authority', 'Karnataka Examinations Authority'], ['Exam level', 'State level, once a year'], ['Mode of exam', 'Offline (OMR-based)'], ['Duration', '3 hours'], ['Questions', '100 MCQs · 5 sections'], ['Marking', '+1 per correct answer, no negative marking'], ['Language', 'English'], ['Application & counselling', 'Online']] as [$k, $v]): ?>
          <div class="col-sm-6"><div class="card-x py-3"><div class="small-caps muted"><?= e($k) ?></div><div class="fw-semibold mt-1" style="font-family:var(--ff-display)"><?= e($v) ?></div></div></div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec sec-dark">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-5" data-reveal>
        <span class="eyebrow eyebrow-light">Exam pattern</span>
        <h2 class="sec-title display">Five subjects. <span class="text-grad">20 marks each.</span></h2>
        <p class="lead-x">Balanced weightage means every subject matters — there is no “skip” section in DCET.</p>
        <a class="btn-x btn-x-glass mt-2" href="<?= e(url('/dcet-syllabus')) ?>">Open syllabus explorer <?= icon('arrow', 'ic ic-sm') ?></a>
      </div>
      <div class="col-lg-7" data-reveal="stagger">
        <?php foreach ($syl as $s): ?>
        <div class="d-flex align-items-center gap-3 py-3" style="border-bottom:1px solid rgba(255,255,255,.08)">
          <span class="chip chip-dark" style="min-width:64px;justify-content:center"><?= e($s['short']) ?></span>
          <span class="flex-grow-1 fw-semibold"><?= e($s['subject']) ?></span>
          <span style="font-family:var(--ff-display);font-weight:800;font-size:1.4rem"><?= (int) $s['marks'] ?></span>
        </div>
        <?php endforeach; ?>
        <div class="d-flex justify-content-between pt-3"><span class="muted">Total</span><span style="font-family:var(--ff-display);font-weight:800;font-size:1.4rem"><?= array_sum(array_map(fn($s) => (int) $s['marks'], $syl)) ?></span></div>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="sec-head center" data-reveal>
      <span class="eyebrow">Our DCET batches</span>
      <h2 class="sec-title display">Choose your preparation runway</h2>
    </div>
    <div class="course-rail" data-reveal="stagger">
      <?php foreach (courses() as $c) partial('course-card', ['c' => $c]); ?>
    </div>
  </div>
</section>

<section class="sec sec-soft">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-6" data-reveal>
        <span class="eyebrow">Application</span>
        <h2 class="sec-title-sm display">How to fill the DCET application form</h2>
        <ol class="num-list mt-4">
          <li>Visit the official website <strong>kea.kar.nic.in</strong>.</li>
          <li>On the home page, under the admission tab, click DCET.</li>
          <li>Click on New Registration and enter the required details.</li>
          <li>You will receive the application number and password on your registered email / mobile.</li>
          <li>Fill in all details carefully and proceed.</li>
          <li>Upload a recent passport-size photo, scanned signature, parent’s signature and left-hand thumb impression in the prescribed format.</li>
          <li>Cross-check every detail — the form cannot be edited once submitted.</li>
          <li>Make the declaration and pay the application fee.</li>
          <li>Download and store the application form for future reference.</li>
        </ol>
      </div>
      <div class="col-lg-6" data-reveal>
        <div class="card-x mb-4">
          <h3>DCET exam centres</h3>
          <div class="d-flex flex-wrap gap-2 mt-3">
            <?php foreach (['Bengaluru', 'Ballari', 'Vijayapura', 'Belagavi', 'Davanagere', 'Mangaluru', 'Dharwad', 'Kalaburagi', 'Mysuru', 'Shivamogga'] as $c): ?><span class="chip"><?= icon('pin', 'ic ic-sm') ?> <?= e($c) ?></span><?php endforeach; ?>
          </div>
          <p class="note-x mt-3 mb-0">Horanadu / Gadinadu candidates must choose Bengaluru as their exam centre.</p>
        </div>
        <div class="card-x">
          <h3>Documents required at verification</h3>
          <ul class="check-list mt-3 small">
            <?php foreach (['Final printout of the downloaded DCET application form', 'Original challan (application fee payment)', 'DCET admission ticket', 'SSLC / 10th standard marks card', 'Diploma marks cards of all years / semesters', 'Study certificate counter-signed by BEO / DDPI (Karnataka candidates)', 'Two recent passport-size colour photographs', 'Rural study certificate (if claiming rural reservation)', 'Kannada medium study certificate (if claiming Kannada medium quota)', 'Caste and income certificates (if applicable)'] as $d): ?>
            <li><?= icon('check') ?><?= e($d) ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow">Preparation strategy</span><h2 class="sec-title-sm display">How T.T.T toppers prepare</h2></div>
    <div class="row g-4" data-reveal="stagger">
      <div class="col-md-6 col-lg-3"><div class="card-x"><span class="b-icon mb-3"><?= icon('clock') ?></span><h3>Manage your time</h3><p class="muted mb-0 small">Develop and stick to a time-management strategy and a study schedule. Cut distractions like social media and TV.</p></div></div>
      <div class="col-md-6 col-lg-3"><div class="card-x"><span class="b-icon mb-3"><?= icon('calendar') ?></span><h3>Study regularly</h3><p class="muted mb-0 small">Daily study is crucial — but avoid straining yourself. Practise previous year papers, leaving time to double-check answers.</p></div></div>
      <div class="col-md-6 col-lg-3"><div class="card-x"><span class="b-icon mb-3"><?= icon('chart') ?></span><h3>Self-evaluate</h3><p class="muted mb-0 small">Use practice tests to find strengths and weaknesses. A SWOT analysis of your answer paper sharpens the final stretch.</p></div></div>
      <div class="col-md-6 col-lg-3"><div class="card-x"><span class="b-icon mb-3"><?= icon('star') ?></span><h3>‘U’ are unique</h3><p class="muted mb-0 small">Each of you has different strengths, goals and needs. “Know yourself to grow yourself” — and reach your dream college.</p></div></div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
