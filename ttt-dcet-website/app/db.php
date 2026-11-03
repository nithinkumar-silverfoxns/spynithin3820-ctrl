<?php
declare(strict_types=1);

/**
 * Returns a shared PDO connection, or null when the database is not configured
 * or unreachable. Public pages fall back to the bundled verified content in
 * data/seed.php so the site still renders; forms and admin require the DB.
 */
function db(): ?PDO
{
    static $pdo = false;
    if ($pdo !== false) {
        return $pdo;
    }
    $c = config('db');
    try {
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $c['host'], $c['port'], $c['name'], $c['charset']);
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 3,
        ]);
        $pdo->exec("SET time_zone = '+05:30'");
    } catch (Throwable $ex) {
        error_log('[ttt] DB connection failed: ' . $ex->getMessage());
        $pdo = null;
    }
    return $pdo;
}

function db_required(): PDO
{
    $pdo = db();
    if (!$pdo) {
        http_response_code(503);
        exit('Database unavailable. Please configure config/config.local.php and run database/install.php.');
    }
    return $pdo;
}

function db_all(string $sql, array $params = []): array
{
    $st = db_required()->prepare($sql);
    $st->execute($params);
    return $st->fetchAll();
}

function db_one(string $sql, array $params = []): ?array
{
    $st = db_required()->prepare($sql);
    $st->execute($params);
    $row = $st->fetch();
    return $row === false ? null : $row;
}

function db_exec(string $sql, array $params = []): int
{
    $st = db_required()->prepare($sql);
    $st->execute($params);
    return $st->rowCount();
}
