<?php
// Check if user is logged in
require_once "auth_check.php";
// Include config file
require_once "db_config.php";
require_once "csrf.php";
 
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
    csrf_verify();
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
        // See add_product.php — client MIME is untrusted; validate by
        // decoding the file with getimagesize().
        $allowed = ["jpg" => IMAGETYPE_JPEG, "jpeg" => IMAGETYPE_JPEG, "png" => IMAGETYPE_PNG, "webp" => IMAGETYPE_WEBP];
        $filename = $_FILES["image"]["name"];
        $filesize = $_FILES["image"]["size"];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (!array_key_exists($ext, $allowed)) $image_err = "Invalid file format.";
        $maxsize = 5 * 1024 * 1024;
        if ($filesize > $maxsize) $image_err = "File size is too large (Max 5MB).";
        $imginfo = empty($image_err) ? @getimagesize($_FILES["image"]["tmp_name"]) : false;
        if (empty($image_err) && (!$imginfo || $imginfo[2] !== $allowed[$ext])) {
            $image_err = "Uploaded file is not a valid image of the declared type.";
        }

        if (empty($image_err)) {
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
    <meta name="robots" content="noindex, nofollow">
    <link rel="icon" type="image/svg+xml" href="../assets/img/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="header-bar">
            <h2>Edit product</h2>
            <a href="index.php" class="btn btn-secondary">Back to dashboard</a>
        </div>

        <?php 
        if (!empty($error_msg)) {
            echo '<div class="error-msg">' . $error_msg . '</div>';
        }
        ?>

        <form action="<?php echo htmlspecialchars(basename($_SERVER['REQUEST_URI'])); ?>" method="post" enctype="multipart/form-data">
            <?php echo csrf_field(); ?>
            <div class="form-group">
                <label>Product Name</label>
                <input type="text" name="name" value="<?php echo htmlspecialchars($name, ENT_QUOTES); ?>">
                <?php if(!empty($name_err)) echo '<span class="error-msg">' . $name_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <label>Condition</label>
                <input type="text" name="condition" value="<?php echo htmlspecialchars($condition, ENT_QUOTES); ?>">
                <?php if(!empty($condition_err)) echo '<span class="error-msg">' . $condition_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="text" name="price" value="<?php echo htmlspecialchars($price, ENT_QUOTES); ?>">
                <?php if(!empty($price_err)) echo '<span class="error-msg">' . $price_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <label>Current Image</label>
                <div>
                    <img src="../uploads/<?php echo htmlspecialchars($current_image_path, ENT_QUOTES); ?>" class="thumbnail" alt="Current Image">
                </div>
            </div>
            <div class="form-group">
                <label>Upload New Image (Optional)</label>
                <input type="file" name="image" accept="image/png, image/jpeg, image/jpg, image/webp">
                <small>Leave blank to keep the current image.</small>
                <?php if(!empty($image_err)) echo '<span class="error-msg">' . $image_err . '</span>'; ?>
            </div>
            
            <!-- Hidden fields to pass ID and current image path -->
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($product_id, ENT_QUOTES); ?>">
            <input type="hidden" name="current_image_path" value="<?php echo htmlspecialchars($current_image_path, ENT_QUOTES); ?>">
            
            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Update Product">
            </div>
        </form>
    </div>
</body>
</html>
