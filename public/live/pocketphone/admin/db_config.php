<?php
/*
 * Database Configuration
 *
 * PLEASE UPDATE these values with your actual database credentials.
 */

define('DB_SERVER', 'REDACTED');
define('DB_USERNAME', 'REDACTED'); // <-- IMPORTANT
define('DB_PASSWORD', 'REDACTED'); // <-- IMPORTANT
define('DB_NAME', 'REDACTED'); // <-- IMPORTANT

// Attempt to connect to MySQL database
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($conn === false){
    die("ERROR: Could not connect. " . $conn->connect_error);
}

// Set charset to utf8mb4 for full UTF-8 support
$conn->set_charset("utf8mb4");

?>
