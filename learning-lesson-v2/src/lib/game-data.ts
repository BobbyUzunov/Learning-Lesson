export type GameQuest = {
  id: string;
  title: string;
  description: string;
  levels: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rewardBadge: string;
  lessonIds: string[];
};

export type GameLesson = {
  id: string;
  questId: string;
  title: string;
  explanation: string;
  codeExample: string;
  mission: string;
  hint: string;
  solution: string;
};

export const xpPerLesson = 100;
export const xpPerLevel = 500;

export const gameQuests: GameQuest[] = [
  {
    id: "frontend",
    title: "Frontend Quest",
    description: "Build interfaces with HTML, CSS, JavaScript and React fundamentals.",
    levels: 8,
    difficulty: "Beginner",
    rewardBadge: "UI Apprentice",
    lessonIds: ["1", "2"]
  },
  {
    id: "backend",
    title: "Backend Quest",
    description: "Learn APIs, databases, auth and reliable server-side patterns.",
    levels: 10,
    difficulty: "Intermediate",
    rewardBadge: "API Builder",
    lessonIds: ["3"]
  },
  {
    id: "fullstack",
    title: "Full-Stack Quest",
    description: "Connect frontend, backend, auth and deployment into real products.",
    levels: 12,
    difficulty: "Intermediate",
    rewardBadge: "Product Shipper",
    lessonIds: ["4"]
  },
  {
    id: "ai",
    title: "AI Quest",
    description: "Use prompts, structured outputs and AI tools inside apps.",
    levels: 7,
    difficulty: "Advanced",
    rewardBadge: "AI Explorer",
    lessonIds: ["5"]
  },
  {
    id: "mobile",
    title: "Mobile Quest",
    description: "Prepare the foundations for mobile-first app experiences.",
    levels: 6,
    difficulty: "Beginner",
    rewardBadge: "Mobile Starter",
    lessonIds: ["1"]
  }
];

export const gameLessons: GameLesson[] = [
  {
    id: "1",
    questId: "frontend",
    title: "HTML Structure Mission",
    explanation: "HTML gives every page a clear structure. Your first mission is to build a small profile card.",
    codeExample: "<article>\n  <h1>Ada Lovelace</h1>\n  <p>First programmer and math pioneer.</p>\n</article>",
    mission: "Create a card with a title, short description and one call-to-action button.",
    hint: "Start with article, then add h1, p and button elements.",
    solution: "<article>\n  <h1>My Developer Profile</h1>\n  <p>I am learning full-stack development step by step.</p>\n  <button>Start Quest</button>\n</article>"
  },
  {
    id: "2",
    questId: "frontend",
    title: "CSS Layout Mission",
    explanation: "CSS turns structure into a readable interface with spacing, color and hierarchy.",
    codeExample: ".card {\n  padding: 24px;\n  border-radius: 8px;\n  display: grid;\n  gap: 12px;\n}",
    mission: "Style your profile card with padding, a border radius and clear text spacing.",
    hint: "Use a single class on the card and keep the spacing consistent.",
    solution: ".card {\n  padding: 24px;\n  border-radius: 8px;\n  background: white;\n  color: #17212b;\n}"
  },
  {
    id: "3",
    questId: "backend",
    title: "API Route Mission",
    explanation: "An API route exposes one predictable action to the rest of your app.",
    codeExample: "export async function GET() {\n  return Response.json({ lessons: [] });\n}",
    mission: "Sketch a GET route that returns a list of lessons.",
    hint: "Return a JSON object with a lessons array.",
    solution: "export async function GET() {\n  return Response.json({ lessons: ['HTML', 'CSS', 'API'] });\n}"
  },
  {
    id: "4",
    questId: "fullstack",
    title: "Progress Save Mission",
    explanation: "A full-stack app connects user actions to persistent data.",
    codeExample: "await fetch('/api/progress', {\n  method: 'POST',\n  body: JSON.stringify({ lessonId: '1' })\n});",
    mission: "Describe what data should be saved when a learner completes a lesson.",
    hint: "Think about user id, lesson id, XP and completion time.",
    solution: "Save user_id, lesson_id, completed=true, xp_earned=100 and completed_at."
  },
  {
    id: "5",
    questId: "ai",
    title: "AI Helper Mission",
    explanation: "AI features work best when the app asks for structured, predictable output.",
    codeExample: "const prompt = 'Return a JSON lesson summary with title, goals and quiz.';",
    mission: "Write a prompt that asks for a short lesson summary and three quiz questions.",
    hint: "Ask for JSON fields so the app can render them safely.",
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
