<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET,POST,DELETE,OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dbHost = '127.0.0.1';
$dbName = 'administrative';
$dbUser = 'root';
$dbPass = '';

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query('SELECT group_id, user_id FROM user_group_members');
        echo json_encode($stmt->fetchAll());
    } catch (PDOException $e) {
        // Table missing or other DB error — return empty list instead of fatal error
        echo json_encode([]);
    }
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'POST') {
    if (empty($input['group_id']) || empty($input['user_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing group_id or user_id']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT IGNORE INTO user_group_members (group_id, user_id) VALUES (?, ?)');
    $stmt->execute([$input['group_id'], $input['user_id']]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'DELETE') {
    $group = $_GET['group_id'] ?? null;
    $user = $_GET['user_id'] ?? null;
    if (!$group || !$user) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing group_id or user_id']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM user_group_members WHERE group_id = ? AND user_id = ?');
    $stmt->execute([$group, $user]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
