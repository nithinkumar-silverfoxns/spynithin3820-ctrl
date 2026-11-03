<?php /** @var array $v */ ?>
<div class="h-100">
  <button class="vid" type="button" data-yt="<?= e($v['youtube_id']) ?>" aria-label="Play video: <?= e($v['title']) ?>">
    <img src="<?= e(youtube_thumb($v['youtube_id'])) ?>" alt="" loading="lazy" decoding="async" width="480" height="360">
    <span class="vid-play"><?= icon('play') ?></span>
  </button>
  <?php $cats = ['topper' => 'Topper interview', 'testimonial' => 'Student voice', 'demo' => 'Demo lecture', 'course' => 'Course overview']; ?>
  <div class="mt-3"><span class="vid-cat"><?= e($cats[$v['category']] ?? '') ?></span></div>
  <h3 class="vid-title"><?= e($v['title']) ?></h3>
</div>
