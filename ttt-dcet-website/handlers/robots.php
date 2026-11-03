<?php
header('Content-Type: text/plain; charset=utf-8');
echo "User-agent: *\nDisallow: /admin/\nDisallow: /student/\nDisallow: /api/\n\nSitemap: " . abs_url('/sitemap.xml') . "\n";
