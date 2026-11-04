<?php
page_meta([
    'title' => 'Campus & Classroom Gallery | T.T.T Academy Bengaluru',
    'description' => 'Photos of T.T.T Academy’s campus, smart classrooms, DCET classes in action and student events in Bengaluru.',
]);
$items = content('gallery');
$cats = ['campus' => 'Campus & classrooms', 'classes' => 'Classes in action', 'events' => 'Events & celebrations'];
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Gallery',
    'title' => 'Life at <span class="text-grad">T.T.T Academy.</span>',
    'lead' => 'Discussion lounges, digital classrooms and a premium DCET study environment — plus the celebrations that make it a community.',
    'crumbs' => ['Gallery' => null],
    'bg' => 'assets/img/gallery/15.webp',
]);
?>

<section class="sec-sm overflow-hidden">
  <div class="strip" data-scroll-x="-1" aria-hidden="true">
    <?php foreach (array_slice($items, 0, 8) as $g): ?><?= img($g['image'], '', '', ['sizes' => '460px']) ?><?php endforeach; ?>
  </div>
</section>

<section class="sec pt-0" data-filter-scope>
  <div class="container-xl">
    <div class="filter-bar mb-4" role="group" aria-label="Filter gallery">
      <button class="pill-btn" type="button" data-filter="all" aria-pressed="true">All photos</button>
      <?php foreach ($cats as $k => $l): ?><button class="pill-btn" type="button" data-filter="<?= $k ?>" aria-pressed="false"><?= e($l) ?></button><?php endforeach; ?>
    </div>
    <div class="masonry">
      <?php foreach ($items as $g): ?>
      <a href="<?= e(image_large($g['image'])) ?>" data-lightbox="gallery" data-caption="<?= e($g['title']) ?>" data-filter-item="<?= e($g['category']) ?>"><?= img($g['image'], $g['title'], '', ['sizes' => '(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 420px']) ?></a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
