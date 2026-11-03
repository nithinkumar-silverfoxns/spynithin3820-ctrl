<?php
page_meta(['title' => 'Page not found | T.T.T Academy', 'description' => 'The page you are looking for could not be found.']);
require ROOT . '/templates/header.php';
partial('page-hero', [
    'eyebrow' => 'Error 404',
    'title' => 'This page took a <span class="text-grad">wrong turn.</span>',
    'lead' => 'The page you are looking for doesn’t exist or has moved. Try one of these instead.',
    'crumbs' => ['Not found' => null],
    'actions' => '<a class="btn-x btn-x-primary" href="' . e(url('/')) . '">Back to home</a><a class="btn-x btn-x-glass" href="' . e(url('/dcet-coaching')) . '">DCET coaching</a><a class="btn-x btn-x-glass" href="' . e(url('/dcet-results')) . '">DCET results</a>',
]);
require ROOT . '/templates/footer.php';
