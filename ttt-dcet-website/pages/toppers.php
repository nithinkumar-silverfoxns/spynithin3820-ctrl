<?php
$toppers = array_values(array_filter(toppers(), fn($t) => $t['photo'] !== ''));
$rankers = rankers();
$years = array_values(array_unique(array_map(fn($r) => (int) $r['year'], $rankers)));
rsort($years);
$hall = [
    ['img' => 'assets/img/toppers/feature-abhigna.webp', 'name' => 'Abhigna H', 'line' => 'DCET 2025 · State 1st rank · 93/100'],
    ['img' => 'assets/img/toppers/feature-santrupth.webp', 'name' => 'Santhrupth H R', 'line' => 'DCET 2023 · State 1st rank · 93/100'],
    ['img' => 'assets/img/toppers/feature-manohar.webp', 'name' => 'Manohar D S', 'line' => 'DCET 2024 · State 3rd rank · 94/100'],
    ['img' => 'assets/img/toppers/feature-srujan.webp', 'name' => 'Srujan', 'line' => 'DCET 2023 · State 7th rank · 91/100'],
];
page_meta([
    'title' => 'Our DCET Toppers | State Rank Holders 2023–2026 | T.T.T Academy',
    'description' => 'Meet T.T.T Academy’s DCET state rank holders — Abhigna H (State 1st, 2025), Santhrupth H R (State 1st, 2023), Manohar D S (State 3rd, 2024), Keshavaram (State 3rd, 2026) and ' . count($rankers) . '+ named rank holders.',
]);
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Our Toppers',
    'title' => 'The T.T.T <span class="text-grad">Hall of Fame.</span>',
    'lead' => 'Real students, real ranks — exactly as published on our official DCET result posters. Search for any rank holder from 2023 to 2026.',
    'crumbs' => ['Results' => '/dcet-results', 'Our Toppers' => null],
]);
?>

<section class="sec sec-dark" style="padding-top:0">
  <div class="container-xl">
    <div class="row g-4" data-reveal="stagger">
      <?php foreach ($hall as $h): ?>
      <div class="col-sm-6 col-lg-3">
        <figure class="m-0 rounded-x overflow-hidden" style="background:#fff" data-tilt="7">
          <?= img($h['img'], $h['name'] . ' — ' . $h['line']) ?>
          <figcaption class="p-3" style="background:var(--navy-800)"><strong class="d-block" style="font-family:var(--ff-display)"><?= e($h['name']) ?></strong><span class="small" style="color:rgba(255,255,255,.65)"><?= e($h['line']) ?></span></figcaption>
        </figure>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="sec" data-filter-scope>
  <div class="container-xl">
    <div class="sec-head" data-reveal>
      <span class="eyebrow">State top rank holders</span>
      <h2 class="sec-title display">Top-ranked achievers, year by year</h2>
    </div>
    <div class="filter-bar mb-4" role="group" aria-label="Filter by year">
      <button class="pill-btn" type="button" data-filter="all" aria-pressed="true">All years</button>
      <?php foreach ($years as $y): ?><button class="pill-btn" type="button" data-filter="<?= $y ?>" aria-pressed="false">DCET <?= $y ?></button><?php endforeach; ?>
    </div>
    <div class="spotlight">
      <?php foreach ($toppers as $t) partial('topper-card', ['t' => $t]); ?>
    </div>
  </div>
</section>

<section class="sec sec-soft" id="wall" data-filter-scope>
  <div class="container-xl">
    <div class="row g-4 align-items-end mb-4">
      <div class="col-lg-7" data-reveal>
        <span class="eyebrow">Rank holders wall</span>
        <h2 class="sec-title-sm display"><span data-filter-count><?= count($rankers) ?></span> named rank holders</h2>
        <p class="muted mb-0">Transcribed from T.T.T Academy’s official DCET 2023–2026 result posters. These are the featured names — each year’s full count (e.g. <?= (int) results()[0]['below_2000'] ?> students under rank 2000 in DCET <?= (int) results()[0]['year'] ?>) is larger.</p>
      </div>
      <div class="col-lg-5"><label class="search-x w-100" style="max-width:none"><?= icon('search', 'ic ic-sm') ?><span class="visually-hidden">Search rank holders</span><input type="search" placeholder="Search by name or polytechnic…" data-filter-search></label></div>
    </div>
    <div class="filter-bar mb-4" role="group" aria-label="Filter rank holders by year">
      <button class="pill-btn" type="button" data-filter="all" aria-pressed="true">All</button>
      <?php foreach ($years as $y): ?><button class="pill-btn" type="button" data-filter="<?= $y ?>" aria-pressed="false"><?= $y ?></button><?php endforeach; ?>
      <button class="pill-btn" type="button" data-filter="top100" aria-pressed="false">Top 100 only</button>
    </div>
    <div class="ranker-grid">
      <?php foreach ($rankers as $r): $n = (int) $r['rank_no']; $cls = $n <= 10 ? 'top10' : ($n <= 100 ? 'top100' : ''); ?>
      <div class="ranker <?= $cls ?>" data-filter-item="<?= (int) $r['year'] ?><?= $n <= 100 ? ' top100' : '' ?>" data-search="<?= e(mb_strtolower($r['name'] . ' ' . $r['college'] . ' ' . $r['year'])) ?>">
        <span class="r-no"><?= $n ?><?= $r['category'] ? '<small style="font-size:.6em;margin-left:2px">' . e($r['category']) . '</small>' : '' ?></span>
        <span><span class="r-name d-block"><?= e($r['name']) ?></span><span class="r-col">DCET <?= (int) $r['year'] ?> · <?= e($r['college']) ?></span></span>
      </div>
      <?php endforeach; ?>
    </div>
    <p class="note-x mt-4">Rank shown is the DCET state rank; “G55” marks a category rank as printed on the poster. Spotted a spelling mistake in your name? <a href="<?= e(url('/contact')) ?>">Tell us</a>.</p>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow">Topper interviews</span><h2 class="sec-title-sm display">Hear it from the rank holders</h2></div>
    <div class="row g-4" data-reveal="stagger">
      <?php foreach (videos('topper') as $v): ?><div class="col-md-6 col-lg-3"><?php partial('video-card', ['v' => $v]); ?></div><?php endforeach; ?>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
