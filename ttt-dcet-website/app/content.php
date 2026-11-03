<?php
declare(strict_types=1);

function entities(): array
{
    static $e = null;
    return $e ??= require ROOT . '/app/entities.php';
}

function seed_data(): array
{
    static $s = null;
    return $s ??= require ROOT . '/data/seed.php';
}

/** Decode "lines" (JSON array) fields of an entity row. */
function hydrate(string $entity, array $row): array
{
    foreach (entities()[$entity]['fields'] ?? [] as $name => $f) {
        if ($f['type'] === 'lines') {
            $v = $row[$name] ?? '[]';
            $row[$name] = is_array($v) ? $v : (json_decode((string) $v, true) ?: []);
        }
    }
    return $row;
}

/**
 * Fetch visible rows of an entity. Reads the database when available and
 * falls back to the verified seed content otherwise.
 */
function content(string $entity, array $where = []): array
{
    static $cache = [];
    $key = $entity . json_encode($where);
    if (isset($cache[$key])) {
        return $cache[$key];
    }
    $def = entities()[$entity];
    $rows = null;

    if ($pdo = db()) {
        try {
            $sql = "SELECT * FROM `{$entity}` WHERE is_active = 1";
            $params = [];
            foreach ($where as $col => $val) {
                if (!isset($def['fields'][$col])) {
                    continue;
                }
                $sql .= " AND `{$col}` = ?";
                $params[] = $val;
            }
            $st = $pdo->prepare($sql . ' ORDER BY ' . $def['order']);
            $st->execute($params);
            $rows = $st->fetchAll();
        } catch (Throwable $ex) {
            error_log('[ttt] content(' . $entity . '): ' . $ex->getMessage());
            $rows = null;
        }
    }

    if ($rows === null) {
        $rows = array_values(array_filter(seed_data()[$entity] ?? [], static function ($r) use ($where) {
            if (isset($r['is_active']) && !$r['is_active']) {
                return false;
            }
            foreach ($where as $c => $v) {
                if ((string) ($r[$c] ?? '') !== (string) $v) {
                    return false;
                }
            }
            return true;
        }));
        $rows = sort_like_sql($rows, $def['order']);
    }

    return $cache[$key] = array_map(static fn($r) => hydrate($entity, $r), $rows);
}

function sort_like_sql(array $rows, string $order): array
{
    $parts = array_map(static function ($p) {
        $p = preg_split('/\s+/', trim($p));
        return [$p[0], strtoupper($p[1] ?? 'ASC') === 'DESC' ? -1 : 1];
    }, explode(',', $order));
    usort($rows, static function ($a, $b) use ($parts) {
        foreach ($parts as [$col, $dir]) {
            $cmp = ($a[$col] ?? 0) <=> ($b[$col] ?? 0);
            if ($cmp !== 0) {
                return $cmp * $dir;
            }
        }
        return 0;
    });
    return $rows;
}

function settings(): array
{
    static $s = null;
    if ($s !== null) {
        return $s;
    }
    $s = seed_data()['settings'];
    if ($pdo = db()) {
        try {
            foreach ($pdo->query('SELECT `key`, `value` FROM settings') as $row) {
                $s[$row['key']] = $row['value'];
            }
        } catch (Throwable $ex) {
            error_log('[ttt] settings: ' . $ex->getMessage());
        }
    }
    return $s;
}

/* ---------- Convenience accessors ---------- */

function courses(): array
{
    return content('courses');
}

function course(string $slug): ?array
{
    foreach (courses() as $c) {
        if ($c['slug'] === $slug) {
            return $c;
        }
    }
    return null;
}

function results(): array
{
    return content('results');
}

function result_years(): array
{
    return array_map(static fn($r) => (int) $r['year'], results());
}

function toppers(?int $year = null): array
{
    return $year ? content('toppers', ['year' => $year]) : content('toppers');
}

function featured_toppers(): array
{
    $t = array_values(array_filter(toppers(), static fn($r) => !empty($r['featured']) && !empty($r['photo'])));
    usort($t, static fn($a, $b) => [$a['rank_no'], -$a['year']] <=> [$b['rank_no'], -$b['year']]);
    return $t;
}

function rankers(?int $year = null): array
{
    return $year ? content('rankers', ['year' => $year]) : content('rankers');
}

function videos(?string $category = null): array
{
    return $category ? content('videos', ['category' => $category]) : content('videos');
}

function faqs(?string $category = null): array
{
    return $category ? content('faqs', ['category' => $category]) : content('faqs');
}

/** Headline numbers used across the site, all derived from verified results. */
function headline_stats(): array
{
    $r = results();
    $latest = $r[0] ?? [];
    $firsts = array_values(array_filter($r, static fn($x) => (int) $x['best_rank'] === 1));
    return [
        'latest_year'   => (int) ($latest['year'] ?? 0),
        'latest_100'    => (int) ($latest['below_100'] ?? 0),
        'latest_2000'   => (int) ($latest['below_2000'] ?? 0),
        'latest_best'   => (int) ($latest['best_rank'] ?? 0),
        'first_years'   => array_map(static fn($x) => (int) $x['year'], $firsts),
        'total_top100'  => array_sum(array_map(static fn($x) => (int) ($x['below_100'] ?? 0), $r)),
        'years_tracked' => count($r),
    ];
}

/** Top-50 college guide with DCET 2026 Round-1 cutoffs (General / Rest of Karnataka). */
function colleges(): array
{
    static $c = null;
    return $c ??= json_decode((string) file_get_contents(ROOT . '/data/colleges.json'), true) ?: [];
}
