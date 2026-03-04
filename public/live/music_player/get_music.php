<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$musicDir = 'music/';
$songs = [];

if (is_dir($musicDir)) {
    $files = scandir($musicDir);
    foreach ($files as $file) {
        $filePath = $musicDir . $file;
        if (is_file($filePath) && strtolower(pathinfo($filePath, PATHINFO_EXTENSION)) === 'mp3') {
            // Clean up filename for display
            $name = pathinfo($file, PATHINFO_FILENAME);
            // Replace underscores/hyphens with spaces for better readability
            $displayName = str_replace(['_', '-'], ' ', $name);
            
            $songs[] = [
                'name' => $displayName,
                'filename' => $file,
                'path' => $musicDir . rawurlencode($file) // Encode filename for URL safety
            ];
        }
    }
}

echo json_encode($songs);
?>