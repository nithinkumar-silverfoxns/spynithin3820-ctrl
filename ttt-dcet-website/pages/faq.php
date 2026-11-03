<?php
$all = faqs();
page_meta([
    'title' => 'DCET & Coaching FAQs | T.T.T Academy',
    'description' => 'Answers to common questions about the DCET exam, rank calculation, T.T.T batch timings, online classes, admission discount, PG accommodation and cash prizes.',
    'schema' => [[
        '@context' => 'https://schema.org', '@type' => 'FAQPage',
        'mainEntity' => array_map(fn($f) => ['@type' => 'Question', 'name' => $f['question'], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['answer']]], $all),
    ]],
]);
$cats = ['exam' => 'DCET exam', 'coaching' => 'Coaching & batches', 'admission' => 'Admission & fees'];
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'FAQ',
    'title' => 'Quick answers for <span class="text-grad">students &amp; parents.</span>',
    'lead' => 'Everything students and parents ask us most. Can’t find your answer? Call or WhatsApp us.',
    'crumbs' => ['Resources' => null, 'FAQ' => null],
]);
?>

<section class="sec">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-3">
        <nav class="d-flex flex-lg-column gap-2 flex-wrap" style="position:sticky;top:110px" aria-label="FAQ categories">
          <?php foreach ($cats as $k => $l): ?><a class="pill-btn" href="#faq-<?= $k ?>"><?= e($l) ?></a><?php endforeach; ?>
        </nav>
      </div>
      <div class="col-lg-9">
        <?php foreach ($cats as $k => $l): $items = array_filter($all, fn($f) => $f['category'] === $k); if (!$items) continue; ?>
        <h2 class="h3 display mb-3 mt-2" id="faq-<?= $k ?>" style="scroll-margin-top:110px"><?= e($l) ?></h2>
        <div class="accordion faq-x mb-5" id="acc-<?= $k ?>">
          <?php foreach (array_values($items) as $i => $f): $id = $k . $i; ?>
          <div class="accordion-item">
            <h3 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q<?= $id ?>" aria-expanded="false" aria-controls="q<?= $id ?>"><?= e($f['question']) ?></button></h3>
            <div id="q<?= $id ?>" class="accordion-collapse collapse" data-bs-parent="#acc-<?= $k ?>"><div class="accordion-body"><?= e($f['answer']) ?></div></div>
          </div>
          <?php endforeach; ?>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
