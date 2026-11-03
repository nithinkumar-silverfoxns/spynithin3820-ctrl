<?php
require __DIR__ . '/inc/boot.php';
require_admin();
admin_post_guard();
$key = (string) ($_GET['e'] ?? '');
$def = entities()[$key] ?? null;
if (!$def) { http_response_code(404); exit('Unknown content type'); }
$id = (int) ($_GET['id'] ?? 0);
$row = $id ? db_one("SELECT * FROM `{$key}` WHERE id = ?", [$id]) : null;
if ($id && !$row) { http_response_code(404); exit('Not found'); }
$row = $row ?? ['is_active' => 1, 'sort_order' => 0];
$errors = [];

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $data = [];
    foreach ($def['fields'] as $name => $f) {
        $raw = $_POST[$name] ?? null;
        switch ($f['type']) {
            case 'bool':
                $data[$name] = empty($raw) ? 0 : 1;
                break;
            case 'int':
                $data[$name] = ($raw === '' || $raw === null) ? ($name === 'sort_order' ? 0 : null) : (int) $raw;
                break;
            case 'lines':
                $lines = array_values(array_filter(array_map('trim', preg_split('/\R/', (string) $raw))));
                $data[$name] = json_encode($lines, JSON_UNESCAPED_UNICODE);
                break;
            case 'select':
                $data[$name] = array_key_exists((string) $raw, $f['options']) ? (string) $raw : null;
                break;
            case 'color':
                $data[$name] = preg_match('/^#[0-9a-fA-F]{6}$/', (string) $raw) ? $raw : '#2F6BFF';
                break;
            case 'url':
                $raw = trim((string) $raw);
                $data[$name] = $raw === '' ? null : (filter_var($raw, FILTER_VALIDATE_URL) && preg_match('#^https://#', $raw) ? $raw : null);
                if ($raw !== '' && $data[$name] === null) $errors[] = $f['label'] . ' must be a valid https:// URL.';
                break;
            case 'image':
            case 'file':
                try {
                    $private = $key === 'materials' && ($_POST['access'] ?? '') === 'students';
                    $up = handle_upload($name . '_upload', $f['type'] === 'image' ? 'image' : 'pdf', $private);
                } catch (RuntimeException $ex) {
                    $errors[] = $f['label'] . ': ' . $ex->getMessage();
                    $up = null;
                }
                $typed = trim((string) $raw);
                if ($typed !== '' && !preg_match('#^(https://|assets/|uploads/|private:)#', $typed)) {
                    $errors[] = $f['label'] . ': use an https:// URL or upload a file.';
                    $typed = '';
                }
                $data[$name] = $up ?? $typed;
                break;
            default:
                $data[$name] = mb_substr(trim((string) $raw), 0, $f['type'] === 'textarea' ? 10000 : 255);
        }
        if (!empty($f['required']) && ($data[$name] === null || $data[$name] === '' || $data[$name] === '[]')) {
            $errors[] = $f['label'] . ' is required.';
        }
    }
    if ($key === 'courses' && !preg_match('/^[a-z0-9-]{3,120}$/', (string) $data['slug'])) {
        $errors[] = 'Slug may contain lowercase letters, numbers and hyphens only.';
    }
    if (!$errors) {
        $cols = array_keys($data);
        try {
            if ($id) {
                db_exec("UPDATE `{$key}` SET " . implode(', ', array_map(fn($c) => "`$c` = ?", $cols)) . ' WHERE id = ?', [...array_values($data), $id]);
            } else {
                db_exec("INSERT INTO `{$key}` (`" . implode('`,`', $cols) . '`) VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')', array_values($data));
            }
            flash('ok', $def['singular'] . ' saved.');
            redirect('/admin/content.php?e=' . $key);
        } catch (PDOException $ex) {
            $errors[] = str_contains($ex->getMessage(), 'Duplicate') ? 'An item with this unique value (year or slug) already exists.' : 'Could not save. Please check the values.';
            error_log('[ttt-admin] save failed: ' . $ex->getMessage());
        }
    }
    $row = array_merge($row, $data);
}

admin_header(($id ? 'Edit ' : 'Add ') . strtolower($def['singular']), 'content.php?e=' . $key);
?>
<?php if ($errors): ?><div class="alert alert-danger"><ul class="m-0"><?php foreach ($errors as $er): ?><li><?= e($er) ?></li><?php endforeach; ?></ul></div><?php endif; ?>
<form class="adm-card" method="post" enctype="multipart/form-data">
  <?= csrf_field() ?>
  <div class="row g-3">
  <?php foreach ($def['fields'] as $name => $f):
      $val = $row[$name] ?? '';
      $wide = in_array($f['type'], ['textarea', 'lines', 'image', 'file', 'url'], true);
      $idf = 'f_' . $name; ?>
    <div class="<?= $wide ? 'col-12' : 'col-md-6' ?>">
      <?php if ($f['type'] === 'bool'): ?>
        <div class="form-check form-switch mt-4"><input class="form-check-input" type="checkbox" id="<?= $idf ?>" name="<?= $name ?>" value="1" <?= $val ? 'checked' : '' ?>><label class="form-check-label" for="<?= $idf ?>"><?= e($f['label']) ?></label></div>
      <?php else: ?>
        <label class="form-label" for="<?= $idf ?>"><?= e($f['label']) ?><?= !empty($f['required']) ? ' *' : '' ?></label>
        <?php if ($f['type'] === 'textarea'): ?>
          <textarea class="form-control" id="<?= $idf ?>" name="<?= $name ?>" rows="5"><?= e($val) ?></textarea>
        <?php elseif ($f['type'] === 'lines'): $arr = is_array($val) ? $val : (json_decode((string) $val, true) ?: []); ?>
          <textarea class="form-control" id="<?= $idf ?>" name="<?= $name ?>" rows="6"><?= e(implode("\n", $arr)) ?></textarea>
        <?php elseif ($f['type'] === 'select'): ?>
          <select class="form-select" id="<?= $idf ?>" name="<?= $name ?>"><?php foreach ($f['options'] as $ok => $ol): ?><option value="<?= e($ok) ?>" <?= (string) $val === (string) $ok ? 'selected' : '' ?>><?= e($ol) ?></option><?php endforeach; ?></select>
        <?php elseif ($f['type'] === 'image' || $f['type'] === 'file'): ?>
          <div class="d-flex gap-3 align-items-start">
            <?php if ($f['type'] === 'image' && $val): ?><img src="<?= e(media_url($val)) ?>" alt="" class="adm-thumb"><?php endif; ?>
            <div class="flex-grow-1">
              <input class="form-control mb-2" id="<?= $idf ?>" name="<?= $name ?>" value="<?= e($val) ?>" placeholder="Existing path or https:// URL">
              <input class="form-control" type="file" name="<?= $name ?>_upload" accept="<?= $f['type'] === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'application/pdf' ?>" aria-label="Upload <?= e($f['label']) ?>">
              <div class="form-text"><?= $f['type'] === 'image' ? 'Images are converted to optimised WebP automatically.' : 'PDF only. Files for “students only” are stored privately.' ?></div>
            </div>
          </div>
        <?php else: ?>
          <input class="form-control" id="<?= $idf ?>" name="<?= $name ?>" value="<?= e($val) ?>" <?= $f['type'] === 'int' ? 'type="number"' : ($f['type'] === 'color' ? 'type="color"' : ($f['type'] === 'url' ? 'type="url"' : '')) ?>>
        <?php endif; ?>
        <?php if (!empty($f['help'])): ?><div class="form-text"><?= e($f['help']) ?></div><?php endif; ?>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
  </div>
  <div class="d-flex gap-2 mt-4"><button class="btn btn-primary">Save</button><a class="btn btn-outline-secondary" href="<?= e(admin_url('content.php', ['e' => $key])) ?>">Cancel</a></div>
</form>
<?php admin_footer();
