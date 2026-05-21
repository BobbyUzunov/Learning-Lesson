// ============================================
// JavaScript Learning Environment
// ============================================

// Уроци по JavaScript
const lessonsJS = {
    'basics-1': {
        category: 'Основи на JavaScript',
        title: "📝 Урок 1: Променливи (Variables)",
        description: "Променливите са основен концепт в програмирането. Те са като кутии, в които съхраняваме информация, която може да използваме по-късно в нашия код.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Какво е променлива?</h3>
                <p class="lesson-section-description">
                    Променливата е име, което даваме на място в паметта, където съхраняваме данни. 
                    Мисли за нея като за етикет на кутия - казваш на компютъра "Запази тази стойност под това име".
                </p>
            </div>
            
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Имената на променливите трябва да са описателни и ясни. 
                Използвай английски език и camelCase (първата буква малка, останалите думи с главна).
            </div>
        `,
        code: `// 1. let - променлива, която може да се променя
let name = "Иван";
name = "Петър"; // ✅ Можем да променяме стойността

// 2. const - константа, не може да се променя
const age = 25;
// age = 30; // ❌ Грешка! const не може да се променя

// 3. var - старият начин (избягвай го)
var oldWay = "Не препоръчва се";

// Правилно именуване на променливи
let userName = "Иван";        // ✅ Добре
let user_name = "Иван";       // ⚠️ Работи, но не е стандарт
let UserName = "Иван";        // ⚠️ Избягвай (започва с главна)
let 123name = "Иван";        // ❌ Грешка! Не може да започва с число

// Променливи без стойност
let emptyVariable;            // undefined
let nullVariable = null;      // null (специална стойност)`,
        example: function() {
            displayOutput("=== Демонстрация на променливи ===");
            
            let name = "Иван";
            displayOutput(`let name = "${name}"`);
            
            name = "Петър";
            displayOutput(`След промяна: name = "${name}"`);
            
            const age = 25;
            displayOutput(`const age = ${age}`);
            displayOutput("⚠️ const не може да се променя!");
            
            console.log("Променливи:", { name, age });
        }
    },
    
    'basics-2': {
        category: 'Основи на JavaScript',
        title: "🔢 Урок 2: Типове данни (Data Types)",
        description: "В JavaScript имаме различни типове данни. Всеки тип има специфично предназначение и поведение. Разбирането на типовете е критично за писането на правилен код.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни типове данни:</h3>
                <p class="lesson-section-description">
                    <strong>String (текст):</strong> Използва се за текст. Огражда се с кавички (единични или двойни).<br>
                    <strong>Number (число):</strong> Използва се за числа - цели или десетични.<br>
                    <strong>Boolean:</strong> Само две стойности - true (истина) или false (лъжа).<br>
                    <strong>Array (масив):</strong> Списък от елементи, подредени в определен ред.<br>
                    <strong>Object (обект):</strong> Колекция от ключ-стойност двойки.<br>
                    <strong>null:</strong> Специална стойност, която означава "нищо" или "празно".<br>
                    <strong>undefined:</strong> Променлива, която не е инициализирана.
                </p>
            </div>
            
            <div class="warning-box">
                <strong>⚠️ Внимание:</strong> JavaScript е "динамично типизиран" език - променливата може да променя типа си. 
                Това е удобно, но може да причини неочаквани грешки!
            </div>
        `,
        code: `// STRING (текст) - за съхранение на текст
let text1 = "Здравей";           // Двойни кавички
let text2 = 'Свет';              // Единични кавички
let text3 = \`Многореден
текст\`;                          // Template literal (обратни кавички)

// NUMBER (число) - за числа
let wholeNumber = 42;             // Цяло число
let decimal = 3.14;               // Десетично число
let negative = -10;               // Отрицателно число
let bigNumber = 1e6;              // 1000000 (научна нотация)

// BOOLEAN (true/false) - за логически стойности
let isActive = true;              // Истина
let isComplete = false;           // Лъжа
let isGreater = 5 > 3;            // true (резултат от сравнение)

// ARRAY (масив) - списък от елементи
let colors = ["червено", "зелено", "синьо"];
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "текст", true];   // Може да смесва типове

// OBJECT (обект) - колекция от свойства
let person = {
    name: "Мария",
    age: 30,
    city: "София",
    isStudent: false
};

// null и undefined
let empty = null;                 // Специална стойност "нищо"
let notDefined;                   // undefined (не е зададена стойност)

// Проверка на тип
console.log(typeof "текст");      // "string"
console.log(typeof 42);           // "number"
console.log(typeof true);         // "boolean"
console.log(typeof []);           // "object" (специален случай!)
console.log(typeof {});           // "object"
console.log(typeof null);         // "object" (грешка в JavaScript!)`,
        example: function() {
            displayOutput("=== Демонстрация на типове данни ===");
            
            let text = "Здравей";
            let number = 42;
            let isActive = true;
            let colors = ["червено", "зелено", "синьо"];
            let person = { name: "Мария", age: 30 };
            
            displayOutput(`String: "${text}" (тип: ${typeof text})`);
            displayOutput(`Number: ${number} (тип: ${typeof number})`);
            displayOutput(`Boolean: ${isActive} (тип: ${typeof isActive})`);
            displayOutput(`Array: ${colors.join(", ")} (тип: ${typeof colors})`);
            displayOutput(`Object: ${person.name}, ${person.age} години (тип: ${typeof person})`);
            
            console.log("Всички типове:", {
                text: typeof text,
                number: typeof number,
                isActive: typeof isActive,
                colors: Array.isArray(colors) ? "array" : typeof colors,
                person: typeof person
            });
        }
    },
    
    'basics-3': {
        category: 'Основи на JavaScript',
        title: "⚙️ Урок 3: Оператори (Operators)",
        description: "Операторите са символи, които извършват операции върху данни. Те са инструментите, с които манипулираме стойности и правим изчисления.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Видове оператори:</h3>
                <p class="lesson-section-description">
                    <strong>Аритметични:</strong> +, -, *, /, %, ** (събиране, изваждане, умножение, деление, модуло, степенуване)<br>
                    <strong>Сравнение:</strong> ==, ===, !=, !==, >, <, >=, <= (сравняване на стойности)<br>
                    <strong>Логически:</strong> && (И), || (ИЛИ), ! (НЕ)<br>
                    <strong>Присвояване:</strong> =, +=, -=, *=, /= (присвояване на стойности)
                </p>
            </div>
            
            <div class="tip-box">
                <strong>💡 Важно:</strong> Използвай === вместо == за сравнение! 
                === проверява и стойността, и типа, докато == прави автоматично преобразуване на типове, 
                което може да доведе до неочаквани резултати.
            </div>
        `,
        code: `// АРИТМЕТИЧНИ ОПЕРАТОРИ
let a = 10;
let b = 5;

console.log(a + b);   // 15 (събиране)
console.log(a - b);   // 5 (изваждане)
console.log(a * b);  // 50 (умножение)
console.log(a / b);  // 2 (деление)
console.log(a % b);  // 0 (модуло - остатък от деление)
console.log(a ** b); // 100000 (степенуване: 10^5)

// ОПЕРАТОРИ ЗА СРАВНЕНИЕ
console.log(a > b);   // true (10 > 5)
console.log(a < b);   // false (10 < 5)
console.log(a >= b);  // true (10 >= 5)
console.log(a <= b);  // false (10 <= 5)
console.log(a === b); // false (равно по стойност И тип)
console.log(a !== b); // true (различно)

// ВАЖНО: Разлика между == и ===
console.log(5 == "5");  // true (автоматично преобразуване)
console.log(5 === "5"); // false (различни типове!)

// ЛОГИЧЕСКИ ОПЕРАТОРИ
let x = true;
let y = false;

console.log(x && y);  // false (И - и двете трябва да са true)
console.log(x || y);  // true (ИЛИ - поне едното трябва да е true)
console.log(!x);      // false (НЕ - обръща стойността)

// ОПЕРАТОРИ ЗА ПРИСВОЯВАНЕ
let num = 10;
num += 5;  // num = num + 5 (15)
num -= 3;  // num = num - 3 (12)
num *= 2;  // num = num * 2 (24)
num /= 4;  // num = num / 4 (6)

// ИНКРЕМЕНТ И ДЕКРЕМЕНТ
let counter = 0;
counter++;  // counter = counter + 1 (1)
counter--;  // counter = counter - 1 (0)
++counter;  // Преди инкремент
counter++;  // След инкремент`,
        example: function() {
            displayOutput("=== Демонстрация на оператори ===");
            
            let a = 10;
            let b = 5;
            
            displayOutput(`Аритметични: ${a} + ${b} = ${a + b}`);
            displayOutput(`Аритметични: ${a} - ${b} = ${a - b}`);
            displayOutput(`Аритметични: ${a} * ${b} = ${a * b}`);
            displayOutput(`Аритметични: ${a} / ${b} = ${a / b}`);
            displayOutput(`Сравнение: ${a} > ${b} = ${a > b}`);
            displayOutput(`Сравнение: ${a} === ${b} = ${a === b}`);
            
            let x = true;
            let y = false;
            displayOutput(`Логически: true && false = ${x && y}`);
            displayOutput(`Логически: true || false = ${x || y}`);
            
            console.log("Оператори демонстрирани успешно!");
        }
    },
    
    'control-1': {
        category: 'Условия и Контрол на потока',
        title: "🔀 Урок 4: Условия (Conditionals)",
        description: "Условните оператори позволяват на програмата да взема решения. В зависимост от дадено условие, изпълняваме различен код.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">if/else структура:</h3>
                <p class="lesson-section-description">
                    if проверява условие. Ако е true, изпълнява кода в блока. 
                    else if проверява друго условие, ако първото е false. 
                    else изпълнява код, ако всички условия са false.
                </p>
            </div>
            
            <div class="lesson-section">
                <h3 class="lesson-section-title">Тернарен оператор:</h3>
                <p class="lesson-section-description">
                    Кратък начин за if/else в един ред. Синтаксис: условие ? стойност_ако_true : стойност_ако_false
                </p>
            </div>
            
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Винаги използвай фигурни скоби {} дори и за един ред код. 
                Това прави кода по-четим и предотвратява грешки.
            </div>
        `,
        code: `// IF/ELSE - основна структура
let temperature = 25;

if (temperature > 30) {
    console.log("Много горещо!");
} else if (temperature > 20) {
    console.log("Приятно време!");
} else {
    console.log("Хладно!");
}

// ВЛОЖЕНИ IF (nested if)
let age = 18;
let hasLicense = true;

if (age >= 18) {
    if (hasLicense) {
        console.log("Можеш да караш!");
    } else {
        console.log("Трябва ти книжка!");
    }
} else {
    console.log("Твърде млад си!");
}

// ТЕРНАРЕН ОПЕРАТОР (кратък if/else)
let userAge = 20;
let status = userAge >= 18 ? "Пълнолетен" : "Непълнолетен";
console.log(status); // "Пълнолетен"

// SWITCH - за множество условия
let day = "понеделник";
switch(day) {
    case "понеделник":
        console.log("Начало на седмицата");
        break;
    case "петък":
        console.log("Край на седмицата");
        break;
    case "събота":
    case "неделя":
        console.log("Уикенд!");
        break;
    default:
        console.log("Обикновен ден");
}

// ЛОГИЧЕСКИ ОПЕРАТОРИ В УСЛОВИЯ
let score = 85;
if (score >= 90 && score <= 100) {
    console.log("Отличен!");
} else if (score >= 70 || score < 50) {
    console.log("Трябва да учиш повече!");
}`,
        example: function() {
            displayOutput("=== Демонстрация на условия ===");
            
            let temperature = 25;
            let message = "";
            
            if (temperature > 30) {
                message = "Много горещо!";
            } else if (temperature > 20) {
                message = "Приятно време!";
            } else {
                message = "Хладно!";
            }
            
            displayOutput(`Температура: ${temperature}°C`);
            displayOutput(`Съобщение: ${message}`);
            
            let age = 18;
            let status = age >= 18 ? "Пълнолетен" : "Непълнолетен";
            displayOutput(`Възраст: ${age} - ${status}`);
            
            console.log("Условия демонстрирани успешно!");
        }
    },
    
    'control-2': {
        category: 'Условия и Контрол на потока',
        title: "🔄 Урок 5: Цикли (Loops)",
        description: "Циклите позволяват да изпълняваме код многократно. Вместо да пишем същия код много пъти, използваме цикъл, който го повтаря автоматично.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Видове цикли:</h3>
                <p class="lesson-section-description">
                    <strong>for:</strong> Използва се, когато знаеш колко пъти искаш да повториш кода.<br>
                    <strong>while:</strong> Изпълнява се, докато условието е true.<br>
                    <strong>do-while:</strong> Изпълнява се поне веднъж, след това проверява условието.<br>
                    <strong>for...of:</strong> Итерира през елементите на масив или обект.
                </p>
            </div>
            
            <div class="warning-box">
                <strong>⚠️ Внимание:</strong> Внимавай за безкрайни цикли! Винаги увери се, че условието 
                в while цикъла ще стане false в някакъв момент, иначе програмата ще "замръзне".
            </div>
        `,
        code: `// FOR ЦИКЪЛ - знаеш колко пъти да повториш
for (let i = 1; i <= 5; i++) {
    console.log("Итерация:", i);
}
// Резултат: 1, 2, 3, 4, 5

// FOR с масив
let fruits = ["ябълка", "банан", "портокал"];
for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}

// WHILE ЦИКЪЛ - докато условието е true
let count = 0;
while (count < 3) {
    console.log("Брояч:", count);
    count++; // Важно! Иначе безкраен цикъл!
}

// DO-WHILE - изпълнява се поне веднъж
let num = 0;
do {
    console.log("Число:", num);
    num++;
} while (num < 3);

// FOR...OF - за масиви (по-лесен начин)
let colors = ["червено", "зелено", "синьо"];
for (let color of colors) {
    console.log("Цвят:", color);
}

// FOR...IN - за обекти (ключовете)
let person = { name: "Иван", age: 25 };
for (let key in person) {
    console.log(key + ":", person[key]);
}

// FOREACH - метод на масива
fruits.forEach(function(fruit, index) {
    console.log(\`\${index + 1}. \${fruit}\`);
});

// BREAK - излизане от цикъла
for (let i = 0; i < 10; i++) {
    if (i === 5) break; // Спира при 5
    console.log(i);
}

// CONTINUE - прескачане на итерация
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) continue; // Прескача четните
    console.log(i); // Печата само нечетните
}`,
        example: function() {
            displayOutput("=== Демонстрация на цикли ===");
            
            displayOutput("--- For цикъл ---");
            for (let i = 1; i <= 5; i++) {
                displayOutput(`Итерация: ${i}`);
            }
            
            displayOutput("--- While цикъл ---");
            let count = 0;
            while (count < 3) {
                displayOutput(`Брояч: ${count}`);
                count++;
            }
            
            displayOutput("--- For...of цикъл ---");
            let fruits = ["ябълка", "банан", "портокал"];
            for (let fruit of fruits) {
                displayOutput(`Плод: ${fruit}`);
            }
            
            console.log("Цикли демонстрирани успешно!");
        }
    },
    
    'functions-1': {
        category: 'Функции',
        title: "⚡ Урок 6: Функции (Functions)",
        description: "Функциите са блокове код, които изпълняват конкретна задача. Те позволяват да организираме кода, да го използваме многократно и да го правим по-четим.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Защо да използваме функции?</h3>
                <p class="lesson-section-description">
                    • <strong>Повторна употреба:</strong> Една функция може да се извика много пъти<br>
                    • <strong>Организация:</strong> Разделя сложния код на по-малки части<br>
                    • <strong>Четимост:</strong> Кодът става по-лесен за разбиране<br>
                    • <strong>Поддръжка:</strong> Лесно можеш да променяш функционалността
                </p>
            </div>
            
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Функциите трябва да правят едно нещо и да го правят добре. 
                Ако функцията прави твърде много неща, раздели я на по-малки функции.
            </div>
        `,
        code: `// ОБИКНОВЕНА ФУНКЦИЯ
function greet(name) {
    return "Здравей, " + name + "!";
}
console.log(greet("Иван")); // "Здравей, Иван!"

// ФУНКЦИЯ С МНОГО ПАРАМЕТРИ
function add(a, b) {
    return a + b;
}
console.log(add(5, 3)); // 8

// ФУНКЦИЯ БЕЗ ПАРАМЕТРИ
function sayHello() {
    console.log("Здравей!");
}
sayHello();

// ФУНКЦИЯ БЕЗ RETURN (връща undefined)
function logMessage(message) {
    console.log(message);
    // Няма return
}

// ARROW ФУНКЦИЯ (ES6) - модерен синтаксис
const multiply = (a, b) => {
    return a * b;
};

// ARROW ФУНКЦИЯ (кратка форма)
const divide = (a, b) => a / b;

// ARROW ФУНКЦИЯ с един параметър
const square = x => x * x;

// ПАРАМЕТРИ ПО ПОДРАЗБИРАНЕ
function introduce(name = "Гост", age = 0) {
    return \`Аз съм \${name} и съм на \${age} години.\`;
}
console.log(introduce("Мария", 25));
console.log(introduce()); // Използва стойностите по подразбиране

// ФУНКЦИЯ КАТО СТОЙНОСТ
const myFunction = function() {
    return "Анонимна функция";
};

// ВЛОЖЕНИ ФУНКЦИИ
function outer() {
    function inner() {
        return "Вътрешна функция";
    }
    return inner();
}`,
        example: function() {
            displayOutput("=== Демонстрация на функции ===");
            
            function greet(name) {
                return "Здравей, " + name + "!";
            }
            displayOutput(greet("Иван"));
            
            const add = (a, b) => a + b;
            displayOutput(`5 + 3 = ${add(5, 3)}`);
            
            const multiply = (a, b) => a * b;
            displayOutput(`4 * 5 = ${multiply(4, 5)}`);
            
            function introduce(name = "Гост", age = 0) {
                return `Аз съм ${name} и съм на ${age} години.`;
            }
            displayOutput(introduce("Мария", 25));
            displayOutput(introduce());
            
            console.log("Функции демонстрирани успешно!");
        }
    },
    
    'data-1': {
        category: 'Структури данни',
        title: "📊 Урок 7: Масиви (Arrays)",
        description: "Масивите са списъци от елементи, подредени в определен ред. Те са един от най-важните типове данни в JavaScript и имат много полезни методи за работа.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни операции с масиви:</h3>
                <p class="lesson-section-description">
                    <strong>push():</strong> Добавя елемент в края<br>
                    <strong>pop():</strong> Премахва последния елемент<br>
                    <strong>shift():</strong> Премахва първия елемент<br>
                    <strong>unshift():</strong> Добавя елемент в началото<br>
                    <strong>length:</strong> Връща дължината на масива
                </p>
            </div>
            
            <div class="lesson-section">
                <h3 class="lesson-section-title">Полезни методи:</h3>
                <p class="lesson-section-description">
                    <strong>map():</strong> Трансформира всеки елемент<br>
                    <strong>filter():</strong> Филтрира елементи по условие<br>
                    <strong>find():</strong> Намира първия елемент, който отговаря на условие<br>
                    <strong>forEach():</strong> Изпълнява функция за всеки елемент
                </p>
            </div>
        `,
        code: `// СЪЗДАВАНЕ НА МАСИВ
let fruits = ["ябълка", "банан", "портокал"];

// ДОСТЪП ДО ЕЛЕМЕНТИ
console.log(fruits[0]);        // "ябълка" (първи елемент)
console.log(fruits[1]);        // "банан"
console.log(fruits.length);    // 3 (брой елементи)

// ДОБАВЯНЕ НА ЕЛЕМЕНТИ
fruits.push("грозде");         // Добавя в края
fruits.unshift("лимон");       // Добавя в началото

// ПРЕМАХВАНЕ НА ЕЛЕМЕНТИ
fruits.pop();                  // Премахва последния
fruits.shift();                // Премахва първия

// MAP - трансформира всеки елемент
let numbers = [1, 2, 3, 4, 5];
let doubled = numbers.map(n => n * 2);
console.log(doubled);          // [2, 4, 6, 8, 10]

// FILTER - филтрира елементи
let even = numbers.filter(n => n % 2 === 0);
console.log(even);             // [2, 4]

// FIND - намира елемент
let found = fruits.find(f => f === "банан");
console.log(found);            // "банан"

// FOREACH - изпълнява функция за всеки елемент
fruits.forEach(function(fruit, index) {
    console.log(\`\${index + 1}. \${fruit}\`);
});

// INCLUDES - проверява дали съдържа елемент
console.log(fruits.includes("ябълка")); // true

// INDEXOF - намира индекса на елемент
console.log(fruits.indexOf("банан"));    // 1

// SLICE - копира част от масива
let someFruits = fruits.slice(1, 3);    // От индекс 1 до 3

// SPLICE - премахва/добавя елементи
fruits.splice(1, 1, "круша");  // Премахва 1 елемент от индекс 1, добавя "круша"`,
        example: function() {
            displayOutput("=== Демонстрация на масиви ===");
            
            let fruits = ["ябълка", "банан", "портокал"];
            displayOutput(`Масив: ${fruits.join(", ")}`);
            displayOutput(`Дължина: ${fruits.length}`);
            displayOutput(`Първи елемент: ${fruits[0]}`);
            
            fruits.push("грозде");
            displayOutput(`След push: ${fruits.join(", ")}`);
            
            let numbers = [1, 2, 3, 4, 5];
            let doubled = numbers.map(n => n * 2);
            displayOutput(`Удвоени: ${doubled.join(", ")}`);
            
            let even = numbers.filter(n => n % 2 === 0);
            displayOutput(`Четни: ${even.join(", ")}`);
            
            console.log("Масиви демонстрирани успешно!");
        }
    },
    
    'data-2': {
        category: 'Структури данни',
        title: "📦 Урок 8: Обекти (Objects)",
        description: "Обектите са колекции от ключ-стойност двойки. Те позволяват да групираме свързани данни и функционалности заедно, което прави кода по-организиран.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Какво е обект?</h3>
                <p class="lesson-section-description">
                    Обектът е като речник - имаш ключ (името на свойството) и стойност (данните). 
                    Например, обект "човек" може да има ключове като "име", "възраст", "град" и техните стойности.
                </p>
            </div>
            
            <div class="lesson-section">
                <h3 class="lesson-section-title">Методи на обекти:</h3>
                <p class="lesson-section-description">
                    Обектите могат да съдържат не само данни, но и функции (наречени методи). 
                    Методите са функции, които принадлежат на обекта и могат да използват неговите данни.
                </p>
            </div>
        `,
        code: `// СЪЗДАВАНЕ НА ОБЕКТ
let person = {
    name: "Иван",
    age: 30,
    city: "София",
    isStudent: false
};

// ДОСТЪП ДО СВОЙСТВА
console.log(person.name);         // "Иван" (точкова нотация)
console.log(person["age"]);        // 30 (скобкова нотация)

// ДОБАВЯНЕ НА СВОЙСТВА
person.email = "ivan@example.com";
person["phone"] = "0888123456";

// ПРОМЯНА НА СВОЙСТВА
person.age = 31;
person["city"] = "Пловдив";

// МЕТОДИ НА ОБЕКТИ (функции в обект)
let person2 = {
    name: "Мария",
    age: 25,
    greet: function() {
        return "Здравей, аз съм " + this.name;
    },
    // ES6 синтаксис за методи
    introduce() {
        return \`Аз съм \${this.name} и съм на \${this.age} години.\`;
    }
};

console.log(person2.greet());      // "Здравей, аз съм Мария"

// ДЕСТРУКТУРИРАНЕ (ES6)
let { name, age } = person;
console.log(name, age);            // "Иван" 30

// OBJECT.KEYS - всички ключове
console.log(Object.keys(person));  // ["name", "age", "city", ...]

// OBJECT.VALUES - всички стойности
console.log(Object.values(person)); // ["Иван", 30, "София", ...]

// ВЛОЖЕНИ ОБЕКТИ
let student = {
    name: "Петър",
    grades: {
        math: 5,
        english: 6,
        science: 5.5
    }
};

console.log(student.grades.math);   // 5

// ОБЕКТИ В МАСИВИ
let people = [
    { name: "Иван", age: 30 },
    { name: "Мария", age: 25 },
    { name: "Петър", age: 28 }
];`,
        example: function() {
            displayOutput("=== Демонстрация на обекти ===");
            
            let person = {
                name: "Иван",
                age: 30,
                city: "София",
                greet: function() {
                    return "Здравей, аз съм " + this.name;
                }
            };
            
            displayOutput(`Име: ${person.name}`);
            displayOutput(`Възраст: ${person.age}`);
            displayOutput(`Град: ${person.city}`);
            displayOutput(person.greet());
            
            let { name, age } = person;
            displayOutput(`Деструктуриране: ${name}, ${age}`);
            
            console.log("Ключове:", Object.keys(person));
            console.log("Стойности:", Object.values(person));
        }
    },
    
    'dom-1': {
        category: 'DOM Манипулации',
        title: "🌐 Урок 9: DOM Основи (Document Object Model)",
        description: "DOM позволява на JavaScript да взаимодейства с HTML елементи. Можем да четем, променяме, добавяме и премахваме елементи от страницата.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Какво е DOM?</h3>
                <p class="lesson-section-description">
                    DOM (Document Object Model) е представяне на HTML документа като дърво от обекти. 
                    Всеки HTML елемент става обект, който можем да манипулираме с JavaScript.
                </p>
            </div>
            
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни операции:</h3>
                <p class="lesson-section-description">
                    • <strong>Избиране:</strong> getElementById, querySelector<br>
                    • <strong>Промяна:</strong> innerHTML, textContent, style<br>
                    • <strong>Добавяне:</strong> createElement, appendChild<br>
                    • <strong>Събития:</strong> addEventListener
                </p>
            </div>
        `,
        code: `// ИЗБИРАНЕ НА ЕЛЕМЕНТИ
let element = document.getElementById("output");        // По ID
let elements = document.querySelectorAll(".button");    // По клас
let firstButton = document.querySelector("button");      // Първия елемент

// ПРОМЯНА НА СЪДЪРЖАНИЕ
element.innerHTML = "<p>Ново съдържание</p>";           // Позволява HTML
element.textContent = "Текст без HTML";                 // Само текст

// ПРОМЯНА НА СТИЛОВЕ
element.style.color = "red";
element.style.backgroundColor = "blue";
element.style.fontSize = "20px";

// ДОБАВЯНЕ/ПРЕМАХВАНЕ НА КЛАСОВЕ
element.classList.add("active");                         // Добавя клас
element.classList.remove("inactive");                    // Премахва клас
element.classList.toggle("visible");                     // Превключва клас

// СЪЗДАВАНЕ НА НОВИ ЕЛЕМЕНТИ
let newDiv = document.createElement("div");
newDiv.textContent = "Нов елемент";
newDiv.className = "my-class";
element.appendChild(newDiv);                             // Добавя в края

// ПРЕМАХВАНЕ НА ЕЛЕМЕНТИ
element.removeChild(newDiv);                            // Премахва елемент

// СЛУШАТЕЛИ НА СЪБИТИЯ
let button = document.querySelector("button");
button.addEventListener("click", function() {
    console.log("Бутонът е натиснат!");
    alert("Здравей!");
});

// ПРОМЯНА НА АТРИБУТИ
element.setAttribute("id", "new-id");
let id = element.getAttribute("id");

// ПРОВЕРКА ЗА СЪЩЕСТВУВАНЕ
if (element) {
    // Елементът съществува
    element.style.display = "block";
}`,
        example: function() {
            displayOutput("=== Демонстрация на DOM ===");
            displayOutput("Текущият елемент е манипулиран!");
            
            let output = document.getElementById("output");
            let originalBorder = output.style.border;
            
            // Промяна на стил
            output.style.border = "3px solid #667eea";
            output.style.transition = "border 0.3s ease";
            
            displayOutput("Стилът е променен временно!");
            
            setTimeout(() => {
                output.style.border = originalBorder || "2px solid rgba(102, 126, 234, 0.2)";
            }, 2000);
            
            console.log("DOM елементът е манипулиран успешно!");
        }
    },
    
    'modern-1': {
        category: 'Модерен JavaScript (ES6+)',
        title: "🚀 Урок 10: ES6+ Функции",
        description: "ES6 (ECMAScript 2015) и по-новите версии добавиха много нови функции, които правят JavaScript по-модерен и по-лесен за използване.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни нови функции:</h3>
                <p class="lesson-section-description">
                    <strong>Template Literals:</strong> По-лесен начин за създаване на низове с променливи<br>
                    <strong>Деструктуриране:</strong> Извличане на стойности от масиви и обекти<br>
                    <strong>Spread оператор:</strong> Разширяване на масиви и обекти<br>
                    <strong>Arrow функции:</strong> По-кратък синтаксис за функции<br>
                    <strong>Промисове и async/await:</strong> Работа с асинхронни операции
                </p>
            </div>
            
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Модерните функции правят кода по-четим и по-кратък, 
                но винаги помни за съвместимостта с по-стари браузъри!
            </div>
        `,
        code: `// TEMPLATE LITERALS - по-лесен начин за низове
let name = "Иван";
let age = 25;
let greeting = \`Здравей, \${name}! Ти си на \${age} години.\`;
// Много по-лесно от: "Здравей, " + name + "! Ти си на " + age + " години."

// МНОГОРЕДНИ TEMPLATE LITERALS
let message = \`Това е
многореден
текст\`;

// ДЕСТРУКТУРИРАНЕ НА МАСИВИ
let [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1, 2, 3

// ДЕСТРУКТУРИРАНЕ НА ОБЕКТИ
let { x, y } = { x: 10, y: 20 };
console.log(x, y); // 10, 20

// SPREAD ОПЕРАТОР - масиви
let arr1 = [1, 2, 3];
let arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]
let arr3 = [0, ...arr1, 4]; // [0, 1, 2, 3, 4]

// SPREAD ОПЕРАТОР - обекти
let obj1 = { a: 1, b: 2 };
let obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// ARROW ФУНКЦИИ
const add = (a, b) => a + b;
const square = x => x * x;
const greet = () => "Здравей!";

// ARROW ФУНКЦИИ С МНОГО РЕДОВЕ
const process = (data) => {
    let result = data * 2;
    return result + 10;
};

// ПРОМИСОВЕ (PROMISES) - за асинхронни операции
fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// ASYNC/AWAIT - по-чист начин за промисове
async function getData() {
    try {
        let response = await fetch('https://api.example.com/data');
        let data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

// DEFAULT ПАРАМЕТРИ
function greet(name = "Гост") {
    return \`Здравей, \${name}!\`;
}`,
        example: function() {
            displayOutput("=== Демонстрация на ES6+ ===");
            
            // Template literals
            let name = "Иван";
            let greeting = `Здравей, ${name}!`;
            displayOutput(greeting);
            
            // Деструктуриране
            let [a, b, c] = [1, 2, 3];
            displayOutput(`Деструктуриране: a=${a}, b=${b}, c=${c}`);
            
            // Spread оператор
            let arr1 = [1, 2, 3];
            let arr2 = [...arr1, 4, 5];
            displayOutput(`Spread: ${arr2.join(", ")}`);
            
            // Arrow функции
            const square = x => x * x;
            displayOutput(`Квадрат на 5: ${square(5)}`);
            
            console.log("ES6+ функции демонстрирани успешно!");
        }
    }
};

// Функциите за показване на уроци и изпълнение на код са в HTML файла
// Тук са само данните за уроците и помощни функции

// Функция за изчистване на output (ако е нужно от други места)
function clearOutput() {
    const output = document.getElementById("output");
    if (output) {
        output.innerHTML = '';
    }
    console.clear();
}

// Функция за показване на резултати (ако е нужно от други места)
function displayOutput(text, type = '') {
    const output = document.getElementById("output");
    if (!output) return;
    
    const emptyState = output.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const p = document.createElement('p');
    p.textContent = text;
    if (type) {
        p.classList.add(type);
    }
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
}

// Събития и DOM
window.addEventListener("DOMContentLoaded", function() {
    console.log("Страницата е заредена!");
    console.log("Можеш да започнеш да учиш JavaScript!");
});

// Експорт в PDF
function exportToPDF() {
    // Проверка дали html2pdf е зареден
    if (typeof html2pdf === 'undefined') {
        alert('PDF библиотеката не е заредена. Моля, опитай отново след малко.');
        return;
    }

    // Елементът, който искаме да експортираме
    const element = document.querySelector('.container');
    
    // Опции за PDF
    const opt = {
        margin: [10, 10, 10, 10],
        filename: 'javascript-learning-environment.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };

    // Показване на съобщение
    displayOutput('Генериране на PDF...');
    
    // Генериране и изтегляне на PDF
    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            displayOutput('PDF файлът е изтеглен успешно!');
            console.log('PDF експортът е завършен успешно!');
        })
        .catch((error) => {
            console.error('Грешка при експорт в PDF:', error);
            displayOutput('Грешка при генериране на PDF. Провери конзолата за повече информация.');
        });
}
