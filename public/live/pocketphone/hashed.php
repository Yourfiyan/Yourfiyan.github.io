<?php
$password = "785630"; // Replace with your desired password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
echo "Generated hash for password: " . $hashed_password;
?>