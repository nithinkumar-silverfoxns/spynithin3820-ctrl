<?php
require __DIR__ . '/inc/boot.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && verify_csrf()) logout('admin');
redirect('/admin/login.php');
