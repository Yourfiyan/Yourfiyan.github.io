<?php
/*
 * Minimal CSRF protection shared by the admin forms.
 *
 * Usage:
 *   require_once "csrf.php";
 *   POST forms include: <?php echo csrf_field(); ?>
 *   POST handlers call: csrf_verify();   // dies with 403 on mismatch
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function csrf_field() {
    return '<input type="hidden" name="csrf_token" value="'
        . htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES)
        . '">';
}

function csrf_verify() {
    if (
        !isset($_POST['csrf_token']) ||
        !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])
    ) {
        http_response_code(403);
        die("Invalid request token. Please go back and try again.");
    }
}
?>
