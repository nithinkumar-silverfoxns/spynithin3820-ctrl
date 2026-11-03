<?php
header('Content-Type: application/xml; charset=utf-8');
$paths = ['/', '/about', '/dcet-coaching', '/dcet-results', '/our-toppers', '/student-testimonials', '/faculty', '/study-materials', '/demo-classes', '/gallery', '/admission', '/contact', '/dcet-rank-predictor', '/dcet-syllabus', '/college-cutoffs', '/compare-courses', '/faq', '/privacy-policy'];
foreach (courses() as $c) {
    $paths[] = '/dcet-coaching/' . $c['slug'];
}
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($paths as $p) {
    $prio = $p === '/' ? '1.0' : (str_starts_with($p, '/dcet') ? '0.9' : '0.7');
    echo '  <url><loc>' . e(abs_url($p)) . '</loc><changefreq>weekly</changefreq><priority>' . $prio . "</priority></url>\n";
}
echo "</urlset>\n";
