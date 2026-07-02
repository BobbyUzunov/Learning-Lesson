import type { Language } from "./i18n";

export type QuizTopic =
  | "html"
  | "css"
  | "javascript"
  | "dom"
  | "fetch"
  | "react"
  | "api"
  | "quiz-generator"
  | "fullstack"
  | "ai"
  | "mobile"
  | "product";

export type QuizQuestion = {
  id: string;
  topic: QuizTopic;
  question: string;
  questionBg: string;
  options: string[];
  optionsBg: string[];
  correctIndex: number;
  explanation: string;
  explanationBg: string;
};

const questionBank: QuizQuestion[] = [
  {
    id: "html-1",
    topic: "html",
    question: "Which element is best for a self-contained piece of content?",
    questionBg: "Кой елемент е най-подходящ за самостоятелна част от съдържание?",
    options: ["<div>", "<article>", "<span>", "<b>"],
    optionsBg: ["<div>", "<article>", "<span>", "<b>"],
    correctIndex: 1,
    explanation: "article groups independent content like cards or posts.",
    explanationBg: "article групира самостоятелно съдържание като карти или постове."
  },
  {
    id: "html-2",
    topic: "html",
    question: "What does semantic HTML improve?",
    questionBg: "Какво подобрява семантичният HTML?",
    options: ["Only colors", "Accessibility and structure", "Database speed", "Git commits"],
    optionsBg: ["Само цветовете", "Достъпност и структура", "Скорост на базата", "Git commits"],
    correctIndex: 1,
    explanation: "Semantic tags help screen readers and make layouts easier to reason about.",
    explanationBg: "Семантичните тагове помагат на screen readers и правят layout-а по-ясен."
  },
  {
    id: "html-3",
    topic: "html",
    question: "Which attribute makes a button submit a form by default?",
    questionBg: "Кой атрибут кара бутон да изпраща форма по подразбиране?",
    options: ['type="button"', 'type="submit"', 'role="button"', "href='#'"],
    optionsBg: ['type="button"', 'type="submit"', 'role="button"', "href='#'"],
    correctIndex: 1,
    explanation: 'Buttons inside forms default to type="submit" unless you change it.',
    explanationBg: 'Бутоните във форма са type="submit" по подразбиране, освен ако го смениш.'
  },
  {
    id: "css-1",
    topic: "css",
    question: "Which property creates space inside an element?",
    questionBg: "Кое свойство създава пространство вътре в елемент?",
    options: ["margin", "padding", "border-radius", "z-index"],
    optionsBg: ["margin", "padding", "border-radius", "z-index"],
    correctIndex: 1,
    explanation: "Padding adds inner space; margin adds outer space.",
    explanationBg: "Padding добавя вътрешно пространство; margin — външно."
  },
  {
    id: "css-2",
    topic: "css",
    question: "Which layout is best for a simple two-column card?",
    questionBg: "Кой layout е най-добър за проста карта с две колони?",
    options: ["float", "display: grid", "text-align", "position: fixed"],
    optionsBg: ["float", "display: grid", "text-align", "position: fixed"],
    correctIndex: 1,
    explanation: "CSS Grid handles columns and gaps with little code.",
    explanationBg: "CSS Grid управлява колони и gap-ове с малко код."
  },
  {
    id: "css-3",
    topic: "css",
    question: "What does border-radius change?",
    questionBg: "Какво променя border-radius?",
    options: ["Text color", "Corner roundness", "Font size", "Line height"],
    optionsBg: ["Цвета на текста", "Заобленост на ъглите", "Размера на шрифта", "Височина на реда"],
    correctIndex: 1,
    explanation: "border-radius rounds the corners of a box.",
    explanationBg: "border-radius заобля ъглите на box."
  },
  {
    id: "js-1",
    topic: "javascript",
    question: "Which keyword should you prefer for values that do not change?",
    questionBg: "Коя дума е по-добра за стойности, които не се променят?",
    options: ["var", "let", "const", "static"],
    optionsBg: ["var", "let", "const", "static"],
    correctIndex: 2,
    explanation: "const prevents reassignment and makes intent clearer.",
    explanationBg: "const спира повторно присвояване и прави кода по-ясен."
  },
  {
    id: "js-2",
    topic: "javascript",
    question: "What does a function return if there is no return statement?",
    questionBg: "Какво връща функция без return?",
    options: ["0", "null", "undefined", "false"],
    optionsBg: ["0", "null", "undefined", "false"],
    correctIndex: 2,
    explanation: "JavaScript functions return undefined by default.",
    explanationBg: "JavaScript функциите връщат undefined по подразбиране."
  },
  {
    id: "js-3",
    topic: "javascript",
    question: "Which method adds one item to the end of an array?",
    questionBg: "Кой метод добавя един елемент в края на масив?",
    options: ["push()", "pop()", "shift()", "slice()"],
    optionsBg: ["push()", "pop()", "shift()", "slice()"],
    correctIndex: 0,
    explanation: "push() mutates the array and returns the new length.",
    explanationBg: "push() променя масива и връща новата дължина."
  },
  {
    id: "dom-1",
    topic: "dom",
    question: "Which API listens for user clicks?",
    questionBg: "Кой API слуша за кликове на потребителя?",
    options: ["addEventListener('click')", "querySelector('click')", "JSON.parse()", "fetch()"],
    optionsBg: ["addEventListener('click')", "querySelector('click')", "JSON.parse()", "fetch()"],
    correctIndex: 0,
    explanation: "Event listeners connect user actions to your JavaScript logic.",
    explanationBg: "Event listeners свързват действията на потребителя с JavaScript логиката."
  },
  {
    id: "dom-2",
    topic: "dom",
    question: "What does document.querySelector('.card') return?",
    questionBg: "Какво връща document.querySelector('.card')?",
    options: ["All cards", "The first matching element", "A CSS file", "An event"],
    optionsBg: ["Всички карти", "Първия съвпадащ елемент", "CSS файл", "Event"],
    correctIndex: 1,
    explanation: "querySelector returns the first match for a CSS selector.",
    explanationBg: "querySelector връща първото съвпадение за CSS селектор."
  },
  {
    id: "fetch-1",
    topic: "fetch",
    question: "What does fetch() return?",
    questionBg: "Какво връща fetch()?",
    options: ["JSON directly", "A Promise", "An array", "A DOM node"],
    optionsBg: ["JSON директно", "Promise", "Масив", "DOM node"],
    correctIndex: 1,
    explanation: "fetch resolves to a Response object after the network request.",
    explanationBg: "fetch връща Response обект след мрежовата заявка."
  },
  {
    id: "fetch-2",
    topic: "fetch",
    question: "Which HTTP method is commonly used to create data?",
    questionBg: "Кой HTTP метод се ползва най-често за създаване на данни?",
    options: ["GET", "POST", "DELETE", "OPTIONS"],
    optionsBg: ["GET", "POST", "DELETE", "OPTIONS"],
    correctIndex: 1,
    explanation: "POST sends a body to create or submit new data.",
    explanationBg: "POST изпраща body за създаване или изпращане на нови данни."
  },
  {
    id: "react-1",
    topic: "react",
    question: "What is a React component?",
    questionBg: "Какво е React component?",
    options: ["A database table", "A reusable UI function", "A CSS file", "A Git branch"],
    optionsBg: ["Таблица в база", "Преизползваема UI функция", "CSS файл", "Git branch"],
    correctIndex: 1,
    explanation: "Components let you split UI into reusable pieces with props and state.",
    explanationBg: "Components разделят UI на преизползваеми части с props и state."
  },
  {
    id: "react-2",
    topic: "react",
    question: "How do you pass data into a child component?",
    questionBg: "Как подаваш данни към child component?",
    options: ["With props", "With SQL", "With padding", "With return only"],
    optionsBg: ["С props", "С SQL", "С padding", "Само с return"],
    correctIndex: 0,
    explanation: "Props are the standard way to pass read-only data into components.",
    explanationBg: "Props са стандартният начин да подадеш read-only данни към components."
  },
  {
    id: "api-1",
    topic: "api",
    question: "What should a good API response include?",
    questionBg: "Какво трябва да включва добър API response?",
    options: ["Random HTML", "Predictable JSON shape", "Only images", "Private keys"],
    optionsBg: ["Случаен HTML", "Предвидима JSON форма", "Само изображения", "Частни ключове"],
    correctIndex: 1,
    explanation: "Consistent JSON makes frontend rendering and error handling easier.",
    explanationBg: "Консистентният JSON улеснява render-а и error handling-а."
  },
  {
    id: "api-2",
    topic: "api",
    question: "Which HTTP status code fits a missing required field?",
    questionBg: "Кой HTTP status code е подходящ за липсващо задължително поле?",
    options: ["200", "400", "404", "500"],
    optionsBg: ["200", "400", "404", "500"],
    correctIndex: 1,
    explanation: "400 Bad Request tells the client the input was invalid.",
    explanationBg: "400 Bad Request казва на клиента, че входът е невалиден."
  },
  {
    id: "api-3",
    topic: "api",
    question: "Where should Supabase service role keys live?",
    questionBg: "Къде трябва да живеят Supabase service role ключовете?",
    options: ["In a public React component", "Server-only environment variables", "In README", "In CSS"],
    optionsBg: ["В публичен React component", "Server-only environment variables", "В README", "В CSS"],
    correctIndex: 1,
    explanation: "Service role keys bypass RLS and must never ship to the browser.",
    explanationBg: "Service role ключовете заобикалят RLS и никога не трябва да отиват в браузъра."
  },
  {
    id: "api-4",
    topic: "api",
    question: "What should a protected route return when there is no session?",
    questionBg: "Какво трябва да върне защитен route, когато няма сесия?",
    options: ["200 with empty body", "401 Unauthorized", "302 to homepage", "500"],
    optionsBg: ["200 с празно body", "401 Unauthorized", "302 към homepage", "500"],
    correctIndex: 1,
    explanation: "401 clearly signals that authentication is required.",
    explanationBg: "401 ясно показва, че е нужна автентикация."
  },
  {
    id: "api-5",
    topic: "api",
    question: "How do you read JSON from a Next.js route handler request?",
    questionBg: "Как четеш JSON от request в Next.js route handler?",
    options: ["request.text()", "await request.json()", "request.headers.json()", "JSON.parse(request)"],
    optionsBg: ["request.text()", "await request.json()", "request.headers.json()", "JSON.parse(request)"],
    correctIndex: 1,
    explanation: "request.json() parses the body into a JavaScript object.",
    explanationBg: "request.json() парсва body към JavaScript обект."
  },
  {
    id: "quiz-gen-1",
    topic: "quiz-generator",
    question: "What input does a quiz generator need at minimum?",
    questionBg: "Какво трябва да има генераторът за въпроси като минимум?",
    options: ["A topic and question bank", "A printer", "A video file", "A CSS reset"],
    optionsBg: ["Тема и банка от въпроси", "Принтер", "Видео файл", "CSS reset"],
    correctIndex: 0,
    explanation: "Pick a topic, filter questions, then randomly select a few for practice.",
    explanationBg: "Избери тема, филтрирай въпросите и случайно избери няколко за практика."
  },
  {
    id: "quiz-gen-2",
    topic: "quiz-generator",
    question: "Why store both question and answer in quiz data?",
    questionBg: "Защо quiz данните пазят и въпрос, и отговор?",
    options: ["For instant feedback", "For slower pages", "To hide the UI", "To remove XP"],
    optionsBg: ["За моментален feedback", "За по-бавни страници", "За скриване на UI", "За премахване на XP"],
    correctIndex: 0,
    explanation: "Structured quiz objects let the app check answers and explain mistakes.",
    explanationBg: "Структурираните quiz обекти позволяват проверка и обяснение на грешки."
  },
  {
    id: "fullstack-1",
    topic: "fullstack",
    question: "What happens first when a learner completes a mission?",
    questionBg: "Какво се случва първо, когато learner завърши мисия?",
    options: ["Database backup", "Client calls an API route", "CSS reload", "Git commit"],
    optionsBg: ["Database backup", "Client вика API route", "CSS reload", "Git commit"],
    correctIndex: 1,
    explanation: "The UI sends the completion to an API route before data is persisted.",
    explanationBg: "UI изпраща завършването към API route, преди данните да се запишат."
  },
  {
    id: "fullstack-2",
    topic: "fullstack",
    question: "Where should guest progress live before login?",
    questionBg: "Къде трябва да живее guest progress преди login?",
    options: ["Supabase only", "localStorage", "Cookies only", "README"],
    optionsBg: ["Само Supabase", "localStorage", "Само cookies", "README"],
    correctIndex: 1,
    explanation: "Guests can store progress locally until they authenticate and sync.",
    explanationBg: "Guests могат да пазят progress локално, докато не се authenticate-нат и sync-нат."
  },
  {
    id: "fullstack-3",
    topic: "fullstack",
    question: "Which routes should require authentication in this app?",
    questionBg: "Кои routes трябва да изискват authentication в това app?",
    options: ["/lesson/1", "/dashboard and /profile", "/paths only", "/register"],
    optionsBg: ["/lesson/1", "/dashboard и /profile", "Само /paths", "/register"],
    correctIndex: 1,
    explanation: "Personal progress views should be protected while public onboarding stays open.",
    explanationBg: "Личните progress изгледи трябва да са защитени, а public onboarding остава отворен."
  },
  {
    id: "ai-1",
    topic: "ai",
    question: "Why ask AI for JSON output?",
    questionBg: "Защо да искаш JSON output от AI?",
    options: ["To slow the app", "So the app can parse fields safely", "To hide answers", "To remove hints"],
    optionsBg: ["За да забави app-а", "За да parse-не полетата safely", "За да скрие отговори", "За да махне hints"],
    correctIndex: 1,
    explanation: "Structured JSON makes rendering and validation predictable.",
    explanationBg: "Структурираният JSON прави render-а и validation предвидими."
  },
  {
    id: "ai-2",
    topic: "ai",
    question: "What should never be sent to an AI provider?",
    questionBg: "Какво никога не трябва да се изпраща към AI provider?",
    options: ["Lesson topic", "Service role keys", "Beginner level", "HTML topic"],
    optionsBg: ["Lesson topic", "Service role keys", "Beginner level", "HTML topic"],
    correctIndex: 1,
    explanation: "Secrets must stay on the server and out of prompts.",
    explanationBg: "Secrets трябва да останат на сървъра и извън prompts."
  },
  {
    id: "ai-3",
    topic: "ai",
    question: "What should you validate in AI quiz output?",
    questionBg: "Какво трябва да валидираш в AI quiz output?",
    options: ["Font color only", "correctIndex and options length", "Git branch", "Image size"],
    optionsBg: ["Само font color", "correctIndex и options length", "Git branch", "Image size"],
    correctIndex: 1,
    explanation: "Bounds checks prevent broken quizzes from reaching learners.",
    explanationBg: "Bounds checks спират счупени quizzes да стигнат до learners."
  },
  {
    id: "mobile-1",
    topic: "mobile",
    question: "What is a good minimum touch target height?",
    questionBg: "Каква е добра минимална touch target височина?",
    options: ["12px", "48px", "2px", "200px"],
    optionsBg: ["12px", "48px", "2px", "200px"],
    correctIndex: 1,
    explanation: "Around 44–48px is a common accessible tap target size.",
    explanationBg: "Около 44–48px е често срещан accessible tap target размер."
  },
  {
    id: "mobile-2",
    topic: "mobile",
    question: "What does width=device-width do?",
    questionBg: "Какво прави width=device-width?",
    options: ["Hides the navbar", "Matches layout width to the device screen", "Deletes CSS", "Adds XP"],
    optionsBg: ["Скрива navbar", "Съпоставя layout width с device screen", "Изтрива CSS", "Добавя XP"],
    correctIndex: 1,
    explanation: "It prevents mobile browsers from rendering a tiny scaled desktop page.",
    explanationBg: "Спира mobile browsers да render-ват намалена desktop страница."
  },
  {
    id: "mobile-3",
    topic: "mobile",
    question: "How should quest cards behave on phones?",
    questionBg: "Как трябва да се държат quest cards на телефони?",
    options: ["Five columns", "Single column stack", "Horizontal scroll only", "Hidden"],
    optionsBg: ["Пет колони", "Една колона", "Само horizontal scroll", "Скрити"],
    correctIndex: 1,
    explanation: "A single column keeps cards readable without sideways scrolling.",
    explanationBg: "Една колона държи cards четими без horizontal scrolling."
  },
  {
    id: "product-1",
    topic: "product",
    question: "What is a good first deploy goal for an MVP?",
    questionBg: "Каква е добра първа deploy цел за MVP?",
    options: ["Perfect design only", "Working auth and progress loop", "100 quests", "No database"],
    optionsBg: ["Само perfect design", "Работещ auth и progress loop", "100 quests", "Без database"],
    correctIndex: 1,
    explanation: "Ship the core learning loop before adding every planned feature.",
    explanationBg: "Ship-вай core learning loop, преди да добавиш всяка планирана feature."
  },
  {
    id: "product-2",
    topic: "product",
    question: "Which tables store learner state in this app?",
    questionBg: "Кои таблици пазят learner state в това app?",
    options: ["profiles and user_progress", "Only CSS files", "Git branches", "Vercel logs"],
    optionsBg: ["profiles и user_progress", "Само CSS files", "Git branches", "Vercel logs"],
    correctIndex: 0,
    explanation: "Profiles track XP and user metadata; user_progress stores completed lessons.",
    explanationBg: "Profiles следят XP и user metadata; user_progress пази завършени уроци."
  },
  {
    id: "product-3",
    topic: "product",
    question: "What makes a Cursor task prompt effective?",
    questionBg: "Какво прави Cursor task prompt ефективен?",
    options: ["Vague goals", "Clear scope and expected files", "No context", "Only emojis"],
    optionsBg: ["Неясни цели", "Ясен scope и expected files", "Без context", "Само emojis"],
    correctIndex: 1,
    explanation: "Specific scope and file targets produce smaller, reviewable changes.",
    explanationBg: "Конкретният scope и file targets дават по-малки, reviewable промени."
  }
];

const lessonTopicMap: Record<string, QuizTopic> = {
  "1": "html",
  "2": "css",
  "8": "javascript",
  "9": "javascript",
  "10": "dom",
  "11": "fetch",
  "12": "react",
  "13": "quiz-generator",
  "3": "api",
  "14": "api",
  "15": "api",
  "16": "api",
  "17": "api",
  "18": "api",
  "4": "fullstack",
  "19": "fullstack",
  "20": "fullstack",
  "21": "fullstack",
  "22": "fullstack",
  "23": "fullstack",
  "24": "fullstack",
  "5": "ai",
  "25": "ai",
  "26": "ai",
  "27": "ai",
  "28": "ai",
  "29": "ai",
  "30": "ai",
  "6": "mobile",
  "31": "mobile",
  "32": "mobile",
  "33": "mobile",
  "34": "mobile",
  "35": "mobile",
  "36": "mobile",
  "7": "product",
  "37": "product",
  "38": "product",
  "39": "product",
  "40": "product",
  "41": "product",
  "42": "product"
};

export function getQuizTopicForLesson(lessonId: string): QuizTopic {
  return lessonTopicMap[lessonId] ?? "html";
}

export function localizeQuizQuestion(question: QuizQuestion, language: Language) {
  if (language === "en") {
    return {
      id: question.id,
      question: question.question,
      options: question.options,
      explanation: question.explanation
    };
  }

  return {
    id: question.id,
    question: question.questionBg,
    options: question.optionsBg,
    explanation: question.explanationBg
  };
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function generateQuizQuestions(topic: QuizTopic, count = 3) {
  const pool = questionBank.filter((item) => item.topic === topic);
  const fallback = questionBank.filter((item) => item.topic === "html");
  const source = pool.length >= count ? pool : [...pool, ...fallback];
  return shuffle(source).slice(0, Math.min(count, source.length));
}

export function getQuestionBankSize(topic: QuizTopic) {
  return questionBank.filter((item) => item.topic === topic).length;
}

export function getQuizQuestionById(id: string) {
  return questionBank.find((item) => item.id === id);
}
