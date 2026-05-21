// Нови уроци – разширени практически теми
const lessonsNew = {
    'new-1': {
        category: 'Практически JavaScript',
        title: "🧠 Урок 1: План за мини проект",
        description: "Преди да пишеш код, раздели идеята на малки части: данни, действия, екран и резултат. Така проектът става по-лесен за мислене и довършване.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">4 въпроса преди старт</h3>
                <p class="lesson-section-description">
                    <strong>Какви данни имам?</strong> Например списък със задачи.<br>
                    <strong>Какво може да прави потребителят?</strong> Добавя, трие, маркира.<br>
                    <strong>Какво трябва да се вижда?</strong> Заглавие, списък, брояч.<br>
                    <strong>Как разбирам, че работи?</strong> Пробвам основните действия едно по едно.
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Първо направи най-малката работеща версия. После добавяй детайли.
            </div>
        `,
        code: `// План за мини To-Do проект
const project = {
    name: "To-Do App",
    data: ["учи JavaScript", "направи HTML", "стилизирай с CSS"],
    actions: ["add", "remove", "complete"],
    screen: ["input", "button", "list", "counter"]
};

console.log("Проект:", project.name);
console.log("Данни:", project.data.join(", "));
console.log("Действия:", project.actions.join(", "));
console.log("Екран:", project.screen.join(", "));`
    },
    'new-2': {
        category: 'JavaScript структури',
        title: "🗂️ Урок 2: Array методи за реални списъци",
        description: "map, filter и reduce са основа за работа със списъци: показване, търсене, филтриране и изчисляване на обобщения.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Кога кой метод?</h3>
                <p class="lesson-section-description">
                    <code>map()</code> преобразува всеки елемент.<br>
                    <code>filter()</code> оставя само елементите, които отговарят на условие.<br>
                    <code>reduce()</code> събира списък до една стойност: сума, брояч, обект.
                </p>
            </div>
        `,
        code: `const lessons = [
    { title: "HTML", minutes: 20, done: true },
    { title: "CSS Grid", minutes: 35, done: false },
    { title: "JavaScript", minutes: 45, done: true }
];

const titles = lessons.map(lesson => lesson.title);
const completed = lessons.filter(lesson => lesson.done);
const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

console.log("Всички теми:", titles.join(", "));
console.log("Завършени:", completed.length);
console.log("Общо минути:", totalMinutes);`
    },
    'new-3': {
        category: 'Асинхронен JavaScript',
        title: "🌐 Урок 3: fetch и обработка на данни",
        description: "fetch изпраща заявка към API и връща Promise. Използва се с async/await, за да четеш данни от сървър.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Важният ред</h3>
                <p class="lesson-section-description">
                    <code>await response.json()</code> превръща JSON отговора в JavaScript обект. Винаги провери дали заявката е успешна.
                </p>
            </div>
            <div class="read-warn">
                <strong>⚠️ Забележка:</strong> Външните API-та може да имат CORS ограничения. Този пример използва вграден JSON адрес, за да работи еднакво локално и в production.
            </div>
        `,
        code: `async function loadServerTest() {
    try {
        const mockData = {
            message: "Данните са заредени успешно!",
            lesson: "fetch API",
            status: "ready"
        };
        const apiUrl = "data:application/json," + encodeURIComponent(JSON.stringify(mockData));
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log("Съобщение:", data.message);
        console.log("Урок:", data.lesson);
        console.log("Статус:", data.status);
    } catch (error) {
        console.error("Заявката не успя:", error.message);
    }
}

loadServerTest();`
    },
    'new-4': {
        category: 'Browser storage',
        title: "💾 Урок 4: localStorage за запазване на настройки",
        description: "localStorage пази малки стойности в браузъра. Подходящ е за тема, име, последен избор или настройки на интерфейса.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни команди</h3>
                <p class="lesson-section-description">
                    <code>localStorage.setItem(key, value)</code> записва стойност.<br>
                    <code>localStorage.getItem(key)</code> чете стойност.<br>
                    <code>localStorage.removeItem(key)</code> изтрива стойност.
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> localStorage пази само текст. За обекти използвай <code>JSON.stringify()</code> и <code>JSON.parse()</code>.
            </div>
        `,
        code: `const settings = {
    theme: "dark",
    fontSize: 18,
    language: "bg"
};

localStorage.setItem("learning-settings", JSON.stringify(settings));

const saved = JSON.parse(localStorage.getItem("learning-settings"));
console.log("Запазена тема:", saved.theme);
console.log("Размер на шрифта:", saved.fontSize);
console.log("Език:", saved.language);`
    },
    'new-5': {
        category: 'Качествен код',
        title: "🧪 Урок 5: Малки функции и проверими резултати",
        description: "Добрата функция прави едно ясно нещо и връща резултат. Така можеш лесно да я тестваш с няколко примера.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Правило</h3>
                <p class="lesson-section-description">
                    Ако функцията става дълга и прави много неща, раздели я. Имената трябва да казват какво получаваш: <code>calculateTotal</code>, <code>formatName</code>, <code>isValidEmail</code>.
                </p>
            </div>
        `,
        code: `function calculateProgress(done, total) {
    if (total === 0) return 0;
    return Math.round((done / total) * 100);
}

function testProgress(done, total, expected) {
    const result = calculateProgress(done, total);
    const status = result === expected ? "OK" : "Грешка";
    console.log(status + ": " + done + "/" + total + " = " + result + "%");
}

testProgress(3, 10, 30);
testProgress(5, 5, 100);
testProgress(0, 0, 0);`
    },
    'new-6': {
        category: 'Мини проект',
        title: "🎯 Урок 6: Генератор на учебен план",
        description: "Комбинирай масиви, функции и template strings, за да генерираш кратък план за учене по дни.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Какво упражняваш?</h3>
                <p class="lesson-section-description">
                    Данни в масив, функция за форматиране, цикъл с <code>map()</code> и чист изход чрез <code>join()</code>.
                </p>
            </div>
        `,
        code: `const topics = ["HTML структура", "CSS layout", "JavaScript функции", "fetch API"];

function buildStudyPlan(items) {
    return items.map((topic, index) => {
        const day = index + 1;
        return "Ден " + day + ": " + topic + " - 30 минути практика";
    }).join("\\n");
}

const plan = buildStudyPlan(topics);
console.log(plan);`
    }
};

topicsByLanguage.new = [
    { id: 'new-1', label: '🧠 1. План за проект' },
    { id: 'new-2', label: '🗂️ 2. Array методи' },
    { id: 'new-3', label: '🌐 3. fetch API' },
    { id: 'new-4', label: '💾 4. localStorage' },
    { id: 'new-5', label: '🧪 5. Малки функции' },
    { id: 'new-6', label: '🎯 6. Учебен план' }
];

defaultCodeByLanguage.new = `// Нови уроци - JavaScript практика
const message = "Избери урок от секцията Нови уроци";
console.log(message);
`;
