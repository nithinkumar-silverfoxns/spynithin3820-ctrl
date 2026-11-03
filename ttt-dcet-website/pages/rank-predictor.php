<?php
page_meta([
    'title' => 'DCET Rank Predictor 2027 | Estimate Your Rank from CGPA & Marks | T.T.T Academy',
    'description' => 'Free DCET rank predictor: enter your diploma CGPA and DCET marks to see your calculated score (50% diploma + 50% DCET) and an estimated rank range based on previous DCET results.',
]);
page_script('assets/js/rank-predictor.js');
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Free tool · DCET Rank Predictor',
    'title' => 'Know where you stand <span class="text-grad">before results day.</span>',
    'lead' => 'Your DCET rank is decided by 50% diploma percentage and 50% DCET marks. Move the sliders to see your calculated score and estimated rank range instantly.',
    'crumbs' => ['Resources' => null, 'Rank Predictor' => null],
]);
?>

<section class="sec" style="margin-top:-60px;padding-top:0">
  <div class="container-xl position-relative" style="z-index:3">
    <div class="predictor" id="predictor">
      <div class="p-in form-x">
        <h2 class="h3 display mb-4">Your marks</h2>
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-end mb-2">
            <label class="form-label m-0" for="cgpa">Diploma CGPA (0–10)</label>
            <input class="form-control text-end" id="cgpa" type="number" min="0" max="10" step="0.01" value="8.50" style="width:110px;height:44px" inputmode="decimal">
          </div>
          <input class="range-x" type="range" min="4" max="10" step="0.01" value="8.50" data-sync="cgpa" aria-label="Diploma CGPA slider">
        </div>
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-end mb-2">
            <label class="form-label m-0" for="score">Expected DCET marks (out of 100)</label>
            <input class="form-control text-end" id="score" type="number" min="0" max="100" step="1" value="75" style="width:110px;height:44px" inputmode="numeric">
          </div>
          <input class="range-x" type="range" min="0" max="100" step="1" value="75" data-sync="score" aria-label="DCET marks slider">
        </div>
        <div class="card-x py-3" style="background:var(--bg-soft);box-shadow:none">
          <div class="small fw-semibold mb-2">How it is calculated</div>
          <div class="small muted">Diploma % = (CGPA − 0.75) × 10<br>Calculated score = 50% × Diploma % + 50% × DCET marks</div>
        </div>
        <p class="note-x mt-3 mb-0">This is an estimate based on T.T.T Academy’s analysis of previous DCET score-to-rank data. Actual ranks depend on the year’s paper and the KEA result. It is not an official KEA prediction.</p>
      </div>
      <div class="p-out" aria-live="polite">
        <div class="gauge">
          <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="10"/><circle id="gaugeArc" cx="60" cy="60" r="52" fill="none" stroke="url(#gg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="326.7"/><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#5b8cff"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs></svg>
          <div class="g-c"><div><div class="g-v" id="calcScore">—</div><div class="g-l">Calculated score / 100</div></div></div>
        </div>
        <div class="text-center small-caps" style="color:rgba(255,255,255,.6)">Estimated DCET rank</div>
        <div class="p-range" id="rankRange">—</div>
        <div class="p-break">
          <div><b id="dipPct">—</b><small>Diploma %</small></div>
          <div><b id="dcetPart">—</b><small>DCET marks</small></div>
        </div>
        <p class="text-center small mt-4 mb-3" id="rankMsg" style="color:rgba(255,255,255,.75)"></p>
        <div class="d-flex flex-wrap gap-2 justify-content-center">
          <a class="btn-x btn-x-primary btn-x-sm" href="<?= e(url('/college-cutoffs')) ?>">Which colleges fit this rank? <?= icon('arrow', 'ic ic-sm') ?></a>
          <a class="btn-x btn-x-glass btn-x-sm" href="<?= e(url('/admission')) ?>">Aim higher with T.T.T</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec sec-soft">
  <div class="container-xl">
    <div class="row g-5 align-items-center">
      <div class="col-lg-6" data-reveal>
        <span class="eyebrow">DCET 2026 score distribution</span>
        <h2 class="sec-title-sm display">How DCET scores are spread across candidates</h2>
        <p class="muted">A small difference in marks near the top changes your rank by hundreds of places — that is why every mock test matters.</p>
        <a class="btn-x btn-x-dark mt-2" href="<?= e(url('/study-materials')) ?>"><?= icon('download', 'ic ic-sm') ?> How toppers calculate DCET ranks (PDF)</a>
      </div>
      <div class="col-lg-6" data-reveal><a href="<?= e(asset('assets/img/posters/dcet-2026-score-distribution.webp')) ?>" data-lightbox="dist" data-caption="DCET 2026 score range distribution"><?= img('assets/img/posters/dcet-2026-score-distribution.webp', 'DCET 2026 score range distribution chart published by T.T.T Academy', 'rounded-x shadow-x') ?></a></div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
