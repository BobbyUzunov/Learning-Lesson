// По-подробни описания за първите уроци + уроци 11–18
if (lessonsJS['basics-1']) {
    lessonsJS['basics-1'].title = "📝 Урок 1: Променливи (let, const, var)";
    lessonsJS['basics-1'].description = "Променливите пазят данни за по-късно. let и const са модерният начин; var е остарял. Научи кога какво да използваш.";
    lessonsJS['basics-2'].description = "Всеки тип данни има различно предназначение. typeof ти показва типа. null и undefined не са едно и също.";
    lessonsJS['functions-1'].description = "Функциите организират кода в преизползваеми блокове. Параметри, return, arrow функции и scope на функцията.";
}

Object.assign(lessonsJS, {
    'strings-1': {
        category: 'Низове и текст',
        title: "💬 Урок 11: Низове (String) – подробно",
        description: "Низовете са навсякъде в JS. Научи интерполация, методи за текст, търсене и промяна.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Template literals</h3>
                <p class="lesson-section-description">
                    Обратни кавички <code>\`...\`</code> и <code>\${израз}</code> – вмъкваш променливи и изрази в текста.
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Полезни методи</h3>
                <p class="lesson-section-description">
                    <code>length</code>, <code>includes()</code>, <code>startsWith()</code>, <code>slice()</code>,
                    <code>split()</code>, <code>trim()</code>, <code>replace()</code>, <code>toUpperCase()</code>
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Низовете в JS са неизменяеми – методите връщат нов низ, не променят оригинала.
            </div>
        `,
        code: `let name = "  Иван  ";
let city = "София";

// Template literal
console.log(\`Здравей, \${name.trim()} от \${city}!\`);

// Методи
console.log(name.trim());
console.log("JavaScript".includes("Script"));
console.log("hello@mail.com".startsWith("hello"));
console.log("ябълка,банан".split(","));

let text = "Здравей свят";
console.log(text.slice(0, 7));
console.log(text.replace("свят", "JavaScript"));`
    },
    'scope-1': {
        category: 'Основи на JavaScript',
        title: "🔒 Урок 12: Обхват (Scope)",
        description: "Scope определя къде променливата е видима. let/const имат блочен обхват; var – функционален (избягвай).",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Видове обхват</h3>
                <p class="lesson-section-description">
                    <strong>Global</strong> – навсякъде (прозорец в браузъра)<br>
                    <strong>Function</strong> – вътре в функция<br>
                    <strong>Block</strong> – вътре в { } при let/const
                </p>
            </div>
            <div class="warning-box">
                <strong>⚠️ var:</strong> „пробива“ блока – затова се ползва let/const.
            </div>
        `,
        code: `let globalVar = "Глобална";

function testScope() {
    let insideFunction = "В функция";
    if (true) {
        let insideBlock = "В блок";
        const alsoBlock = 42;
        console.log(insideBlock, alsoBlock);
    }
    // console.log(insideBlock); // Грешка – не е видима
    console.log(insideFunction);
}

testScope();
console.log(globalVar);`
    },
    'events-1': {
        category: 'DOM и браузър',
        title: "🖱️ Урок 13: Събития (Events)",
        description: "Потребителят кликва, пише, скролва – браузърът генерира събития. addEventListener връзва код с действие.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Чести събития</h3>
                <p class="lesson-section-description">
                    <code>click</code>, <code>input</code>, <code>change</code>, <code>submit</code>,
                    <code>keydown</code>, <code>load</code>, <code>mouseover</code>
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">addEventListener</h3>
                <p class="lesson-section-description">
                    <code>element.addEventListener("click", function(e) { ... })</code><br>
                    <code>e</code> – обект със събитието (target, preventDefault и др.)
                </p>
            </div>
        `,
        code: `// Симулация на event handler логика
function handleClick(event) {
    console.log("Кликнат елемент:", event.target);
    console.log("Тип събитие:", event.type);
}

const fakeEvent = {
    type: "click",
    target: "button#submit"
};

handleClick(fakeEvent);

// Реален код в страница:
// const btn = document.querySelector("button");
// btn.addEventListener("click", () => console.log("Клик!"));`
    },
    'errors-1': {
        category: 'Качествен код',
        title: "🛡️ Урок 14: Грешки (try / catch)",
        description: "Кодът може да се счупи. try/catch хваща грешката, за да не спре цялата програма.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Структура</h3>
                <p class="lesson-section-description">
                    <code>try { рисков код }</code> → <code>catch (error) { обработка }</code> → опционално <code>finally { винаги }</code>
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Не скривай грешки – логвай ги и покажи ясно съобщение на потребителя.
            </div>
        `,
        code: `function divide(a, b) {
    if (b === 0) {
        throw new Error("Деление на нула!");
    }
    return a / b;
}

try {
    console.log(divide(10, 2));
    console.log(divide(5, 0));
} catch (error) {
    console.log("Хваната грешка:", error.message);
} finally {
    console.log("Блокът finally винаги се изпълнява");
}

// JSON parse – честа грешка
try {
    JSON.parse("{ невалиден json }");
} catch (e) {
    console.log("JSON грешка:", e.message);
}`
    },
    'promises-1': {
        category: 'Асинхронен JavaScript',
        title: "⏳ Урок 15: Promises",
        description: "Promise представя бъдеща стойност – операция, която още не е завършила (мрежа, таймер, файл).",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Състояния</h3>
                <p class="lesson-section-description">
                    <strong>pending</strong> – чака &nbsp;|&nbsp; <strong>fulfilled</strong> – успех &nbsp;|&nbsp; <strong>rejected</strong> – грешка
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">.then() и .catch()</h3>
                <p class="lesson-section-description">
                    Верига от обещания за последователни асинхронни стъпки. <code>fetch</code> връща Promise.
                </p>
            </div>
        `,
        code: `// Създаване на Promise
const wait = (ms) => new Promise((resolve) => {
    setTimeout(() => resolve(\`Готово след \${ms}ms\`), ms);
});

wait(300).then((msg) => {
    console.log(msg);
    return "Следваща стъпка";
}).then((step) => {
    console.log(step);
}).catch((err) => {
    console.log("Грешка:", err);
});

// fetch пример (ако npm start работи):
// fetch("/api/test").then(r => r.json()).then(console.log);`
    },
    'async-1': {
        category: 'Асинхронен JavaScript',
        title: "⚡ Урок 16: async / await",
        description: "async/await е синтактична захар върху Promises – пишеш асинхронен код като синхронен.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Правила</h3>
                <p class="lesson-section-description">
                    <code>async function</code> винаги връща Promise.<br>
                    <code>await</code> само вътре в async функция – чака резултата.
                </p>
            </div>
        `,
        code: `function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadUser() {
    console.log("Зареждане...");
    await delay(200);
    return { id: 1, name: "Иван" };
}

async function main() {
    try {
        const user = await loadUser();
        console.log("Потребител:", user);
    } catch (e) {
        console.log("Грешка:", e.message);
    }
}

main();

// async fetch:
// async function getApi() {
//   const res = await fetch("/api/test");
//   return await res.json();
// }`
    },
    'storage-1': {
        category: 'DOM и браузър',
        title: "💾 Урок 17: localStorage",
        description: "localStorage пази данни в браузъра след затваряне. JSON.stringify/parse за обекти.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Методи</h3>
                <p class="lesson-section-description">
                    <code>setItem(key, value)</code>, <code>getItem(key)</code>, <code>removeItem(key)</code>, <code>clear()</code>
                </p>
            </div>
            <div class="warning-box">
                <strong>⚠️:</strong> Не пази пароли или тайни – видими са в браузъра. Само настройки, тема, чернова.
            </div>
        `,
        code: `// Симулация на localStorage логика
const storage = {};

function setItem(key, value) {
    storage[key] = value;
}
function getItem(key) {
    return storage[key] ?? null;
}

const user = { name: "Иван", theme: "dark" };
setItem("user", JSON.stringify(user));

const saved = JSON.parse(getItem("user"));
console.log("Запазено:", saved);

setItem("lastVisit", new Date().toISOString());
console.log("Последно:", getItem("lastVisit"));`
    },
    'project-1': {
        category: 'Следващи стъпки',
        title: "🎯 Урок 18: Пътека и мини проекти",
        description: "Обобщение и идеи за практика: калкулатор, to-do списък, форма с валидация, после React или Node.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Проекти за начинаещи</h3>
                <p class="lesson-section-description">
                    1. <strong>Калкулатор</strong> – бутони + DOM + if/switch<br>
                    2. <strong>To-Do</strong> – масив, добавяне/изтриване, localStorage<br>
                    3. <strong>Форма</strong> – input, валидация, съобщения за грешка<br>
                    4. <strong>Таймер</strong> – setInterval, бутони start/stop
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">След JavaScript основи</h3>
                <p class="lesson-section-description">
                    → Раздел <strong>Backend</strong> (Node, API) &nbsp;|&nbsp; → <strong>React</strong> / <strong>Next.js</strong>
                </p>
            </div>
        `,
        code: `// Мини To-Do логика (без DOM – само логика)
let todos = [
    { id: 1, text: "Уча променливи", done: true },
    { id: 2, text: "Уча масиви", done: false }
];

function addTodo(text) {
    todos.push({ id: Date.now(), text, done: false });
}
function toggleTodo(id) {
    const t = todos.find(x => x.id === id);
    if (t) t.done = !t.done;
}

addTodo("Направи мини проект");
toggleTodo(2);

todos.forEach(t => {
    console.log((t.done ? "✅" : "⬜") + " " + t.text);
});`
    }
});

// Списъкът с теми е в lessons-python.js (topicsByLanguage.javascript)
