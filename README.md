# Learning Environment

Среда за начинаещи: уроци, обяснения и редактор за код.

| Раздел | Теми | Изпълнение в браузъра |
|--------|------|------------------------|
| **HTML & CSS** | **16** | ✅ Визуален преглед в iframe |
| **JavaScript** | **18** | ✅ Пълно |
| **Python** | **18** | ✅ Skulpt |
| **Swift** | 19 | ⚡ Симулация + Xcode |
| **Backend** | 19 | ✅ JS + `fetch` към API; сървър в терминал |
| **AI & Tools** | **8** | ✅ JavaScript практика |

## Backend разделът покрива

- Node.js, npm, модули  
- HTTP, Express, routes, middleware  
- REST API, JSON, `.env`  
- Файлове (`fs`), async/await  
- **Next.js** – routing, API Routes  
- fetch, бази данни, deploy, full-stack пътека  

## Стартиране

```bash
npm install
npm start
```

Отвори: **http://localhost:3000**

За backend уроци с `fetch("/api/test")` сървърът трябва да работи (`npm start`).

## Supabase

1. Създай Supabase проект.
2. Отвори Supabase SQL Editor и пусни `supabase-schema.sql`.
3. За временен vanilla JS setup можеш да зададеш public anon config по един от тези начини:

```js
localStorage.setItem('SUPABASE_URL', 'https://YOUR_PROJECT.supabase.co');
localStorage.setItem('SUPABASE_ANON_KEY', 'YOUR_ANON_KEY');
```

или копирай `public/supabase-config.example.js` като `public/supabase-config.js`, попълни стойностите и добави script tag преди `/supabase.js`.

Важно: anon key е публичен. За production защити writes с Supabase Auth admin роли или server route със `SUPABASE_SERVICE_ROLE_KEY`; не поставяй service role key в `public/`.

## Файлове

- `script.js` + `lessons-js-more.js` – JavaScript (18 теми)  
- `lessons-python.js` + `lessons-python-more.js` – Python (18 теми)  
- `lessons-swift.js` – Swift  
- `lessons-backend.js` – Node.js, Express, Next.js  
- `lessons-web.js` – HTML & CSS (16 теми)  
- `lessons-new.js` – AI & Tools практически уроци  
- `supabase.js` – Supabase browser client + fallback helpers
- `supabase-schema.sql` – SQL schema за Supabase
- `server.js` – Express (обслужва сайта + `/api/test`)  

## Спиране

`Ctrl+C` в терминала
