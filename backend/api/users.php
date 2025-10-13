<?php
ob_start();
header('Content-Type: application/json; charset=utf-8');

// CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost',
    'http://127.0.0.1',
];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// disable HTML errors in response
ini_set('display_errors', '0');
error_reporting(E_ALL);

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
    echo json_encode(['error' => 'DB connection failed', 'detail' => $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->query('SELECT id, name, email, phone, role, department, active, status, created_at FROM users ORDER BY name');
        echo json_encode($stmt->fetchAll());
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($input['name']) || empty($input['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing name or email']);
            exit;
        }

        $rawPassword = $input['password'] ?? '';
        $passwordHash = password_hash($rawPassword, PASSWORD_DEFAULT);

        // ensure department is not null (DB requires NOT NULL)
        $department = $input['department'] ?? '';

        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email, phone, password, role, department, active, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())'
        );
        $stmt->execute([
            $input['name'],
            $input['email'],
            $input['phone'] ?? '',
            $passwordHash,
            $input['role'] ?? 'Employee',
            $department,
            isset($input['active']) ? (int)$input['active'] : 1,
            $input['status'] ?? 'active'
        ]);

        echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
        exit;
    }

    if ($method === 'PUT') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $fields = [];
        $params = [];
        $allowed = ['name', 'email', 'phone', 'role', 'department', 'active', 'status', 'password'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $input)) {
                if ($f === 'password') {
                    $fields[] = 'password = ?';
                    $params[] = password_hash($input['password'] ?? '', PASSWORD_DEFAULT);
                } else {
                    $fields[] = "$f = ?";
                    $params[] = $input[$f];
                }
            }
        }
        if (empty($fields)) {
            echo json_encode(['ok' => true, 'updated' => 0]);
            exit;
        }
        $params[] = $id;
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['ok' => true, 'updated' => $stmt->rowCount()]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            exit;
        }
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['ok' => true]);
        exit;
    }

    // unsupported method
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
} catch (PDOException $e) {
    $msg = $e->getMessage();
    if (stripos($msg, 'duplicate') !== false) {
        http_response_code(409);
        echo json_encode(['error' => 'Duplicate entry', 'detail' => $msg]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error', 'detail' => $msg]);
    }
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'detail' => $e->getMessage()]);
    exit;
} finally {
    ob_end_flush();
}
