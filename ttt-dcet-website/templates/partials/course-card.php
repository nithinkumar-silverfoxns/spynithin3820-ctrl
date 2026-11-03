<?php /** @var array $c */ ?>
<article class="course-card" style="--accent: <?= e($c['accent'] ?: '#2F6BFF') ?>" data-tilt="5">
  <div class="cc-top">
    <div>
      <span class="cc-type"><?= e($c['type_label']) ?></span>
      <h3 class="cc-name display"><?= e($c['name']) ?></h3>
      <p class="cc-tag mb-0"><?= e($c['tagline']) ?></p>
    </div>
    <div class="cc-dur" aria-label="<?= e($c['duration']) ?>"><b><?= (int) $c['duration_months'] ?></b><small><?= (int) $c['duration_months'] === 1 ? 'Month' : 'Months' ?></small></div>
  </div>
  <ul class="cc-list">
    <?php foreach (array_slice($c['features'], 0, 5) as $f): ?>
    <li><?= icon('check') ?><span><?= e($f) ?></span></li>
    <?php endforeach; ?>
  </ul>
  <div class="cc-chips">
    <span class="chip"><?= icon('users', 'ic ic-sm') ?> Offline &amp; online</span>
    <span class="chip"><?= icon('video', 'ic ic-sm') ?> Recorded classes</span>
    <span class="chip"><?= icon('test', 'ic ic-sm') ?> Mock tests</span>
    <span class="chip"><?= icon('book', 'ic ic-sm') ?> Study material</span>
  </div>
  <div class="cc-actions">
    <a class="btn-x btn-x-dark btn-x-sm" href="<?= e(url('/dcet-coaching/' . $c['slug'])) ?>">Explore <?= e($c['name']) ?> <?= icon('arrow', 'ic ic-sm') ?></a>
    <a class="btn-x btn-x-light btn-x-sm" href="<?= e(url('/admission?course=' . rawurlencode($c['name']))) ?>">Enquire</a>
  </div>
</article>
