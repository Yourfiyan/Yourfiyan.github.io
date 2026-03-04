<?php
// Check if user is logged in
require_once "auth_check.php";
// Include config file
require_once "db_config.php";
 
// Prevent demo user from editing products
if (isset($_SESSION["username"]) && $_SESSION["username"] === 'admin') {
    $_SESSION['message'] = "Demo account cannot edit products.";
    header("location: index.php");
    exit();
}

$name = $condition = $price = $current_image_path = "";
$name_err = $condition_err = $price_err = $image_err = $error_msg = "";
$product_id = 0;

// Get ID from URL
if (isset($_GET["id"]) && !empty(trim($_GET["id"]))) {
    $product_id = trim($_GET["id"]);

    // Prepare a select statement
    $sql = "SELECT * FROM products WHERE id = ?";
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("i", $product_id);
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows == 1) {
                $row = $result->fetch_assoc();
                $name = $row["name"];
                $condition = $row["condition_desc"];
                $price = $row["price"];
                $current_image_path = $row["image_path"];
            } else {
                $error_msg = "No product found with that ID.";
            }
        } else {
            $error_msg = "Oops! Something went wrong.";
        }
        $stmt->close();
    }
} else {
    // No ID specified
    header("location: index.php");
    exit();
}

// Processing form data when form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get hidden input values
    $product_id = $_POST["id"];
    $current_image_path = $_POST["current_image_path"];

    // Validate name
    $name = trim($_POST["name"]);
    if (empty($name)) {
        $name_err = "Please enter a name.";
    }

    // Validate condition
    $condition = trim($_POST["condition"]);
    if (empty($condition)) {
        $condition_err = "Please enter a condition.";
    }

    // Validate price
    $price = trim($_POST["price"]);
    if (empty($price)) {
        $price_err = "Please enter a price.";
    }

    $new_image_filename = $current_image_path; // Default to old image
    $image_upload_success = false;

    // Check if a new image was uploaded
    if (isset($_FILES["image"]) && $_FILES["image"]["error"] == 0) {
        $allowed = ["jpg" => "image/jpg", "jpeg" => "image/jpeg", "png" => "image/png", "webp" => "image/webp"];
        $filename = $_FILES["image"]["name"];
        $filetype = $_FILES["image"]["type"];
        $filesize = $_FILES["image"]["size"];
        $ext = pathinfo($filename, PATHINFO_EXTENSION);

        if (!array_key_exists($ext, $allowed)) $image_err = "Invalid file format.";
        $maxsize = 5 * 1024 * 1024;
        if ($filesize > $maxsize) $image_err = "File size is too large (Max 5MB).";
        
        if (in_array($filetype, $allowed) && empty($image_err)) {
            $new_image_filename = uniqid() . "." . $ext;
            $target_file = "../uploads/" . $new_image_filename;

            if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
                $image_upload_success = true;
                // Delete the old image
                if (!empty($current_image_path) && file_exists("../uploads/" . $current_image_path)) {
                    unlink("../uploads/" . $current_image_path);
                }
            } else {
                $image_err = "Failed to upload new image.";
            }
        }
    }

    // Check input errors before updating database
    if (empty($name_err) && empty($condition_err) && empty($price_err) && empty($image_err)) {
        $sql = "UPDATE products SET name = ?, condition_desc = ?, price = ?, image_path = ? WHERE id = ?";
        
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("ssssi", $name, $condition, $price, $new_image_filename, $product_id);
            
            if ($stmt->execute()) {
                $_SESSION['message'] = "Product updated successfully!";
                header("location: index.php");
                exit();
            } else {
                $error_msg = "Something went wrong. Please try again later.";
            }
            $stmt->close();
        }
    }
    
    $conn->close();
}
?>
 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Product - PocketPhone Admin</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="header-bar">
            <h2>Edit Product</h2>
            <a href="index.php" class="btn btn-secondary">Back to Dashboard</a>
        </div>

        <?php 
        if (!empty($error_msg)) {
            echo '<div class="error-msg">' . $error_msg . '</div>';
        }
        ?>

        <form action="<?php echo htmlspecialchars(basename($_SERVER['REQUEST_URI'])); ?>" method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label>Product Name</label>
                <input type="text" name="name" value="<?php echo $name; ?>">
                <?php if(!empty($name_err)) echo '<span class="error-msg">' . $name_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <label>Condition</label>
                <input type="text" name="condition" value="<?php echo $condition; ?>">
                <?php if(!empty($condition_err)) echo '<span class="error-msg">' . $condition_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="text" name="price" value="<?php echo $price; ?>">
                <?php if(!empty($price_err)) echo '<span class="error-msg">' . $price_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <label>Current Image</label>
                <div>
                    <img src="../uploads/<?php echo $current_image_path; ?>" class="thumbnail" alt="Current Image">
                </div>
            </div>
            <div class="form-group">
                <label>Upload New Image (Optional)</label>
                <input type="file" name="image" accept="image/png, image/jpeg, image/jpg, image/webp">
                <small>Leave blank to keep the current image.</small>
                <?php if(!empty($image_err)) echo '<span class="error-msg">' . $image_err . '</span>'; ?>
            </div>
            
            <!-- Hidden fields to pass ID and current image path -->
            <input type="hidden" name="id" value="<?php echo $product_id; ?>">
            <input type="hidden" name="current_image_path" value="<?php echo $current_image_path; ?>">
            
            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Update Product">
            </div>
        </form>
    </div>
</body>
</html>
