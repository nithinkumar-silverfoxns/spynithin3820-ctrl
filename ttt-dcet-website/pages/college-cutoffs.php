<?php
page_meta([
    'title' => 'DCET 2026 College Cutoffs & Top 50 Engineering Colleges in Karnataka | T.T.T Academy',
    'description' => 'Find engineering colleges and branches within reach of your DCET rank using DCET 2026 round-1 cutoff ranks (General / Rest of Karnataka), plus fees and placements for Karnataka’s top 50 colleges.',
]);
page_script('assets/js/cutoffs.js');
$colleges = colleges();
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'College cutoffs & admission guidance',
    'title' => 'Turn your rank into <span class="text-grad">the right college.</span>',
    'lead' => 'Enter your expected DCET rank and category to see which colleges and branches closed at or above that rank in DCET 2026 (Round 1).',
    'crumbs' => ['Resources' => null, 'College Cutoffs' => null],
]);
?>

<section class="sec" style="margin-top:-60px;padding-top:0">
  <div class="container-xl position-relative" style="z-index:3">
    <div class="form-card form-x" id="cutoffFinder" data-src="<?= e(url('/api/cutoffs')) ?>">
      <div class="row g-3 align-items-end">
        <div class="col-md-3"><label class="form-label" for="cfRank">Your DCET rank</label><input class="form-control" id="cfRank" type="number" min="1" max="30000" value="500" inputmode="numeric"></div>
        <div class="col-md-3"><label class="form-label" for="cfCat">Category</label>
          <select class="form-select" id="cfCat">
            <option value="GM">GM (General merit)</option><option value="GMK">GMK (GM Kannada)</option><option value="GMR">GMR (GM Rural)</option>
            <option value="1G">1G</option><option value="2AG">2AG</option><option value="2BG">2BG</option><option value="3AG">3AG</option><option value="3BG">3BG</option><option value="STG">STG</option>
          </select></div>
        <div class="col-md-4"><label class="form-label" for="cfBranch">Branch keyword (optional)</label><input class="form-control" id="cfBranch" type="search" placeholder="e.g. Computer, Mechanical, Civil"></div>
        <div class="col-md-2"><button class="btn-x btn-x-primary w-100" type="button" id="cfGo">Find colleges</button></div>
      </div>
      <div class="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
        <strong id="cfSummary" aria-live="polite" style="font-family:var(--ff-display)">Loading cutoff data…</strong>
        <span class="note-x">Source: DCET 2026 Round-1 cutoff ranks (General / Rest of Karnataka), via T.T.T’s DCET cutoff portal.</span>
      </div>
      <div class="table-scroll mt-3" style="max-height:520px;overflow-y:auto">
        <table class="table-x mb-0"><thead style="position:sticky;top:0"><tr><th>College</th><th>Branch</th><th class="num">Closing rank</th><th class="num">Margin</th></tr></thead><tbody id="cfBody"><tr><td colspan="4" class="muted">—</td></tr></tbody></table>
      </div>
      <p class="note-x mt-3 mb-0">Cutoffs change every year with seat matrix, difficulty and number of candidates. Use this as guidance only and verify with KEA during counselling. “--” in the source means no seat was allotted in that category.</p>
    </div>
  </div>
</section>

<section class="sec sec-soft" data-filter-scope>
  <div class="container-xl">
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
      <div data-reveal><span class="eyebrow">College guide</span><h2 class="sec-title-sm display">Top 50 engineering colleges in Karnataka</h2><p class="muted mb-0">Approximate fees and placement figures as compiled by T.T.T Academy for DCET aspirants.</p></div>
      <label class="search-x"><?= icon('search', 'ic ic-sm') ?><span class="visually-hidden">Search colleges</span><input type="search" placeholder="Search college, city or KEA code" data-filter-search></label>
    </div>
    <p class="small muted mb-3">Showing <span data-filter-count><?= count($colleges) ?></span> colleges</p>
    <div class="row g-3">
      <?php foreach ($colleges as $c): ?>
      <div class="col-md-6 col-lg-4" data-filter-item="all" data-search="<?= e(mb_strtolower($c['name'] . ' ' . implode(' ', $c['tags'] ?? []) . ' ' . ($c['code'] ?? ''))) ?>">
        <article class="card-x d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <span class="badge-soft">#<?= (int) $c['rank'] ?> · <?= e($c['code'] ?? '') ?></span>
            <?php if (!empty($c['badge'])): ?><span class="chip"><?= e($c['badge']) ?></span><?php endif; ?>
          </div>
          <h3 class="h5 mt-3 mb-1"><?= e($c['name']) ?></h3>
          <p class="small muted mb-3"><?= e(implode(' · ', $c['tags'] ?? [])) ?></p>
          <div class="row g-2 small mb-3">
            <div class="col-4"><div class="muted" style="font-size:.72rem">Approx. fees</div><strong><?= e($c['fees'] ?? '—') ?></strong></div>
            <div class="col-4"><div class="muted" style="font-size:.72rem">Avg package</div><strong><?= e($c['avg_lpa'] ?? '—') ?></strong></div>
            <div class="col-4"><div class="muted" style="font-size:.72rem">Highest</div><strong><?= e($c['max_lpa'] ?? '—') ?></strong></div>
          </div>
          <?php if (!empty($c['cutoffs'])): ?>
          <details class="mt-auto">
            <summary class="link-arrow" style="cursor:pointer">DCET 2026 GM cutoffs (<?= count($c['cutoffs']) ?> branches)</summary>
            <ul class="list-unstyled small mt-2 mb-0">
              <?php foreach ($c['cutoffs'] as $co): ?><li class="d-flex justify-content-between gap-2 py-1" style="border-bottom:1px solid var(--line)"><span><?= e($co['course']) ?></span><strong><?= e($co['GM'] ?? '--') ?></strong></li><?php endforeach; ?>
            </ul>
          </details>
          <?php endif; ?>
          <?php if (!empty($c['website'])): ?><a class="small mt-2" href="<?= e($c['website']) ?>" target="_blank" rel="noopener nofollow">Official website <?= icon('external', 'ic ic-xs') ?></a><?php endif; ?>
        </article>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-6" data-reveal>
        <span class="eyebrow">Admission guidance</span>
        <h2 class="sec-title-sm display">Counselling support for every T.T.T student</h2>
        <ul class="check-list mt-3">
          <li><?= icon('check') ?>Live counselling / guidance sessions before KEA option entry</li>
          <li><?= icon('check') ?>Previous year college-wise seat matrix and cutoff PDF</li>
          <li><?= icon('check') ?>Rank predictor and performance trends in the TTT Student Panel</li>
          <li><?= icon('check') ?>Help choosing between branch and college based on your goals</li>
        </ul>
      </div>
      <div class="col-lg-6" data-reveal>
        <div class="kpi-grid" style="grid-template-columns:repeat(2,1fr)">
          <?php foreach (array_slice(content('admissions'), 0, 4) as $a): ?>
          <div class="kpi kpi-light"><div class="k-num text-grad-blue" data-count="<?= (int) $a['students'] ?>"><?= (int) $a['students'] ?></div><div class="k-lbl">T.T.T students at <?= e($a['college']) ?></div></div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
