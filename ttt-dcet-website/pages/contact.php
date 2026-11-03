<?php
page_meta([
    'title' => 'Contact T.T.T Academy | Peenya, T-Dasarahalli & Magadi Road, Bengaluru',
    'description' => 'Call +91 99868 69966, WhatsApp or visit T.T.T Academy at Peenya 3rd Phase, Hesaraghatta Main Road (T-Dasarahalli) or Magadi Main Road, Bengaluru.',
]);
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Contact Us',
    'title' => 'Let’s talk about <span class="text-grad">your rank.</span>',
    'lead' => 'Visit any of our three Bengaluru branches, call our admission team or message us on WhatsApp.',
    'crumbs' => ['Contact' => null],
]);
?>

<section class="sec-sm">
  <div class="container-xl">
    <div class="row g-3" data-reveal="stagger">
      <div class="col-md-4"><a class="tool-card" href="<?= e(tel_link(setting('phone_primary'))) ?>"><span class="b-icon"><?= icon('phone') ?></span><h3>Call us</h3><p><?= e(setting('phone_primary')) ?> · <?= e(setting('phone_admission')) ?></p></a></div>
      <div class="col-md-4"><a class="tool-card" href="<?= e(wa_link('Hi T.T.T Academy, I have a DCET enquiry.')) ?>" target="_blank" rel="noopener"><span class="b-icon" style="background:#1faa53"><?= icon('whatsapp') ?></span><h3>WhatsApp</h3><p>Chat with our admission team</p></a></div>
      <div class="col-md-4"><a class="tool-card" href="mailto:<?= e(setting('email')) ?>"><span class="b-icon"><?= icon('mail') ?></span><h3>Email</h3><p><?= e(setting('email')) ?> · <?= e(setting('email_branches')) ?></p></a></div>
    </div>
  </div>
</section>

<section class="sec sec-soft">
  <div class="container-xl">
    <div class="sec-head" data-reveal><span class="eyebrow">Branches</span><h2 class="sec-title-sm display">Find a T.T.T campus near you</h2></div>
    <div class="row g-4" data-reveal="stagger">
      <?php foreach (content('branches') as $b): ?>
      <div class="col-lg-4">
        <article class="branch">
          <?php if ($b['map_embed']): ?><iframe src="<?= e($b['map_embed']) ?>" title="Map: <?= e($b['name']) ?>" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><?php endif; ?>
          <div class="br-body">
            <h3><?= e($b['name']) ?></h3>
            <div class="br-row"><?= icon('pin', 'ic ic-sm') ?><span><?= e($b['address']) ?></span></div>
            <div class="br-row"><?= icon('phone', 'ic ic-sm') ?><a href="<?= e(tel_link(explode('/', $b['phone'])[0])) ?>"><?= e($b['phone']) ?></a></div>
            <div class="br-row"><?= icon('mail', 'ic ic-sm') ?><a href="mailto:<?= e($b['email']) ?>"><?= e($b['email']) ?></a></div>
          </div>
        </article>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="sec">
  <div class="container-xl">
    <div class="row g-5">
      <div class="col-lg-5" data-reveal>
        <span class="eyebrow">Write to us</span>
        <h2 class="sec-title-sm display">Questions about DCET or our batches?</h2>
        <p class="muted">Send us a message and our team will get back within one working day. For the fastest response, WhatsApp us.</p>
        <div class="d-flex flex-wrap gap-2 mt-4">
          <a class="btn-x btn-x-light btn-x-sm" href="<?= e(setting('instagram')) ?>" target="_blank" rel="noopener"><?= icon('instagram', 'ic ic-sm') ?> Instagram</a>
          <a class="btn-x btn-x-light btn-x-sm" href="<?= e(setting('youtube')) ?>" target="_blank" rel="noopener"><?= icon('youtube', 'ic ic-sm') ?> YouTube</a>
        </div>
      </div>
      <div class="col-lg-7" data-reveal><?php partial('enquiry-form', ['type' => 'contact']); ?></div>
    </div>
  </div>
</section>

<?php require ROOT . '/templates/footer.php'; ?>
