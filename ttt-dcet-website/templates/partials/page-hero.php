<?php
/**
 * @var string $eyebrow
 * @var string $title   (may contain <span class="text-grad"> markup — trusted, written in templates)
 * @var string $lead
 * @var array  $crumbs  [label => path]
 * @var string $bg      optional background image path
 * @var string $actions optional HTML (trusted)
 */
?>
<section class="page-hero">
  <?php if (!empty($bg)): ?><div class="ph-bg"><?= img($bg, '', 'img-cover', ['loading' => 'eager', 'fetchpriority' => 'high', 'sizes' => '100vw']) ?></div><?php endif; ?>
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="orb orb-a" aria-hidden="true" data-parallax="80"></div>
  <div class="orb orb-b" aria-hidden="true" data-parallax="140"></div>
  <div class="container-xl">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="<?= e(url('/')) ?>">Home</a>
      <?php foreach (($crumbs ?? []) as $label => $path): ?>
        <span aria-hidden="true">/</span><?= $path ? '<a href="' . e(url($path)) . '">' . e($label) . '</a>' : '<span aria-current="page">' . e($label) . '</span>' ?>
      <?php endforeach; ?>
    </nav>
    <span class="eyebrow eyebrow-light mt-4"><?= e($eyebrow) ?></span>
    <h1 class="display"><?= $title ?></h1>
    <?php if (!empty($lead)): ?><p class="lead-x"><?= e($lead) ?></p><?php endif; ?>
    <?php if (!empty($actions)): ?><div class="ph-actions d-flex flex-wrap gap-3 mt-4"><?= $actions ?></div><?php endif; ?>
  </div>
</section>
