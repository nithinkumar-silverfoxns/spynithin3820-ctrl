<?php /** @var array $t */ ?>
<article class="t-card" data-tilt="6" data-filter-item="<?= (int) $t['year'] ?>" data-search="<?= e(mb_strtolower($t['name'] . ' ' . $t['diploma_college'])) ?>">
  <div class="t-img">
    <?php if ($t['photo']): ?><?= img($t['photo'], $t['name'] . ', DCET ' . $t['year'] . ' State Rank ' . $t['rank_no'], '', ['sizes' => '(max-width: 600px) 50vw, 260px']) ?><?php endif; ?>
  </div>
  <span class="rank-badge" aria-label="State rank <?= (int) $t['rank_no'] ?>"><b><?= (int) $t['rank_no'] ?><sup><?= e(substr(ordinal((int) $t['rank_no']), -2)) ?></sup></b><small>State</small></span>
  <div class="t-body">
    <div class="t-name"><?= e($t['name']) ?></div>
    <div class="t-meta">DCET <?= (int) $t['year'] ?> · <?= e($t['diploma_college']) ?></div>
    <?php if ($t['score']): ?><span class="t-score"><?= e($t['score']) ?> in DCET</span><?php endif; ?>
    <?php if ($t['admitted_college']): ?><div class="t-meta mt-2"><?= icon('building', 'ic ic-sm') ?> <?= e($t['admitted_college']) ?></div><?php endif; ?>
  </div>
</article>
