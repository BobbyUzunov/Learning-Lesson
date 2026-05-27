import type { LearningPath, Lesson } from "./types";

export const learningPaths: LearningPath[] = [
  {
    id: "javascript",
    title: "JavaScript Fundamentals",
    titleBg: "JavaScript основи",
    description: "Core syntax, functions, arrays, objects, and DOM thinking.",
    descriptionBg: "Основен синтаксис, функции, масиви, обекти и DOM мислене.",
    color: "bg-mint",
    difficulty: "beginner",
    requiredLevel: 1,
    lessonIds: ["js-variables", "js-functions", "js-arrays"]
  },
  {
    id: "python",
    title: "Python Basics",
    titleBg: "Python основи",
    description: "Readable programming foundations with practical examples.",
    descriptionBg: "Четими програмни основи с практически примери.",
    color: "bg-coral",
    difficulty: "beginner",
    requiredLevel: 1,
    lessonIds: ["py-variables", "py-loops"]
  },
  {
    id: "backend",
    title: "Backend Starter",
    titleBg: "Backend старт",
    description: "APIs, data models, authentication, and server-side habits.",
    descriptionBg: "API-та, модели на данни, authentication и server-side навици.",
    color: "bg-violet",
    difficulty: "intermediate",
    requiredLevel: 2,
    lessonIds: ["api-basics", "auth-flow"]
  }
];

export const lessons: Lesson[] = [
  {
    id: "js-variables",
    pathId: "javascript",
    title: "Variables and Values",
    titleBg: "Променливи и стойности",
    summary: "Learn how JavaScript stores and updates values.",
    summaryBg: "Научи как JavaScript пази и променя стойности.",
    content:
      "Variables are named references to values. Use const by default, let when the value changes, and avoid var in modern code.",
    contentBg:
      "Променливите са именувани препратки към стойности. Използвай const по подразбиране, let когато стойността се променя, и избягвай var в модерен код.",
    xp: 40,
    order: 1
  },
  {
    id: "js-functions",
    pathId: "javascript",
    title: "Functions",
    titleBg: "Функции",
    summary: "Package behavior into reusable blocks.",
    summaryBg: "Организирай поведение в преизползваеми блокове.",
    content:
      "Functions accept input, run logic, and return output. Small functions make code easier to test and change.",
    contentBg:
      "Функциите приемат вход, изпълняват логика и връщат резултат. Малките функции правят кода по-лесен за тест и промяна.",
    xp: 55,
    order: 2,
    lockedBy: "js-variables"
  },
  {
    id: "js-arrays",
    pathId: "javascript",
    title: "Arrays",
    titleBg: "Масиви",
    summary: "Work with ordered lists of data.",
    summaryBg: "Работи с подредени списъци от данни.",
    content:
      "Arrays keep values in order. Methods like map, filter, and reduce help transform collections without noisy loops.",
    contentBg:
      "Масивите пазят стойности в ред. Методи като map, filter и reduce помагат да трансформираш колекции без шумни цикли.",
    xp: 65,
    order: 3,
    lockedBy: "js-functions"
  },
  {
    id: "py-variables",
    pathId: "python",
    title: "Python Variables",
    titleBg: "Python променливи",
    summary: "Store data with clean, readable names.",
    summaryBg: "Пази данни с ясни и четими имена.",
    content:
      "Python variables do not need explicit type declarations. Clear names and simple expressions keep programs readable.",
    contentBg:
      "Python променливите не изискват явни типове. Ясните имена и простите изрази правят програмите четими.",
    xp: 40,
    order: 1
  },
  {
    id: "py-loops",
    pathId: "python",
    title: "Loops",
    titleBg: "Цикли",
    summary: "Repeat work with for and while loops.",
    summaryBg: "Повтаряй действия с for и while цикли.",
    content:
      "Use for loops for known collections and while loops when repetition depends on a condition that changes over time.",
    contentBg:
      "Използвай for цикли за известни колекции и while цикли, когато повторението зависи от условие, което се променя.",
    xp: 55,
    order: 2,
    lockedBy: "py-variables"
  },
  {
    id: "api-basics",
    pathId: "backend",
    title: "API Basics",
    titleBg: "API основи",
    summary: "Understand routes, requests, and responses.",
    summaryBg: "Разбери routes, requests и responses.",
    content:
      "An API exposes predictable operations. Good routes use clear nouns, proper HTTP methods, and consistent response shapes.",
    contentBg:
      "API-то предоставя предвидими операции. Добрите routes използват ясни съществителни, правилни HTTP методи и консистентни responses.",
    xp: 70,
    order: 1
  },
  {
    id: "auth-flow",
    pathId: "backend",
    title: "Authentication Flow",
    titleBg: "Authentication flow",
    summary: "Connect identity to protected user data.",
    summaryBg: "Свържи потребителската идентичност със защитени данни.",
    content:
      "Authentication proves who a user is. Authorization decides what that user can do after signing in.",
    contentBg:
      "Authentication доказва кой е потребителят. Authorization решава какво може да прави след вход.",
    xp: 80,
    order: 2,
    lockedBy: "api-basics"
  }
];

export function getLesson(id: string) {
  return lessons.find((lesson) => lesson.id === id);
}

export function getPathLessons(pathId: string) {
  return lessons.filter((lesson) => lesson.pathId === pathId).sort((a, b) => a.order - b.order);
}
