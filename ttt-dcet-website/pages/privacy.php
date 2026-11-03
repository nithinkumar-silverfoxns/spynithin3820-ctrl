<?php
page_meta(['title' => 'Privacy Policy | T.T.T Academy', 'description' => 'How T.T.T Academy collects and uses information submitted through this website.']);
require ROOT . '/templates/header.php';
partial('page-hero', ['eyebrow' => 'Privacy', 'title' => 'Privacy policy', 'lead' => 'How we handle the information you share with us.', 'crumbs' => ['Privacy policy' => null]]);
?>
<section class="sec"><div class="container-xl" style="max-width:820px">
  <h2 class="h4">What we collect</h2>
  <p>When you submit an admission enquiry, demo booking or contact form we collect the details you enter: name, mobile number, optional email, course and branch preference, diploma details and your message. We also store the submission time and your IP address to prevent spam and abuse.</p>
  <h2 class="h4 mt-4">How we use it</h2>
  <p>We use these details only to respond to your enquiry — by phone, WhatsApp or email — and to provide admission counselling. We do not sell or share your information with third parties for marketing.</p>
  <h2 class="h4 mt-4">Student accounts</h2>
  <p>Student login credentials are issued by T.T.T Academy after admission. Passwords are stored using one-way hashing and are never visible to staff.</p>
  <h2 class="h4 mt-4">Embedded content</h2>
  <p>Videos are loaded from YouTube (privacy-enhanced mode) only when you press play, and branch maps are provided by Google Maps. These services may set their own cookies.</p>
  <h2 class="h4 mt-4">Your choices</h2>
  <p>To have your enquiry data corrected or deleted, write to <a href="mailto:<?= e(setting('email')) ?>"><?= e(setting('email')) ?></a> or call <?= e(setting('phone_primary')) ?>.</p>
</div></section>
<?php require ROOT . '/templates/footer.php';
