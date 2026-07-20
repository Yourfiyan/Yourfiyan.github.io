<?php
// Check if user is logged in
require_once "auth_check.php";
// Include config file
require_once "db_config.php";
require_once "csrf.php";

// Prevent demo user from deleting products
if (isset($_SESSION["username"]) && $_SESSION["username"] === 'admin') {
    $_SESSION['message'] = "Demo account cannot delete products.";
    header("location: index.php");
    exit();
}

// Deletion is state-changing: require POST + a valid CSRF token.
// (GET deletes could be triggered by a crafted link or by crawlers.)
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["id"]) && !empty(trim($_POST["id"]))) {
    csrf_verify();
    $product_id = trim($_POST["id"]);
    
    // First, get the image path to delete the file from the server
    $sql_select = "SELECT image_path FROM products WHERE id = ?";
    if ($stmt_select = $conn->prepare($sql_select)) {
        $stmt_select->bind_param("i", $product_id);
        if ($stmt_select->execute()) {
            $result = $stmt_select->get_result();
            if ($result->num_rows == 1) {
                $row = $result->fetch_assoc();
                $image_to_delete = "../uploads/" . $row["image_path"];
            }
        }
        $stmt_select->close();
    }

    // Prepare a delete statement
    $sql = "DELETE FROM products WHERE id = ?";
    
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("i", $product_id);
        
        if ($stmt->execute()) {
            // Product deleted from DB, now delete the file
            if (!empty($image_to_delete) && file_exists($image_to_delete)) {
                unlink($image_to_delete);
            }
            $_SESSION['message'] = "Product deleted successfully.";
        } else {
            $_SESSION['message'] = "Oops! Something went wrong. Please try again later.";
        }
        $stmt->close();
    }
    
    $conn->close();
    
    // Redirect to admin index
    header("location: index.php");
    exit();
} else {
    // If no ID was provided, redirect
    header("location: index.php");
    exit();
}
?>
