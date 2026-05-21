// Уроци по Swift – подробна програма за начинаещи
const lessonsSwift = {
    'intro-1': {
        category: 'Въведение',
        title: "🍎 Урок 1: Какво е Swift?",
        description: "Swift е модерен език от Apple за iPhone, iPad, Mac, Apple Watch и Apple TV. Създаден е да е безопасен, бърз и лесен за четене.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Защо Swift?</h3>
                <p class="lesson-section-description">
                    • <strong>Безопасност</strong> – компилаторът хваща много грешки преди стартиране<br>
                    • <strong>Ясен синтаксис</strong> – по-малко скоби и „магия“ от стари езици<br>
                    • <strong>Един език</strong> – приложения за цялата Apple екосистема<br>
                    • <strong>Playgrounds</strong> – учиш и тестваш код на Mac/iPad без пълен проект
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Къде пишеш код?</h3>
                <p class="lesson-section-description">
                    <strong>Xcode</strong> (безплатно от Mac App Store) – пълна среда за разработка.<br>
                    <strong>Swift Playgrounds</strong> – приложение за iPad/Mac за начинаещи.<br>
                    Тук в браузъра можеш да четеш, да пишеш и да симулираш прости <code>print</code> редове.
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Всяка инструкция в Swift завършва без точка и запетая (на повечето места не е нужна <code>;</code>).
            </div>
        `,
        code: `// Първата ти програма на Swift
print("Здравей, Swift!")
print("Добре дошъл в програмирането!")

// Можеш да отпечаташ числа
print(42)
print(3.14)`
    },
    'basics-1': {
        category: 'Основи на Swift',
        title: "📝 Урок 2: Променливи – var и let",
        description: "В Swift има два вида „кутии“ за данни: var (променлива) и let (константа). Константата не може да се променя след първото присвояване.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">let срещу var</h3>
                <p class="lesson-section-description">
                    <strong>let</strong> – стойността не се променя (препоръчително по подразбиране).<br>
                    <strong>var</strong> – стойността може да се променя, когато наистина ти трябва.<br>
                    Apple препоръчва: първо използвай <code>let</code>, после <code>var</code> само ако е нужно.
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Именуване</h3>
                <p class="lesson-section-description">
                    camelCase: <code>userName</code>, <code>totalPrice</code>.<br>
                    Константи понякога с главни букви: <code>maxSpeed</code> или <code>MaxSpeed</code> в по-стари стилове.
                </p>
            </div>
            <div class="warning-box">
                <strong>⚠️ Внимание:</strong> Не можеш да използваш променлива преди да ѝ дадеш стойност. Swift изисква инициализация.
            </div>
        `,
        code: `// let – константа (не се променя)
let name = "Иван"
// name = "Петър"  // Грешка!

// var – променлива
var score = 0
score = 10
score = score + 5
print(score)

// Явно указване на тип (рядко е нужно)
let age: Int = 25
let price: Double = 19.99
print(age, price)`
    },
    'basics-2': {
        category: 'Основи на Swift',
        title: "🔢 Урок 3: Типове данни",
        description: "Swift е силно типизиран език – всеки израз има тип. Основните са Int, Double, String, Bool, Array, Dictionary и Optional.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Основни типове</h3>
                <p class="lesson-section-description">
                    <strong>Int</strong> – цели числа &nbsp;|&nbsp; <strong>Double</strong> – десетични &nbsp;|&nbsp;
                    <strong>String</strong> – текст &nbsp;|&nbsp; <strong>Bool</strong> – true/false<br>
                    <strong>Array</strong> – [1, 2, 3] &nbsp;|&nbsp; <strong>Dictionary</strong> – ["ключ": стойност]
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Type inference</h3>
                <p class="lesson-section-description">
                    Компилаторът сам познава типа: <code>let x = 10</code> → Int. 
                    Можеш да зададеш тип ръчно: <code>let x: Double = 10</code>.
                </p>
            </div>
        `,
        code: `let text: String = "Здравей"
let whole: Int = 42
let pi: Double = 3.14159
let isReady: Bool = true

let colors = ["червено", "зелено", "синьо"]
let person: [String: Any] = ["name": "Мария", "age": 30]

print(type(of: text))
print(colors[0])
print(person["name"] ?? "няма")`
    },
    'basics-3': {
        category: 'Основи на Swift',
        title: "⚙️ Урок 4: Оператори",
        description: "Аритметични, сравнение и логически оператори. Swift има и оператори за диапазони (ranges), много удобни в цикли.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Диапазони (Ranges)</h3>
                <p class="lesson-section-description">
                    <code>1...5</code> – затворен диапазон (включва 5)<br>
                    <code>1..&lt;5</code> – полуотворен (до 4)<br>
                    <code>...5</code> – от началото до 5
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> За сравнение използвай <code>==</code> и <code>!=</code>. При низове <code>===</code> не се ползва като в JavaScript.
            </div>
        `,
        code: `let a = 10
let b = 3

print(a + b)
print(a - b)
print(a * b)
print(Double(a) / Double(b))
print(a % b)

print(a > b)
print(a == b)

print(true && false)
print(!true)

// Диапазон
for i in 1...5 {
    print("Число:", i)
}`
    },
    'strings-1': {
        category: 'Низове и текст',
        title: "💬 Урок 5: Низове (String)",
        description: "Низовете в Swift са мощни: интерполация с \\(...), multiline низове, методи като uppercased(), contains(), split().",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Интерполация</h3>
                <p class="lesson-section-description">
                    Вмъкни променливи в текст: <code>"Здравей, \\(name)!"</code> – обратна наклонена черта и скоби.
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Multiline низ</h3>
                <p class="lesson-section-description">
                    Три двойни кавички <code>\"\"\"</code> за няколко реда текст без \\n.
                </p>
            </div>
        `,
        code: `let name = "Иван"
let age = 25

// Интерполация
let greeting = "Здравей, \\(name)! На \\(age) години си."
print(greeting)

// Многореден низ
let poem = """
    Swift е модерен,
    ясен и силен език.
    """
print(poem)

print(name.uppercased())
print(greeting.contains("Иван"))`
    },
    'control-1': {
        category: 'Условия и цикли',
        title: "🔀 Урок 6: Условия (if, switch)",
        description: "if / else if / else работят с фигурни скоби. switch в Swift е много мощен – може да сравнява стойности, диапазони и много case-ове.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">switch – не само числа</h3>
                <p class="lesson-section-description">
                    Всеки <code>case</code> трябва да завърши с <code>break</code> (или <code>return</code>), освен ако не използваш <code>fallthrough</code>.<br>
                    <code>case 1...5:</code> – диапазон &nbsp;|&nbsp; <code>default:</code> – „всичко друго“
                </p>
            </div>
            <div class="warning-box">
                <strong>⚠️ Внимание:</strong> Условието в if трябва да е Bool – няма автоматично 0/1 като в C.
            </div>
        `,
        code: `let temperature = 25

if temperature > 30 {
    print("Много горещо!")
} else if temperature > 20 {
    print("Приятно време!")
} else {
    print("Хладно!")
}

// switch
let grade = "B"
switch grade {
case "A":
    print("Отлично!")
case "B", "C":
    print("Добре")
default:
    print("Учи повече")
}

// Тернарен стил (чрез израз)
let age = 20
let status = age >= 18 ? "Пълнолетен" : "Непълнолетен"
print(status)`
    },
    'control-2': {
        category: 'Условия и цикли',
        title: "🔄 Урок 7: Цикли (for, while)",
        description: "for-in е най-често срещаният цикъл – обхожда масиви, речници, диапазони. while и repeat-while за условия.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">for-in варианти</h3>
                <p class="lesson-section-description">
                    <code>for item in array</code> – всеки елемент<br>
                    <code>for (key, value) in dict</code> – ключ и стойност<br>
                    <code>for i in 0..&lt;10</code> – брояч
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">repeat-while</h3>
                <p class="lesson-section-description">
                    Като do-while в други езици – изпълнява се поне веднъж, после проверява условието.
                </p>
            </div>
        `,
        code: `// for с диапазон
for i in 1...5 {
    print("Итерация:", i)
}

// for върху масив
let fruits = ["ябълка", "банан", "портокал"]
for fruit in fruits {
    print("Плод:", fruit)
}

// for с индекс (enumerated)
for (index, fruit) in fruits.enumerated() {
    print("\\(index + 1). \\(fruit)")
}

// while
var count = 0
while count < 3 {
    print("Брояч:", count)
    count += 1
}`
    },
    'functions-1': {
        category: 'Функции',
        title: "⚡ Урок 8: Функции",
        description: "Функциите в Swift могат да имат имена на параметри, стойности по подразбиране, външни и вътрешни имена (labels) и да връщат няколко стойности.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Параметри с етикети</h3>
                <p class="lesson-section-description">
                    <code>func greet(person name: String)</code> – при извикване: <code>greet(person: "Иван")</code>.<br>
                    Първото име е за четене при извикване, второто – вътре в функцията.
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Множество return стойности</h3>
                <p class="lesson-section-description">
                    Tuple: <code>return (min, max)</code> – връщаш две или повече стойности наведнъж.
                </p>
            </div>
        `,
        code: `// Обикновена функция
func greet(name: String) -> String {
    return "Здравей, \\(name)!"
}
print(greet(name: "Иван"))

// Без return (Void) – или пиши -> Void
func sayHello() {
    print("Здравей!")
}
sayHello()

// Параметър по подразбиране
func introduce(name: String = "Гост", age: Int = 0) {
    print("Аз съм \\(name), на \\(age) години.")
}
introduce()
introduce(name: "Мария", age: 25)

// Няколко стойности
func minMax(_ numbers: [Int]) -> (min: Int, max: Int) {
    return (numbers.min()!, numbers.max()!)
}
let result = minMax([3, 1, 9, 2])
print(result.min, result.max)`
    },
    'collections-1': {
        category: 'Колекции',
        title: "📊 Урок 9: Масиви (Array)",
        description: "Array е подреден списък с един тип елементи. Има count, isEmpty, append, remove, map, filter и др.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Важни свойства и методи</h3>
                <p class="lesson-section-description">
                    <code>.count</code>, <code>.isEmpty</code>, <code>.first</code>, <code>.last</code><br>
                    <code>.append()</code>, <code>.insert()</code>, <code>.remove(at:)</code><br>
                    <code>.map { }</code>, <code>.filter { }</code>, <code>.reduce(0, +)</code>
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Индексите започват от 0. При достъп извън границите програмата спира – внимавай!
            </div>
        `,
        code: `var fruits = ["ябълка", "банан", "портокал"]
print(fruits[0])
print(fruits.count)

fruits.append("грозде")
print(fruits)

// map и filter
let numbers = [1, 2, 3, 4, 5]
let doubled = numbers.map { $0 * 2 }
print(doubled)

let even = numbers.filter { $0 % 2 == 0 }
print(even)

// Обхождане
for (i, n) in numbers.enumerated() {
    print("\\(i): \\(n)")
}`
    },
    'collections-2': {
        category: 'Колекции',
        title: "📦 Урок 10: Речници (Dictionary)",
        description: "Dictionary пази двойки ключ → стойност. Ключовете са уникални. Удобен за настройки, профили, речници с думи.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Достъп и Optional</h3>
                <p class="lesson-section-description">
                    <code>dict["key"]</code> връща Optional – може да няма такъв ключ.<br>
                    <code>dict["key", default: 0]</code> – стойност по подразбиране (Swift 5+).
                </p>
            </div>
        `,
        code: `var person: [String: Any] = [
    "name": "Иван",
    "age": 30,
    "city": "София"
]

print(person["name"] ?? "няма")
person["email"] = "ivan@example.com"

for (key, value) in person {
    print("\\(key): \\(value)")
}

// Типизиран речник
var scores: [String: Int] = ["Иван": 95, "Мария": 88]
scores["Петър"] = 76
print(scores)`
    },
    'structs-1': {
        category: 'Структури и класове',
        title: "🏗️ Урок 11: Структури (struct)",
        description: "struct е начинът да групираш данни и функции. В Swift структурите са много важни – Array и String са структури. Копират се по стойност.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">struct срещу class</h3>
                <p class="lesson-section-description">
                    <strong>struct</strong> – value type, копие при присвояване (по подразбиране за данни).<br>
                    <strong>class</strong> – reference type, споделена референция (за обекти с идентичност).<br>
                    За модели на данни (User, Product) често се ползва struct.
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Memberwise инициализатор</h3>
                <p class="lesson-section-description">
                    Swift автоматично създава инициализатор от свойствата: <code>Person(name: "Иван", age: 25)</code>.
                </p>
            </div>
        `,
        code: `struct Person {
    var name: String
    var age: Int
    
    func introduce() -> String {
        return "Аз съм \\(name), на \\(age) години."
    }
}

let person = Person(name: "Мария", age: 28)
print(person.introduce())

// Промяна (var свойства)
var p2 = Person(name: "Иван", age: 30)
p2.age = 31
print(p2.age)`
    },
    'classes-1': {
        category: 'Структури и класове',
        title: "🎭 Урок 12: Класове (class)",
        description: "class е за обекти с идентичност – две променливи могат да сочат към един и същ обект. Поддържа наследяване (на един родител) и deinit.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Инициализатор (init)</h3>
                <p class="lesson-section-description">
                    <code>init()</code> задава начални стойности. Може да има <code>required init</code> при наследяване.
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Наследяване</h3>
                <p class="lesson-section-description">
                    <code>class Dog: Animal { }</code> – един родител. Метод с <code>override</code> презаписва родителски.
                </p>
            </div>
        `,
        code: `class Animal {
    var name: String
    
    init(name: String) {
        self.name = name
    }
    
    func speak() {
        print("\\(name) издава звук")
    }
}

class Dog: Animal {
    override func speak() {
        print("\\(name) казва: Ав!")
    }
}

let dog = Dog(name: "Рекс")
dog.speak()

// Референция – две променливи, един обект
let a = Dog(name: "Шаро")
let b = a
b.name = "Барон"
print(a.name)  // Барон`
    },
    'optionals-1': {
        category: 'Swift – уникални концепции',
        title: "❓ Урок 13: Optional – стойност или „няма“",
        description: "Optional е най-характерната черта на Swift. Означава „може да има стойност, може да няма“. Пише се с ? след типа: String?",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Unwrapping (разопаковане)</h3>
                <p class="lesson-section-description">
                    <strong>if let</strong> – безопасно: ако има стойност, влез в блока<br>
                    <strong>guard let</strong> – излез рано, ако няма стойность<br>
                    <strong>??</strong> – nil coalescing: <code>name ?? "Гост"</code><br>
                    <strong>!</strong> – force unwrap (опасно, ако си сигурен)
                </p>
            </div>
            <div class="warning-box">
                <strong>⚠️ Внимание:</strong> Force unwrap на nil спира програмата. Избягвай <code>!</code> докато не си напълно сигурен.
            </div>
        `,
        code: `var nickname: String? = nil
nickname = "Иво"

// if let
if let nick = nickname {
    print("Прякор: \\(nick)")
} else {
    print("Няма прякор")
}

// nil coalescing
let display = nickname ?? "Анонимен"
print(display)

// Optional от речник
let ages = ["Иван": 25, "Мария": 30]
let ivanAge = ages["Петър"]  // Int? = nil
print(ivanAge ?? 0)

// guard (в функция)
func printAge(for name: String, in dict: [String: Int]) {
    guard let age = dict[name] else {
        print("Няма данни")
        return
    }
    print(age)
}
printAge(for: "Иван", in: ages)`
    },
    'enums-1': {
        category: 'Swift – уникални концепции',
        title: "🎯 Урок 14: Енумерации (enum)",
        description: "enum групира свързани стойности. В Swift enum може да има associated values и методи – много по-мощни от в други езици.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">enum с raw value</h3>
                <p class="lesson-section-description">
                    <code>enum Status: String { case ok = "OK" }</code> – всяка стойност има низ или число.
                </p>
            </div>
            <div class="lesson-section">
                <h3 class="lesson-section-title">Associated values</h3>
                <p class="lesson-section-description">
                    <code>case success(message: String)</code> – всяка стойност може да носи допълнителни данни.
                </p>
            </div>
        `,
        code: `enum Direction {
    case north, south, east, west
}

var way = Direction.north
way = .east

switch way {
case .north: print("Север")
case .south: print("Юг")
case .east:  print("Изток")
case .west:  print("Запад")
}

// Raw values
enum Grade: String {
    case a = "A", b = "B", c = "C"
}
let g = Grade.a
print(g.rawValue)

// Associated values
enum Result {
    case success(String)
    case failure(Int)
}
let ok: Result = .success("Записано!")
switch ok {
case .success(let msg): print(msg)
case .failure(let code): print("Грешка \\(code)")
}`
    },
    'protocols-1': {
        category: 'Swift – уникални концепции',
        title: "📜 Урок 15: Протоколи (protocol)",
        description: "protocol описва какво трябва да може тип (struct, class, enum) – като интерфейс. Позволява полиморфизъм и тестване.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Защо protocol?</h3>
                <p class="lesson-section-description">
                    Договор: „всеки, който е Describable, има func describe()“. 
                    Различни типове могат да го изпълнят по свой начин.
                </p>
            </div>
            <div class="tip-box">
                <strong>💡 Съвет:</strong> Apple използва протоколи навсякъде – UITableViewDelegate, Codable и др.
            </div>
        `,
        code: `protocol Describable {
    func describe() -> String
}

struct Book: Describable {
    let title: String
    func describe() -> String {
        return "Книга: \\(title)"
    }
}

struct Movie: Describable {
    let name: String
    func describe() -> String {
        return "Филм: \\(name)"
    }
}

let items: [Describable] = [
    Book(title: "Swift Guide"),
    Movie(name: "Coding")
]

for item in items {
    print(item.describe())
}`
    },
    'extensions-1': {
        category: 'Swift – уникални концепции',
        title: "➕ Урок 16: Разширения (extension)",
        description: "extension добавя методи и свойства към съществуващ тип без да променяш оригиналния код – дори към типове от Apple (String, Int).",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Практически примери</h3>
                <p class="lesson-section-description">
                    • Форматиране на <code>Double</code> като цена<br>
                    • Проверка дали <code>String</code> е валиден имейл (опростено)<br>
                    • Групиране на помощни функции
                </p>
            </div>
        `,
        code: `// Разширение на String
extension String {
    func shout() -> String {
        return self.uppercased() + "!"
    }
}

print("здравей".shout())

// Разширение на Int
extension Int {
    func squared() -> Int {
        return self * self
    }
}

print(5.squared())

// Codable – протокол за JSON (споменаваме накратко)
// struct User: Codable { let name: String }
// let data = try JSONEncoder().encode(user)`
    },
    'errors-1': {
        category: 'Грешки и безопасност',
        title: "🛡️ Урок 17: Грешки (Error, try, catch)",
        description: "Swift предпочита явно хващане на грешки с do-try-catch вместо изключения „от нищото“. Функциите маркират опасни операции с throws.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">try варианти</h3>
                <p class="lesson-section-description">
                    <strong>try</strong> – грешката може да се хвърли нагоре<br>
                    <strong>try?</strong> – връща Optional, при грешка nil<br>
                    <strong>try!</strong> – force (опасно)
                </p>
            </div>
        `,
        code: `enum LoginError: Error {
    case wrongPassword
    case userNotFound
}

func login(user: String, password: String) throws {
    if user.isEmpty { throw LoginError.userNotFound }
    if password != "secret" { throw LoginError.wrongPassword }
    print("Влязъл: \\(user)")
}

do {
    try login(user: "Иван", password: "secret")
} catch LoginError.wrongPassword {
    print("Грешна парола")
} catch {
    print("Друга грешка: \\(error)")
}`
    },
    'closures-1': {
        category: 'Напреднали основи',
        title: "🔗 Урок 18: Затваряния (closures)",
        description: "Closure е функция без име – блок код, който може да се подава като параметър. Използва се в map, filter, асинхронни задачи и UI callbacks.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Кратък синтаксис</h3>
                <p class="lesson-section-description">
                    <code>{ $0 + $1 }</code> – $0, $1 са параметрите по ред.<br>
                    Trailing closure – последният closure извън скобите: <code>numbers.map { $0 * 2 }</code>
                </p>
            </div>
        `,
        code: `let numbers = [1, 2, 3, 4, 5]

// Пълен closure
let doubled = numbers.map({ (n: Int) -> Int in
    return n * 2
})

// Съкратен
let tripled = numbers.map { $0 * 3 }

// filter и sorted
let even = numbers.filter { $0 % 2 == 0 }
let sorted = numbers.sorted { $0 > $1 }

print(doubled)
print(tripled)
print(even)
print(sorted)

// Closure като променлива
let greet = { (name: String) -> String in
    "Здравей, \\(name)!"
}
print(greet("Свет"))`
    },
    'projects-1': {
        category: 'Следващи стъпки',
        title: "🚀 Урок 19: Къде да продължиш",
        description: "След основите: SwiftUI за приложения, UIKit за по-стари проекти, Playgrounds за експерименти, документацията на Apple.",
        detailedExplanation: `
            <div class="lesson-section">
                <h3 class="lesson-section-title">Пътека за начинаещ</h3>
                <p class="lesson-section-description">
                    1. Упражнявай се в <strong>Swift Playgrounds</strong> или Xcode Playground<br>
                    2. Малко приложение: списък със задачи (To-Do)<br>
                    3. Научи <strong>SwiftUI</strong> – декларативен UI<br>
                    4. Прочети <strong>Apple Developer Documentation</strong> – docs.swift.org
                </p>
            </div>
            <div class="read-next-step" style="background:#e6f4ea;padding:14px;border-radius:8px;border-left:4px solid #28a745;">
                <strong>🎯 Цел:</strong> Направи Playground в Xcode с 5–10 print и една struct Person – така затвърчваш всичко от този курс.
            </div>
        `,
        code: `// Обобщение – малък пример
struct Student {
    let name: String
    var grades: [Int]
    
    var average: Double {
        guard !grades.isEmpty else { return 0 }
        return Double(grades.reduce(0, +)) / Double(grades.count)
    }
}

let student = Student(name: "Анна", grades: [5, 6, 5, 4])
print("\\(student.name): среден \\(student.average)")

if student.average >= 5.5 {
    print("Отлично представяне!")
} else {
    print("Може още да се подобри.")
}`
    }
};

// 19 теми за Swift – по-подробна програма
topicsByLanguage.swift = [
    { id: 'intro-1', label: '🍎 1. Какво е Swift?' },
    { id: 'basics-1', label: '📝 2. var и let' },
    { id: 'basics-2', label: '🔢 3. Типове данни' },
    { id: 'basics-3', label: '⚙️ 4. Оператори' },
    { id: 'strings-1', label: '💬 5. Низове' },
    { id: 'control-1', label: '🔀 6. if и switch' },
    { id: 'control-2', label: '🔄 7. Цикли' },
    { id: 'functions-1', label: '⚡ 8. Функции' },
    { id: 'collections-1', label: '📊 9. Масиви' },
    { id: 'collections-2', label: '📦 10. Речници' },
    { id: 'structs-1', label: '🏗️ 11. struct' },
    { id: 'classes-1', label: '🎭 12. class' },
    { id: 'optionals-1', label: '❓ 13. Optional' },
    { id: 'enums-1', label: '🎯 14. enum' },
    { id: 'protocols-1', label: '📜 15. protocol' },
    { id: 'extensions-1', label: '➕ 16. extension' },
    { id: 'errors-1', label: '🛡️ 17. Грешки' },
    { id: 'closures-1', label: '🔗 18. Closures' },
    { id: 'projects-1', label: '🚀 19. Следващи стъпки' }
];

defaultCodeByLanguage.swift = `// Swift – пиши код тук
// За пълно изпълнение: Xcode Playground или Swift Playgrounds

print("Здравей, Swift!")

let name = "Иван"
print("Име: \\(name)")

func greet(name: String) -> String {
    return "Здравей, \\(name)!"
}
print(greet(name: "Свет"))`;
