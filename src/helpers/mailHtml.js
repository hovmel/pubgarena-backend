/** HTML письма с кодом (структура как в Nomad-Back, брендинг PubgArena). */
export default function mailHtml(code) {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PubgArena</title>
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; }
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f4f6f8; }
    .container { background: #fff; max-width: 560px; padding: 32px 40px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .title { font-size: 22px; color: #1a1a2e; margin-bottom: 8px; }
    .muted { color: #6b7280; font-size: 15px; line-height: 1.5; }
    .code { font-size: 36px; font-weight: 600; color: #2563eb; letter-spacing: 0.15em; margin: 28px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">Код подтверждения</div>
    <p class="muted">Привет! Чтобы подтвердить регистрацию в PubgArena, введи этот код в приложении:</p>
    <div class="code">${code}</div>
    <p class="muted">Код действителен 5 минут. Если ты не запрашивал регистрацию — просто игнорируй письмо.</p>
  </div>
</body>
</html>
`;
}
