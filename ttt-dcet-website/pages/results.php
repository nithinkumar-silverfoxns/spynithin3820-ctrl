<?php
$results = results();
$admissions = content('admissions');
$bands = ['below_10' => 'Top 10', 'below_100' => 'Top 100', 'below_200' => 'Top 200', 'below_500' => 'Top 500', 'below_1000' => 'Top 1000', 'below_1500' => 'Top 1500', 'below_2000' => 'Top 2000'];
page_meta([
    'title' => 'DCET Results 2022–2026 | T.T.T Academy Rank Holders Dashboard',
    'description' => 'Verified DCET results of T.T.T Academy: State 1st rank in 2023 & 2025, State 3rd in 2024 & 2026. Year-wise number of students under ranks 10, 100, 200, 500, 1000, 1500 and 2000.',
]);
page_script('assets/js/results.js');
$payload = [
    'bands' => $bands,
    'years' => array_map(fn($r) => ['year' => (int) $r['year'], 'best' => (int) $r['best_rank'], 'values' => array_map(fn($k) => $r[$k] === null || $r[$k] === '' ? null : (int) $r[$k], array_combine(array_keys($bands), array_keys($bands)))], $results),
];
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'DCET Results',
    'title' => 'Results that speak. <span class="text-grad">Training that delivers.</span>',
    'lead' => 'Every number on this page comes from T.T.T Academy’s official DCET result announcements. No estimates, no rounding up.',
    'crumbs' => ['DCET Results' => null],
]);
?>

<section class="sec sec-dark" aria-labelledby="dashTitle" style="padding-top: 0;">
  <div class="container-xl">
    <div class="dash" id="resultsDash" data-results='<?= e(json_encode($payload)) ?>'>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 class="h3 display m-0" id="dashTitle">Rank distribution by year</h2>
        <div class="year-tabs" role="tablist" aria-label="Select DCET year">
          <?php foreach ($results as $i => $r): ?>
          <button type="button" role="tab" aria-selected="<?= $i ? 'false' : 'true' ?>" data-year="<?= (int) $r['year'] ?>"><?= (int) $r['year'] ?></button>
          <?php endforeach; ?>
        </div>
      </div>
      <div class="row g-4">
        <div class="col-lg-4">
          <div class="kpi h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="small-caps" style="color:var(--blue-2)">Best state rank</div>
              <div class="k-num mt-2" id="dashBest">—</div>
              <div class="k-lbl" id="dashYearLbl"></div>
            </div>
            <div class="row g-2 mt-4">
              <div class="col-6"><div class="kpi p-3"><div class="h3 m-0 display" id="dash100">—</div><div class="k-lbl m-0 small">under rank 100</div></div></div>
              <div class="col-6"><div class="kpi p-3"><div class="h3 m-0 display" id="dash500">—</div><div class="k-lbl m-0 small">under rank 500</div></div></div>
            </div>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="chart-wrap" id="bandChart" role="img" aria-label="Bar chart of T.T.T students within each DCET rank band for the selected year"></div>
          <p class="note-x mt-2 mb-0" id="bandNote">Cumulative counts: “Top 500” includes everyone in the top 100.</p>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-1">
      <div class="col-lg-7">
        <div class="dash h-100">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <h2 class="h4 display m-0">Year-on-year growth</h2>
            <div class="legend"><span><i style="background:#4F7FF0"></i>Under rank 100</span><span><i style="background:#C08A1E"></i>Under rank 500</span></div>
          </div>
          <div class="chart-wrap" id="trendChart" role="img" aria-label="Line chart of T.T.T students under rank 100 and under rank 500 from <?= min(result_years()) ?> to <?= max(result_years()) ?>"></div>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="dash h-100">
          <h2 class="h4 display mb-1">Where our students study</h2>
          <p class="note-x mb-3">T.T.T achievers admitted to top engineering colleges (as published by T.T.T Academy).</p>
          <div class="chart-wrap" id="collegeChart" data-colleges='<?= e(json_encode(array_map(fn($a) => ['c' => $a['college'], 'n' => (int) $a['students']], $admissions))) ?>' role="img" aria-label="Bar chart of T.T.T students admitted per engineering college"></div>
        </div>
      </div>
    </div>

    <div class="table-scroll mt-4">
      <table class="table-x table-dark mb-0">
        <caption class="visually-hidden">T.T.T Academy DCET results by year and rank band</caption>
        <thead><tr><th scope="col">Year</th><th scope="col" class="num">Best rank</th><?php foreach ($bands as $l): ?><th scope="col" class="num"><?= e($l) ?></th><?php endforeach; ?></tr></thead>
        <tbody>
          <?php foreach ($results as $r): ?>
          <tr><th scope="row">DCET <?= (int) $r['year'] ?></th><td class="num">State <?= e(ordinal((int) $r['best_rank'])) ?></td><?php foreach (array_keys($bands) as $k): ?><td class="num"><?= $r[$k] === null || $r[$k] === '' ? '<span title="Not published">—</span>' : (int) $r[$k] ?></td><?php endforeach; ?></tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
    <p class="note-x mt-3">“—” = category not published for that year. Sources: T.T.T Academy official DCET result posters and announcements.</p>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="sec-head" data-reveal>
      <span class="eyebrow">Official result posters</span>
      <h2 class="sec-title-sm display">See every rank holder, as announced</h2>
      <p class="muted">Tap a poster to view it full-size.</p>
    </div>
    <div class="row g-4" data-reveal="stagger">
      <?php foreach ($results as $r): if (!$r['poster']) continue; ?>
      <div class="col-sm-6 col-lg-3"><a class="poster-thumb" href="<?= e(media_url($r['poster'])) ?>" data-lightbox="posters" data-caption="DCET <?= (int) $r['year'] ?> top rank holders — T.T.T Academy"><?= img($r['poster'], 'DCET ' . $r['year'] . ' T.T.T Academy rank holders poster') ?><span>DCET <?= (int) $r['year'] ?> rank holders</span></a></div>
      <?php endforeach; ?>
    </div>
    <div class="row g-4 mt-1" data-reveal="stagger">
      <div class="col-md-6"><a class="poster-thumb" href="<?= e(asset('assets/img/posters/dcet-2023-2025-summary.webp')) ?>" data-lightbox="posters" data-caption="DCET 2023, 2024 & 2025 results summary"><?= img('assets/img/posters/dcet-2023-2025-summary.webp', 'DCET 2023 to 2025 results summary', '', ['style' => 'height:280px']) ?><span>2023 · 2024 · 2025 summary</span></a></div>
      <div class="col-md-6"><a class="poster-thumb" href="<?= e(asset('assets/img/posters/dcet-2026-achievers.webp')) ?>" data-lightbox="posters" data-caption="DCET 2026 achievers"><?= img('assets/img/posters/dcet-2026-achievers.webp', 'DCET 2026 achievers summary', '', ['style' => 'height:280px']) ?><span>DCET 2026 achievers</span></a></div>
    </div>
    <div class="d-flex flex-wrap gap-3 mt-5">
      <a class="btn-x btn-x-dark" href="<?= e(url('/our-toppers')) ?>">Search the rank holders wall <?= icon('arrow', 'ic ic-sm') ?></a>
      <a class="btn-x btn-x-light" href="<?= e(url('/study-materials')) ?>"><?= icon('download', 'ic ic-sm') ?> Download detailed rankers results</a>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
