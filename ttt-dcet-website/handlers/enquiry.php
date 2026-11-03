<?php
/**
 * POST /api/enquiry — admission enquiries, demo bookings and contact messages.
 * Security: POST only, CSRF token, honeypot, server-side validation, per-IP rate limit,
 * prepared statements, no HTML stored unescaped (output is always escaped on render).
 */
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
}
if (!verify_csrf()) {
    json_response(['ok' => false, 'message' => 'Your session expired. Please refresh the page and try again.'], 419);
}
// Honeypot: bots fill hidden fields. Pretend success.
if (!empty($_POST['website'])) {
    json_response(['ok' => true, 'message' => 'Thank you! Our team will contact you shortly.']);
}

$str = static fn(string $k, int $max) => mb_substr(trim(strip_tags((string) ($_POST[$k] ?? ''))), 0, $max);
$type    = in_array($_POST['type'] ?? '', ['admission', 'demo', 'contact'], true) ? $_POST['type'] : 'admission';
$name    = $str('name', 80);
$phone   = preg_replace('/\D+/', '', (string) ($_POST['phone'] ?? ''));
$phone   = strlen($phone) > 10 ? substr($phone, -10) : $phone;
$email   = $str('email', 120);
$course  = $str('course', 120);
$branch  = $str('branch', 120);
$mode    = in_array($_POST['mode'] ?? '', ['Offline', 'Online', 'Hybrid'], true) ? $_POST['mode'] : '';
$diploma = $str('diploma', 80);
$message = $str('message', 1000);
$date    = (string) ($_POST['preferred_date'] ?? '');
$slot    = in_array($_POST['slot'] ?? '', ['Morning', 'Evening', 'Weekend'], true) ? $_POST['slot'] : '';

$errors = [];
if (!preg_match('/^[\p{L} .\'-]{2,80}$/u', $name)) $errors[] = 'Please enter a valid name.';
if (!preg_match('/^[6-9]\d{9}$/', $phone)) $errors[] = 'Please enter a valid 10-digit Indian mobile number.';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Please enter a valid email address.';
if (empty($_POST['consent'])) $errors[] = 'Please agree to be contacted about your enquiry.';
if ($type === 'contact' && mb_strlen($message) < 5) $errors[] = 'Please enter your message.';
$validCourses = array_map(fn($c) => $c['name'] . ' – ' . $c['type_label'] . ' (' . $c['duration'] . ')', courses());
$validCourses[] = 'Not sure – need guidance';
if ($type !== 'contact' && !in_array($course, $validCourses, true)) $errors[] = 'Please choose a batch.';
$prefDate = null;
if ($type === 'demo') {
    $d = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    if (!$d || $d < new DateTimeImmutable('today') || $d > new DateTimeImmutable('+120 days')) $errors[] = 'Please choose a valid demo date.';
    else $prefDate = $d->format('Y-m-d');
}
if ($errors) {
    json_response(['ok' => false, 'message' => implode(' ', $errors)], 422);
}

$pdo = db();
if (!$pdo) {
    error_log('[ttt] enquiry received but DB unavailable: ' . $phone);
    json_response(['ok' => false, 'message' => 'We could not save your enquiry right now. Please call ' . setting('phone_primary') . ' or use WhatsApp.'], 503);
}

try {
    $recent = db_one('SELECT COUNT(*) AS c FROM enquiries WHERE ip = ? AND created_at > (NOW() - INTERVAL 1 HOUR)', [client_ip()]);
    if ((int) $recent['c'] >= config('security.enquiry_rate_limit')) {
        json_response(['ok' => false, 'message' => 'Too many submissions from your network. Please call or WhatsApp us instead.'], 429);
    }
    db_exec(
        'INSERT INTO enquiries (type, name, phone, email, course, branch, mode, diploma, message, preferred_date, slot, ip, user_agent, source_page)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [$type, $name, $phone, $email ?: null, $course ?: null, $branch ?: null, $mode ?: null, $diploma ?: null, $message ?: null, $prefDate, $slot ?: null, client_ip(), mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255), mb_substr((string) ($_SERVER['HTTP_REFERER'] ?? ''), 0, 255)]
    );
} catch (Throwable $ex) {
    error_log('[ttt] enquiry insert failed: ' . $ex->getMessage());
    json_response(['ok' => false, 'message' => 'Something went wrong. Please call ' . setting('phone_primary') . ' or use WhatsApp.'], 500);
}

// Optional email notification to the admission team
if ($to = config('mail.notify_to')) {
    $subject = '[T.T.T website] New ' . $type . ' enquiry: ' . $name;
    $body = "Type: {$type}\nName: {$name}\nPhone: {$phone}\nEmail: {$email}\nCourse: {$course}\nBranch: {$branch}\nMode: {$mode}\nDiploma: {$diploma}\nDemo date: {$prefDate} {$slot}\n\n{$message}\n";
    @mail($to, $subject, $body, 'From: ' . config('mail.from') . "\r\nContent-Type: text/plain; charset=UTF-8");
}

$msg = $type === 'demo'
    ? 'Your demo class request is received! We will confirm your slot by phone or WhatsApp.'
    : 'Thank you, ' . $name . '! Our admission team will call you within one working day.';
json_response(['ok' => true, 'message' => $msg]);
