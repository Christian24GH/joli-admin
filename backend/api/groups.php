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
    $stmt = $pdo->query('SELECT id, name, department, parent FROM user_groups ORDER BY name');
    echo json_encode($stmt->fetchAll());
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'POST') {
    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing name']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO user_groups (name, department, parent) VALUES (?, ?, ?)');
    $stmt->execute([$input['name'], $input['department'] ?? null, $input['parent'] ?? null]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM user_groups WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
