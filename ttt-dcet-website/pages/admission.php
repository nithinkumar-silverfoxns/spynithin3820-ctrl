<?php
$pre = substr(trim((string) ($_GET['course'] ?? '')), 0, 40);
page_meta([
    'title' => 'DCET 2027 Admission | Apply Online | T.T.T Academy Bengaluru',
    'description' => 'Apply for T.T.T Academy DCET 2027 coaching — Pratigna (12 months), Jnana (6 months) or Pragathi (2 months). Simple admission process, QR book discount and cash prizes for state toppers.',
]);
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Admission · ' . setting('admission_year'),
    'title' => 'Your DCET seat <span class="text-grad">is waiting.</span>',
    'lead' => 'Talk to our admission team, choose the batch that fits your schedule, and get full access to classes, tests and study material.',
    'crumbs' => ['Admission' => null],
]);
?>

<section class="sec">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-7 order-lg-2" data-reveal><?php partial('enquiry-form', ['type' => 'admission', 'course' => $pre, 'title' => 'Apply for admission']); ?></div>
      <div class="col-lg-5" data-reveal>
        <span class="eyebrow">How admission works</span>
        <h2 class="sec-title-sm display">Four simple steps</h2>
        <div class="roadmap mt-4">
          <div class="rm-step"><span class="rm-dot">1</span><div><h3>Counselling &amp; batch selection</h3><p>Choose Morning, Evening or Weekend — at Peenya, T-Dasarahalli or Magadi Road, or online.</p></div></div>
          <div class="rm-step"><span class="rm-dot">2</span><div><h3>Buy the DCET book &amp; scan</h3><p>Scan the QR on the T.T.T DCET book cover for an instant admission discount.</p></div></div>
          <div class="rm-step"><span class="rm-dot">3</span><div><h3>Confirm admission</h3><p>Show the discount screenshot at the admission desk and complete enrolment.</p></div></div>
          <div class="rm-step"><span class="rm-dot">4</span><div><h3>Get your Student Panel login</h3><p>Receive panel credentials, orientation schedule and your complete test calendar.</p></div></div>
        </div>
        <div class="d-flex flex-wrap gap-2 mt-4">
          <a class="btn-x btn-x-dark btn-x-sm" href="<?= e(tel_link(setting('phone_admission'))) ?>"><?= icon('phone', 'ic ic-sm') ?> <?= e(setting('phone_admission')) ?></a>
          <a class="btn-x btn-x-wa btn-x-sm" href="<?= e(wa_link('Hi T.T.T Academy, I want to take admission for DCET coaching.')) ?>" target="_blank" rel="noopener"><?= icon('whatsapp', 'ic ic-sm') ?> WhatsApp</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec sec-soft">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow">Choose your batch</span><h2 class="sec-title-sm display">DCET batches at a glance</h2></div>
    <div class="table-scroll" data-reveal>
      <table class="table-x mb-0 bg-white">
        <thead><tr><th>Batch</th><th>Type</th><th>Duration</th><th>Best for</th><th></th></tr></thead>
        <tbody>
          <?php foreach (courses() as $c): ?>
          <tr><th scope="row" style="font-family:var(--ff-display)"><?= e($c['name']) ?></th><td><?= e($c['type_label']) ?></td><td><?= e($c['duration']) ?></td><td class="small"><?= e($c['ideal_for'][0] ?? '') ?></td><td><a class="link-arrow" href="<?= e(url('/dcet-coaching/' . $c['slug'])) ?>">Details <?= icon('arrow', 'ic ic-sm') ?></a></td></tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="row g-4" data-reveal="stagger">
      <div class="col-lg-4"><div class="prize h-100"><span class="eyebrow eyebrow-light">Cash prizes</span><div class="prize-amt mt-3"><?= e(setting('prize_first')) ?></div><p class="mb-3" style="color:rgba(255,255,255,.7)">State 1st rank</p><div class="prize-amt"><?= e(setting('prize_second')) ?></div><p class="mb-0" style="color:rgba(255,255,255,.7)">State 2nd rank</p></div></div>
      <div class="col-lg-4"><div class="card-x"><span class="b-icon mb-3"><?= icon('home') ?></span><h3>Outstation students</h3><p class="muted">Separate boys &amp; girls PG near the academy, with onboarding support for parents. Or join every class live online.</p></div></div>
      <div class="col-lg-4"><div class="card-x"><span class="b-icon mb-3"><?= icon('sparkle') ?></span><h3>Free Crash Course entry</h3><p class="muted">Jnana Batch students get free entry to the Pragathi Crash Course after 6th sem.</p></div></div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
