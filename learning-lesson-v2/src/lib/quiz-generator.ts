import type { Language } from "./i18n";

export type QuizTopic =
  | "html"
  | "css"
  | "javascript"
  | "dom"
  | "fetch"
  | "react"
  | "api"
  | "quiz-generator";

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
  "4": "api",
  "5": "quiz-generator",
  "6": "css",
  "7": "quiz-generator"
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
