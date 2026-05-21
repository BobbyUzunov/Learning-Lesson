// ============================================
// Node.js Server – JavaScript & Python Learning Environment
// ============================================

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Обслужване на статични файлове (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Главен route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint за тестване на Node.js функционалност
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Сървърът работи успешно!',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
    });
});

// Стартиране на сървъра
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 Сървърът е стартиран!');
    console.log(`📍 Адрес: http://localhost:${PORT}`);
    console.log('========================================');
    console.log('Отвори браузъра и отиди на горния адрес');
    console.log('Или натисни Ctrl+C за да спреш сървъра');
    console.log('========================================');
});
