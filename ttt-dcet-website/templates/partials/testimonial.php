<?php /** @var array $t */ ?>
<figure class="quote-card m-0">
  <?= icon('quote', 'q-ic') ?>
  <blockquote><?= e($t['quote']) ?></blockquote>
  <figcaption class="q-who">
    <?php if ($t['photo']): ?><?= img($t['photo'], $t['name'], 'q-avatar') ?><?php else: ?><span class="q-avatar" aria-hidden="true"><?= e(mb_substr($t['name'], 0, 1)) ?></span><?php endif; ?>
    <span><span class="q-name d-block"><?= e($t['name']) ?></span><span class="q-title"><?= e($t['title']) ?></span></span>
  </figcaption>
</figure>
