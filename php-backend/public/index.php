<?php

declare(strict_types=1);

use Dotenv\Dotenv;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$root = dirname(__DIR__);
$autoload = $root . '/vendor/autoload.php';
if (!file_exists($autoload)) {
    http_response_code(500);
    echo json_encode(['error' => 'Missing dependencies. Run composer install in php-backend.']);
    exit;
}

require $autoload;

$workspaceRoot = dirname($root);
// Load backend-specific .env first so php-backend settings take precedence for this service.
if (file_exists($root . '/.env')) {
    Dotenv::createImmutable($root)->safeLoad();
}

// Load workspace-level .env as fallback values only.
if (file_exists($workspaceRoot . '/.env')) {
    Dotenv::createImmutable($workspaceRoot)->safeLoad();
}

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function firstNonEmpty(array $values): string {
    foreach ($values as $value) {
        $candidate = trim((string)$value);
        if ($candidate !== '') {
            return $candidate;
        }
    }
    return '';
}

function firstNonEmptyWithSource(array $items): array {
    foreach ($items as $item) {
        $value = trim((string)($item['value'] ?? ''));
        if ($value !== '') {
            return [
                'value' => $value,
                'source' => (string)($item['source'] ?? 'unknown'),
            ];
        }
    }

    return [
        'value' => '',
        'source' => 'none',
    ];
}

function readDotEnvValue(string $filePath, string $key): string {
    if (!file_exists($filePath)) {
        return '';
    }

    $content = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($content === false) {
        return '';
    }

    $targetKey = strtoupper(preg_replace('/[^A-Za-z0-9_]/', '', $key));

    foreach ($content as $line) {
        // Normalize potential BOM/UTF-16 artifacts from Windows-edited .env files.
        $normalized = str_replace(["\0", "\xEF\xBB\xBF", "\xFF\xFE", "\xFE\xFF"], '', $line);
        $trimmed = trim($normalized);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        if (!preg_match('/^([^=]+)=(.*)$/u', $trimmed, $m)) {
            continue;
        }

        $parsedKey = strtoupper(preg_replace('/[^A-Za-z0-9_]/', '', trim((string)$m[1])));
        if ($parsedKey !== $targetKey) {
            continue;
        }

        $v = trim((string)$m[2]);

        return trim($v, " \t\n\r\0\x0B\"'");
    }

    return '';
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (!in_array($path, ['/api/ask', '/index.php', '/'], true)) {
    respond(404, ['error' => 'Not found']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Method not allowed']);
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(400, ['error' => 'Invalid JSON body']);
}

$question = trim((string)($data['question'] ?? ''));
if ($question === '') {
    respond(422, ['error' => 'question is required']);
}

$apiKeyInfo = firstNonEmptyWithSource([
    ['source' => 'getenv:GOOGLE_API_KEY', 'value' => getenv('GOOGLE_API_KEY')],
    ['source' => 'getenv:GEMINI_API_KEY', 'value' => getenv('GEMINI_API_KEY')],
    ['source' => '$_ENV[GOOGLE_API_KEY]', 'value' => $_ENV['GOOGLE_API_KEY'] ?? ''],
    ['source' => '$_ENV[GEMINI_API_KEY]', 'value' => $_ENV['GEMINI_API_KEY'] ?? ''],
    ['source' => '$_SERVER[GOOGLE_API_KEY]', 'value' => $_SERVER['GOOGLE_API_KEY'] ?? ''],
    ['source' => '$_SERVER[GEMINI_API_KEY]', 'value' => $_SERVER['GEMINI_API_KEY'] ?? ''],
    ['source' => 'php-backend/.env:GOOGLE_API_KEY', 'value' => readDotEnvValue($root . '/.env', 'GOOGLE_API_KEY')],
    ['source' => 'php-backend/.env:GEMINI_API_KEY', 'value' => readDotEnvValue($root . '/.env', 'GEMINI_API_KEY')],
    ['source' => 'workspace/.env:GOOGLE_API_KEY', 'value' => readDotEnvValue($workspaceRoot . '/.env', 'GOOGLE_API_KEY')],
    ['source' => 'workspace/.env:GEMINI_API_KEY', 'value' => readDotEnvValue($workspaceRoot . '/.env', 'GEMINI_API_KEY')],
]);
$apiKey = $apiKeyInfo['value'];

$model = firstNonEmpty([
    getenv('GEMINI_MODEL'),
    $_ENV['GEMINI_MODEL'] ?? '',
    $_SERVER['GEMINI_MODEL'] ?? '',
    readDotEnvValue($root . '/.env', 'GEMINI_MODEL'),
    readDotEnvValue($workspaceRoot . '/.env', 'GEMINI_MODEL'),
    'gemini-1.5-flash',
]);
// Normalize common human-friendly model names into the API model id.
// Examples: "2.5 flash" -> "gemini-2.5-flash", "gemini-2.5-flash" -> unchanged
$rawModel = trim((string)$model);
if ($rawModel !== '') {
    $m = strtolower($rawModel);
    // replace whitespace and underscores with hyphens
    $m = preg_replace('/[\s_]+/', '-', $m);
    // if the user supplied something like '2.5-flash' or '2.5 flash', ensure it has gemini- prefix
    if (!str_starts_with($m, 'gemini-')) {
        $m = 'gemini-' . $m;
    }
    // keep the normalized model
    $model = $m;
}
if ($apiKey === '') {
    respond(500, ['error' => 'GOOGLE_API_KEY/GEMINI_API_KEY is not configured']);
}

$endpoint = sprintf(
    'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
    rawurlencode($model),
    rawurlencode($apiKey)
);

$payload = [
    'contents' => [[
        'parts' => [[
            'text' => $question,
        ]],
    ]],
];

$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    CURLOPT_TIMEOUT => 25,
]);

$response = curl_exec($ch);
$curlErrNo = curl_errno($ch);
$curlError = curl_error($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlErrNo !== 0 || $response === false) {
    respond(502, ['error' => 'Gemini request failed', 'details' => $curlError]);
}

$decoded = json_decode($response, true);
if (!is_array($decoded)) {
    respond(502, ['error' => 'Invalid Gemini response']);
}

if ($httpCode >= 400) {
    $errorPayload = ['error' => 'Gemini API error', 'details' => $decoded];

    if (strtolower((string)(getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? ''))) === 'local') {
        $keySuffix = strlen($apiKey) >= 6 ? substr($apiKey, -6) : $apiKey;
        $errorPayload['debug'] = [
            'model' => $model,
            'key_source' => $apiKeyInfo['source'],
            'key_suffix' => $keySuffix,
        ];
    }

    respond($httpCode, $errorPayload);
}

$answer = '';
if (isset($decoded['candidates'][0]['content']['parts'][0]['text'])) {
    $answer = (string)$decoded['candidates'][0]['content']['parts'][0]['text'];
}

respond(200, [
    'ok' => true,
    'model' => $model,
    'answer' => $answer,
    'raw' => $decoded,
]);
