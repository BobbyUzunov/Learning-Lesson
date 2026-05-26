// ============================================
// Node.js Server – JavaScript & Python Learning Environment
// ============================================

const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'local-admin-session-secret';
const ADMIN_COOKIE_NAME = 'learning_admin_session';
const PUBLIC_SUPABASE_URL = 'https://hmhwupoubtdcywcsqtwz.supabase.co';
const PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_wR-OwwxoOMkh4MLt2B-6fQ_qgub5oN-';

app.use(express.urlencoded({ extended: false }));

function signAdminSession(value) {
    return crypto
        .createHmac('sha256', ADMIN_SESSION_SECRET)
        .update(value)
        .digest('hex');
}

function getCookies(req) {
    return (req.headers.cookie || '').split(';').reduce((cookies, part) => {
        const [rawName, ...rawValue] = part.trim().split('=');
        if (!rawName) return cookies;
        cookies[rawName] = decodeURIComponent(rawValue.join('='));
        return cookies;
    }, {});
}

function hasValidAdminSession(req) {
    const token = getCookies(req)[ADMIN_COOKIE_NAME];
    if (!token) return false;
    const [username, signature] = token.split('.');
    if (username !== ADMIN_USERNAME || !signature) return false;
    return signature === signAdminSession(username);
}

function setAdminSession(res) {
    const signature = signAdminSession(ADMIN_USERNAME);
    const token = `${ADMIN_USERNAME}.${signature}`;
    res.setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`);
}

function clearAdminSession(res) {
    res.setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function isAdminPath(req) {
    return ['/admin', '/admin.html', '/admin.js', '/public/admin.js'].includes(req.path);
}

function requireAdminAuth(req, res, next) {
    if (!isAdminPath(req)) return next();
    if (hasValidAdminSession(req)) return next();

    const authHeader = req.headers.authorization || '';
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
        const [username, password] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            setAdminSession(res);
            return next();
        }
    }

    return res.redirect('/admin-login');
}

function renderAdminLogin(error = '') {
    return `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Admin Login</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 18px;
            font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #e5e7eb;
            background: linear-gradient(135deg, #0b1120, #111827 52%, #0f172a);
        }
        .login-card {
            width: min(420px, 100%);
            border: 1px solid rgba(148, 163, 184, 0.24);
            border-radius: 10px;
            padding: 22px;
            background: rgba(15, 23, 42, 0.92);
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
        }
        h1 { font-size: 1.45rem; line-height: 1.2; }
        p { margin-top: 8px; color: #94a3b8; line-height: 1.5; }
        form { display: grid; gap: 12px; margin-top: 20px; }
        label { display: grid; gap: 7px; color: #cbd5e1; font-size: 0.86rem; font-weight: 850; }
        input {
            min-height: 44px;
            border: 1px solid rgba(148, 163, 184, 0.3);
            border-radius: 8px;
            padding: 10px 12px;
            color: #f8fafc;
            background: rgba(15, 23, 42, 0.82);
            font: inherit;
        }
        button, a {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font: inherit;
            font-weight: 950;
            text-decoration: none;
        }
        button {
            border: 1px solid rgba(20, 184, 166, 0.44);
            color: white;
            background: #0f766e;
            cursor: pointer;
        }
        a {
            color: #cbd5e1;
            border: 1px solid rgba(148, 163, 184, 0.24);
            background: rgba(30, 41, 59, 0.62);
        }
        .error {
            margin-top: 14px;
            padding: 10px 12px;
            border-radius: 8px;
            color: #fecaca;
            background: rgba(127, 29, 29, 0.58);
            font-weight: 850;
        }
    </style>
</head>
<body>
    <main class="login-card">
        <h1>Admin login</h1>
        <p>Влез, за да управляваш съдържанието и прогреса.</p>
        ${error ? `<div class="error">${error}</div>` : ''}
        <form method="post" action="/admin-login">
            <label>
                Username
                <input name="username" autocomplete="username" required>
            </label>
            <label>
                Password
                <input name="password" type="password" autocomplete="current-password" required>
            </label>
            <button type="submit">Вход</button>
            <a href="/">Назад към сайта</a>
        </form>
    </main>
</body>
</html>`;
}

app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

app.use(requireAdminAuth);

// Обслужване на статични файлове (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

// Главен route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin-login', (req, res) => {
    if (hasValidAdminSession(req)) {
        return res.redirect('/admin');
    }
    return res.send(renderAdminLogin());
});

app.post('/admin-login', (req, res) => {
    const { username, password } = req.body || {};
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setAdminSession(res);
        return res.redirect('/admin');
    }
    return res.status(401).send(renderAdminLogin('Грешно потребителско име или парола.'));
});

app.get('/admin/logout', (req, res) => {
    clearAdminSession(res);
    return res.redirect('/admin-login');
});

// Admin panel route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// API endpoint за тестване на Node.js функционалност
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Сървърът работи успешно!',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
    });
});

app.get('/api/supabase-config', (req, res) => {
    const envUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const envAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const hasRealValue = (value) => value && !/your-|placeholder|anon public key/i.test(value);
    const url = hasRealValue(envUrl) ? envUrl : PUBLIC_SUPABASE_URL;
    const anonKey = hasRealValue(envAnonKey) ? envAnonKey : PUBLIC_SUPABASE_ANON_KEY;

    res.set('Cache-Control', 'no-store');
    res.json({
        configured: Boolean(url && anonKey),
        SUPABASE_URL: url,
        SUPABASE_ANON_KEY: anonKey
    });
});

// Стартиране на сървъра
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 Сървърът е стартиран!');
    console.log(`📍 Адрес: http://localhost:${PORT}`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
    console.log(`👤 Admin user: ${ADMIN_USERNAME}`);
    if (!process.env.ADMIN_PASSWORD) {
        console.log('⚠️  Временна admin парола: admin123 (смени я с ADMIN_PASSWORD в production)');
    }
    console.log('========================================');
    console.log('Отвори браузъра и отиди на горния адрес');
    console.log('Или натисни Ctrl+C за да спреш сървъра');
    console.log('========================================');
});
