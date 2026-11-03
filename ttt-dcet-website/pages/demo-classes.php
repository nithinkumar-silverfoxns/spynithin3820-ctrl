<?php
page_meta([
    'title' => 'Free DCET Demo Class | Watch & Book | T.T.T Academy',
    'description' => 'Watch T.T.T Academy DCET course and topper videos, then book a free demo class at Peenya, T-Dasarahalli or Magadi Road — or attend online.',
]);
$demo = videos('demo');
$course = videos('course');
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Demo Classes',
    'title' => 'Sit in a class <span class="text-grad">before you decide.</span>',
    'lead' => 'Experience how T.T.T teaches DCET — attend a free demo class in person or online, and watch our course and topper sessions below.',
    'crumbs' => ['Resources' => null, 'Demo Classes' => null],
    'actions' => '<a class="btn-x btn-x-primary" href="#book">Book a free demo ' . icon('arrow', 'ic ic-sm') . '</a>',
]);
?>

<section class="sec">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <?php if ($course): $v = $course[0]; ?>
      <div class="col-lg-7" data-reveal><?php partial('video-card', ['v' => $v]); ?></div>
      <?php endif; ?>
      <div class="col-lg-5" data-reveal>
        <span class="eyebrow">What a demo class looks like</span>
        <h2 class="sec-title-sm display">A real class, not a sales pitch</h2>
        <ul class="check-list mt-3">
          <li><?= icon('check') ?>A live chapter session by a DCET textbook author</li>
          <li><?= icon('check') ?>Shortcut techniques for DCET-pattern MCQs</li>
          <li><?= icon('check') ?>A walkthrough of the TTT Student Panel, tests and recorded classes</li>
          <li><?= icon('check') ?>Counselling on the right batch — Pratigna, Jnana or Pragathi</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<?php if ($demo): ?>
<section class="sec sec-soft">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow">Demo lectures</span><h2 class="sec-title-sm display">Watch sample lectures</h2></div>
    <div class="row g-4" data-reveal="stagger"><?php foreach ($demo as $v): ?><div class="col-md-6 col-lg-4"><?php partial('video-card', ['v' => $v]); ?></div><?php endforeach; ?></div>
  </div>
</section>
<?php endif; ?>

<section class="sec sec-dark">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow eyebrow-light">Learn from toppers</span><h2 class="sec-title-sm display">Study tips from our state rank holders</h2></div>
    <div class="row g-4" data-reveal="stagger"><?php foreach (videos('topper') as $v): ?><div class="col-md-6 col-lg-3"><?php partial('video-card', ['v' => $v]); ?></div><?php endforeach; ?></div>
    <div class="mt-5"><a class="btn-x btn-x-glass" href="<?= e(setting('youtube')) ?>" target="_blank" rel="noopener"><?= icon('youtube', 'ic ic-sm') ?> All videos on YouTube</a></div>
  </div>
</section>

<section class="sec" id="book">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-5" data-reveal>
        <span class="eyebrow">Book a demo</span>
        <h2 class="sec-title-sm display">Pick a date. We’ll save you a seat.</h2>
        <p class="muted">Choose your preferred date and slot; our team will confirm the demo class by phone or WhatsApp.</p>
        <?php foreach (content('branches') as $b): ?>
        <div class="d-flex gap-3 mt-3"><span class="b-icon" style="width:40px;height:40px;flex:none"><?= icon('pin', 'ic ic-sm') ?></span><span><strong class="d-block"><?= e($b['name']) ?></strong><span class="small muted"><?= e($b['address']) ?></span></span></div>
        <?php endforeach; ?>
      </div>
      <div class="col-lg-7" data-reveal><?php partial('enquiry-form', ['type' => 'demo']); ?></div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
