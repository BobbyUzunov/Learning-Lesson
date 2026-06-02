export type GameQuest = {
  id: string;
  title: string;
  titleBg?: string;
  description: string;
  descriptionBg?: string;
  levels: number;
  difficulty: string;
  difficultyBg?: string;
  rewardBadge: string;
  rewardBadgeBg?: string;
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
  hint: string;
  hintBg?: string;
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
    rewardBadge: "UI Apprentice",
    rewardBadgeBg: "UI чирак",
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
    rewardBadge: "API Builder",
    rewardBadgeBg: "API строител",
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
    rewardBadge: "Product Shipper",
    rewardBadgeBg: "Product shipper",
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
    rewardBadge: "AI Explorer",
    rewardBadgeBg: "AI изследовател",
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
    rewardBadge: "Mobile Starter",
    rewardBadgeBg: "Mobile starter",
    lessonIds: ["1"]
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
