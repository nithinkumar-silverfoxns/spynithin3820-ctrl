<?php
declare(strict_types=1);

// Built-in dev server: let it serve real static files directly
if (PHP_SAPI === 'cli-server') {
    $f = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (is_file($f) && (!str_ends_with($f, '.php') || preg_match('#^/admin/[a-z]+\.php$#', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)))) {
        return false;
    }
}

require __DIR__ . '/app/bootstrap.php';

/** SEO-friendly routes → page templates. */
$routes = [
    ''                                        => ['page' => 'home'],
    'about'                                   => ['page' => 'about'],
    'dcet-coaching'                           => ['page' => 'dcet-coaching'],
    'dcet-coaching/pratigna-long-term-batch'  => ['page' => 'course', 'slug' => 'pratigna-long-term-batch'],
    'dcet-coaching/jnana-short-term-batch'    => ['page' => 'course', 'slug' => 'jnana-short-term-batch'],
    'dcet-coaching/pragathi-crash-course'     => ['page' => 'course', 'slug' => 'pragathi-crash-course'],
    'dcet-results'                            => ['page' => 'results'],
    'our-toppers'                             => ['page' => 'toppers'],
    'student-testimonials'                    => ['page' => 'testimonials'],
    'faculty'                                 => ['page' => 'faculty'],
    'study-materials'                         => ['page' => 'study-materials'],
    'demo-classes'                            => ['page' => 'demo-classes'],
    'gallery'                                 => ['page' => 'gallery'],
    'admission'                               => ['page' => 'admission'],
    'contact'                                 => ['page' => 'contact'],
    'dcet-rank-predictor'                     => ['page' => 'rank-predictor'],
    'dcet-syllabus'                           => ['page' => 'syllabus'],
    'college-cutoffs'                         => ['page' => 'college-cutoffs'],
    'compare-courses'                         => ['page' => 'compare-courses'],
    'faq'                                     => ['page' => 'faq'],
    'privacy-policy'                          => ['page' => 'privacy'],
    'student/login'                           => ['page' => 'student-login'],
    'student/dashboard'                       => ['page' => 'student-dashboard'],
    'student/logout'                          => ['page' => 'student-logout'],
    'student/download'                        => ['page' => 'student-download'],
    'api/enquiry'                             => ['api' => 'enquiry'],
    'api/cutoffs'                             => ['api' => 'cutoffs'],
    'sitemap.xml'                             => ['api' => 'sitemap'],
    'robots.txt'                              => ['api' => 'robots'],
];

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$base = config('app.base_path');
if ($base && str_starts_with($path, $base)) {
    $path = substr($path, strlen($base));
}
$path = trim(rawurldecode($path), '/');
$path = preg_replace('#\.php$#', '', $path);

// Legacy URLs from the previous website → new pages (301 for SEO continuity)
$legacy = [
    'd-cet' => 'dcet-coaching', 'dcet-2026' => 'dcet-coaching', 'dcet-2027-coaching-bangalore' => 'dcet-coaching/pratigna-long-term-batch',
    'dcet-2027-jnana-short-term-course' => 'dcet-coaching/jnana-short-term-batch', 'dcet-2026-short-term-course' => 'dcet-coaching/jnana-short-term-batch',
    'dcet-crash-course-2026-pragathi-batch' => 'dcet-coaching/pragathi-crash-course', 'faculties' => 'faculty', 'managements' => 'about',
    'achivements' => 'dcet-results', 'index' => '', 'home' => '',
];
if (isset($legacy[$path])) {
    redirect('/' . $legacy[$path], 301);
}

$route = $routes[$path] ?? null;

if ($route && isset($route['api'])) {
    require ROOT . '/handlers/' . $route['api'] . '.php';
    exit;
}

if (!$route) {
    http_response_code(404);
    $route = ['page' => '404'];
}

page_meta(['path' => '/' . $path]);
$file = ROOT . '/pages/' . $route['page'] . '.php';
require $file;
