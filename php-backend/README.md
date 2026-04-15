# PHP Gemini API

Backend PHP API goi Google Gemini (`gemini-1.5-flash`) voi `vlucas/phpdotenv`.

## 1) Cai dat

```bash
cd php-backend
composer install
cp .env.example .env
```

Sua file `.env`:

```env
GOOGLE_API_KEY=your_real_key
GEMINI_MODEL=gemini-1.5-flash
APP_ENV=local
```

## 2) Chay server

```bash
cd php-backend
php -S localhost:8000 -t public
```

## 3) Goi API

Endpoint: `POST http://localhost:8000/api/ask`

Body JSON:

```json
{
  "question": "Explain how AI works in a few words"
}
```

Curl:

```bash
curl "http://localhost:8000/api/ask" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"question":"Explain how AI works in a few words"}'
```

## 4) Bao mat

- Khong commit `.env` len git.
- Da co `.gitignore` chan `.env`.
- Neu key bi lo, rotate ngay tren Google Cloud Console.
