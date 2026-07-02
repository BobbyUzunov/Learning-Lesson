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
    lessonIds: ["1", "2"]
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

export function getTotalAvailableXp() {
  return gameLessons.length * xpPerLesson;
}
