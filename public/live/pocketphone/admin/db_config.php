<?php
/*
 * Database Configuration Loader
 *
 * Real credentials are NOT stored in the repository. They live in an
 * untracked file next to this one: db_config.local.php
 *
 * One-time server setup (via FTP / file manager):
 *   1. Copy db_config.local.php.example to db_config.local.php
 *   2. Fill in the real DB_SERVER / DB_USERNAME / DB_PASSWORD / DB_NAME
 *
 * The deploy script never uploads or overwrites db_config.local.php.
 */

$local_config = __DIR__ . '/db_config.local.php';
if (is_file($local_config)) {
    require_once $local_config;
}

if (!defined('DB_SERVER') || !defined('DB_USERNAME') || !defined('DB_PASSWORD') || !defined('DB_NAME')) {
    http_response_code(503);
    die("Database configuration missing. Create admin/db_config.local.php on the server (see db_config.local.php.example).");
}

// Attempt to connect to MySQL database
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// mysqli never returns false from the constructor — check connect_error instead
if ($conn->connect_error) {
    http_response_code(503);
    die("ERROR: Could not connect to the database.");
}

// Set charset to utf8mb4 for full UTF-8 support
$conn->set_charset("utf8mb4");
?>
