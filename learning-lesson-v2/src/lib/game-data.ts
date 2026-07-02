export type GameQuest = {
  id: string;
  title: string;
  titleBg?: string;
  description: string;
  descriptionBg?: string;
  levels: number;
  difficulty: string;
  difficultyBg?: string;
  estimatedTime: string;
  estimatedTimeBg?: string;
  rewardBadge: string;
  rewardBadgeBg?: string;
  xpReward: number;
  lessonIds: string[];
};

export type GameLesson = {
  id: string;
  questId: string;
  title: string;
  titleBg?: string;
  explanation: string;
  explanationBg?: string;
  codeExample: string;
  mission: string;
  missionBg?: string;
  hint?: string;
  hintBg?: string;
  hint1?: string;
  hint1Bg?: string;
  hint2?: string;
  hint2Bg?: string;
  hint3?: string;
  hint3Bg?: string;
  solution: string;
};

export const xpPerLesson = 100;
export const xpPerLevel = 500;

export const gameQuests: GameQuest[] = [
  {
    id: "frontend",
    title: "Frontend Quest",
    titleBg: "Frontend мисия",
    description: "Build interfaces with HTML, CSS, JavaScript and React fundamentals.",
    descriptionBg: "Изграждай интерфейси с HTML, CSS, JavaScript и основите на React.",
    levels: 8,
    difficulty: "Beginner",
    difficultyBg: "Начинаещ",
    estimatedTime: "4-6 hours",
    estimatedTimeBg: "4-6 часа",
    rewardBadge: "UI Apprentice",
    rewardBadgeBg: "UI чирак",
    xpReward: 800,
    lessonIds: ["1", "2", "8", "9", "10", "11", "12", "13"]
  },
  {
    id: "backend",
    title: "Backend Quest",
    titleBg: "Backend мисия",
    description: "Learn APIs, databases, auth and reliable server-side patterns.",
    descriptionBg: "Научи API-та, бази данни, auth и стабилни server-side модели.",
    levels: 10,
    difficulty: "Intermediate",
    difficultyBg: "Средно",
    estimatedTime: "6-8 hours",
    estimatedTimeBg: "6-8 часа",
    rewardBadge: "API Builder",
    rewardBadgeBg: "API строител",
    xpReward: 1000,
    lessonIds: ["3"]
  },
  {
    id: "fullstack",
    title: "Full-Stack Quest",
    titleBg: "Full-Stack мисия",
    description: "Connect frontend, backend, auth and deployment into real products.",
    descriptionBg: "Свържи frontend, backend, auth и deployment в реални продукти.",
    levels: 12,
    difficulty: "Intermediate",
    difficultyBg: "Средно",
    estimatedTime: "8-10 hours",
    estimatedTimeBg: "8-10 часа",
    rewardBadge: "Product Shipper",
    rewardBadgeBg: "Product shipper",
    xpReward: 1200,
    lessonIds: ["4"]
  },
  {
    id: "ai",
    title: "AI Quest",
    titleBg: "AI мисия",
    description: "Use prompts, structured outputs and AI tools inside apps.",
    descriptionBg: "Използвай prompts, структурирани отговори и AI tools в приложения.",
    levels: 7,
    difficulty: "Advanced",
    difficultyBg: "Напреднал",
    estimatedTime: "5-7 hours",
    estimatedTimeBg: "5-7 часа",
    rewardBadge: "AI Explorer",
    rewardBadgeBg: "AI изследовател",
    xpReward: 700,
    lessonIds: ["5"]
  },
  {
    id: "mobile",
    title: "Mobile Quest",
    titleBg: "Mobile мисия",
    description: "Prepare the foundations for mobile-first app experiences.",
    descriptionBg: "Подготви основите за mobile-first app изживявания.",
    levels: 6,
    difficulty: "Beginner",
    difficultyBg: "Начинаещ",
    estimatedTime: "3-5 hours",
    estimatedTimeBg: "3-5 часа",
    rewardBadge: "Mobile Starter",
    rewardBadgeBg: "Mobile starter",
    xpReward: 600,
    lessonIds: ["6"]
  },
  {
    id: "ai-product-builder",
    title: "AI Product Builder",
    titleBg: "AI Product Builder",
    description: "Learn how to build real products using AI, Cursor, Supabase and Vercel.",
    descriptionBg: "Научи как да изграждаш реални продукти с AI, Cursor, Supabase и Vercel.",
    levels: 20,
    difficulty: "Beginner Friendly",
    difficultyBg: "Подходящо за начинаещи",
    estimatedTime: "10-14 hours",
    estimatedTimeBg: "10-14 часа",
    rewardBadge: "XP",
    rewardBadgeBg: "XP",
    xpReward: 2000,
    lessonIds: ["7"]
  }
];

export const gameLessons: GameLesson[] = [
  {
    id: "1",
    questId: "frontend",
    title: "HTML Structure Mission",
    titleBg: "Мисия: HTML структура",
    explanation: "HTML gives every page a clear structure. Your first mission is to build a small profile card.",
    explanationBg: "HTML дава ясна структура на всяка страница. Първата ти мисия е да направиш малка профилна карта.",
    codeExample: "<article>\n  <h1>Ada Lovelace</h1>\n  <p>First programmer and math pioneer.</p>\n</article>",
    mission: "Create a card with a title, short description and one call-to-action button.",
    missionBg: "Създай карта със заглавие, кратко описание и един call-to-action бутон.",
    hint: "Start with article, then add h1, p and button elements.",
    hintBg: "Започни с article, после добави h1, p и button елементи.",
    solution: "<article>\n  <h1>My Developer Profile</h1>\n  <p>I am learning full-stack development step by step.</p>\n  <button>Start Quest</button>\n</article>"
  },
  {
    id: "2",
    questId: "frontend",
    title: "CSS Layout Mission",
    titleBg: "Мисия: CSS layout",
    explanation: "CSS turns structure into a readable interface with spacing, color and hierarchy.",
    explanationBg: "CSS превръща структурата в четим интерфейс с разстояния, цветове и йерархия.",
    codeExample: ".card {\n  padding: 24px;\n  border-radius: 8px;\n  display: grid;\n  gap: 12px;\n}",
    mission: "Style your profile card with padding, a border radius and clear text spacing.",
    missionBg: "Стилизирай профилната карта с padding, border radius и ясни разстояния между текста.",
    hint: "Use a single class on the card and keep the spacing consistent.",
    hintBg: "Използвай един class върху картата и дръж разстоянията консистентни.",
    solution: ".card {\n  padding: 24px;\n  border-radius: 8px;\n  background: white;\n  color: #17212b;\n}"
  },
  {
    id: "3",
    questId: "backend",
    title: "API Route Mission",
    titleBg: "Мисия: API route",
    explanation: "An API route exposes one predictable action to the rest of your app.",
    explanationBg: "API route дава една предвидима action точка към останалата част от приложението.",
    codeExample: "export async function GET() {\n  return Response.json({ lessons: [] });\n}",
    mission: "Sketch a GET route that returns a list of lessons.",
    missionBg: "Скицирай GET route, който връща списък с уроци.",
    hint: "Return a JSON object with a lessons array.",
    hintBg: "Върни JSON object с lessons array.",
    solution: "export async function GET() {\n  return Response.json({ lessons: ['HTML', 'CSS', 'API'] });\n}"
  },
  {
    id: "4",
    questId: "fullstack",
    title: "Progress Save Mission",
    titleBg: "Мисия: Запазване на прогрес",
    explanation: "A full-stack app connects user actions to persistent data.",
    explanationBg: "Full-stack приложение свързва действията на потребителя с постоянни данни.",
    codeExample: "await fetch('/api/progress', {\n  method: 'POST',\n  body: JSON.stringify({ lessonId: '1' })\n});",
    mission: "Describe what data should be saved when a learner completes a lesson.",
    missionBg: "Опиши какви данни трябва да се запазят, когато learner завърши урок.",
    hint: "Think about user id, lesson id, XP and completion time.",
    hintBg: "Помисли за user id, lesson id, XP и време на завършване.",
    solution: "Save user_id, lesson_id, completed=true, xp_earned=100 and completed_at."
  },
  {
    id: "5",
    questId: "ai",
    title: "AI Helper Mission",
    titleBg: "Мисия: AI помощник",
    explanation: "AI features work best when the app asks for structured, predictable output.",
    explanationBg: "AI функционалностите работят най-добре, когато app-ът иска структуриран и предвидим output.",
    codeExample: "const prompt = 'Return a JSON lesson summary with title, goals and quiz.';",
    mission: "Write a prompt that asks for a short lesson summary and three quiz questions.",
    missionBg: "Напиши prompt, който иска кратко резюме на урок и три quiz въпроса.",
    hint: "Ask for JSON fields so the app can render them safely.",
    hintBg: "Поискай JSON полета, за да може app-ът да ги render-не безопасно.",
    solution: "Return JSON with title, summary, goals: string[] and quiz: {question, answer}[]"
  },
  {
    id: "6",
    questId: "mobile",
    title: "Mobile First Mission",
    titleBg: "Мисия: Mobile-first основи",
    explanation: "Mobile-first design starts with the smallest screen and scales up only when the layout needs more space.",
    explanationBg: "Mobile-first дизайнът започва от най-малкия екран и се разширява само когато layout-ът има нужда от повече място.",
    codeExample: ".app-shell {\n  display: grid;\n  gap: 16px;\n  padding: 16px;\n}\n\n@media (min-width: 768px) {\n  .app-shell {\n    grid-template-columns: 240px 1fr;\n  }\n}",
    mission: "Sketch a mobile-first layout for a learning dashboard with a header, progress area and lesson list.",
    missionBg: "Скицирай mobile-first layout за learning dashboard с header, progress зона и списък с уроци.",
    hint: "Start with one column, then add a wider layout only for tablet and desktop screens.",
    hintBg: "Започни с една колона, после добави по-широк layout само за tablet и desktop екрани.",
    solution: ".dashboard {\n  display: grid;\n  gap: 16px;\n}\n\n@media (min-width: 768px) {\n  .dashboard {\n    grid-template-columns: 280px 1fr;\n  }\n}"
  },
  {
    id: "7",
    questId: "ai-product-builder",
    title: "AI Product Brief Mission",
    titleBg: "Мисия: AI product brief",
    explanation: "Every AI product needs a clear user problem, a small workflow and a reliable way to save data.",
    explanationBg: "Всеки AI продукт има нужда от ясен user проблем, малък workflow и надежден начин за записване на данни.",
    codeExample: "const productBrief = {\n  userProblem: 'Creators need faster lesson drafts.',\n  aiStep: 'Generate a structured lesson outline.',\n  stack: ['Cursor', 'Supabase', 'Vercel']\n};",
    mission: "Write a short product brief for an AI-powered learning feature you can build with Cursor, Supabase and Vercel.",
    missionBg: "Напиши кратък product brief за AI learning функция, която можеш да изградиш с Cursor, Supabase и Vercel.",
    hint: "Include the user, the problem, the AI action, saved data and the first deploy target.",
    hintBg: "Включи user-а, проблема, AI action-а, данните за запис и първата deploy цел.",
    solution: "User: beginner developers. Problem: they need guided practice. AI action: generate one mission. Save: lesson progress in Supabase. Deploy: Vercel."
  },
  {
    id: "8",
    questId: "frontend",
    title: "JavaScript Variables Mission",
    titleBg: "Мисия: JavaScript променливи",
    explanation: "Variables store values your app can read and update while the learner interacts with the page.",
    explanationBg: "Променливите пазят стойности, които app-ът чете и обновява, докато learner взаимодейства със страницата.",
    codeExample: "const course = 'Frontend Quest';\nlet xp = 100;\nxp = xp + 25;\nconsole.log(course, xp);",
    mission: "Create three variables for course name, current XP and completed missions count, then log them.",
    missionBg: "Създай три променливи за име на курс, текущ XP и брой завършени мисии, после ги log-ни.",
    hint1: "Use const for values that should not change and let for values that update.",
    hint1Bg: "Използвай const за стойности, които не се променят, и let за тези, които се обновяват.",
    hint2: "Keep the names clear: courseName, currentXp, completedMissions.",
    hint2Bg: "Дръж имената ясни: courseName, currentXp, completedMissions.",
    solution: "const courseName = 'Frontend Quest';\nlet currentXp = 100;\nlet completedMissions = 2;\nconsole.log(courseName, currentXp, completedMissions);"
  },
  {
    id: "9",
    questId: "frontend",
    title: "JavaScript Functions Mission",
    titleBg: "Мисия: JavaScript функции",
    explanation: "Functions package reusable logic so your UI can award XP, unlock lessons and validate answers.",
    explanationBg: "Функциите опаковат логика, за да може UI да дава XP, отключва уроци и проверява отговори.",
    codeExample: "function addXp(currentXp, reward) {\n  return currentXp + reward;\n}",
    mission: "Write a function that receives current XP and lesson reward, then returns the new total.",
    missionBg: "Напиши функция, която приема текущ XP и награда от урок, после връща новия total.",
    hint1: "Use return instead of console.log if the caller needs the result.",
    hint1Bg: "Използвай return вместо console.log, ако извикващият код има нужда от резултата.",
    solution: "function addXp(currentXp, reward) {\n  return currentXp + reward;\n}\n\nconst nextXp = addXp(100, 25);"
  },
  {
    id: "10",
    questId: "frontend",
    title: "DOM Events Mission",
    titleBg: "Мисия: DOM events",
    explanation: "The DOM connects HTML to JavaScript. Events let buttons, forms and cards react to user actions.",
    explanationBg: "DOM свързва HTML с JavaScript. Events карат бутони, форми и карти да реагират на действията на потребителя.",
    codeExample: "const button = document.querySelector('#start');\nbutton.addEventListener('click', () => {\n  console.log('Mission started');\n});",
    mission: "Write code that listens for a click on #complete-mission and logs a success message.",
    missionBg: "Напиши код, който слуша за click върху #complete-mission и log-ва success съобщение.",
    hint1: "First select the element, then attach addEventListener.",
    hint1Bg: "Първо избери елемента, после добави addEventListener.",
    solution: "const button = document.querySelector('#complete-mission');\nbutton.addEventListener('click', () => {\n  console.log('Mission complete');\n});"
  },
  {
    id: "11",
    questId: "frontend",
    title: "Fetch Data Mission",
    titleBg: "Мисия: Fetch данни",
    explanation: "Modern frontends load lesson progress, quests and quiz questions from APIs using fetch.",
    explanationBg: "Модерните frontend apps зареждат прогрес, quests и quiz въпроси от API-та чрез fetch.",
    codeExample: "const response = await fetch('/api/progress');\nconst data = await response.json();",
    mission: "Sketch an async function that loads progress from /api/progress and returns the JSON body.",
    missionBg: "Скицирай async функция, която зарежда progress от /api/progress и връща JSON body.",
    hint1: "Use await on both fetch and response.json().",
    hint1Bg: "Използвай await и върху fetch, и върху response.json().",
    solution: "async function loadProgress() {\n  const response = await fetch('/api/progress');\n  return response.json();\n}"
  },
  {
    id: "12",
    questId: "frontend",
    title: "React Component Mission",
    titleBg: "Мисия: React component",
    explanation: "React components turn UI into reusable building blocks with props and predictable rendering.",
    explanationBg: "React components превръщат UI в преизползваеми блокове с props и предвидим render.",
    codeExample: "export function MissionCard({ title, xp }) {\n  return (\n    <article>\n      <h2>{title}</h2>\n      <p>{xp} XP</p>\n    </article>\n  );\n}",
    mission: "Create a MissionCard component that receives title and xp props and renders them.",
    missionBg: "Създай MissionCard component, който приема title и xp props и ги показва.",
    hint1: "Destructure props in the function parameter list.",
    hint1Bg: "Деструктурирай props в параметрите на функцията.",
    solution: "export function MissionCard({ title, xp }) {\n  return (\n    <article className=\"card\">\n      <h2>{title}</h2>\n      <p>{xp} XP</p>\n    </article>\n  );\n}"
  },
  {
    id: "13",
    questId: "frontend",
    title: "Quiz Generator Mission",
    titleBg: "Мисия: Генератор за въпроси",
    explanation: "A quiz generator picks a topic, filters a question bank and returns a small random practice set.",
    explanationBg: "Генераторът за въпроси избира тема, филтрира банка от въпроси и връща малък случаен practice сет.",
    codeExample: "function generateQuizQuestions(topic, count) {\n  const pool = questionBank.filter((q) => q.topic === topic);\n  return shuffle(pool).slice(0, count);\n}",
    mission: "Write a generateQuizQuestions(topic, count) function that filters by topic and returns count random questions.",
    missionBg: "Напиши generateQuizQuestions(topic, count), която филтрира по тема и връща count случайни въпроса.",
    hint1: "Filter first, shuffle second, then slice to the requested count.",
    hint1Bg: "Първо филтрирай, после shuffle, после slice до желания брой.",
    hint2: "Each question should include options and one correct answer index.",
    hint2Bg: "Всеки въпрос трябва да има options и един correct answer index.",
    solution: "function generateQuizQuestions(topic, count, bank) {\n  const pool = bank.filter((question) => question.topic === topic);\n  return shuffle(pool).slice(0, count);\n}"
  }
];

export function getGameLesson(id: string) {
  return gameLessons.find((lesson) => lesson.id === id);
}

export function getFirstGameLesson() {
  return gameLessons[0];
}

export function getQuestForLesson(lessonId: string) {
  const lesson = getGameLesson(lessonId);
  return lesson ? gameQuests.find((quest) => quest.id === lesson.questId) : undefined;
}

export function getQuestById(questId: string) {
  return gameQuests.find((quest) => quest.id === questId);
}

export function getQuestLessons(questId: string) {
  const quest = getQuestById(questId);
  if (!quest) {
    return [];
  }

  return quest.lessonIds
    .map((lessonId) => getGameLesson(lessonId))
    .filter((lesson): lesson is GameLesson => Boolean(lesson));
}

export function getLessonOrderInQuest(lessonId: string) {
  const lesson = getGameLesson(lessonId);
  if (!lesson) {
    return null;
  }

  const quest = getQuestById(lesson.questId);
  if (!quest) {
    return null;
  }

  const order = quest.lessonIds.indexOf(lessonId);
  return order >= 0 ? order + 1 : null;
}

export function getLessonUnlockRule(lessonId: string) {
  const lesson = getGameLesson(lessonId);
  if (!lesson) {
    return null;
  }

  const quest = getQuestById(lesson.questId);
  if (!quest) {
    return null;
  }

  const index = quest.lessonIds.indexOf(lessonId);
  return index > 0 ? quest.lessonIds[index - 1] : null;
}

export function isLessonUnlocked(lessonId: string, completedLessonIds: Iterable<string>) {
  const completed = new Set(completedLessonIds);

  if (completed.has(lessonId)) {
    return true;
  }

  const prerequisite = getLessonUnlockRule(lessonId);
  return !prerequisite || completed.has(prerequisite);
}

export function getNextLessonInQuest(questId: string, completedLessonIds: Iterable<string>) {
  const quest = getQuestById(questId);
  if (!quest) {
    return null;
  }

  const completed = new Set(completedLessonIds);
  const nextIncomplete = quest.lessonIds.find((id) => !completed.has(id) && isLessonUnlocked(id, completed));
  if (nextIncomplete) {
    return nextIncomplete;
  }

  return quest.lessonIds.at(-1) ?? null;
}

export function getGlobalNextLesson(completedLessonIds: Iterable<string>) {
  const completed = new Set(completedLessonIds);

  for (const quest of gameQuests) {
    for (const lessonId of quest.lessonIds) {
      if (!completed.has(lessonId) && isLessonUnlocked(lessonId, completed)) {
        return lessonId;
      }
    }
  }

  return null;
}

export function getTotalAvailableXp() {
  return gameLessons.length * xpPerLesson;
}
