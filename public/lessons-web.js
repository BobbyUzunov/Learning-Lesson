// Уроци по HTML & CSS – основи на уеб страници
const lessonsWeb = {
    'html-1': {
        category: 'HTML основи',
        title: "🌐 Урок 1: Какво е HTML?",
        description: "HTML (HyperText Markup Language) описва структурата на уеб страница – заглавия, параграфи, връзки, картинки. Не е език за логика, а за съдържание.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">HTML + CSS + JavaScript</h3>
                <p class="lesson-section-description">
                    <strong>HTML</strong> – какво има на страницата<br>
                    <strong>CSS</strong> – как изглежда<br>
                    <strong>JavaScript</strong> – как се държи (интерактивност)
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> HTML използва <strong>тагове</strong> с ъгълни скоби: <code>&lt;p&gt;текст&lt;/p&gt;</code>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Моята първа страница</title>
</head>
<body>
    <h1>Здравей, HTML!</h1>
    <p>Това е моята първа уеб страница.</p>
</body>
</html>`
    },
    'html-2': {
        category: 'HTML основи',
        title: "📄 Урок 2: Структура на HTML документ",
        description: "Всеки HTML файл има head (метаданни) и body (видимото съдържание). DOCTYPE казва на браузъра, че е модерен HTML5.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни части</h3>
                <p class="lesson-section-description">
                    <code>&lt;!DOCTYPE html&gt;</code> – декларация<br>
                    <code>&lt;html lang="bg"&gt;</code> – корен, език за достъпност<br>
                    <code>&lt;head&gt;</code> – title, charset, CSS връзки<br>
                    <code>&lt;body&gt;</code> – всичко, което вижда потребителят
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Заглавие в таба на браузъра</title>
</head>
<body>
    <h1>Заглавие на страницата</h1>
    <p>Основен текст.</p>
</body>
</html>`
    },
    'html-3': {
        category: 'HTML основи',
        title: "✏️ Урок 3: Текст и заглавия",
        description: "h1–h6 са заглавия (h1 най-важно, едно на страница). p за параграф, strong, em, br за нов ред.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Йерархия</h3>
                <p class="lesson-section-description">
                    Не прескачай нива (h1 → h3 без h2). За SEO и четимост структурата трябва да е логична.
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Текст</title>
</head>
<body>
    <h1>Главно заглавие</h1>
    <h2>Подзаглавие</h2>
    <p>Обикновен параграф с <strong>удебен</strong> и <em>курсив</em> текст.</p>
    <p>Втори параграф.<br>Нов ред с br.</p>
    <h3>По-малко заглавие</h3>
</body>
</html>`
    },
    'html-4': {
        category: 'HTML основи',
        title: "🔗 Урок 4: Връзки и изображения",
        description: "a (anchor) с href за линкове. img с src и alt – alt е задължителен за достъпност и SEO.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Атрибути</h3>
                <p class="lesson-section-description">
                    <code>href</code> – адрес &nbsp;|&nbsp; <code>target="_blank"</code> – нов таб<br>
                    <code>src</code> – път до картинка &nbsp;|&nbsp; <code>alt</code> – описание
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Линкове</title>
</head>
<body>
    <p><a href="https://developer.mozilla.org">MDN документация</a></p>
    <p><a href="#contact" id="contact">Към секция контакт (вътрешен линк)</a></p>
    <img src="https://via.placeholder.com/200x120/667eea/ffffff?text=Пример" alt="Примерна картинка" width="200">
</body>
</html>`
    },
    'html-5': {
        category: 'HTML основи',
        title: "📋 Урок 5: Списъци и таблици",
        description: "ul/ol/li за списъци. table, tr, th, td за таблични данни (не за layout – за това е CSS Grid/Flex).",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Списъци</h3>
                <p class="lesson-section-description">
                    <code>ul</code> – неподреден (точки) &nbsp;|&nbsp; <code>ol</code> – номериран
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Списъци</title>
</head>
<body>
    <h2>Плодове</h2>
    <ul>
        <li>Ябълка</li>
        <li>Банан</li>
    </ul>
    <h2>Стъпки</h2>
    <ol>
        <li>Отвори редактор</li>
        <li>Напиши HTML</li>
        <li>Запази файла</li>
    </ol>
    <table border="1" cellpadding="8">
        <tr><th>Име</th><th>Възраст</th></tr>
        <tr><td>Иван</td><td>25</td></tr>
        <tr><td>Мария</td><td>30</td></tr>
    </table>
</body>
</html>`
    },
    'html-6': {
        category: 'HTML основи',
        title: "📝 Урок 6: Форми",
        description: "form, input, label, textarea, select, button – събиране на данни от потребителя. label връзва текст с поле.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">input типове</h3>
                <p class="lesson-section-description">
                    text, email, password, number, checkbox, radio, date – всеки има различно поле.
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Форма</title>
</head>
<body>
    <h2>Регистрация</h2>
    <form>
        <label>Име: <input type="text" name="name" placeholder="Твоето име"></label><br><br>
        <label>Имейл: <input type="email" name="email"></label><br><br>
        <label>Съобщение:<br>
            <textarea name="msg" rows="3" cols="30"></textarea>
        </label><br><br>
        <button type="submit">Изпрати</button>
    </form>
</body>
</html>`
    },
    'html-7': {
        category: 'HTML основи',
        title: "🏷️ Урок 7: Семантичен HTML",
        description: "header, nav, main, section, article, footer дават смисъл на блоковете – по-добър SEO и достъпност от безкрайни div.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Защо семантика?</h3>
                <p class="lesson-section-description">
                    Четци на екрана (за незрящи) и търсачки разбират структурата. Кодът е по-четим за разработчици.
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Семантика</title>
</head>
<body>
    <header>
        <h1>Моят блог</h1>
        <nav>
            <a href="#">Начало</a> |
            <a href="#">За мен</a>
        </nav>
    </header>
    <main>
        <article>
            <h2>Статия: Уча HTML</h2>
            <p>Съдържание на статията...</p>
        </article>
    </main>
    <footer>
        <p>&copy; 2025 Моят сайт</p>
    </footer>
</body>
</html>`
    },
    'css-1': {
        category: 'CSS основи',
        title: "🎨 Урок 8: Какво е CSS?",
        description: "CSS (Cascading Style Sheets) оцветява, подрежда и оформя HTML. Може в <style>, външен файл, или inline (избягвай inline).",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Три начина да добавиш CSS</h3>
                <p class="lesson-section-description">
                    1. <code>&lt;link rel="stylesheet" href="style.css"&gt;</code> – най-добре<br>
                    2. <code>&lt;style&gt;</code> в head – за малки примери<br>
                    3. <code>style="..."</code> inline – само при изключение
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>CSS</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f0f4f8;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #667eea;
        }
        p {
            color: #333;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <h1>Заглавие с CSS</h1>
    <p>Текстът е стилизиран с правила в head.</p>
</body>
</html>`
    },
    'css-2': {
        category: 'CSS основи',
        title: "🎯 Урок 9: Селектори",
        description: "Селекторът казва на кой елемент да се приложи стилът: по таг, клас (.class), id (#id), атрибут, псевдо-класове.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Специфичност</h3>
                <p class="lesson-section-description">
                    id &gt; class &gt; tag. По-специфичното правило печели. Избягвай твърде много #id за стилове.
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Селектори</title>
    <style>
        p { color: #555; }
        .highlight { background: yellow; padding: 4px; }
        #main-title { font-size: 2rem; color: #764ba2; }
        a:hover { color: red; }
        button { padding: 10px 20px; cursor: pointer; }
    </style>
</head>
<body>
    <h1 id="main-title">Заглавие</h1>
    <p class="highlight">Параграф с клас highlight.</p>
    <p>Обикновен параграф.</p>
    <a href="#">Линк с hover</a>
    <button>Бутон</button>
</body>
</html>`
    },
    'css-3': {
        category: 'CSS основи',
        title: "🌈 Урок 10: Цветове, шрифтове, размери",
        description: "Цветове: hex (#667eea), rgb, rgba (с прозрачност). font-family, font-size, font-weight, text-align.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Единици</h3>
                <p class="lesson-section-description">
                    <code>px</code> – пиксели &nbsp;|&nbsp; <code>%</code> – процент &nbsp;|&nbsp;
                    <code>rem</code> – спрямо root font-size (препоръчително)
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Цветове</title>
    <style>
        body { font-family: Georgia, serif; font-size: 16px; }
        .card {
            background: rgba(102, 126, 234, 0.15);
            border-left: 4px solid #667eea;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 8px;
        }
        .big { font-size: 1.5rem; font-weight: bold; color: #333; }
    </style>
</head>
<body>
    <p class="big">Голям текст</p>
    <div class="card">Картичка с цвят и padding.</div>
</body>
</html>`
    },
    'css-4': {
        category: 'CSS оформление',
        title: "📦 Урок 11: Box Model",
        description: "Всеки елемент е кутия: content → padding → border → margin. box-sizing: border-box улеснява оформлението.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">box-sizing</h3>
                <p class="lesson-section-description">
                    <code>* { box-sizing: border-box; }</code> – width включва padding и border (стандарт в модерния CSS).
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Box Model</title>
    <style>
        * { box-sizing: border-box; }
        .box {
            width: 200px;
            padding: 20px;
            border: 3px solid #667eea;
            margin: 15px;
            background: #e8ecff;
        }
    </style>
</head>
<body>
    <div class="box">Кутия с padding, border и margin</div>
    <div class="box">Втора кутия</div>
</body>
</html>`
    },
    'css-5': {
        category: 'CSS оформление',
        title: "📐 Урок 12: Flexbox",
        description: "display: flex подрежда деца в ред или колона – идеален за навигации, карти, центриране.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Чести свойства</h3>
                <p class="lesson-section-description">
                    <code>display: flex</code>, <code>justify-content</code> (хоризонтално),
                    <code>align-items</code> (вертикално), <code>gap</code> (разстояние)
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Flexbox</title>
    <style>
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #333;
            color: white;
            padding: 12px 20px;
        }
        .cards {
            display: flex;
            gap: 16px;
            padding: 20px;
            flex-wrap: wrap;
        }
        .card {
            flex: 1;
            min-width: 120px;
            background: #667eea;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="nav">
        <span>Лого</span>
        <span>Меню</span>
    </div>
    <div class="cards">
        <div class="card">1</div>
        <div class="card">2</div>
        <div class="card">3</div>
    </div>
</body>
</html>`
    },
    'css-6': {
        category: 'CSS оформление',
        title: "🔲 Урок 13: CSS Grid",
        description: "Grid подрежда в редици и колони – перфектен за страници с секции и галерии.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основи</h3>
                <p class="lesson-section-description">
                    <code>display: grid</code>, <code>grid-template-columns: 1fr 1fr 1fr</code>, <code>gap</code>
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Grid</title>
    <style>
        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 20px;
        }
        .item {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="grid">
        <div class="item">A</div>
        <div class="item">B</div>
        <div class="item">C</div>
        <div class="item">D</div>
        <div class="item">E</div>
        <div class="item">F</div>
    </div>
</body>
</html>`
    },
    'css-7': {
        category: 'CSS оформление',
        title: "📱 Урок 14: Responsive дизайн",
        description: "Сайтът трябва да изглежда добре на телефон, таблет и десктоп. Media queries и гъвкави единици (%, rem, fr).",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">viewport meta</h3>
                <p class="lesson-section-description">
                    <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;</code> – задължително за мобилни.
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive</title>
    <style>
        .container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 10px;
        }
        .box {
            flex: 1 1 200px;
            background: #667eea;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
        }
        @media (max-width: 500px) {
            .box { flex: 1 1 100%; background: #764ba2; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="box">Кутия 1</div>
        <div class="box">Кутия 2</div>
        <div class="box">Кутия 3</div>
    </div>
</body>
</html>`
    },
    'project-web-1': {
        category: 'Проект',
        title: "🎯 Урок 15: Мини сайт – карта на обучението",
        description: "Обобщение: направи едностраничен сайт с header, секции, стилове и responsive layout. После добави JavaScript за интерактивност.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Следваща стъпка</h3>
                <p class="lesson-section-description">
                    → Раздел <strong>JavaScript</strong> за DOM и събития<br>
                    → Раздел <strong>Backend</strong> за сървър<br>
                    → Инструменти: VS Code, Live Server extension
                </p>
            </div>
        `,
        code: `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Уча уеб разработка</title>
    <style>
        * { box-sizing: border-box; margin: 0; }
        body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
        header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        main { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 1rem;
        }
        .skill {
            background: #e8ecff;
            color: #667eea;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
        }
        footer { text-align: center; padding: 1rem; background: #f5f5f5; }
    </style>
</head>
<body>
    <header>
        <h1>Здравей! Уча HTML & CSS</h1>
        <p>Това е моят мини проект</p>
    </header>
    <main>
        <h2>Какво уча</h2>
        <div class="skills">
            <span class="skill">HTML</span>
            <span class="skill">CSS</span>
            <span class="skill">Flexbox</span>
            <span class="skill">Grid</span>
        </div>
    </main>
    <footer><p>Направено в Learning Environment</p></footer>
</body>
</html>`
    }
};

topicsByLanguage.web = [
    { id: 'html-1', label: '🌐 1. Какво е HTML' },
    { id: 'html-2', label: '📄 2. Структура' },
    { id: 'html-3', label: '✏️ 3. Текст' },
    { id: 'html-4', label: '🔗 4. Линкове' },
    { id: 'html-5', label: '📋 5. Списъци' },
    { id: 'html-6', label: '📝 6. Форми' },
    { id: 'html-7', label: '🏷️ 7. Семантика' },
    { id: 'css-1', label: '🎨 8. CSS' },
    { id: 'css-2', label: '🎯 9. Селектори' },
    { id: 'css-3', label: '🌈 10. Цветове' },
    { id: 'css-4', label: '📦 11. Box Model' },
    { id: 'css-5', label: '📐 12. Flexbox' },
    { id: 'css-6', label: '🔲 13. Grid' },
    { id: 'css-7', label: '📱 14. Responsive' },
    { id: 'project-web-1', label: '🎯 15. Проект' }
];

defaultCodeByLanguage.web = `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Моята страница</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f7fa;
            padding: 20px;
            text-align: center;
        }
        h1 { color: #667eea; }
    </style>
</head>
<body>
    <h1>Здравей от HTML & CSS!</h1>
    <p>Редактирай кода и натисни „Изпълни код” за визуален преглед.</p>
</body>
</html>`;
