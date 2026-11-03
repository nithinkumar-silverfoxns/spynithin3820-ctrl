<?php
declare(strict_types=1);

/**
 * Authentication for admins and students.
 * - password_hash / password_verify (bcrypt/argon via PASSWORD_DEFAULT)
 * - session id regenerated on login
 * - brute-force throttling per IP + identifier (login_attempts table)
 */

function too_many_attempts(string $scope, string $identifier): bool
{
    try {
        $row = db_one(
            'SELECT COUNT(*) AS c FROM login_attempts WHERE scope = ? AND (ip = ? OR identifier = ?) AND attempted_at > (NOW() - INTERVAL 15 MINUTE)',
            [$scope, client_ip(), $identifier]
        );
        return (int) ($row['c'] ?? 0) >= config('security.login_max_attempts');
    } catch (Throwable) {
        return false;
    }
}

function record_failed_attempt(string $scope, string $identifier): void
{
    try {
        db_exec('INSERT INTO login_attempts (scope, identifier, ip) VALUES (?, ?, ?)', [$scope, $identifier, client_ip()]);
    } catch (Throwable) {
    }
}

function clear_attempts(string $scope, string $identifier): void
{
    try {
        db_exec('DELETE FROM login_attempts WHERE scope = ? AND identifier = ?', [$scope, $identifier]);
    } catch (Throwable) {
    }
}

/** @return array{ok:bool, error?:string} */
function attempt_login(string $scope, string $identifier, string $password): array
{
    $identifier = trim(mb_strtolower($identifier));
    if ($identifier === '' || $password === '') {
        return ['ok' => false, 'error' => 'Please enter your login details.'];
    }
    if (too_many_attempts($scope, $identifier)) {
        return ['ok' => false, 'error' => 'Too many failed attempts. Please wait 15 minutes and try again.'];
    }
    $table = $scope === 'admin' ? 'admins' : 'students';
    $col   = $scope === 'admin' ? 'username' : 'login_id';
    $user  = db_one("SELECT * FROM {$table} WHERE LOWER({$col}) = ? AND is_active = 1 LIMIT 1", [$identifier]);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        // Constant-ish time on unknown users
        if (!$user) {
            password_verify($password, '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG');
        }
        record_failed_attempt($scope, $identifier);
        return ['ok' => false, 'error' => 'Invalid login details.'];
    }

    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        db_exec("UPDATE {$table} SET password_hash = ? WHERE id = ?", [password_hash($password, PASSWORD_DEFAULT), $user['id']]);
    }
    clear_attempts($scope, $identifier);
    session_regenerate_id(true);
    $_SESSION[$scope] = ['id' => (int) $user['id'], 'name' => $user['name'], 'at' => time()];
    db_exec("UPDATE {$table} SET last_login_at = NOW() WHERE id = ?", [$user['id']]);
    return ['ok' => true];
}

function current_user(string $scope): ?array
{
    $u = $_SESSION[$scope] ?? null;
    // Idle timeout: 2 hours
    if ($u && time() - ($u['at'] ?? 0) > 7200) {
        unset($_SESSION[$scope]);
        return null;
    }
    if ($u) {
        $_SESSION[$scope]['at'] = time();
    }
    return $u;
}

function logout(string $scope): void
{
    unset($_SESSION[$scope]);
    session_regenerate_id(true);
}

function require_admin(): array
{
    $u = current_user('admin');
    if (!$u) {
        header('Location: ' . url('/admin/login.php'));
        exit;
    }
    return $u;
}

function require_student(): array
{
    $u = current_user('student');
    if (!$u) {
        flash('error', 'Please log in to continue.');
        redirect('/student/login');
    }
    return $u;
}
