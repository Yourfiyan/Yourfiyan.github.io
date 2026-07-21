<?php
// Check if user is logged in
require_once "auth_check.php";
// Include config file
require_once "db_config.php";
require_once "csrf.php";

// Prevent demo user from adding products
if (isset($_SESSION["username"]) && $_SESSION["username"] === 'admin') {
    $_SESSION['message'] = "Demo account cannot add products.";
    header("location: index.php");
    exit();
}
 
$name = $condition = $price = $image = "";
$name_err = $condition_err = $price_err = $image_err = $error_msg = "";
 
// Processing form data when form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    csrf_verify();
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

    // Validate image
    if (isset($_FILES["image"]) && $_FILES["image"]["error"] == 0) {
        // Allowed extensions mapped to the IMAGETYPE_* constants that
        // getimagesize() actually detects — the client-supplied
        // $_FILES["type"] is attacker-controlled and is NOT trusted.
        $allowed = ["jpg" => IMAGETYPE_JPEG, "jpeg" => IMAGETYPE_JPEG, "png" => IMAGETYPE_PNG, "webp" => IMAGETYPE_WEBP];
        $filename = $_FILES["image"]["name"];
        $filesize = $_FILES["image"]["size"];
    
        // Verify file extension
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        if (!array_key_exists($ext, $allowed)) {
            $image_err = "Please select a valid file format (JPG, JPEG, PNG, WEBP).";
        }
    
        // Verify file size - 5MB maximum
        $maxsize = 5 * 1024 * 1024;
        if ($filesize > $maxsize) {
            $image_err = "File size is larger than the allowed limit (5MB).";
        }
    
        // Verify actual content: must decode as the image type the
        // extension claims (blocks PHP payloads renamed to .png etc.)
        $imginfo = empty($image_err) ? @getimagesize($_FILES["image"]["tmp_name"]) : false;
        if (empty($image_err) && (!$imginfo || $imginfo[2] !== $allowed[$ext])) {
            $image_err = "Uploaded file is not a valid image of the declared type.";
        }
        if (empty($image_err)) {
            // Create a unique name
            $new_filename = uniqid() . "." . $ext;
            // IMPORTANT: Set target directory to parent folder's 'uploads'
            $target_file = "../uploads/" . $new_filename; 

            // Try to move the uploaded file
            if (!move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
                $image_err = "There was an error uploading your file.";
            }
        }
    } else {
        $image_err = "Please select an image to upload.";
    }

    // Check input errors before inserting in database
    if (empty($name_err) && empty($condition_err) && empty($price_err) && empty($image_err)) {
        
        $sql = "INSERT INTO products (name, condition_desc, price, image_path) VALUES (?, ?, ?, ?)";
         
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("ssss", $param_name, $param_condition, $param_price, $param_image_path);
            
            $param_name = $name;
            $param_condition = $condition;
            $param_price = $price;
            $param_image_path = $new_filename;
            
            if ($stmt->execute()) {
                $_SESSION['message'] = "Product added successfully!";
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
    <title>Add Product - PocketPhone Admin</title>
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
            <h2>Add a product</h2>
            <a href="index.php" class="btn btn-secondary">Back to dashboard</a>
        </div>

        <?php 
        if (!empty($error_msg)) {
            echo '<div class="error-msg">' . $error_msg . '</div>';
        }
        ?>

        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" enctype="multipart/form-data">
            <?php echo csrf_field(); ?>
            <div class="form-group">
                <label>Product Name</label>
                <input type="text" name="name" value="<?php echo htmlspecialchars($name, ENT_QUOTES); ?>">
                <?php if(!empty($name_err)) echo '<span class="error-msg">' . $name_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <label>Condition</label>
                <input type="text" name="condition" value="<?php echo htmlspecialchars($condition, ENT_QUOTES); ?>" placeholder="e.g., Pristine Condition, Excellent Condition">
                <?php if(!empty($condition_err)) echo '<span class="error-msg">' . $condition_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="text" name="price" value="<?php echo htmlspecialchars($price, ENT_QUOTES); ?>" placeholder="e.g., ₹45,999">
                <?php if(!empty($price_err)) echo '<span class="error-msg">' . $price_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <label>Product Image</label>
                <input type="file" name="image" accept="image/png, image/jpeg, image/jpg, image/webp">
                <?php if(!empty($image_err)) echo '<span class="error-msg">' . $image_err . '</span>'; ?>
            </div>
            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Add Product">
            </div>
        </form>
    </div>
</body>
</html>
