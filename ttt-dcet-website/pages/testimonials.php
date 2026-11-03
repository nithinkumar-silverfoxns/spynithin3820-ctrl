<?php
page_meta([
    'title' => 'Student Testimonials & Success Stories | T.T.T Academy DCET',
    'description' => 'Genuine words and videos from T.T.T Academy DCET rank holders, students and parents — including State 1st rank holders Abhigna H (2025) and Santhrupth H R (2023).',
]);
$tests = content('testimonials');
$featured = array_shift($tests);
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Student Testimonials',
    'title' => 'Struggles, stress <span class="text-grad">&amp; success.</span>',
    'lead' => 'Unedited words from T.T.T students and parents. Every testimonial here is published with the student’s real name and result.',
    'crumbs' => ['Results' => '/dcet-results', 'Testimonials' => null],
]);
?>

<?php if ($featured): ?>
<section class="sec">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-4" data-reveal>
        <div class="rounded-x overflow-hidden shadow-x" data-tilt="6" style="aspect-ratio:1;background:var(--bg-tint)"><?= img($featured['photo'], $featured['name'], 'img-cover') ?></div>
      </div>
      <div class="col-lg-8" data-reveal>
        <span class="badge-soft"><?= icon('trophy', 'ic ic-sm') ?> <?= e($featured['title']) ?></span>
        <blockquote class="quote-hero mt-4">“<?= e($featured['quote']) ?>”</blockquote>
        <p class="fw-bold mt-3 mb-0" style="font-family:var(--ff-display)">— <?= e($featured['name']) ?></p>
      </div>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="sec sec-soft">
  <div class="container-xl">
    <div class="row g-4" data-reveal="stagger">
      <?php foreach ($tests as $t): ?><div class="col-md-6"><?php partial('testimonial', ['t' => $t]); ?></div><?php endforeach; ?>
    </div>
  </div>
</section>

<section class="sec sec-dark">
  <div class="container-xl">
    <div class="sec-head" data-reveal>
      <span class="eyebrow eyebrow-light">Video testimonials</span>
      <h2 class="sec-title display">Watch their <span class="text-grad">stories.</span></h2>
    </div>
    <div class="row g-4" data-reveal="stagger">
      <?php foreach (array_merge(videos('topper'), videos('testimonial')) as $v): ?>
      <div class="col-md-6 col-lg-4"><?php partial('video-card', ['v' => $v]); ?></div>
      <?php endforeach; ?>
    </div>
    <div class="text-center mt-5"><a class="btn-x btn-x-glass" href="<?= e(setting('youtube')) ?>" target="_blank" rel="noopener"><?= icon('youtube', 'ic ic-sm') ?> More on the T.T.T YouTube channel</a></div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
