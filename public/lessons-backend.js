// Уроци по Backend – Node.js, Express, Next.js, сървъри
const lessonsBackend = {
    'intro-1': {
        category: 'Въведение в Backend',
        title: "🌐 Урок 1: Какво е Backend?",
        description: "Backend (сървърна част) е кодът, който работи на сървър – обработва заявки, бази данни, логика, която потребителят не вижда директно.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Frontend срещу Backend</h3>
                <p class="lesson-section-description">
                    <strong>Frontend</strong> – HTML, CSS, JavaScript в браузъра (това, което виждаш).<br>
                    <strong>Backend</strong> – Node.js, Express, бази данни, API – „зад кулисите“.<br>
                    <strong>Full-stack</strong> – и двете (напр. Next.js може и двете).
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Какво прави сървърът?</h3>
                <p class="lesson-section-description">
                    1. Получава HTTP заявка (GET, POST…)<br>
                    2. Обработва я (чете файл, търси в БД, смята нещо)<br>
                    3. Връща отговор (HTML, JSON, грешка)
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Този проект:</strong> Стартираш <code>npm start</code> – Express сървър на порт 3000 обслужва тази страница.
            </div>
        `,
        code: `// Логика, близка до backend (работи в браузъра за учене)
const serverInfo = {
  role: "backend",
  port: 3000,
  tasks: ["API", "файлове", "база данни", "сигурност"]
};

console.log("Backend отговаря за:", serverInfo.tasks.join(", "));

// Симулация на JSON отговор от API
const apiResponse = {
  success: true,
  message: "Здравей от сървъра!",
  timestamp: new Date().toISOString()
};
console.log(JSON.stringify(apiResponse, null, 2));`
    },
    'node-1': {
        category: 'Node.js',
        title: "🟢 Урок 2: Node.js – JavaScript на сървъра",
        description: "Node.js пуска JavaScript извън браузъра – на твоя компютър или сървър. Има достъп до файлове, мрежа, процеси.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Защо Node.js?</h3>
                <p class="lesson-section-description">
                    • Един език (JS) за frontend и backend<br>
                    • Голяма общност и пакети (npm)<br>
                    • Добър за API, real-time, microservices<br>
                    • Използва се от Netflix, LinkedIn, Uber и др.
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Как се стартира</h3>
                <p class="lesson-section-description">
                    <code>node app.js</code> – стартира файл<br>
                    <code>npm start</code> – команда от package.json
                </p>
            </div>
        `,
        code: `// app.js (стартирай: node app.js)
// В терминала, не в браузъра:

console.log("Node.js версия (в терминал):", process.version);

const os = require("os"); // само в Node
// console.log(os.platform());

// За тест тук – без require:
console.log("Привет от Node логика!");
console.log("Работна папка (в Node): process.cwd()");`
    },
    'npm-1': {
        category: 'Node.js',
        title: "📦 Урок 3: npm и package.json",
        description: "npm (Node Package Manager) инсталира библиотеки. package.json описва проекта, скриптовете и зависимостите.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Важни команди</h3>
                <p class="lesson-section-description">
                    <code>npm init -y</code> – нов проект<br>
                    <code>npm install express</code> – добавя пакет<br>
                    <code>npm install</code> – инсталира всичко от package.json<br>
                    <code>npm run dev</code> – пуска скрипт „dev“
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">package.json полета</h3>
                <p class="lesson-section-description">
                    <strong>name, version</strong> – проект<br>
                    <strong>scripts</strong> – команди (start, dev, build)<br>
                    <strong>dependencies</strong> – нужни за production<br>
                    <strong>devDependencies</strong> – само за разработка
                </p>
            </div>
        `,
        code: `// Примерен package.json (текст – не се изпълнява)
/*
{
  "name": "my-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
*/

const pkg = {
  name: "my-api",
  scripts: { start: "node server.js" },
  dependencies: { express: "^4.18.2" }
};
console.log("Проект:", pkg.name);
console.log("Старт:", pkg.scripts.start);`
    },
    'modules-1': {
        category: 'Node.js',
        title: "📁 Урок 4: Модули (import / require)",
        description: "Кодът се разделя на файлове. CommonJS (require) в Node; ES modules (import) – модерен стандарт и в Next.js.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">CommonJS (класически Node)</h3>
                <p class="lesson-section-description">
                    <code>const express = require('express');</code><br>
                    <code>module.exports = { myFunc };</code>
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">ES Modules</h3>
                <p class="lesson-section-description">
                    <code>import express from 'express';</code><br>
                    <code>export default app;</code><br>
                    В package.json: <code>"type": "module"</code> за .js като ESM.
                </p>
            </div>
        `,
        code: `// utils.js
// export function add(a, b) { return a + b; }

// Симулация на модул в един файл:
const utils = {
  add: (a, b) => a + b,
  greet: (name) => \`Здравей, \${name}!\`
};

console.log(utils.add(2, 3));
console.log(utils.greet("Dev"));`
    },
    'http-1': {
        category: 'HTTP и мрежа',
        title: "🔗 Урок 5: HTTP – заявки и отговори",
        description: "Браузърът и приложенията говорят със сървъра чрез HTTP. Методи: GET (четене), POST (изпращане), PUT, PATCH, DELETE.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Части на заявката</h3>
                <p class="lesson-section-description">
                    <strong>URL</strong> – адрес (напр. /api/users)<br>
                    <strong>Method</strong> – GET, POST…<br>
                    <strong>Headers</strong> – метаданни (Authorization, Content-Type)<br>
                    <strong>Body</strong> – данни при POST/PUT (често JSON)
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Status кодове</h3>
                <p class="lesson-section-description">
                    200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error
                </p>
            </div>
        `,
        code: `// Симулация на HTTP отговор
const httpResponse = {
  status: 200,
  statusText: "OK",
  headers: { "Content-Type": "application/json" },
  body: { users: [{ id: 1, name: "Иван" }] }
};

console.log("Status:", httpResponse.status);
console.log("Body:", JSON.stringify(httpResponse.body, null, 2));

// В браузър (ако сървърът работи на :3000):
// fetch("/api/test").then(r => r.json()).then(console.log);`
    },
    'express-1': {
        category: 'Express.js',
        title: "⚡ Урок 6: Express – сървър с Node",
        description: "Express е най-популярният framework за Node. Лесни маршрути (routes), middleware и статични файлове.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Минимален сървър</h3>
                <p class="lesson-section-description">
                    Създаваш app, дефинираш routes, слушаш на порт. Този учебен проект използва Express в <code>server.js</code>.
                </p>
            </div>
        `,
        code: `// server.js – пускаш с: node server.js
/*
const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Здравей от Express!");
});

app.listen(PORT, () => {
  console.log(\`Сървър: http://localhost:\${PORT}\`);
});
*/

// Логика на route (симулация)
function handleGetHome() {
  return { message: "Здравей от Express!", path: "/" };
}
console.log(handleGetHome());`
    },
    'express-2': {
        category: 'Express.js',
        title: "🛤️ Урок 7: Routes и Middleware",
        description: "Route съпоставя URL + метод с функция. Middleware е код между заявката и отговора – логване, auth, JSON parser.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Видове routes</h3>
                <p class="lesson-section-description">
                    <code>app.get('/users', ...)</code><br>
                    <code>app.post('/users', ...)</code><br>
                    <code>app.use('/api', router)</code> – под-пътища
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Middleware</h3>
                <p class="lesson-section-description">
                    <code>app.use(express.json())</code> – парсва JSON body<br>
                    <code>app.use((req, res, next) => { ... next(); })</code> – custom
                </p>
            </div>
        `,
        code: `// Ред на middleware
const steps = [];

function logger(req, res, next) {
  steps.push("1. Logger: " + req.method + " " + req.path);
  next();
}
function auth(req, res, next) {
  steps.push("2. Auth проверка");
  next();
}
function handler(req, res) {
  steps.push("3. Route handler – отговор");
  res = { json: { ok: true } };
}

const fakeReq = { method: "GET", path: "/api/users" };
logger(fakeReq, {}, () => auth(fakeReq, {}, () => handler(fakeReq, {})));
steps.forEach(s => console.log(s));`
    },
    'api-1': {
        category: 'REST API',
        title: "🔌 Урок 8: REST API",
        description: "REST е стил за API с ресурси и HTTP методи. /users GET – списък, POST – създаване, /users/5 GET – един потребител.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Примерни endpoints</h3>
                <p class="lesson-section-description">
                    GET /api/products – всички продукти<br>
                    GET /api/products/3 – продукт #3<br>
                    POST /api/products – нов продукт<br>
                    DELETE /api/products/3 – изтриване
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Тест:</strong> Отвори <code>http://localhost:3000/api/test</code> докато <code>npm start</code> работи.
            </div>
        `,
        code: `// REST – симулация на ресурс „tasks“
let tasks = [
  { id: 1, title: "Учи Node.js", done: false },
  { id: 2, title: "Направи API", done: false }
];

// GET всички
console.log("GET /api/tasks:", JSON.stringify(tasks, null, 2));

// POST нов
const newTask = { id: 3, title: "Deploy", done: false };
tasks.push(newTask);
console.log("След POST:", tasks.length, "задачи");

// Тествай реално API (сървърът трябва да работи):
// fetch("/api/test").then(r => r.json()).then(console.log);`
    },
    'json-1': {
        category: 'Данни',
        title: "📋 Урок 9: JSON – обмен на данни",
        description: "JSON е текстов формат за обекти и масиви. API-тата почти винаги връщат JSON. В Node: JSON.parse() и JSON.stringify().",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">В Express</h3>
                <p class="lesson-section-description">
                    <code>res.json({ ok: true })</code> – изпраща JSON<br>
                    <code>req.body</code> – данни от клиента (с express.json())
                </p>
            </div>
        `,
        code: `const user = { id: 1, name: "Мария", roles: ["admin", "editor"] };

// Обект → низ (за мрежа/файл)
const jsonString = JSON.stringify(user);
console.log("JSON низ:", jsonString);

// Низ → обект
const parsed = JSON.parse(jsonString);
console.log("Обратно:", parsed.name);

// Красиво форматиране
console.log(JSON.stringify(user, null, 2));`
    },
    'env-1': {
        category: 'Сигурност и конфигурация',
        title: "🔐 Урок 10: Променливи на средата (.env)",
        description: "Пароли и тайни ключове НЕ се пишат в кода. Използва се .env файл и process.env – зарежда се с dotenv.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Пример .env</h3>
                <p class="lesson-section-description">
                    <code>PORT=3000</code><br>
                    <code>DATABASE_URL=postgres://...</code><br>
                    <code>JWT_SECRET=дълъг-случаен-низ</code>
                </p>
            </div>
            <div class="warning-box">
                <strong>⚠️ Никога:</strong> Не качвай .env в Git! Добави .env в .gitignore.
            </div>
        `,
        code: `// В Node (с dotenv):
// require("dotenv").config();
// const port = process.env.PORT || 3000;

// Симулация
const processEnv = {
  PORT: "3000",
  NODE_ENV: "development",
  API_KEY: "***скрит***"
};

const port = processEnv.PORT || 3000;
console.log("Порт:", port);
console.log("Среда:", processEnv.NODE_ENV);
console.log("API ключ:", processEnv.API_KEY);`
    },
    'fs-1': {
        category: 'Node.js',
        title: "💾 Урок 11: Работа с файлове (fs)",
        description: "Модулът fs чете и записва файлове на диска. Асинхронно с callbacks, Promises или async/await.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни операции</h3>
                <p class="lesson-section-description">
                    <code>fs.readFile</code>, <code>fs.writeFile</code>, <code>fs.readdir</code><br>
                    По-добре: <code>fs.promises.readFile</code> с async/await
                </p>
            </div>
        `,
        code: `// const fs = require("fs").promises;
// const data = await fs.readFile("file.txt", "utf8");

// Симулация
const files = ["server.js", "package.json", "index.html"];
console.log("Файлове в проекта:", files.join(", "));

const fakeFileContent = '{"name": "my-app"}';
const parsed = JSON.parse(fakeFileContent);
console.log("Прочетен JSON:", parsed);`
    },
    'async-1': {
        category: 'Асинхронност',
        title: "⏳ Урок 12: async/await и Promises",
        description: "Backend често чака – база данни, файл, външен API. async/await прави асинхронния код по-четим от .then().",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Защо async?</h3>
                <p class="lesson-section-description">
                    Сървърът не трябва да „замръзва“ – обработва много заявки. Докато чака БД, може да обслужи други.
                </p>
            </div>
        `,
        code: `// Симулация на забавена операция (база данни)
function fetchUserFromDB(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "Иван", email: "ivan@example.com" });
    }, 100);
  });
}

async function getUser(id) {
  console.log("Чакам базата...");
  const user = await fetchUserFromDB(id);
  console.log("Потребител:", user);
  return user;
}

getUser(1);`
    },
    'nextjs-1': {
        category: 'Next.js',
        title: "▲ Урок 13: Next.js – какво е?",
        description: "Next.js е framework върху React за уеб приложения. SSR, статични страници, API routes, routing – всичко в един проект.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Предимства</h3>
                <p class="lesson-section-description">
                    • Файлово базиран routing (app/ или pages/)<br>
                    • API Routes – backend в същия проект<br>
                    • SEO – сървърно рендериране<br>
                    • Deploy лесно на Vercel
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Създаване на проект</h3>
                <p class="lesson-section-description">
                    <code>npx create-next-app@latest my-app</code><br>
                    <code>cd my-app && npm run dev</code> → http://localhost:3000
                </p>
            </div>
        `,
        code: `// Next.js структура (опростено)
const projectStructure = {
  "app/": {
    "page.tsx": "Начална страница /",
    "about/page.tsx": "Страница /about",
    "api/hello/route.ts": "API GET /api/hello"
  },
  "package.json": { scripts: { dev: "next dev" } }
};

console.log("Next.js = React + Routing + API + SSR");
console.log(JSON.stringify(projectStructure, null, 2));`
    },
    'nextjs-2': {
        category: 'Next.js',
        title: "📂 Урок 14: Routing в Next.js (App Router)",
        description: "В папка app/ всеки folder е URL сегмент. page.tsx е страницата, layout.tsx – общ layout, loading.tsx – зареждане.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Примери пътища</h3>
                <p class="lesson-section-description">
                    <code>app/page.tsx</code> → /<br>
                    <code>app/blog/page.tsx</code> → /blog<br>
                    <code>app/blog/[slug]/page.tsx</code> → /blog/моя-статия<br>
                    <code>app/api/users/route.ts</code> → API endpoint
                </p>
            </div>
        `,
        code: `// Динамичен сегмент [id]
const routes = [
  { path: "/", file: "app/page.tsx" },
  { path: "/blog", file: "app/blog/page.tsx" },
  { path: "/blog/:slug", file: "app/blog/[slug]/page.tsx" },
  { path: "/dashboard/settings", file: "app/dashboard/settings/page.tsx" }
];

routes.forEach(r => console.log(r.path, "→", r.file));`
    },
    'nextjs-3': {
        category: 'Next.js',
        title: "🔌 Урок 15: API Routes в Next.js",
        description: "В App Router: app/api/.../route.ts експортира GET, POST функции. Backend и frontend в един репо.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Пример route.ts</h3>
                <p class="lesson-section-description">
                    export async function GET() { return Response.json({ ok: true }); }<br>
                    export async function POST(request) { const body = await request.json(); ... }
                </p>
            </div>
        `,
        code: `// app/api/tasks/route.ts (Next.js 13+)
/*
import { NextResponse } from "next/server";

export async function GET() {
  const tasks = [{ id: 1, title: "Урок Next.js" }];
  return NextResponse.json(tasks);
}

export async function POST(request) {
  const body = await request.json();
  return NextResponse.json({ created: body }, { status: 201 });
}
*/

// Симулация
function apiGetTasks() {
  return { status: 200, body: [{ id: 1, title: "Урок Next.js" }] };
}
function apiPostTask(body) {
  return { status: 201, body: { created: body } };
}
console.log("GET:", JSON.stringify(apiGetTasks()));
console.log("POST:", JSON.stringify(apiPostTask({ title: "Нова задача" })));`
    },
    'client-1': {
        category: 'Full-stack',
        title: "🔄 Урок 16: Клиент ↔ Сървър (fetch)",
        description: "Frontend извиква backend с fetch или axios. CORS позволява заявки от друг домейн/порт при правилна настройка.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">fetch пример</h3>
                <p class="lesson-section-description">
                    Браузърът праща заявка → сървърът отговаря с JSON → UI се обновява.
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Опитай тук:</strong> С пуснат <code>npm start</code> изпълни примера с fetch("/api/test") в редактора.
            </div>
        `,
        code: `// Работи в браузъра, ако сървърът е на същия адрес (npm start)
async function testApi() {
  try {
    const res = await fetch("/api/test");
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Отговор:", data);
  } catch (e) {
    console.log("Грешка (сървърът пуснат ли е?):", e.message);
  }
}
testApi();`
    },
    'db-1': {
        category: 'Бази данни',
        title: "🗄️ Урок 17: Бази данни – въведение",
        description: "Данните се пазят в БД: PostgreSQL, MongoDB, MySQL. ORM като Prisma улеснява работата от Node/Next.js.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">SQL срещу NoSQL</h3>
                <p class="lesson-section-description">
                    <strong>SQL</strong> (Postgres) – таблици, релации, строга структура<br>
                    <strong>NoSQL</strong> (MongoDB) – документи, гъвкава схема
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Prisma (популярен с Next)</h3>
                <p class="lesson-section-description">
                    schema.prisma описва моделите → <code>npx prisma migrate</code> → <code>prisma.user.findMany()</code>
                </p>
            </div>
        `,
        code: `// Симулация на таблица users
const users = [
  { id: 1, email: "a@mail.com", name: "Анна" },
  { id: 2, email: "b@mail.com", name: "Борис" }
];

// „SQL-подобни“ операции
const findAll = () => users;
const findById = (id) => users.find(u => u.id === id);
const create = (data) => {
  const u = { id: users.length + 1, ...data };
  users.push(u);
  return u;
};

console.log("Всички:", findAll());
console.log("ID=1:", findById(1));
console.log("Нов:", create({ email: "c@mail.com", name: "Виктор" }));`
    },
    'deploy-1': {
        category: 'Deployment',
        title: "🚀 Урок 18: Качване на сървър (Deploy)",
        description: "Готовият backend се качва на хостинг: Vercel (Next), Railway, Render, DigitalOcean, AWS. ENV променливите се задават в панела.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Къде какво</h3>
                <p class="lesson-section-description">
                    <strong>Next.js</strong> → Vercel (създателите на Next)<br>
                    <strong>Node API</strong> → Railway, Render, Fly.io<br>
                    <strong>База</strong> → Supabase, Neon, MongoDB Atlas
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Преди deploy</h3>
                <p class="lesson-section-description">
                    • Тествай локално<br>
                    • .env на сървъра, не в Git<br>
                    • npm run build (ако има)<br>
                    • Логове и мониторинг
                </p>
            </div>
        `,
        code: `const deployChecklist = [
  "1. npm test / ръчни тестове",
  "2. NODE_ENV=production",
  "3. ENV променливи в хостинга",
  "4. HTTPS (SSL) – обикновено автоматично",
  "5. Health endpoint: GET /api/health"
];

deployChecklist.forEach(step => console.log(step));

console.log("\\nТози учебен сайт: npm start → localhost:3000");`
    },
    'stack-1': {
        category: 'Обобщение',
        title: "🎯 Урок 19: Пътека Full-Stack",
        description: "Обобщение: HTML/JS → Node + Express → REST API → Next.js → база данни → deploy. Този курс покрива основите.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Препоръчителен ред</h3>
                <p class="lesson-section-description">
                    1. JavaScript (frontend основи)<br>
                    2. Node.js + Express (backend)<br>
                    3. REST API + JSON + fetch<br>
                    4. Next.js (full-stack)<br>
                    5. База данни + auth<br>
                    6. Реален проект + deploy
                </p>
            </div>
            <div class="read-next-step" style="background:#e6f4ea;padding:14px;border-radius:8px;border-left:4px solid #28a745;">
                <strong>🎯 Проект:</strong> Направи API с Express (3 endpoints) + прост HTML клиент с fetch – после пренеси API в Next.js route.
            </div>
        `,
        code: `// Мини full-stack в една идея
const stack = {
  frontend: "HTML + fetch (или React/Next)",
  backend: "Node.js + Express",
  api: "GET/POST JSON",
  data: "масив в памет → после PostgreSQL",
  deploy: "Vercel / Railway"
};

console.log("Твоят stack:", Object.entries(stack).map(([k,v]) => k + ": " + v).join("\\n"));

// Следваща стъпка в терминала:
console.log("\\nmkdir my-api && cd my-api && npm init -y && npm install express");`
    }
};

topicsByLanguage.backend = [
    { id: 'intro-1', label: '🌐 1. Какво е Backend?' },
    { id: 'node-1', label: '🟢 2. Node.js' },
    { id: 'npm-1', label: '📦 3. npm' },
    { id: 'modules-1', label: '📁 4. Модули' },
    { id: 'http-1', label: '🔗 5. HTTP' },
    { id: 'express-1', label: '⚡ 6. Express' },
    { id: 'express-2', label: '🛤️ 7. Routes' },
    { id: 'api-1', label: '🔌 8. REST API' },
    { id: 'json-1', label: '📋 9. JSON' },
    { id: 'env-1', label: '🔐 10. .env' },
    { id: 'fs-1', label: '💾 11. Файлове' },
    { id: 'async-1', label: '⏳ 12. async/await' },
    { id: 'nextjs-1', label: '▲ 13. Next.js' },
    { id: 'nextjs-2', label: '📂 14. Routing' },
    { id: 'nextjs-3', label: '🔌 15. API Routes' },
    { id: 'client-1', label: '🔄 16. fetch' },
    { id: 'db-1', label: '🗄️ 17. Бази данни' },
    { id: 'deploy-1', label: '🚀 18. Deploy' },
    { id: 'stack-1', label: '🎯 19. Full-Stack' }
];

defaultCodeByLanguage.backend = `// Backend / Node.js – пример
// Пълен сървър: node server.js  |  Next: npm run dev

const api = {
  success: true,
  message: "Здравей от backend логика!",
  stack: ["Node.js", "Express", "Next.js"]
};

console.log(JSON.stringify(api, null, 2));

// Тествай реалното API (npm start трябва да работи):
fetch("/api/test")
  .then(r => r.json())
  .then(data => console.log("От /api/test:", data))
  .catch(e => console.log("Пусни: npm start", e.message));`;
