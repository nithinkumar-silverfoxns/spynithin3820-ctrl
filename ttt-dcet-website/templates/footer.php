</main>

<footer class="site-footer">
  <div class="footer-cta">
    <div class="container-xl">
      <div class="fc-inner" data-reveal>
        <div>
          <span class="eyebrow eyebrow-light">Admissions open · <?= e(setting('admission_year')) ?></span>
          <h2 class="display fc-title">Be the next name on the topper list.</h2>
        </div>
        <div class="d-flex flex-wrap gap-3">
          <a class="btn-x btn-x-primary" href="<?= e(url('/admission')) ?>">Apply for admission <?= icon('arrow', 'ic ic-sm') ?></a>
          <a class="btn-x btn-x-glass" href="<?= e(wa_link('Hi T.T.T Academy, I would like to know about DCET coaching.')) ?>" target="_blank" rel="noopener"><?= icon('whatsapp', 'ic ic-sm') ?> WhatsApp us</a>
        </div>
      </div>
    </div>
  </div>
  <div class="container-xl">
    <div class="row g-5 footer-main">
      <div class="col-lg-4">
        <a class="brand brand-footer" href="<?= e(url('/')) ?>">
          <?= img('assets/img/brand/mark.webp', 'T.T.T Academy emblem', 'brand-logo') ?>
          <span class="brand-text"><strong>T.T.T Academy</strong><small>Technical Teaching &amp; Training Academy</small></span>
        </a>
        <p class="mt-3 footer-about">A unit of JPS Educational &amp; Charitable Trust. Since 2013, guiding diploma students across Karnataka to top DCET ranks and Karnataka’s best engineering colleges.</p>
        <div class="social">
          <a href="<?= e(setting('instagram')) ?>" target="_blank" rel="noopener" aria-label="Instagram"><?= icon('instagram') ?></a>
          <a href="<?= e(setting('youtube')) ?>" target="_blank" rel="noopener" aria-label="YouTube"><?= icon('youtube') ?></a>
          <a href="<?= e(setting('linkedin')) ?>" target="_blank" rel="noopener" aria-label="LinkedIn"><?= icon('linkedin') ?></a>
          <a href="<?= e(wa_link()) ?>" target="_blank" rel="noopener" aria-label="WhatsApp"><?= icon('whatsapp') ?></a>
        </div>
      </div>
      <div class="col-6 col-md-4 col-lg-2">
        <h3 class="f-h">DCET Coaching</h3>
        <ul class="f-links">
          <?php foreach (courses() as $navC): ?>
          <li><a href="<?= e(url('/dcet-coaching/' . $navC['slug'])) ?>"><?= e($navC['name']) ?> · <?= e($navC['duration']) ?></a></li>
          <?php endforeach; ?>
          <li><a href="<?= e(url('/compare-courses')) ?>">Compare batches</a></li>
          <li><a href="<?= e(url('/admission')) ?>">Admission</a></li>
          <li><a href="<?= e(url('/demo-classes')) ?>">Demo classes</a></li>
        </ul>
      </div>
      <div class="col-6 col-md-4 col-lg-2">
        <h3 class="f-h">Results &amp; Tools</h3>
        <ul class="f-links">
          <li><a href="<?= e(url('/dcet-results')) ?>">DCET results</a></li>
          <li><a href="<?= e(url('/our-toppers')) ?>">Our toppers</a></li>
          <li><a href="<?= e(url('/dcet-rank-predictor')) ?>">Rank predictor</a></li>
          <li><a href="<?= e(url('/college-cutoffs')) ?>">College cutoffs</a></li>
          <li><a href="<?= e(url('/dcet-syllabus')) ?>">Syllabus</a></li>
          <li><a href="<?= e(url('/study-materials')) ?>">Study materials</a></li>
        </ul>
      </div>
      <div class="col-md-4 col-lg-4">
        <h3 class="f-h">Reach us</h3>
        <ul class="f-contact">
          <li><?= icon('pin') ?><span><?= e(setting('address')) ?></span></li>
          <li><?= icon('phone') ?><a href="<?= e(tel_link(setting('phone_primary'))) ?>"><?= e(setting('phone_primary')) ?></a> · <a href="<?= e(tel_link(setting('phone_admission'))) ?>"><?= e(setting('phone_admission')) ?></a></li>
          <li><?= icon('mail') ?><a href="mailto:<?= e(setting('email')) ?>"><?= e(setting('email')) ?></a></li>
        </ul>
        <div class="d-flex gap-2 flex-wrap mt-3">
          <a class="app-badge" href="<?= e(setting('app_android')) ?>" target="_blank" rel="noopener">T.T.T Live Learn · Android</a>
          <a class="app-badge" href="<?= e(setting('app_ios')) ?>" target="_blank" rel="noopener">T.T.T Live Learn · iOS</a>
          <a class="app-badge" href="<?= e(setting('publications')) ?>" target="_blank" rel="noopener">T.T.T Publications</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <?= date('Y') ?> T.T.T Academy · JPS Educational &amp; Charitable Trust. All rights reserved.</span>
      <span><a href="<?= e(url('/privacy-policy')) ?>">Privacy policy</a> · <a href="<?= e(url('/faq')) ?>">FAQ</a> · <a href="<?= e(url('/contact')) ?>">Contact</a></span>
    </div>
  </div>
</footer>

<a class="wa-float" href="<?= e(wa_link('Hi T.T.T Academy, I have a DCET coaching enquiry.')) ?>" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><?= icon('whatsapp') ?></a>

<nav class="mobile-dock d-lg-none" aria-label="Quick actions">
  <a href="<?= e(tel_link(setting('phone_primary'))) ?>"><?= icon('phone') ?><span>Call</span></a>
  <a href="<?= e(wa_link('Hi T.T.T Academy, I have a DCET coaching enquiry.')) ?>" target="_blank" rel="noopener"><?= icon('whatsapp') ?><span>WhatsApp</span></a>
  <a href="<?= e(url('/demo-classes#book')) ?>"><?= icon('play') ?><span>Free demo</span></a>
  <a class="dock-primary" href="<?= e(url('/admission')) ?>"><?= icon('check') ?><span>Apply</span></a>
</nav>

<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Image viewer">
  <button class="lb-close" type="button" aria-label="Close"><?= icon('close') ?></button>
  <button class="lb-nav lb-prev" type="button" aria-label="Previous"><?= icon('chevron', 'ic flip') ?></button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lb-nav lb-next" type="button" aria-label="Next"><?= icon('chevron') ?></button>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="<?= e(asset('assets/js/app.js')) ?>" defer></script>
<?php foreach ((array) ($GLOBALS['page_scripts'] ?? []) as $s): ?>
<script src="<?= e(asset($s['src'])) ?>" <?= !empty($s['module']) ? 'type="module"' : 'defer' ?>></script>
<?php endforeach; ?>
</body>
</html>
