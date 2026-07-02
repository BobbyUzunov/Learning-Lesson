import { phase2Lessons } from "./game-data-phase2-lessons";

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
    lessonIds: ["3", "14", "15", "16", "17", "18", "43", "44", "45", "46"]
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
    lessonIds: ["4", "19", "20", "21", "22", "23", "24", "47", "48", "49", "50", "51"]
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
    lessonIds: ["5", "25", "26", "27", "28", "29", "30"]
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
    lessonIds: ["6", "31", "32", "33", "34", "35", "36"]
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
    lessonIds: ["7", "37", "38", "39", "40", "41", "42", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63"]
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
  },
  {
    id: "14",
    questId: "backend",
    title: "POST Route Mission",
    titleBg: "Мисия: POST route",
    explanation: "POST routes receive data from the client, validate it and create or update records.",
    explanationBg: "POST routes получават данни от клиента, валидират ги и създават или обновяват записи.",
    codeExample: "export async function POST(request: Request) {\n  const body = await request.json();\n  return Response.json({ ok: true, lessonId: body.lessonId });\n}",
    mission: "Sketch a POST route that reads lessonId from the request body and returns { ok: true, lessonId }.",
    missionBg: "Скицирай POST route, който чете lessonId от request body и връща { ok: true, lessonId }.",
    hint1: "Use await request.json() before accessing body fields.",
    hint1Bg: "Използвай await request.json(), преди да достъпиш полетата в body.",
    solution: "export async function POST(request: Request) {\n  const { lessonId } = await request.json();\n  if (!lessonId) {\n    return Response.json({ error: 'lessonId is required' }, { status: 400 });\n  }\n  return Response.json({ ok: true, lessonId });\n}"
  },
  {
    id: "15",
    questId: "backend",
    title: "Environment Variables Mission",
    titleBg: "Мисия: Environment variables",
    explanation: "Secrets and config belong in environment variables, not in source code committed to git.",
    explanationBg: "Тайните и конфигурацията живеят в environment variables, не в source code в git.",
    codeExample: "const url = process.env.NEXT_PUBLIC_SUPABASE_URL;\nconst anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;",
    mission: "List which Supabase values belong in .env.local and which must never be exposed to the browser.",
    missionBg: "Изброй кои Supabase стойности отиват в .env.local и кои никога не трябва да са видими в браузъра.",
    hint1: "Public keys use NEXT_PUBLIC_; service role keys stay server-only.",
    hint1Bg: "Публичните ключове ползват NEXT_PUBLIC_; service role ключовете остават само на сървъра.",
    solution: "Store NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local. Never expose the service role key in client code."
  },
  {
    id: "16",
    questId: "backend",
    title: "Supabase Query Mission",
    titleBg: "Мисия: Supabase заявка",
    explanation: "Server routes use a Supabase client to read and write rows in Postgres tables.",
    explanationBg: "Server routes използват Supabase client за четене и запис на редове в Postgres таблици.",
    codeExample: "const { data, error } = await supabase\n  .from('user_progress')\n  .select('lesson_id, completed')\n  .eq('user_id', user.id);",
    mission: "Write a query that loads completed lesson ids for the current user from user_progress.",
    missionBg: "Напиши заявка, която зарежда завършените lesson id-та на текущия user от user_progress.",
    hint1: "Filter with .eq('user_id', user.id) and .eq('completed', true).",
    hint1Bg: "Филтрирай с .eq('user_id', user.id) и .eq('completed', true).",
    solution: "const { data } = await supabase\n  .from('user_progress')\n  .select('lesson_id')\n  .eq('user_id', user.id)\n  .eq('completed', true);"
  },
  {
    id: "17",
    questId: "backend",
    title: "API Error Handling Mission",
    titleBg: "Мисия: API error handling",
    explanation: "Good APIs return clear status codes and messages so the frontend can show useful feedback.",
    explanationBg: "Добрите API-та връщат ясни status codes и съобщения, за да покаже frontend-ът полезен feedback.",
    codeExample: "if (!lessonId) {\n  return Response.json({ error: 'lessonId is required' }, { status: 400 });\n}",
    mission: "Add validation that returns 400 when lessonId is missing and 404 when the lesson does not exist.",
    missionBg: "Добави валидация: 400 при липсващ lessonId и 404, когато урокът не съществува.",
    hint1: "Check input first, then look up the lesson before saving progress.",
    hint1Bg: "Първо провери входа, после потърси урока, преди да запишеш прогреса.",
    solution: "if (!lessonId) return Response.json({ error: 'lessonId is required' }, { status: 400 });\nif (!getGameLesson(lessonId)) return Response.json({ error: 'Unknown lesson' }, { status: 404 });"
  },
  {
    id: "18",
    questId: "backend",
    title: "Protected API Mission",
    titleBg: "Мисия: Защитен API",
    explanation: "Routes that save user progress must verify the session before reading or writing database rows.",
    explanationBg: "Routes, които записват user progress, трябва да проверят сесията преди четене или запис в базата.",
    codeExample: "const { data: { user } } = await supabase.auth.getUser();\nif (!user) {\n  return Response.json({ error: 'Not authenticated' }, { status: 401 });\n}",
    mission: "Sketch the auth check that should run at the start of a protected progress API route.",
    missionBg: "Скицирай auth проверката, която трябва да се изпълни в началото на защитен progress API route.",
    hint1: "Return 401 before any database write when user is null.",
    hint1Bg: "Върни 401 преди запис в базата, когато user е null.",
    solution: "const supabase = await createClient();\nconst { data: { user } } = await supabase.auth.getUser();\nif (!user) {\n  return Response.json({ error: 'Not authenticated.' }, { status: 401 });\n}"
  },
  {
    id: "19",
    questId: "fullstack",
    title: "Client-Server Flow Mission",
    titleBg: "Мисия: Client-server поток",
    explanation: "A full-stack feature starts in the UI, calls an API route, and persists the result in the database.",
    explanationBg: "Full-stack функция започва в UI, вика API route и записва резултата в базата.",
    codeExample: "await fetch('/api/progress', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ lessonId: '4' })\n});",
    mission: "Describe the three steps that happen when a learner completes a mission in this app.",
    missionBg: "Опиши трите стъпки, когато learner завърши мисия в това app.",
    hint1: "Think: UI action → API route → Supabase row.",
    hint1Bg: "Помисли: UI action → API route → Supabase row.",
    solution: "1) Mission panel sends POST /api/progress. 2) API validates user and lesson. 3) Supabase upserts user_progress and updates profiles XP."
  },
  {
    id: "20",
    questId: "fullstack",
    title: "Progress Sync Mission",
    titleBg: "Мисия: Синхронизация на прогрес",
    explanation: "Guest progress lives in localStorage until login, then merges into Supabase without losing XP.",
    explanationBg: "Guest прогресът е в localStorage до login, после се merge-ва в Supabase без загуба на XP.",
    codeExample: "await supabase.from('user_progress').upsert(rows, { onConflict: 'user_id,lesson_id' });",
    mission: "Explain how guest lesson completions should merge when the user registers or logs in.",
    missionBg: "Обясни как guest завършванията трябва да се merge-нат при регистрация или login.",
    hint1: "Upsert by user_id + lesson_id and keep the higher XP total.",
    hint1Bg: "Upsert по user_id + lesson_id и запази по-високия XP total.",
    solution: "Read completed lesson ids from localStorage, upsert each row to user_progress, merge profiles XP, then clear local guest storage."
  },
  {
    id: "21",
    questId: "fullstack",
    title: "Protected Pages Mission",
    titleBg: "Мисия: Защитени страници",
    explanation: "Dashboard and profile should only render for authenticated users with a valid Supabase session.",
    explanationBg: "Dashboard и profile трябва да се показват само за authenticated users с валидна Supabase сесия.",
    codeExample: "await requireUser();\nconst { progress } = await getCurrentUserProgress();",
    mission: "List which routes in this app should require login and what should happen for guests.",
    missionBg: "Изброй кои routes в app-а изискват login и какво става при guests.",
    hint1: "Guests can still open /paths and lesson 1 without an account.",
    hint1Bg: "Guests могат да отворят /paths и урок 1 без акаунт.",
    solution: "Protect /dashboard, /profile, and /admin. Redirect guests to /login. Keep /, /paths, /lesson/1, /register public."
  },
  {
    id: "22",
    questId: "fullstack",
    title: "Deploy Config Mission",
    titleBg: "Мисия: Deploy конфигурация",
    explanation: "Production needs the same Supabase env vars locally and on Vercel so auth and progress work after deploy.",
    explanationBg: "Production има нужда от същите Supabase env vars локално и на Vercel, за да работят auth и progress след deploy.",
    codeExample: "NEXT_PUBLIC_SUPABASE_URL=...\nNEXT_PUBLIC_SUPABASE_ANON_KEY=...",
    mission: "Write the deploy checklist for connecting this Next.js app to Supabase on Vercel.",
    missionBg: "Напиши deploy checklist за свързване на Next.js app с Supabase на Vercel.",
    hint1: "Include env vars, schema migration, and admin role setup.",
    hint1Bg: "Включи env vars, schema migration и admin role setup.",
    solution: "Set env vars in Vercel, run supabase-schema.sql, set profiles.role=admin for your email, redeploy, test register/login/progress."
  },
  {
    id: "23",
    questId: "fullstack",
    title: "Error UX Mission",
    titleBg: "Мисия: Error UX",
    explanation: "When an API fails, the UI should show a clear message instead of silently ignoring the error.",
    explanationBg: "Когато API fail-не, UI трябва да покаже ясно съобщение вместо тихо да игнорира грешката.",
    codeExample: "if (!response.ok) {\n  const body = await response.json();\n  setMessage(body.error ?? 'Request failed');\n}",
    mission: "Sketch client code that handles a failed progress save and shows the API error message.",
    missionBg: "Скицирай client код, който обработва неуспешен progress save и показва API error съобщението.",
    hint1: "Check response.ok before assuming the mission was saved.",
    hint1Bg: "Провери response.ok, преди да приемеш, че мисията е записана.",
    solution: "const response = await fetch('/api/progress', { method: 'POST', body: JSON.stringify({ lessonId }) });\nif (!response.ok) {\n  const body = await response.json();\n  throw new Error(body.error ?? 'Save failed');\n}"
  },
  {
    id: "24",
    questId: "fullstack",
    title: "Ship MVP Mission",
    titleBg: "Мисия: Ship MVP",
    explanation: "A shippable MVP connects quests, missions, auth, progress, and deploy into one working learning loop.",
    explanationBg: "Shippable MVP свързва quests, missions, auth, progress и deploy в един работещ learning loop.",
    codeExample: "Guest plays lesson 1 → registers → progress syncs → dashboard shows XP → admin can edit missions.",
    mission: "Define the smallest full-stack loop a new learner should experience from landing page to second mission.",
    missionBg: "Определи най-малкия full-stack loop, който нов learner трябва да мине от landing page до втора мисия.",
    hint1: "Include guest start, auth, dashboard, and unlock rule.",
    hint1Bg: "Включи guest start, auth, dashboard и unlock rule.",
    solution: "Landing → lesson 1 as guest → register → dashboard → paths → unlock lesson 2 → complete → XP updates in Supabase."
  },
  {
    id: "25",
    questId: "ai",
    title: "Structured Prompt Mission",
    titleBg: "Мисия: Структуриран prompt",
    explanation: "AI outputs are more useful when the prompt defines role, task, format and constraints.",
    explanationBg: "AI отговорите са по-полезни, когато prompt-ът дефинира role, task, format и constraints.",
    codeExample: "You are a coding tutor. Return JSON with title, goals: string[], and one practice task.",
    mission: "Write a prompt that asks an AI to generate one beginner-friendly mission with JSON output.",
    missionBg: "Напиши prompt, който кара AI да генерира една beginner-friendly мисия с JSON output.",
    hint1: "Ask for explicit JSON keys so the app can parse the answer.",
    hint1Bg: "Поискай explicit JSON keys, за да може app-ът да parse-не отговора.",
    solution: "Return JSON: { title, explanation, mission, hint1, solution } for a beginner HTML lesson."
  },
  {
    id: "26",
    questId: "ai",
    title: "JSON Output Mission",
    titleBg: "Мисия: JSON output",
    explanation: "Apps should validate AI JSON before rendering it in the UI or saving it to the database.",
    explanationBg: "Apps трябва да валидират AI JSON, преди да го render-нат в UI или запишат в базата.",
    codeExample: "const parsed = JSON.parse(aiText);\nif (!parsed.title || !parsed.mission) throw new Error('Invalid shape');",
    mission: "List the minimum fields you would validate before showing an AI-generated lesson.",
    missionBg: "Изброй минималните полета, които би валидирал преди показване на AI-generated урок.",
    hint1: "At least title, mission, and solution or hint.",
    hint1Bg: "Поне title, mission и solution или hint.",
    solution: "Require title: string, mission: string, and either solution or hint1 before saving to game_missions."
  },
  {
    id: "27",
    questId: "ai",
    title: "Quiz Prompt Mission",
    titleBg: "Мисия: Quiz prompt",
    explanation: "Quiz generators need prompts that return options, one correct index, and a short explanation.",
    explanationBg: "Quiz generators имат нужда от prompts, които връщат options, един correct index и кратко explanation.",
    codeExample: "Generate 3 multiple-choice questions about CSS layout. Return JSON array with question, options, correctIndex, explanation.",
    mission: "Write a prompt that generates three quiz questions for the CSS topic.",
    missionBg: "Напиши prompt, който генерира три quiz въпроса за CSS тема.",
    hint1: "Each item should include options as an array and correctIndex as a number.",
    hint1Bg: "Всеки item трябва да има options като array и correctIndex като number.",
    solution: "Return [{ question, options: string[], correctIndex: number, explanation }] length 3 for topic 'css'."
  },
  {
    id: "28",
    questId: "ai",
    title: "Prompt Safety Mission",
    titleBg: "Мисия: Prompt safety",
    explanation: "Never send secrets, service role keys, or private user data to an external AI provider.",
    explanationBg: "Никога не изпращай secrets, service role keys или private user data към външен AI provider.",
    codeExample: "const safeContext = { topic: 'html', level: 'beginner' };",
    mission: "Identify three things that must never be included in prompts sent from this learning app.",
    missionBg: "Посочи три неща, които никога не трябва да са в prompts от това learning app.",
    hint1: "Think about keys, passwords, and full user records.",
    hint1Bg: "Помисли за keys, passwords и пълни user records.",
    solution: "Do not include Supabase service role keys, user passwords, or full profiles with emails in AI prompts."
  },
  {
    id: "29",
    questId: "ai",
    title: "AI API Route Mission",
    titleBg: "Мисия: AI API route",
    explanation: "If you call an AI model from the backend, keep the API key server-side and return only sanitized JSON.",
    explanationBg: "Ако викаш AI model от backend, дръж API key server-side и връщай само sanitized JSON.",
    codeExample: "export async function POST(request: Request) {\n  const { topic } = await request.json();\n  return Response.json({ questions: [] });\n}",
    mission: "Sketch a protected API route that accepts a topic and returns generated quiz questions.",
    missionBg: "Скицирай защитен API route, който приема topic и връща generated quiz questions.",
    hint1: "Authenticate first, then call the model, then validate the response shape.",
    hint1Bg: "Първо authenticate, после викни model-а, после валидирай response shape.",
    solution: "POST /api/quiz/generate → require user → call model with topic → validate JSON → return questions array."
  },
  {
    id: "30",
    questId: "ai",
    title: "Evaluate AI Output Mission",
    titleBg: "Мисия: Оценка на AI output",
    explanation: "Human review or automated checks should catch wrong answers, missing fields, or unsafe content before publish.",
    explanationBg: "Human review или automated checks трябва да хванат грешни отговори, липсващи полета или unsafe content преди publish.",
    codeExample: "if (question.correctIndex >= question.options.length) reject(question);",
    mission: "Write three validation rules for AI-generated quiz questions before they appear to learners.",
    missionBg: "Напиши три validation правила за AI-generated quiz въпроси, преди да се покажат на learners.",
    hint1: "Check options length, index bounds, and non-empty text.",
    hint1Bg: "Провери options length, index bounds и non-empty text.",
    solution: "Reject if options.length < 2, correctIndex out of range, or question/explanation strings are empty."
  },
  {
    id: "31",
    questId: "mobile",
    title: "Touch Targets Mission",
    titleBg: "Мисия: Touch targets",
    explanation: "Buttons and links on mobile need enough size and spacing for comfortable tapping.",
    explanationBg: "Бутоните и линковете на mobile трябва да са достатъчно големи и с разстояние за удобно докосване.",
    codeExample: ".cta {\n  min-height: 48px;\n  padding: 12px 16px;\n}",
    mission: "Define minimum tap size and spacing rules for mission buttons on phones.",
    missionBg: "Дефинирай минимален tap size и spacing правила за mission бутони на телефони.",
    hint1: "Aim for at least 44–48px touch height.",
    hint1Bg: "Цели поне 44–48px touch height.",
    solution: "Use min-height: 48px, full-width primary buttons on small screens, and at least 12px vertical gap between actions."
  },
  {
    id: "32",
    questId: "mobile",
    title: "Viewport Mission",
    titleBg: "Мисия: Viewport",
    explanation: "The viewport meta tag tells mobile browsers how to scale the page width correctly.",
    explanationBg: "Viewport meta tag казва на mobile browsers как да мащабират ширината на страницата правилно.",
    codeExample: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    mission: "Explain why width=device-width matters for a learning dashboard on phones.",
    missionBg: "Обясни защо width=device-width е важно за learning dashboard на телефони.",
    hint1: "Without it, mobile browsers may render a desktop-width page scaled down.",
    hint1Bg: "Без него mobile browsers може да render-нат desktop-width страница в намален мащаб.",
    solution: "width=device-width makes CSS pixels match the device screen so layouts and text stay readable without horizontal zoom."
  },
  {
    id: "33",
    questId: "mobile",
    title: "Mobile Navigation Mission",
    titleBg: "Мисия: Mobile navigation",
    explanation: "Navigation on small screens should stack vertically and keep the most important action visible.",
    explanationBg: "Navigation на малки екрани трябва да се подрежда вертикално и да държи най-важното действие видимо.",
    codeExample: "@media (max-width: 768px) {\n  .nav {\n    flex-direction: column;\n    gap: 12px;\n  }\n}",
    mission: "Sketch a mobile nav layout for home, paths, dashboard and login actions.",
    missionBg: "Скицирай mobile nav layout за home, paths, dashboard и login actions.",
    hint1: "Stack links and make the primary CTA full width.",
    hint1Bg: "Подреди links вертикално и направи primary CTA full width.",
    solution: "Stack nav links vertically under 768px, keep Continue Learning as the first full-width button, move secondary links below."
  },
  {
    id: "34",
    questId: "mobile",
    title: "Responsive Cards Mission",
    titleBg: "Мисия: Responsive cards",
    explanation: "Quest cards should switch from multi-column grids to a single column on narrow screens.",
    explanationBg: "Quest cards трябва да преминат от multi-column grid към една колона на тесни екрани.",
    codeExample: ".quests {\n  display: grid;\n  gap: 20px;\n}\n\n@media (min-width: 768px) {\n  .quests { grid-template-columns: repeat(2, 1fr); }\n}",
    mission: "Describe how the /paths quest grid should behave on phone vs desktop.",
    missionBg: "Опиши как /paths quest grid трябва да се държи на phone vs desktop.",
    hint1: "One column on mobile, two or three on larger breakpoints.",
    hint1Bg: "Една колона на mobile, две или три на по-големи breakpoints.",
    solution: "Use one column by default, md:grid-cols-2, xl:grid-cols-3 so cards stay readable without horizontal scrolling."
  },
  {
    id: "35",
    questId: "mobile",
    title: "Mobile Forms Mission",
    titleBg: "Мисия: Mobile forms",
    explanation: "Login and register forms should use large inputs, clear labels and keyboard-friendly field types.",
    explanationBg: "Login и register forms трябва да ползват големи inputs, ясни labels и keyboard-friendly field types.",
    codeExample: '<input type="email" autocomplete="email" className="w-full px-3 py-3" />',
    mission: "List three UX improvements for the register form on mobile.",
    missionBg: "Изброй три UX подобрения за register form на mobile.",
    hint1: "Think about input type, spacing, and button size.",
    hint1Bg: "Помисли за input type, spacing и button size.",
    solution: "Use type=email, 48px+ tap targets, full-width fields, and autocomplete attributes for faster mobile signup."
  },
  {
    id: "36",
    questId: "mobile",
    title: "Mobile Performance Mission",
    titleBg: "Мисия: Mobile performance",
    explanation: "Fast first load on mobile depends on small bundles, lazy loading and avoiding unnecessary client work.",
    explanationBg: "Бързото първо зареждане на mobile зависи от малки bundles, lazy loading и избягване на ненужна client работа.",
    codeExample: "const DashboardGameSummary = dynamic(() => import('./dashboard-game-summary'));",
    mission: "Name two ways this Next.js app can stay fast on slower mobile networks.",
    missionBg: "Посочи два начина това Next.js app да остане бързо на по-бавни mobile мрежи.",
    hint1: "Server components and smaller client bundles help.",
    hint1Bg: "Server components и по-малки client bundles помагат.",
    solution: "Prefer server components for data fetching and keep heavy interactive widgets as focused client islands only where needed."
  },
  {
    id: "37",
    questId: "ai-product-builder",
    title: "Cursor Workflow Mission",
    titleBg: "Мисия: Cursor workflow",
    explanation: "Cursor helps you iterate quickly when you give it clear goals, file context and small reviewable tasks.",
    explanationBg: "Cursor помага за бърза итерация, когато дадеш ясни цели, file context и малки reviewable tasks.",
    codeExample: "Fix registration flow: create profiles row on sign-up, idempotent, no duplicate rows.",
    mission: "Write one high-quality Cursor task prompt for adding a new mission to game-data.ts.",
    missionBg: "Напиши един качествен Cursor task prompt за добавяне на нова мисия в game-data.ts.",
    hint1: "Include quest id, bilingual fields, unlock order, and quiz topic.",
    hint1Bg: "Включи quest id, bilingual fields, unlock order и quiz topic.",
    solution: "Add Backend mission 19 about POST routes to game-data.ts with EN/BG text, append to backend.lessonIds, map quiz topic api."
  },
  {
    id: "38",
    questId: "ai-product-builder",
    title: "Supabase Schema Mission",
    titleBg: "Мисия: Supabase schema",
    explanation: "Schema changes should be idempotent SQL migrations with RLS policies and triggers documented together.",
    explanationBg: "Schema промените трябва да са idempotent SQL migrations с RLS policies и triggers, документирани заедно.",
    codeExample: "alter table public.profiles add column if not exists display_name text;",
    mission: "List the core tables this learning app needs in Supabase and what each one stores.",
    missionBg: "Изброй core таблиците, които learning app-ът има нужда в Supabase, и какво пази всяка.",
    hint1: "Profiles, progress, and optional mission overrides.",
    hint1Bg: "Profiles, progress и optional mission overrides.",
    solution: "profiles: user metadata and XP. user_progress: completed lessons. game_missions: admin content overrides."
  },
  {
    id: "39",
    questId: "ai-product-builder",
    title: "Vercel Deploy Mission",
    titleBg: "Мисия: Vercel deploy",
    explanation: "Deploy early so auth, database and UI issues surface in a real environment, not only on localhost.",
    explanationBg: "Deploy-вай рано, за да излязат auth, database и UI проблеми в реална среда, не само на localhost.",
    codeExample: "git push origin main",
    mission: "Write the minimum deploy checklist from local dev to a live Vercel URL.",
    missionBg: "Напиши минималния deploy checklist от local dev до live Vercel URL.",
    hint1: "Include env vars, Supabase SQL, and smoke test steps.",
    hint1Bg: "Включи env vars, Supabase SQL и smoke test стъпки.",
    solution: "Push to GitHub, connect Vercel project root learning-lesson-v2, set Supabase env vars, run SQL migrations, test register/login/lesson complete."
  },
  {
    id: "40",
    questId: "ai-product-builder",
    title: "Iteration Loop Mission",
    titleBg: "Мисия: Iteration loop",
    explanation: "Strong builders ship small slices: implement, test, deploy, gather feedback, then refine.",
    explanationBg: "Силните builders ship-ват малки парчета: implement, test, deploy, feedback, после refine.",
    codeExample: "1) Add mission 2) npm run build 3) deploy 4) test on phone 5) fix issues",
    mission: "Define your personal build loop for one feature in this project.",
    missionBg: "Дефинирай личния си build loop за една feature в този проект.",
    hint1: "Keep the loop short enough to finish in one session.",
    hint1Bg: "Дръж loop-а достатъчно кратък за една сесия.",
    solution: "Pick one mission → edit game-data → run build → push → verify on production → collect one UX note → improve."
  },
  {
    id: "41",
    questId: "ai-product-builder",
    title: "User Feedback Mission",
    titleBg: "Мисия: User feedback",
    explanation: "Watch where learners stop: locked missions, auth errors, slow pages, or confusing copy.",
    explanationBg: "Наблюдавай къде learners спират: locked missions, auth errors, бавни страници или объркващ copy.",
    codeExample: "Guest completes lesson 1 → register fails → fix trigger → retest signup",
    mission: "Identify one real friction point you already hit in this project and how you fixed or would fix it.",
    missionBg: "Посочи една реална friction точка в този проект и как я оправи или би оправил.",
    hint1: "Registration and schema mismatches are common early blockers.",
    hint1Bg: "Registration и schema mismatch-ове са чести early blockers.",
    solution: "Registration failed because profiles.email was missing; fixed with idempotent SQL migration and SECURITY DEFINER trigger."
  },
  {
    id: "42",
    questId: "ai-product-builder",
    title: "Launch Checklist Mission",
    titleBg: "Мисия: Launch checklist",
    explanation: "A launch-ready MVP has working auth, progress, content, mobile layout, admin access and a clear next roadmap.",
    explanationBg: "Launch-ready MVP има работещ auth, progress, content, mobile layout, admin access и ясен next roadmap.",
    codeExample: "✓ register/login ✓ lesson complete ✓ XP sync ✓ admin edit ✓ mobile nav",
    mission: "Create a 6-item launch checklist for Learning Lesson v2.",
    missionBg: "Създай 6-item launch checklist за Learning Lesson v2.",
    hint1: "Cover auth, learning loop, content, admin, mobile, and deploy.",
    hint1Bg: "Покрий auth, learning loop, content, admin, mobile и deploy.",
    solution: "1) Auth works 2) Guest + registered progress 3) Multiple quests 4) Admin edits visible 5) Mobile usable 6) Production deploy healthy."
  },
  ...phase2Lessons
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
