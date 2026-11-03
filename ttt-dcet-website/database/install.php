<?php
/**
 * T.T.T Academy DCET website — database installer (CLI only).
 *
 *   php database/install.php --admin-user=admin --admin-pass='S3cure!Pass' [--fresh]
 *       Creates tables, seeds verified content (only into empty tables) and creates/updates the admin user.
 *
 *   php database/install.php --sql > database/ttt_dcet.sql
 *       Writes schema + seed SQL (for importing through phpMyAdmin). Create the admin with --admin-* afterwards,
 *       or insert one manually using a password_hash() value.
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only');
}

require dirname(__DIR__) . '/app/bootstrap.php';

$opts = getopt('', ['admin-user:', 'admin-pass:', 'fresh', 'sql']);

function schema_sql(): array
{
    $sql = [];
    $sql[] = "CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $sql[] = "CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  login_id VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(15) NULL,
  email VARCHAR(120) NULL,
  batch VARCHAR(120) NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $sql[] = "CREATE TABLE IF NOT EXISTS enquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('admission','demo','contact') NOT NULL DEFAULT 'admission',
  status ENUM('new','contacted','enrolled','closed') NOT NULL DEFAULT 'new',
  name VARCHAR(80) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(120) NULL,
  course VARCHAR(120) NULL,
  branch VARCHAR(120) NULL,
  mode VARCHAR(20) NULL,
  diploma VARCHAR(80) NULL,
  message TEXT NULL,
  preferred_date DATE NULL,
  slot VARCHAR(20) NULL,
  admin_note TEXT NULL,
  ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(255) NULL,
  source_page VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_created (created_at),
  KEY idx_ip_created (ip, created_at),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $sql[] = "CREATE TABLE IF NOT EXISTS login_attempts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  scope VARCHAR(10) NOT NULL,
  identifier VARCHAR(80) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_lookup (scope, identifier, attempted_at),
  KEY idx_ip (scope, ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $sql[] = "CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(60) NOT NULL PRIMARY KEY,
  `value` TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $indexes = [
        'courses' => ['UNIQUE KEY uq_slug (slug)'],
        'results' => ['UNIQUE KEY uq_year (year)'],
        'toppers' => ['KEY idx_year (year, rank_no)'],
        'rankers' => ['KEY idx_year (year, rank_no)'],
        'videos'  => ['KEY idx_cat (category)'],
    ];
    foreach (entities() as $table => $def) {
        $cols = ['id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY'];
        foreach ($def['fields'] as $name => $f) {
            $cols[] = "`{$name}` " . match ($f['type']) {
                'text'            => $name === 'slug' ? 'VARCHAR(120) NOT NULL' : 'VARCHAR(255) NULL',
                'textarea', 'lines', 'url' => 'TEXT NULL',
                'int'             => $name === 'sort_order' ? 'INT NOT NULL DEFAULT 0' : 'INT NULL',
                'bool'            => 'TINYINT(1) NOT NULL DEFAULT ' . ($name === 'is_active' ? '1' : '0'),
                'select'          => 'VARCHAR(40) NULL',
                'image', 'file'   => 'VARCHAR(500) NULL',
                'color'           => 'VARCHAR(20) NULL',
                default           => 'TEXT NULL',
            };
        }
        $cols[] = 'created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP';
        $cols[] = 'updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';
        foreach ($indexes[$table] ?? [] as $ix) {
            $cols[] = $ix;
        }
        $sql[] = "CREATE TABLE IF NOT EXISTS `{$table}` (\n  " . implode(",\n  ", $cols) . "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    }
    return $sql;
}

/** @return array<int, array{0:string,1:array}> [sql, params] */
function seed_rows(): array
{
    $out = [];
    $seed = seed_data();
    foreach (entities() as $table => $def) {
        foreach ($seed[$table] ?? [] as $row) {
            $data = [];
            foreach ($def['fields'] as $name => $f) {
                if (!array_key_exists($name, $row)) {
                    if ($name === 'is_active') $data[$name] = 1;
                    continue;
                }
                $v = $row[$name];
                if ($f['type'] === 'lines' && is_array($v)) $v = json_encode($v, JSON_UNESCAPED_UNICODE);
                $data[$name] = $v;
            }
            $cols = array_keys($data);
            $out[$table][] = ['INSERT INTO `' . $table . '` (`' . implode('`,`', $cols) . '`) VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')', array_values($data)];
        }
    }
    foreach ($seed['settings'] as $k => $v) {
        $out['settings'][] = ['INSERT IGNORE INTO settings (`key`, `value`) VALUES (?, ?)', [$k, $v]];
    }
    return $out;
}

function sql_literal($v): string
{
    if ($v === null) return 'NULL';
    if (is_int($v) || is_float($v)) return (string) $v;
    if (is_bool($v)) return $v ? '1' : '0';
    return "'" . str_replace(['\\', "\0", "\n", "\r", "'", "\x1a"], ['\\\\', '\\0', '\\n', '\\r', "\\'", '\\Z'], (string) $v) . "'";
}

/* ---------- --sql: dump to stdout ---------- */
if (isset($opts['sql'])) {
    echo "-- T.T.T Academy DCET website — schema + verified seed data\n-- Generated " . date('c') . " by database/install.php --sql\nSET NAMES utf8mb4;\n\n";
    foreach (schema_sql() as $s) echo $s . ";\n\n";
    foreach (seed_rows() as $table => $rows) {
        echo "-- {$table}\n";
        foreach ($rows as [$q, $params]) {
            $i = 0;
            echo preg_replace_callback('/\?/', function () use (&$i, $params) { return sql_literal($params[$i++]); }, $q) . ";\n";
        }
        echo "\n";
    }
    exit(0);
}

/* ---------- Live install ---------- */
$pdo = db();
if (!$pdo) {
    fwrite(STDERR, "Cannot connect to MySQL. Check config/config.local.php (DB_HOST, DB_NAME, DB_USER, DB_PASS).\n");
    exit(1);
}

if (isset($opts['fresh'])) {
    fwrite(STDOUT, "--fresh: dropping content tables…\n");
    foreach (array_merge(array_keys(entities()), ['settings']) as $t) $pdo->exec("DROP TABLE IF EXISTS `{$t}`");
}

foreach (schema_sql() as $s) $pdo->exec($s);
fwrite(STDOUT, "✓ Schema ready\n");

foreach (seed_rows() as $table => $rows) {
    if ($table !== 'settings') {
        $count = (int) $pdo->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
        if ($count > 0) {
            fwrite(STDOUT, "  · {$table}: already has {$count} rows — skipped\n");
            continue;
        }
    }
    $pdo->beginTransaction();
    foreach ($rows as [$q, $params]) $pdo->prepare($q)->execute($params);
    $pdo->commit();
    fwrite(STDOUT, "  ✓ {$table}: seeded " . count($rows) . " rows\n");
}

if (!empty($opts['admin-user']) && !empty($opts['admin-pass'])) {
    $user = strtolower(trim($opts['admin-user']));
    $pass = (string) $opts['admin-pass'];
    if (strlen($pass) < 10) {
        fwrite(STDERR, "Admin password must be at least 10 characters.\n");
        exit(1);
    }
    $st = $pdo->prepare('INSERT INTO admins (username, name, password_hash) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1');
    $st->execute([$user, 'Administrator', password_hash($pass, PASSWORD_DEFAULT)]);
    fwrite(STDOUT, "✓ Admin user '{$user}' ready — log in at /admin/\n");
} else {
    fwrite(STDOUT, "Tip: create an admin with --admin-user=admin --admin-pass='a strong password'\n");
}
