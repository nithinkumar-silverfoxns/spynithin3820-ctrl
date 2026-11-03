<?php
/** Flattened DCET 2026 Round-1 cutoffs for the client-side finder. */
$keep = ['GM', 'GMK', 'GMR', '1G', '2AG', '2BG', '3AG', '3BG', 'STG'];
$rows = [];
foreach (colleges() as $c) {
    foreach ($c['cutoffs'] ?? [] as $co) {
        $cut = [];
        foreach ($keep as $k) {
            if (isset($co[$k]) && ctype_digit((string) $co[$k])) {
                $cut[$k] = (int) $co[$k];
            }
        }
        if ($cut) {
            $rows[] = ['college' => $c['name'], 'code' => $c['code'] ?? '', 'course' => $co['course'], 'cut' => $cut];
        }
    }
}
header('Cache-Control: public, max-age=86400');
json_response(['year' => 2026, 'round' => 1, 'quota' => 'General / Rest of Karnataka', 'rows' => $rows]);
