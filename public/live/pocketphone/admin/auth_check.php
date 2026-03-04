<?php
// Start the session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if the user is logged in. If not, redirect to login page.
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}
?>
