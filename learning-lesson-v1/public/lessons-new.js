// AI & Tools – модерни практически теми за програмиране
const lessonsNew = {
    'new-1': {
        category: 'AI-assisted development',
        title: "🤖 Урок 1: Как да работиш с AI асистент",
        description: "AI инструментите са най-полезни, когато им дадеш ясна задача, контекст, ограничения и критерии за проверка. Мисли за AI като за партньор, който трябва да бъде насочен.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Добър prompt за код</h3>
                <p class="lesson-section-description">
                    Кажи <strong>какво строиш</strong>, <strong>какви файлове/технологии използваш</strong>, <strong>какво не трябва да се променя</strong> и <strong>как ще провериш резултата</strong>.
                    Така получаваш по-точен код и по-малко случайни промени.
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Питай AI първо за план, после за малка промяна, после за проверка. Не искай всичко наведнъж.
            </div>
        `,
        code: `function buildPrompt(task, context, checks) {
    return [
        "Задача: " + task,
        "Контекст: " + context,
        "Провери: " + checks.join(", ")
    ].join("\\n");
}

const prompt = buildPrompt(
    "Направи сайта responsive за телефон",
    "HTML, CSS, JavaScript, без нов framework",
    ["няма хоризонтален скрол", "бутоните са удобни за touch", "сървърът работи"]
);

console.log(prompt);`
    },
    'new-2': {
        category: 'TypeScript мислене',
        title: "🧩 Урок 2: Типове преди TypeScript",
        description: "TypeScript е актуален, защото типовете правят кода по-ясен за хора, редактори и AI инструменти. Можеш да мислиш типово още в JavaScript.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Какво означава типово мислене?</h3>
                <p class="lesson-section-description">
                    Преди да напишеш функция, опиши какво приема и какво връща. Това намалява грешките и прави кода по-лесен за разширяване.
                    В JavaScript можеш да използваш JSDoc коментари като мека стъпка към TypeScript.
                </p>
            </div>
        `,
        code: `/**
 * @param {{ title: string, minutes: number, done: boolean }} lesson
 * @returns {string}
 */
function formatLesson(lesson) {
    const status = lesson.done ? "готов" : "за учене";
    return lesson.title + " - " + lesson.minutes + " мин. (" + status + ")";
}

const lesson = { title: "TypeScript basics", minutes: 30, done: false };
console.log(formatLesson(lesson));`
    },
    'new-3': {
        category: 'Testing basics',
        title: "🧪 Урок 3: Мини тестове за сигурен код",
        description: "Когато AI или човек променя код, тестовете са предпазната мрежа. Дори малки проверки с очакван резултат помагат много.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Тестът е въпрос</h3>
                <p class="lesson-section-description">
                    Питаш функцията: "Ако входът е това, резултатът ли е онова?". Ако не е, кодът трябва да се поправи.
                    Започни с 2-3 прости случая, преди да мислиш за сложен test framework.
                </p>
            </div>
        `,
        code: `function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price, 0);
}

function expectEqual(name, actual, expected) {
    const ok = actual === expected;
    console.log((ok ? "OK" : "Грешка") + ": " + name);
    if (!ok) console.log("Очаквах " + expected + ", получих " + actual);
}

expectEqual("празна количка", calculateTotal([]), 0);
expectEqual("две покупки", calculateTotal([{ price: 10 }, { price: 15 }]), 25);`
    },
    'new-4': {
        category: 'APIs and JSON',
        title: "🌐 Урок 4: API данни и error handling",
        description: "Модерните приложения говорят с API-та. Важното е не само да вземеш JSON, а да обработиш грешка, празен отговор и неочаквана структура.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Стабилен fetch</h3>
                <p class="lesson-section-description">
                    Проверявай <code>response.ok</code>, използвай <code>try/catch</code> и форматирай данните преди да ги покажеш в интерфейса.
                </p>
            </div>
            <div class="read-warn">
                <strong>⚠️ Забележка:</strong> Примерът използва локални demo данни, за да работи без външен API ключ.
            </div>
        `,
        code: `async function loadProfile() {
    try {
        const demo = { name: "Alex", role: "Frontend", skills: ["JS", "CSS", "API"] };
        const url = "data:application/json," + encodeURIComponent(JSON.stringify(demo));
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("API грешка: " + response.status);
        }

        const profile = await response.json();
        console.log(profile.name + " - " + profile.role);
        console.log("Умения: " + profile.skills.join(", "));
    } catch (error) {
        console.error("Неуспешно зареждане:", error.message);
    }
}

loadProfile();`
    },
    'new-5': {
        category: 'Security basics',
        title: "🔐 Урок 5: Сигурност за начинаещи",
        description: "Сигурният код започва с навици: не пази тайни в frontend кода, валидирай входа и не показвай HTML от потребител без защита.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Три правила</h3>
                <p class="lesson-section-description">
                    <strong>Не слагай API ключове в браузъра.</strong><br>
                    <strong>Проверявай входните данни.</strong><br>
                    <strong>Използвай textContent вместо innerHTML</strong>, когато показваш текст от потребител.
                </p>
            </div>
            <div class="warning-box">
                <strong>⚠️ Важно:</strong> Ако нещо идва от потребител, API или URL, третирай го като непроверено.
            </div>
        `,
        code: `function sanitizeName(name) {
    return String(name)
        .trim()
        .replace(/[<>]/g, "");
}

function createGreeting(rawName) {
    const name = sanitizeName(rawName);
    if (name.length < 2) {
        return "Моля, въведи валидно име.";
    }
    return "Здравей, " + name + "!";
}

console.log(createGreeting("  Мария  "));
console.log(createGreeting("<script>alert(1)</script>"));`
    },
    'new-6': {
        category: 'Git workflow',
        title: "🌿 Урок 6: Git промени без хаос",
        description: "Git е ежедневен инструмент. Най-добрият навик е малка промяна, ясен commit и проверка преди push.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Мини workflow</h3>
                <p class="lesson-section-description">
                    <code>git status</code> вижда какво е променено.<br>
                    <code>git diff</code> показва точната промяна.<br>
                    <code>git add</code>, <code>git commit</code>, <code>git push</code> качват само готовата работа.
                </p>
            </div>
        `,
        code: `const workflow = [
    "1. git status",
    "2. git diff",
    "3. тествай локално",
    "4. git add file",
    "5. git commit -m \\"ясно съобщение\\"",
    "6. git push"
];

console.log("Git workflow:");
console.log(workflow.join("\\n"));`
    },
    'new-7': {
        category: 'Performance',
        title: "⚡ Урок 7: Бързина и UX",
        description: "Оптимизацията не е само скорост. Тя е усещане: бързо зареждане, липса на layout shift, удобни бутони и четим текст на малък екран.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Какво да гледаш?</h3>
                <p class="lesson-section-description">
                    Намали ненужния код, използвай responsive layout, не карай потребителя да чака без feedback и пази интерфейса стабилен при промяна на съдържанието.
                </p>
            </div>
        `,
        code: `const checks = [
    { name: "няма хоризонтален скрол", ok: true },
    { name: "бутоните са поне 44px високи", ok: true },
    { name: "текстът се чете на телефон", ok: true },
    { name: "кодът не блокира интерфейса", ok: false }
];

const passed = checks.filter(check => check.ok).length;
console.log("UX проверки: " + passed + "/" + checks.length);

checks.forEach(check => {
    console.log((check.ok ? "OK" : "Провери") + ": " + check.name);
});`
    },
    'new-8': {
        category: 'Modern mini project',
        title: "🚀 Урок 8: AI планер за учебен проект",
        description: "Комбинирай prompt, задачи, тестове и Git стъпки в един малък план. Това е практичен начин да използваш AI без да губиш контрол над проекта.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Формула</h3>
                <p class="lesson-section-description">
                    Идея → малки задачи → примерен prompt → проверки → commit. Това е модерният цикъл за работа с AI инструменти и код.
                </p>
            </div>
        `,
        code: `const project = {
    idea: "Responsive learning app",
    tasks: ["mobile navigation", "readable lessons", "touch-friendly editor"],
    checks: ["localhost works", "no overflow", "API test passes"]
};

function buildAiProjectPlan(project) {
    return [
        "Идея: " + project.idea,
        "Задачи:\\n- " + project.tasks.join("\\n- "),
        "Проверки:\\n- " + project.checks.join("\\n- "),
        "Commit: improve responsive learning experience"
    ].join("\\n\\n");
}

console.log(buildAiProjectPlan(project));`
    }
};

topicsByLanguage.new = [
    { id: 'new-1', label: '🤖 1. AI асистент' },
    { id: 'new-2', label: '🧩 2. TypeScript мислене' },
    { id: 'new-3', label: '🧪 3. Мини тестове' },
    { id: 'new-4', label: '🌐 4. API данни' },
    { id: 'new-5', label: '🔐 5. Сигурност' },
    { id: 'new-6', label: '🌿 6. Git workflow' },
    { id: 'new-7', label: '⚡ 7. Performance' },
    { id: 'new-8', label: '🚀 8. AI проект' }
];

defaultCodeByLanguage.new = `// AI & Tools - модерна практика
const message = "Избери урок от секцията AI & Tools";
console.log(message);
`;
