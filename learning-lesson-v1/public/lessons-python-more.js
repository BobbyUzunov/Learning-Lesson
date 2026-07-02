// Допълнителни подробни уроци по Python (уроци 11–18)
Object.assign(lessonsPython, {
    'tuples-1': {
        category: 'Структури данни',
        title: "📌 Урок 11: Кортежи (tuple) и множества (set)",
        description: "tuple е неизменяем списък – подходящ за координати, дати. set пази уникални елементи без подредба.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">tuple</h3>
                <p class="lesson-section-description">
                    Създава се с кръгли скоби: <code>(1, 2, 3)</code>. Не можеш да променяш елемент след създаване.
                    Разпакетиране: <code>x, y = point</code>
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">set</h3>
                <p class="lesson-section-description">
                    <code>{1, 2, 3}</code> – автоматично премахва дубликати. Бързо membership: <code>x in my_set</code>
                </p>
            </div>
        `,
        code: `# tuple
point = (10, 20)
x, y = point
print(x, y)

person = ("Иван", 25, "София")
print(person[0])

# set
colors = {"червено", "зелено", "синьо", "червено"}
print(colors)

nums = [1, 2, 2, 3, 3, 3]
unique = set(nums)
print(unique)

a = {1, 2, 3}
b = {3, 4, 5}
print(a | b)  # обединение
print(a & b)  # сечение`
    },
    'comprehensions-1': {
        category: 'Модерен Python',
        title: "✨ Урок 12: Comprehensions – елегантни списъци",
        description: "List, dict и set comprehension създават колекции на един ред – по-четимо от цикъл + append.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Синтаксис</h3>
                <p class="lesson-section-description">
                    <code>[x*2 for x in range(5)]</code><br>
                    <code>[x for x in nums if x % 2 == 0]</code> – с филтър<br>
                    <code>{k: v for k, v in pairs}</code> – dict comprehension
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Не прави comprehension твърде дълъг – ако е объркващ, ползвай обикновен for.
            </div>
        `,
        code: `numbers = [1, 2, 3, 4, 5, 6]

squares = [n ** 2 for n in numbers]
print("Квадрати:", squares)

evens = [n for n in numbers if n % 2 == 0]
print("Четни:", evens)

words = ["ябълка", "банан", "портокал"]
lengths = {w: len(w) for w in words}
print(lengths)

matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(matrix)`
    },
    'exceptions-1': {
        category: 'Качествен код',
        title: "🛡️ Урок 13: Изключения (try / except)",
        description: "При грешка Python хвърля exception. try/except го прихваща, за да продължи програмата или да покаже ясно съобщение.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Структура</h3>
                <p class="lesson-section-description">
                    <code>try:</code> рисков код → <code>except ValueError:</code> конкретна грешка → <code>else:</code> ако няма грешка → <code>finally:</code> винаги
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Чести изключения</h3>
                <p class="lesson-section-description">
                    <code>ValueError</code>, <code>TypeError</code>, <code>KeyError</code>, <code>IndexError</code>, <code>FileNotFoundError</code>
                </p>
            </div>
        `,
        code: `def divide(a, b):
    if b == 0:
        raise ValueError("Деление на нула!")
    return a / b

try:
    print(divide(10, 2))
    print(divide(8, 0))
except ValueError as e:
    print("Грешка:", e)
finally:
    print("Край на опита")

# KeyError
data = {"name": "Иван"}
try:
    print(data["email"])
except KeyError:
    print("Ключът липсва – използвай .get()")
print(data.get("email", "няма"))`
    },
    'modules-1': {
        category: 'Организация на код',
        title: "📦 Урок 14: Модули и pip",
        description: "Разделяш кода в файлове (.py). import ги внася. pip инсталира външни пакети (requests, flask).",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Структура на проект</h3>
                <p class="lesson-section-description">
                    <code>main.py</code> – старт &nbsp;|&nbsp; <code>utils.py</code> – помощни функции &nbsp;|&nbsp;
                    <code>requirements.txt</code> – списък пакети за pip
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">pip команди</h3>
                <p class="lesson-section-description">
                    <code>pip install requests</code> &nbsp;|&nbsp; <code>pip freeze > requirements.txt</code>
                </p>
            </div>
        `,
        code: `# utils.py (отделен файл):
# def greet(name):
#     return f"Здравей, {name}!"

# main.py:
# from utils import greet
# print(greet("Иван"))

# Симулация в един файл
import math
import random

print("Пи:", round(math.pi, 2))
print("Случайно 1-6:", random.randint(1, 6))

# Виртуална среда (в терминал):
# python -m venv venv
# source venv/bin/activate   # Mac/Linux`
    },
    'classes-1': {
        category: 'ООП',
        title: "🎭 Урок 15: Класове и обекти",
        description: "class е шаблон за обекти. __init__ инициализира. self е текущият обект. ООП групира данни + поведение.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни части</h3>
                <p class="lesson-section-description">
                    <strong>Атрибути</strong> – променливи на обекта<br>
                    <strong>Методи</strong> – функции в класа (първи параметър <code>self</code>)
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Наследяване</h3>
                <p class="lesson-section-description">
                    <code>class Dog(Animal):</code> – Dog получава методите на Animal и може да ги презапише.
                </p>
            </div>
        `,
        code: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def introduce(self):
        return f"Аз съм {self.name}, на {self.age} години."
    
    def have_birthday(self):
        self.age += 1

p = Person("Мария", 28)
print(p.introduce())
p.have_birthday()
print("След рожден ден:", p.age)

class Student(Person):
    def __init__(self, name, age, course):
        super().__init__(name, age)
        self.course = course
    
    def introduce(self):
        return super().introduce() + f" Уча {self.course}."

s = Student("Иван", 20, "Python")
print(s.introduce())`
    },
    'files-1': {
        category: 'Файлове',
        title: "📄 Урок 16: Работа с файлове",
        description: "with open(...) as f: автоматично затваря файла. Режими: r (четене), w (запис), a (добавяне).",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">with open – най-добрият начин</h3>
                <p class="lesson-section-description">
                    <code>with open("file.txt", "r", encoding="utf-8") as f:</code><br>
                    <code>content = f.read()</code> или <code>for line in f:</code>
                </p>
            </div>
            <div class="warning-box">
                <strong>⚠️:</strong> В Skulpt/браузъра файловете не работят – тествай в терминал с python file.py
            </div>
        `,
        code: `# Работи в терминал (не в браузъра):
"""
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("Ред 1\\n")
    f.write("Ред 2\\n")

with open("notes.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())
"""

# Симулация
lines = ["Ред 1", "Ред 2", "Ред 3"]
content = "\\n".join(lines)
print("Запис:\\n" + content)
print("Брой редове:", len(lines))`
    },
    'json-py-1': {
        category: 'Данни',
        title: "📋 Урок 17: JSON в Python",
        description: "Модулът json чете и записва JSON – стандарт за API и конфигурации.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни функции</h3>
                <p class="lesson-section-description">
                    <code>json.dumps(obj)</code> – обект → низ<br>
                    <code>json.loads(string)</code> – низ → обект<br>
                    <code>json.dump / json.load</code> – директно във файл
                </p>
            </div>
        `,
        code: `import json

user = {
    "name": "Иван",
    "age": 30,
    "skills": ["Python", "SQL"]
}

# Обект → JSON низ
json_string = json.dumps(user, ensure_ascii=False, indent=2)
print(json_string)

# JSON низ → обект
parsed = json.loads(json_string)
print("Име:", parsed["name"])

# Списък от потребители
users = [
    {"id": 1, "name": "Анна"},
    {"id": 2, "name": "Борис"}
]
print(json.dumps(users, ensure_ascii=False))`
    },
    'project-py-1': {
        category: 'Следващи стъпки',
        title: "🎯 Урок 18: Проекти и пътека",
        description: "Идеи за практика и какво да учиш след основите – Django, FastAPI, автоматизация, данни.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Мини проекти</h3>
                <p class="lesson-section-description">
                    1. <strong>Игра „Познай числото“</strong> – random, while, if<br>
                    2. <strong>Телефонен указател</strong> – dict, CRUD в конзола<br>
                    3. <strong>Четене CSV</strong> – файлове, списъци<br>
                    4. <strong>Бот/скрипт</strong> – requests към API
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Напред</h3>
                <p class="lesson-section-description">
                    Web: <strong>Flask</strong> / <strong>FastAPI</strong> &nbsp;|&nbsp; Данни: pandas &nbsp;|&nbsp; Автоматизация: скриптове за файлове
                </p>
            </div>
        `,
        code: `# Мини игра: познай числото
import random

secret = random.randint(1, 10)
attempts = 0
max_attempts = 3

print("Познай число от 1 до 10 (симулация с фиксиран отговор)")

# Симулация на 3 опита
guesses = [5, 8, secret]
for g in guesses:
    attempts += 1
    if g == secret:
        print(f"Позна! Числото е {secret} за {attempts} опита.")
        break
    elif g < secret:
        print(f"{g} – по-голямо")
    else:
        print(f"{g} – по-малко")
else:
    print("Край. Числото беше:", secret)`
    }
});

// Разширени обяснения за първите уроци (по-подробно)
if (lessonsPython['basics-1']) {
    lessonsPython['basics-1'].description = "Променливите са имена за стойности. В Python няма отделна декларация – присвояваш директно. Разбери разликата между променлива и константа (по конвенция).";
    lessonsPython['basics-1'].detailedExplanation += `
        <div class="lesson-section">
            <h3 class="lesson-section-title">Множествено присвояване</h3>
            <p class="lesson-section-description"><code>a, b, c = 1, 2, 3</code> – три променливи наведнъж. <code>x = y = 0</code> – и двете са 0.</p>
        </div>`;
}

topicsByLanguage.python = [
    { id: 'basics-1', label: '📝 1. Променливи' },
    { id: 'basics-2', label: '🔢 2. Типове данни' },
    { id: 'basics-3', label: '⚙️ 3. Оператори' },
    { id: 'control-1', label: '🔀 4. Условия' },
    { id: 'control-2', label: '🔄 5. Цикли' },
    { id: 'functions-1', label: '⚡ 6. Функции' },
    { id: 'data-1', label: '📊 7. Списъци' },
    { id: 'data-2', label: '📦 8. Речници' },
    { id: 'strings-1', label: '💬 9. Низове' },
    { id: 'modern-1', label: '✨ 10. Модерен синтаксис' },
    { id: 'tuples-1', label: '📌 11. Tuple и Set' },
    { id: 'comprehensions-1', label: '✨ 12. Comprehensions' },
    { id: 'exceptions-1', label: '🛡️ 13. try/except' },
    { id: 'modules-1', label: '📦 14. Модули и pip' },
    { id: 'classes-1', label: '🎭 15. Класове' },
    { id: 'files-1', label: '📄 16. Файлове' },
    { id: 'json-py-1', label: '📋 17. JSON' },
    { id: 'project-py-1', label: '🎯 18. Проекти' }
];
