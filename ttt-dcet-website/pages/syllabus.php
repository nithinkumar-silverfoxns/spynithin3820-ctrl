<?php
page_meta([
    'title' => 'DCET Syllabus Explorer 2027 | Subjects, Marks & Focus Areas | T.T.T Academy',
    'description' => 'DCET syllabus: Engineering Mathematics, Statistics & Analytics, IT Skills, Fundamentals of Electrical & Electronics Engineering and Project Management Skills — 20 marks each, 100 MCQs, 3 hours.',
]);
$subs = content('syllabus');
$total = array_sum(array_map(fn($s) => (int) $s['marks'], $subs));
$syllabusPdf = null;
foreach (content('materials') as $m) if (in_array($m['category'], ['syllabus', 'pyq'], true) && $m['access'] === 'public') { $syllabusPdf = $m; break; }
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'DCET Syllabus Explorer',
    'title' => 'Five subjects. <span class="text-grad">One hundred marks.</span>',
    'lead' => 'Explore what each DCET subject covers, how much it weighs, and how our toppers prepare for it.',
    'crumbs' => ['DCET Coaching' => '/dcet-coaching', 'Syllabus' => null],
]);
?>

<section class="sec">
  <div class="container-xl">
    <div class="donut-row mb-5" data-reveal>
      <svg width="150" height="150" viewBox="0 0 42 42" role="img" aria-label="Marks weightage: each of the <?= count($subs) ?> subjects carries <?= (int) ($subs[0]['marks'] ?? 0) ?> marks">
        <?php $off = 25; $cols = ['#2F6BFF', '#6D4AFF', '#0EA5E9', '#C98A12', '#9B4DFF']; foreach ($subs as $i => $s): $pct = $s['marks'] / max(1, $total) * 100; ?>
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="<?= $cols[$i % 5] ?>" stroke-width="5" stroke-dasharray="<?= $pct - 1 ?> <?= 101 - $pct ?>" stroke-dashoffset="<?= $off ?>"></circle>
        <?php $off -= $pct; endforeach; ?>
        <text x="21" y="22.5" text-anchor="middle" style="font: 800 7px var(--ff-display); fill: var(--ink)"><?= $total ?></text>
      </svg>
      <div>
        <h2 class="sec-title-sm display m-0">Equal weightage across subjects</h2>
        <p class="muted mb-2">100 MCQs · 3 hours · offline OMR · +1 per correct answer · no negative marking.</p>
        <div class="d-flex flex-wrap gap-2"><?php foreach ($subs as $i => $s): ?><span class="chip"><i style="width:10px;height:10px;border-radius:3px;background:<?= $cols[$i % 5] ?>"></i><?= e($s['short']) ?> · <?= (int) $s['marks'] ?></span><?php endforeach; ?></div>
      </div>
    </div>

    <div class="syl-wrap" data-tabs>
      <div class="syl-tabs" role="tablist" aria-label="DCET subjects" aria-orientation="vertical">
        <?php foreach ($subs as $i => $s): ?>
        <button type="button" role="tab" id="st<?= $i ?>" aria-controls="sp<?= $i ?>" aria-selected="<?= $i ? 'false' : 'true' ?>" tabindex="<?= $i ? '-1' : '0' ?>"><span><?= e($s['subject']) ?></span><small><?= (int) $s['marks'] ?> marks</small></button>
        <?php endforeach; ?>
      </div>
      <div>
        <?php foreach ($subs as $i => $s): ?>
        <div class="syl-panel" role="tabpanel" id="sp<?= $i ?>" aria-labelledby="st<?= $i ?>" <?= $i ? 'hidden' : '' ?>>
          <span class="badge-soft"><?= e($s['short']) ?> · <?= (int) $s['marks'] ?> marks</span>
          <h2 class="h2 display mt-3"><?= e($s['subject']) ?></h2>
          <div class="syl-topics">
            <?php foreach ($s['topics'] as $t): ?><div class="syl-topic"><?= icon('check', 'ic ic-sm') ?><span><?= e($t) ?></span></div><?php endforeach; ?>
          </div>
          <?php if ($s['tip']): ?><div class="card-x" style="background:var(--bg-tint);border:0;box-shadow:none"><strong style="font-family:var(--ff-display)">T.T.T tip:</strong> <?= e($s['tip']) ?></div><?php endif; ?>
        </div>
        <?php endforeach; ?>
        <p class="note-x mt-3">Focus areas are indicative. Always cross-check with the official KEA DCET syllabus for your exam year.</p>
        <?php if ($syllabusPdf): ?><a class="btn-x btn-x-dark mt-2" href="<?= e(media_url($syllabusPdf['file'])) ?>" target="_blank" rel="noopener"><?= icon('download', 'ic ic-sm') ?> Download syllabus &amp; PYQ book (PDF)</a><?php endif; ?>
      </div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
