<?php
/**
 * @var string $type    admission | demo | contact
 * @var string $course  optional pre-selected course name
 * @var string $title   optional heading
 */
$type   = $type ?? 'admission';
$course = $course ?? '';
$title  = $title ?? ($type === 'demo' ? 'Book a free demo class' : ($type === 'contact' ? 'Send us a message' : 'Admission enquiry'));
$fid    = 'f' . substr(md5($type . $course . random_bytes(4)), 0, 6);
?>
<form class="form-x form-card" method="post" action="<?= e(url('/api/enquiry')) ?>" data-ajax novalidate>
  <h3 class="h4 mb-1"><?= e($title) ?></h3>
  <p class="muted mb-4 small">Our admission team will call you back within one working day.</p>
  <?= csrf_field() ?>
  <input type="hidden" name="type" value="<?= e($type) ?>">
  <div class="hp" aria-hidden="true"><label for="<?= $fid ?>-web">Website</label><input id="<?= $fid ?>-web" type="text" name="website" tabindex="-1" autocomplete="off"></div>
  <div class="row g-3">
    <div class="col-sm-6">
      <label class="form-label" for="<?= $fid ?>-name">Student name *</label>
      <input class="form-control" id="<?= $fid ?>-name" name="name" required minlength="2" maxlength="80" autocomplete="name">
    </div>
    <div class="col-sm-6">
      <label class="form-label" for="<?= $fid ?>-phone">Mobile number *</label>
      <input class="form-control" id="<?= $fid ?>-phone" name="phone" type="tel" inputmode="numeric" required pattern="[0-9+\s-]{10,15}" maxlength="15" autocomplete="tel" placeholder="10-digit mobile">
    </div>
    <?php if ($type !== 'contact'): ?>
    <div class="col-sm-6">
      <label class="form-label" for="<?= $fid ?>-course">Batch of interest *</label>
      <select class="form-select" id="<?= $fid ?>-course" name="course" required>
        <?php foreach (courses() as $c): $label = $c['name'] . ' – ' . $c['type_label'] . ' (' . $c['duration'] . ')'; ?>
        <option value="<?= e($label) ?>"<?= $course && str_starts_with($label, $course) ? ' selected' : '' ?>><?= e($label) ?></option>
        <?php endforeach; ?>
        <option value="Not sure – need guidance"<?= $course ? '' : ' selected' ?>>Not sure – need guidance</option>
      </select>
    </div>
    <div class="col-sm-6">
      <label class="form-label" for="<?= $fid ?>-branch">Preferred branch</label>
      <select class="form-select" id="<?= $fid ?>-branch" name="branch">
        <?php foreach (content('branches') as $b): ?><option><?= e($b['name']) ?></option><?php endforeach; ?>
        <option>Online (live classes)</option>
      </select>
    </div>
    <div class="col-12">
      <span class="form-label d-block">Learning mode</span>
      <div class="seg" role="radiogroup" aria-label="Learning mode">
        <?php foreach (['Offline', 'Online', 'Hybrid'] as $i => $m): ?>
        <input type="radio" id="<?= $fid ?>-m<?= $i ?>" name="mode" value="<?= $m ?>"<?= $i === 0 ? ' checked' : '' ?>><label for="<?= $fid ?>-m<?= $i ?>"><?= $m ?></label>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endif; ?>
    <?php if ($type === 'demo'): ?>
    <div class="col-sm-6">
      <label class="form-label" for="<?= $fid ?>-date">Preferred date *</label>
      <input class="form-control" id="<?= $fid ?>-date" name="preferred_date" type="date" required min="<?= date('Y-m-d') ?>" max="<?= date('Y-m-d', strtotime('+90 days')) ?>">
    </div>
    <div class="col-sm-6">
      <label class="form-label" for="<?= $fid ?>-slot">Preferred slot</label>
      <select class="form-select" id="<?= $fid ?>-slot" name="slot"><option>Morning</option><option>Evening</option><option>Weekend</option></select>
    </div>
    <?php endif; ?>
    <div class="col-sm-6">
      <label class="form-label" for="<?= $fid ?>-email">Email <span class="muted">(optional)</span></label>
      <input class="form-control" id="<?= $fid ?>-email" name="email" type="email" maxlength="120" autocomplete="email">
    </div>
    <div class="col-sm-6">
      <label class="form-label" for="<?= $fid ?>-dip">Diploma branch / semester <span class="muted">(optional)</span></label>
      <input class="form-control" id="<?= $fid ?>-dip" name="diploma" maxlength="80" placeholder="e.g. Mechanical · 5th sem">
    </div>
    <div class="col-12">
      <label class="form-label" for="<?= $fid ?>-msg"><?= $type === 'contact' ? 'Message *' : 'Message (optional)' ?></label>
      <textarea class="form-control" id="<?= $fid ?>-msg" name="message" maxlength="1000" <?= $type === 'contact' ? 'required' : '' ?>></textarea>
    </div>
    <div class="col-12">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="<?= $fid ?>-ok" name="consent" value="1" required>
        <label class="form-check-label small muted" for="<?= $fid ?>-ok">I agree to be contacted by T.T.T Academy by phone / WhatsApp about this enquiry. <a href="<?= e(url('/privacy-policy')) ?>">Privacy policy</a></label>
      </div>
    </div>
    <div class="col-12 d-flex flex-wrap gap-2">
      <button class="btn-x btn-x-primary" type="submit"><?= $type === 'demo' ? 'Book my demo class' : 'Submit enquiry' ?> <?= icon('arrow', 'ic ic-sm') ?></button>
      <button class="btn-x btn-x-wa" type="button" data-wa-send="<?= e(wa_link()) ?>"><?= icon('whatsapp', 'ic ic-sm') ?> Send on WhatsApp</button>
    </div>
  </div>
  <div class="form-status" role="status" aria-live="polite"></div>
</form>
