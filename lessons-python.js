// Уроци по Python (същата структура като JavaScript)
const lessonsPython = {
    'basics-1': {
        category: 'Основи на Python',
        title: "📝 Урок 1: Променливи",
        description: "В Python променливите се създават директно с присвояване. Не пишем let или const – просто име = стойност.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Какво е променлива?</h3>
                <p class="lesson-section-description">
                    Променливата е име за стойност в паметта. В Python присвояването е с <code>име = стойност</code>.
                    Типът се определя автоматично от стойността.
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Използвай snake_case за имена: <code>user_name</code>, <code>total_price</code>.
            </div>
        `,
        code: `# Променливи в Python
name = "Иван"
age = 25

# Можем да променяме стойността
name = "Петър"
print(name)

# Няколко присвоявания наведнъж
x, y, z = 1, 2, 3
print(x, y, z)`
    },
    'basics-2': {
        category: 'Основи на Python',
        title: "🔢 Урок 2: Типове данни",
        description: "Основните типове в Python са: str (текст), int, float, bool, list, dict и None.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни типове:</h3>
                <p class="lesson-section-description">
                    <strong>str</strong> – текст &nbsp;|&nbsp; <strong>int / float</strong> – числа &nbsp;|&nbsp;
                    <strong>bool</strong> – True/False &nbsp;|&nbsp; <strong>list</strong> – списък &nbsp;|&nbsp;
                    <strong>dict</strong> – речник (ключ → стойност) &nbsp;|&nbsp; <strong>None</strong> – празна стойност
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Провери типа с <code>type(променлива)</code> или <code>isinstance(x, int)</code>.
            </div>
        `,
        code: `text = "Здравей"
number = 42
decimal = 3.14
is_active = True
colors = ["червено", "зелено", "синьо"]
person = {"name": "Мария", "age": 30}

print(type(text))
print(type(number))
print(colors)
print(person["name"])`
    },
    'basics-3': {
        category: 'Основи на Python',
        title: "⚙️ Урок 3: Оператори",
        description: "Аритметични (+, -, *, /, //, %, **), сравнение (==, !=, &gt;, &lt;) и логически (and, or, not).",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Важни оператори:</h3>
                <p class="lesson-section-description">
                    <strong>//</strong> – целочислено деление &nbsp;|&nbsp; <strong>%</strong> – остатък &nbsp;|&nbsp;
                    <strong>**</strong> – степен &nbsp;|&nbsp; Използвай <strong>==</strong> за сравнение на равенство.
                </p>
            </div>
        `,
        code: `a = 10
b = 3

print(a + b)   # 13
print(a - b)   # 7
print(a * b)   # 30
print(a / b)   # 3.333...
print(a // b)  # 3 (цело число)
print(a % b)   # 1
print(a ** b)  # 1000

print(a > b)
print(a == b)
print(True and False)
print(not True)`
    },
    'control-1': {
        category: 'Условия и цикли',
        title: "🔀 Урок 4: Условия (if / elif / else)",
        description: "С if проверяваме условие и изпълняваме различен код. elif е „иначе ако“, else – „в противен случай“.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Отстъпи са задължителни!</h3>
                <p class="lesson-section-description">
                    В Python блоковете се отделят с <strong>отстъп (4 интервала или Tab)</strong>, не с фигурни скоби.
                </p>
            </div>
            <div class="warning-box">
                <strong>⚠️ Внимание:</strong> Грешка в отстъпа води до IndentationError.
            </div>
        `,
        code: `temperature = 25

if temperature > 30:
    print("Много горещо!")
elif temperature > 20:
    print("Приятно време!")
else:
    print("Хладно!")

# Тернарен израз (кратък if)
age = 20
status = "Пълнолетен" if age >= 18 else "Непълнолетен"
print(status)`
    },
    'control-2': {
        category: 'Условия и цикли',
        title: "🔄 Урок 5: Цикли (for и while)",
        description: "for обхожда последователност (списък, range). while повтаря, докато условието е вярно.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">range()</h3>
                <p class="lesson-section-description">
                    <code>range(5)</code> дава 0,1,2,3,4. <code>range(1, 6)</code> дава 1 до 5.
                    <code>range(0, 10, 2)</code> – стъпка 2.
                </p>
            </div>
        `,
        code: `# for с range
for i in range(1, 6):
    print("Итерация:", i)

# for върху списък
fruits = ["ябълка", "банан", "портокал"]
for fruit in fruits:
    print("Плод:", fruit)

# while
count = 0
while count < 3:
    print("Брояч:", count)
    count += 1`
    },
    'functions-1': {
        category: 'Функции',
        title: "⚡ Урок 6: Функции (def)",
        description: "Функциите групират код, който използваме многократно. Дефинират се с def и могат да връщат стойност с return.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Синтаксис</h3>
                <p class="lesson-section-description">
                    <code>def име(параметри):</code> – следва блок с отстъп. 
                    <code>return</code> връща резултат (без return функцията връща None).
                </p>
            </div>
        `,
        code: `def greet(name):
    return "Здравей, " + name + "!"

print(greet("Иван"))

def add(a, b):
    return a + b

print(add(5, 3))

# Параметър по подразбиране
def introduce(name="Гост", age=0):
    return f"Аз съм {name}, на {age} години."

print(introduce("Мария", 25))
print(introduce())`
    },
    'data-1': {
        category: 'Структури данни',
        title: "📊 Урок 7: Списъци (lists)",
        description: "Списъците са подредени колекции. Индекси започват от 0. Много полезни методи: append, pop, len, sort.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Често използвани методи</h3>
                <p class="lesson-section-description">
                    <code>append()</code>, <code>insert()</code>, <code>pop()</code>, <code>len()</code>,
                    <code>sort()</code>, <code>reverse()</code>, срезове <code>list[1:4]</code>
                </p>
            </div>
        `,
        code: `fruits = ["ябълка", "банан", "портокал"]
print(fruits[0])
print(len(fruits))

fruits.append("грозде")
print(fruits)

numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print(doubled)

even = [n for n in numbers if n % 2 == 0]
print(even)`
    },
    'data-2': {
        category: 'Структури данни',
        title: "📦 Урок 8: Речници (dict)",
        description: "Речницът пази двойки ключ → стойност. Бърз достъп по ключ. Подобен на „обект“ в JavaScript.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Достъп и методи</h3>
                <p class="lesson-section-description">
                    <code>person["name"]</code> или <code>person.get("name")</code>.
                    <code>keys()</code>, <code>values()</code>, <code>items()</code> за обхождане.
                </p>
            </div>
        `,
        code: `person = {
    "name": "Иван",
    "age": 30,
    "city": "София"
}

print(person["name"])
print(person.get("email", "няма"))

person["email"] = "ivan@example.com"
print(person)

for key, value in person.items():
    print(key, ":", value)`
    },
    'strings-1': {
        category: 'Текст и низове',
        title: "📝 Урок 9: Работа с низове (strings)",
        description: "Низовете са неизменяеми. Методи: upper, lower, strip, split, replace. f-strings за вмъкване на променливи.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">f-strings</h3>
                <p class="lesson-section-description">
                    <code>f"Здравей, {name}!"</code> – най-удобният начин за текст с променливи в Python 3.6+.
                </p>
            </div>
        `,
        code: `name = "Иван"
age = 25

# f-string
message = f"Здравей, {name}! На {age} години си."
print(message)

text = "  Python  "
print(text.strip())
print(text.upper())

words = "ябълка,банан,портокал".split(",")
print(words)`
    },
    'modern-1': {
        category: 'Модерен Python',
        title: "🚀 Урок 10: Модерни възможности",
        description: "List comprehensions, enumerate, zip, type hints (основи). Код по-кратък и четим.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">List comprehension</h3>
                <p class="lesson-section-description">
                    <code>[израз for елемент in списък if условие]</code> – създава нов списък на един ред.
                </p>
            </div>
        `,
        code: `# List comprehension
squares = [x ** 2 for x in range(1, 6)]
print(squares)

# enumerate – индекс + стойност
fruits = ["ябълка", "банан"]
for i, fruit in enumerate(fruits):
    print(i, fruit)

# zip – два списъка заедно
names = ["Иван", "Мария"]
ages = [25, 30]
for name, age in zip(names, ages):
    print(name, age)`
    }
};

// Конфигурация на темите за двата езика
const topicsByLanguage = {
    javascript: [
        { id: 'basics-1', label: '📝 1. Променливи' },
        { id: 'basics-2', label: '🔢 2. Типове данни' },
        { id: 'basics-3', label: '⚙️ 3. Оператори' },
        { id: 'control-1', label: '🔀 4. Условия' },
        { id: 'control-2', label: '🔄 5. Цикли' },
        { id: 'functions-1', label: '⚡ 6. Функции' },
        { id: 'data-1', label: '📊 7. Масиви' },
        { id: 'data-2', label: '📦 8. Обекти' },
        { id: 'dom-1', label: '🌐 9. DOM' },
        { id: 'modern-1', label: '✨ 10. ES6+' },
        { id: 'strings-1', label: '💬 11. Низове' },
        { id: 'scope-1', label: '🔒 12. Scope' },
        { id: 'events-1', label: '🖱️ 13. Събития' },
        { id: 'errors-1', label: '🛡️ 14. try/catch' },
        { id: 'promises-1', label: '⏳ 15. Promises' },
        { id: 'async-1', label: '⚡ 16. async/await' },
        { id: 'storage-1', label: '💾 17. localStorage' },
        { id: 'project-1', label: '🎯 18. Проекти' }
    ],
    python: [
        { id: 'basics-1', label: '📝 1. Променливи' },
        { id: 'basics-2', label: '🔢 2. Типове данни' },
        { id: 'basics-3', label: '⚙️ 3. Оператори' },
        { id: 'control-1', label: '🔀 4. Условия' },
        { id: 'control-2', label: '🔄 5. Цикли' },
        { id: 'functions-1', label: '⚡ 6. Функции' },
        { id: 'data-1', label: '📊 7. Списъци' },
        { id: 'data-2', label: '📦 8. Речници' },
        { id: 'strings-1', label: '📝 9. Низове' },
        { id: 'modern-1', label: '🚀 10. Модерен Python' }
    ]
};

const defaultCodeByLanguage = {
    javascript: `// Напиши своя JavaScript код тук
let greeting = "Здравей, JavaScript!";
console.log(greeting);

function sayHello(name) {
    return "Здравей, " + name + "!";
}
console.log(sayHello("Свет"));`,
    python: `# Напиши своя Python код тук
greeting = "Здравей, Python!"
print(greeting)

def say_hello(name):
    return "Здравей, " + name + "!"

print(say_hello("Свет"))`
};
