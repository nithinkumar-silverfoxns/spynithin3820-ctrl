<?php
/** @var array $meta */
$meta = page_meta();
$canonical = abs_url($meta['path']);
$current = trim($meta['path'], '/');
$isActive = static fn(string ...$p) => in_array(explode('/', $current)[0], $p, true) ? ' is-active' : '';
$org = [
    '@context' => 'https://schema.org',
    '@type' => 'EducationalOrganization',
    'name' => 'T.T.T Academy (Technical Teaching & Training Academy)',
    'alternateName' => 'TTT Academy',
    'url' => abs_url('/'),
    'logo' => abs_url('assets/img/brand/logo.png'),
    'foundingDate' => '2013',
    'parentOrganization' => ['@type' => 'Organization', 'name' => 'JPS Educational & Charitable Trust'],
    'telephone' => setting('phone_primary'),
    'email' => setting('email'),
    'address' => ['@type' => 'PostalAddress', 'streetAddress' => 'No. 8, 1st Floor, Opp. MEI Colony Bus Stop, Peenya 3rd Phase', 'addressLocality' => 'Bengaluru', 'postalCode' => '560058', 'addressRegion' => 'Karnataka', 'addressCountry' => 'IN'],
    'sameAs' => array_values(array_filter([setting('instagram'), setting('youtube'), setting('linkedin')])),
];
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= e($meta['title']) ?></title>
<meta name="description" content="<?= e($meta['description']) ?>">
<link rel="canonical" href="<?= e($canonical) ?>">
<meta name="theme-color" content="#0B1437">
<meta property="og:type" content="website">
<meta property="og:site_name" content="T.T.T Academy">
<meta property="og:title" content="<?= e($meta['title']) ?>">
<meta property="og:description" content="<?= e($meta['description']) ?>">
<meta property="og:url" content="<?= e($canonical) ?>">
<meta property="og:image" content="<?= e(abs_url($meta['image'])) ?>">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="<?= e(asset('favicon.png')) ?>">
<link rel="apple-touch-icon" href="<?= e(asset('assets/img/brand/icon-512.png')) ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
<link href="<?= e(asset('assets/css/app.css')) ?>" rel="stylesheet">
<script type="application/ld+json"><?= json_encode($org, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) ?></script>
<?php foreach ((array) $meta['schema'] as $schema): ?>
<script type="application/ld+json"><?= json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) ?></script>
<?php endforeach; ?>
</head>
<body class="<?= e($meta['body_class']) ?>">
<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header" id="siteHeader">
  <div class="topbar d-none d-lg-block">
    <div class="container-xl d-flex justify-content-between align-items-center">
      <span><?= icon('sparkle', 'ic ic-sm') ?> Admissions open for <strong><?= e(setting('admission_year')) ?></strong> — Pratigna · Jnana · Pragathi batches</span>
      <span class="d-flex gap-4">
        <a href="<?= e(tel_link(setting('phone_primary'))) ?>"><?= icon('phone', 'ic ic-sm') ?> <?= e(setting('phone_primary')) ?></a>
        <a href="mailto:<?= e(setting('email')) ?>"><?= icon('mail', 'ic ic-sm') ?> <?= e(setting('email')) ?></a>
        <a href="<?= e(url('/student/login')) ?>"><?= icon('lock', 'ic ic-sm') ?> Student login</a>
      </span>
    </div>
  </div>
  <nav class="mainnav" aria-label="Main">
    <div class="container-xl d-flex align-items-center">
      <a class="brand" href="<?= e(url('/')) ?>" aria-label="T.T.T Academy home">
        <?= img('assets/img/brand/mark.webp', 'T.T.T Academy emblem', 'brand-logo', ['loading' => 'eager', 'fetchpriority' => 'high']) ?>
        <span class="brand-text"><strong>T.T.T Academy</strong><small>DCET Coaching · Bengaluru</small></span>
      </a>

      <ul class="nav-links d-none d-xl-flex">
        <li><a class="nav-a<?= $isActive('') ?>" href="<?= e(url('/')) ?>">Home</a></li>
        <li><a class="nav-a<?= $isActive('about') ?>" href="<?= e(url('/about')) ?>">About</a></li>
        <li class="has-mega">
          <a class="nav-a<?= $isActive('dcet-coaching', 'compare-courses', 'dcet-syllabus') ?>" href="<?= e(url('/dcet-coaching')) ?>" aria-haspopup="true">DCET Coaching <?= icon('chevron', 'ic ic-xs rot90') ?></a>
          <div class="mega" role="menu">
            <div class="mega-grid">
              <?php foreach (courses() as $navC): ?>
              <a class="mega-course" role="menuitem" href="<?= e(url('/dcet-coaching/' . $navC['slug'])) ?>" style="--accent: <?= e($navC['accent'] ?: '#2F6BFF') ?>">
                <span class="mc-dur"><?= e($navC['duration']) ?></span>
                <strong><?= e($navC['name']) ?></strong>
                <small><?= e($navC['type_label']) ?></small>
              </a>
              <?php endforeach; ?>
              <div class="mega-links">
                <a href="<?= e(url('/dcet-coaching')) ?>"><?= icon('compass') ?> DCET coaching overview</a>
                <a href="<?= e(url('/compare-courses')) ?>"><?= icon('chart') ?> Compare batches</a>
                <a href="<?= e(url('/dcet-syllabus')) ?>"><?= icon('book') ?> Syllabus explorer</a>
                <a href="<?= e(url('/admission')) ?>"><?= icon('check') ?> Admission process</a>
              </div>
            </div>
          </div>
        </li>
        <li class="has-drop">
          <a class="nav-a<?= $isActive('dcet-results', 'our-toppers', 'student-testimonials') ?>" href="<?= e(url('/dcet-results')) ?>" aria-haspopup="true">Results <?= icon('chevron', 'ic ic-xs rot90') ?></a>
          <div class="drop" role="menu">
            <a role="menuitem" href="<?= e(url('/dcet-results')) ?>">DCET results dashboard</a>
            <a role="menuitem" href="<?= e(url('/our-toppers')) ?>">Our toppers</a>
            <a role="menuitem" href="<?= e(url('/student-testimonials')) ?>">Student testimonials</a>
          </div>
        </li>
        <li class="has-drop">
          <a class="nav-a<?= $isActive('study-materials', 'demo-classes', 'dcet-rank-predictor', 'college-cutoffs', 'faq') ?>" href="<?= e(url('/study-materials')) ?>" aria-haspopup="true">Resources <?= icon('chevron', 'ic ic-xs rot90') ?></a>
          <div class="drop" role="menu">
            <a role="menuitem" href="<?= e(url('/dcet-rank-predictor')) ?>">DCET rank predictor</a>
            <a role="menuitem" href="<?= e(url('/college-cutoffs')) ?>">College cutoffs &amp; guide</a>
            <a role="menuitem" href="<?= e(url('/study-materials')) ?>">Study materials &amp; PYQs</a>
            <a role="menuitem" href="<?= e(url('/demo-classes')) ?>">Demo classes</a>
            <a role="menuitem" href="<?= e(url('/faq')) ?>">FAQs</a>
          </div>
        </li>
        <li><a class="nav-a<?= $isActive('faculty') ?>" href="<?= e(url('/faculty')) ?>">Faculty</a></li>
        <li><a class="nav-a<?= $isActive('gallery') ?>" href="<?= e(url('/gallery')) ?>">Gallery</a></li>
        <li><a class="nav-a<?= $isActive('contact') ?>" href="<?= e(url('/contact')) ?>">Contact</a></li>
      </ul>

      <div class="nav-cta ms-auto">
        <a class="btn-x btn-x-primary btn-x-sm d-none d-sm-inline-flex" href="<?= e(url('/admission')) ?>">Apply now <?= icon('arrow', 'ic ic-sm') ?></a>
        <button class="menu-toggle d-xl-none" type="button" aria-controls="mobileMenu" aria-expanded="false" aria-label="Open menu"><?= icon('menu') ?></button>
      </div>
    </div>
  </nav>
</header>

<div class="mobile-menu" id="mobileMenu" hidden>
  <div class="mm-head">
    <span class="brand-text"><strong>T.T.T Academy</strong><small>DCET Coaching</small></span>
    <button class="menu-close" type="button" aria-label="Close menu"><?= icon('close') ?></button>
  </div>
  <nav class="mm-body" aria-label="Mobile">
    <a href="<?= e(url('/')) ?>">Home</a>
    <a href="<?= e(url('/about')) ?>">About T.T.T</a>
    <a href="<?= e(url('/dcet-coaching')) ?>">DCET Coaching</a>
    <div class="mm-sub">
      <?php foreach (courses() as $navC): ?>
      <a href="<?= e(url('/dcet-coaching/' . $navC['slug'])) ?>"><?= e($navC['name']) ?> <small><?= e($navC['duration']) ?></small></a>
      <?php endforeach; ?>
    </div>
    <a href="<?= e(url('/dcet-results')) ?>">DCET Results</a>
    <a href="<?= e(url('/our-toppers')) ?>">Our Toppers</a>
    <a href="<?= e(url('/student-testimonials')) ?>">Testimonials</a>
    <a href="<?= e(url('/dcet-rank-predictor')) ?>">Rank Predictor</a>
    <a href="<?= e(url('/college-cutoffs')) ?>">College Cutoffs</a>
    <a href="<?= e(url('/dcet-syllabus')) ?>">Syllabus</a>
    <a href="<?= e(url('/study-materials')) ?>">Study Materials</a>
    <a href="<?= e(url('/demo-classes')) ?>">Demo Classes</a>
    <a href="<?= e(url('/faculty')) ?>">Faculty</a>
    <a href="<?= e(url('/gallery')) ?>">Gallery</a>
    <a href="<?= e(url('/faq')) ?>">FAQ</a>
    <a href="<?= e(url('/contact')) ?>">Contact</a>
    <a href="<?= e(url('/student/login')) ?>">Student Login</a>
  </nav>
  <div class="mm-foot">
    <a class="btn-x btn-x-primary w-100" href="<?= e(url('/admission')) ?>">Apply for admission</a>
  </div>
</div>

<main id="main">
