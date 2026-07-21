<?php
// Check if user is logged in
require_once "auth_check.php";
// Include config file
require_once "db_config.php";
require_once "csrf.php";

// Handle messages from other pages (e.g., after add/edit/delete)
$message = "";
if (isset($_SESSION['message'])) {
    $message = $_SESSION['message'];
    unset($_SESSION['message']);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard - PocketPhone</title>
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
            <div>
                <a class="admin-brand" href="../" style="margin-bottom:0">Pocket<span>Phone</span><small>Admin console</small></a>
            </div>
            <div>
                <?php if (!isset($_SESSION["username"]) || $_SESSION["username"] !== 'admin'): ?>
                    <a href="add_product.php" class="btn btn-primary">Add product</a>
                <?php endif; ?>
                <a href="../" class="btn btn-secondary" target="_blank" rel="noopener">View site</a>
                <a href="logout.php" class="btn btn-danger">Log out</a>
            </div>
        </div>

        <p>Signed in as <strong><?php echo htmlspecialchars($_SESSION["username"] ?? ''); ?></strong></p>

        <?php if (isset($_SESSION["username"]) && $_SESSION["username"] === 'admin'): ?>
            <div class="demo-notice">
                <p><strong>Demo Account:</strong> You are logged in as a demo user. Product addition, editing, and deletion are disabled. You can view one product for demonstration purposes.</p>
            </div>
        <?php endif; ?>

        <?php 
        if (!empty($message)) {
            echo '<div class="success-msg">' . htmlspecialchars($message, ENT_QUOTES) . '</div>';
        }
        ?>

        <h2>Manage Products</h2>
        
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Condition</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php
                // Attempt select query execution
                if (isset($_SESSION["username"]) && $_SESSION["username"] === 'admin') {
                    // Demo user: only show the latest product (read-only)
                    $sql = "SELECT * FROM products ORDER BY id DESC LIMIT 1";
                } else {
                    $sql = "SELECT * FROM products ORDER BY id DESC";
                }

                if ($result = $conn->query($sql)) {
                    if ($result->num_rows > 0) {
                        while ($row = $result->fetch_assoc()) {
                            echo "<tr>";
                                // IMPORTANT: Assumes 'uploads' folder is in the parent directory
                                echo "<td><img src='../uploads/" . htmlspecialchars($row['image_path']) . "' alt='" . htmlspecialchars($row['name']) . "' class='thumbnail'></td>";
                                echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                                echo "<td>" . htmlspecialchars($row['condition_desc']) . "</td>";
                                echo "<td>" . htmlspecialchars($row['price']) . "</td>";
                                if (!isset($_SESSION["username"]) || $_SESSION["username"] !== 'admin') {
                                    echo "<td class='action-links'>";
                                        echo "<a href='edit_product.php?id=" . $row['id'] . "' class='btn btn-secondary'>Edit</a>";
                                        echo "<form method='post' action='delete_product.php' style='display:inline' onsubmit='return confirm(\"Are you sure you want to delete this product? This action cannot be undone.\")'>";
                                        echo csrf_field();
                                        echo "<input type='hidden' name='id' value='" . (int)$row['id'] . "'>";
                                        echo "<button type='submit' class='btn btn-danger'>Delete</button>";
                                        echo "</form>";
                                    echo "</td>";
                                }
                            echo "</tr>";
                        }
                    } else {
                        $col_span = (isset($_SESSION["username"]) && $_SESSION["username"] === 'admin') ? 4 : 5;
                        echo "<tr><td colspan='" . $col_span . "'>No products found.</td></tr>";
                    }
                } else {
                    $col_span = (isset($_SESSION["username"]) && $_SESSION["username"] === 'admin') ? 4 : 5;
                    echo "<tr><td colspan='" . $col_span . "'>ERROR: Could not execute $sql. " . $conn->error . "</td></tr>";
                }
                
                // Close connection
                $conn->close();
                ?>
            </tbody>
        </table>
    </div>
</body>
</html>
