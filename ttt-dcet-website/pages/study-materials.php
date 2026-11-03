<?php
page_meta([
    'title' => 'DCET Study Materials, Previous Year Papers & Syllabus PDF | T.T.T Academy',
    'description' => 'Download the DCET syllabus & previous year question paper book, rank-holder guides and more. Enrolled students get notes, PPTs, OMR mocks and seat-matrix PDFs in the student panel.',
]);
$materials = content('materials');
$cats = ['syllabus' => 'Syllabus', 'pyq' => 'Previous year papers', 'notes' => 'Notes', 'mock' => 'Mock tests', 'guide' => 'Guides & counselling'];
$student = current_user('student');
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Study Materials',
    'title' => 'Your complete <span class="text-grad">DCET toolkit.</span>',
    'lead' => 'Everything you need to study, practise and revise — prepared by our mentors. Free downloads below; the full library unlocks in the student panel after admission.',
    'crumbs' => ['Resources' => null, 'Study Materials' => null],
]);
?>

<section class="sec" data-filter-scope>
  <div class="container-xl">
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
      <div data-reveal><span class="eyebrow">Downloads</span><h2 class="sec-title-sm display">Free DCET downloads</h2></div>
      <div class="filter-bar" role="group" aria-label="Filter materials">
        <button class="pill-btn" type="button" data-filter="all" aria-pressed="true">All</button>
        <?php foreach ($cats as $k => $l): if (!array_filter($materials, fn($m) => $m['category'] === $k)) continue; ?><button class="pill-btn" type="button" data-filter="<?= e($k) ?>" aria-pressed="false"><?= e($l) ?></button><?php endforeach; ?>
      </div>
    </div>
    <div class="row g-4">
      <?php foreach ($materials as $m): $locked = $m['access'] === 'students' && !$student; ?>
      <div class="col-md-6 col-lg-4" data-filter-item="<?= e($m['category']) ?>">
        <div class="card-x d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <span class="b-icon"><?= icon($locked ? 'lock' : 'download') ?></span>
            <span class="chip"><?= e($cats[$m['category']] ?? '') ?></span>
          </div>
          <h3><?= e($m['title']) ?></h3>
          <p class="muted small"><?= e($m['description']) ?></p>
          <div class="mt-auto">
            <?php if ($locked): ?>
              <a class="btn-x btn-x-light btn-x-sm" href="<?= e(url('/student/login')) ?>"><?= icon('lock', 'ic ic-sm') ?> Student login to download</a>
            <?php elseif ($m['access'] === 'students'): ?>
              <a class="btn-x btn-x-dark btn-x-sm" href="<?= e(url('/student/download?id=' . (int) ($m['id'] ?? 0))) ?>"><?= icon('download', 'ic ic-sm') ?> Download</a>
            <?php else: ?>
              <a class="btn-x btn-x-dark btn-x-sm" href="<?= e(media_url($m['file'])) ?>" target="_blank" rel="noopener"><?= icon('download', 'ic ic-sm') ?> Download PDF</a>
            <?php endif; ?>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="sec sec-soft">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-5" data-reveal>
        <div class="rounded-x overflow-hidden shadow-x" data-tilt="6"><?= img('assets/img/courses/dcet-book-2027.webp', 'T.T.T DCET 2027 book cover') ?></div>
      </div>
      <div class="col-lg-7" data-reveal>
        <span class="eyebrow">T.T.T Publications</span>
        <h2 class="sec-title-sm display">The official T.T.T DCET Book</h2>
        <p>Written by the faculty who teach our batches, covering Engineering Mathematics, Statistics &amp; Analytics, IT Skills, FEEE and Project Management Skills — with theory, MCQs and previous year questions.</p>
        <div class="card-x mt-3" style="background:#fff">
          <h3 class="h5">Scan &amp; get an admission discount</h3>
          <ol class="num-list mt-3"><li>Purchase our DCET book</li><li>Scan the QR code on the cover page</li><li>Get an instant discount from T.T.T Academy</li><li>Save the screenshot &amp; show it while taking admission</li></ol>
        </div>
        <a class="btn-x btn-x-dark mt-4" href="<?= e(setting('publications')) ?>" target="_blank" rel="noopener">Visit T.T.T Publications <?= icon('external', 'ic ic-sm') ?></a>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow">Inside the student panel</span><h2 class="sec-title-sm display">What enrolled students get</h2></div>
    <div class="row g-3" data-reveal="stagger">
      <?php foreach ([['book', 'TTT DCET Text Book', 'Soft copy included with your batch.'], ['calc', 'Maths MCQ solutions', 'Unit-wise questions with worked solutions.'], ['chart', 'Revision PPTs', 'Unit-wise class revision slides.'], ['video', 'Key topic videos', 'Chapter-wise explanations you can replay anytime.'], ['test', 'Previous year papers', 'Question papers with complete solutions.'], ['check', 'OMR mock exams', 'Practise in the real exam format.'], ['sparkle', 'Unit-wise notes', 'Short, focused notes for quick revision.'], ['building', 'Seat matrix & cutoff PDF', 'Previous year college-wise seat matrix and cutoffs.']] as [$ic, $t, $d]): ?>
      <div class="col-6 col-lg-3"><div class="card-x"><span class="b-icon mb-3" style="width:42px;height:42px"><?= icon($ic, 'ic ic-sm') ?></span><h3 class="h6"><?= e($t) ?></h3><p class="muted small mb-0"><?= e($d) ?></p></div></div>
      <?php endforeach; ?>
    </div>
    <div class="d-flex flex-wrap gap-3 mt-5">
      <a class="btn-x btn-x-primary" href="<?= e(url('/student/login')) ?>"><?= icon('lock', 'ic ic-sm') ?> Student login</a>
      <a class="btn-x btn-x-light" href="<?= e(setting('student_panel')) ?>" target="_blank" rel="noopener">Open TTT Student Panel <?= icon('external', 'ic ic-sm') ?></a>
      <a class="btn-x btn-x-light" href="<?= e(setting('app_android')) ?>" target="_blank" rel="noopener">T.T.T Live Learn app</a>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
