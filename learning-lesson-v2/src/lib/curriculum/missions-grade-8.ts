import type { CurriculumMission } from "./types";

// A full grade 8 year: eight sequenced missions per module. Each mission states a
// real problem, a concrete deliverable a student can keep, and the skills it builds.

const digitalFoundationMissions: CurriculumMission[] = [
  {
    id: "mission-digital-footprint",
    moduleId: "grade-8-digital-foundation",
    title: { en: "Mission: Read your own digital footprint", bg: "Мисия: Прочети своя дигитален отпечатък" },
    brief: {
      en: "Search for yourself the way a stranger would and decide what you want the internet to say about you.",
      bg: "Потърси себе си така, както би го направил непознат, и реши какво искаш интернет да казва за теб."
    },
    deliverable: {
      en: "A list of everything you found, marked as safe or risky, plus three changes you made.",
      bg: "Списък с всичко намерено, отбелязано като безопасно или рисково, и три промени, които си направил."
    },
    skills: [
      { en: "Digital citizenship", bg: "Дигитална култура" },
      { en: "Privacy awareness", bg: "Грижа за личните данни" },
      { en: "Self-assessment", bg: "Самооценка" }
    ],
    estimatedMinutes: 45,
    sortOrder: 0
  },
  {
    id: "mission-fact-check-claim",
    moduleId: "grade-8-digital-foundation",
    title: { en: "Mission: Check a claim before you share it", bg: "Мисия: Провери твърдение, преди да го споделиш" },
    brief: {
      en: "Take a viral claim from a school chat and trace it back to its original source.",
      bg: "Вземи вирусно твърдение от училищен чат и го проследи до първоизточника му."
    },
    deliverable: {
      en: "A short verdict card: the claim, two independent sources, and your true or false conclusion.",
      bg: "Кратка карта с оценка: твърдението, два независими източника и заключението ти вярно или невярно."
    },
    skills: [
      { en: "Source evaluation", bg: "Оценка на източници" },
      { en: "Critical thinking", bg: "Критично мислене" },
      { en: "Media literacy", bg: "Медийна грамотност" }
    ],
    estimatedMinutes: 45,
    sortOrder: 1
  },
  {
    id: "mission-account-protection-basics",
    moduleId: "grade-8-digital-foundation",
    title: { en: "Mission: Lock your accounts properly", bg: "Мисия: Заключи профилите си както трябва" },
    brief: {
      en: "Replace one weak password with a passphrase and turn on two-factor authentication where it matters most.",
      bg: "Замени една слаба парола с дълга фраза и включи двуфакторна защита там, където е най-важно."
    },
    deliverable: {
      en: "A before-and-after table for three accounts and a recovery plan if you lose your phone.",
      bg: "Таблица преди и след за три профила и план за възстановяване, ако загубиш телефона си."
    },
    skills: [
      { en: "Account security", bg: "Защита на профили" },
      { en: "Risk assessment", bg: "Оценка на риска" },
      { en: "Planning", bg: "Планиране" }
    ],
    estimatedMinutes: 45,
    sortOrder: 2
  },
  {
    id: "mission-break-down-problem",
    moduleId: "grade-8-digital-foundation",
    title: { en: "Mission: Break a messy task into steps", bg: "Мисия: Разглоби обърканата задача на стъпки" },
    brief: {
      en: "Take a real school task that always goes wrong and rewrite it as numbered steps anyone can follow.",
      bg: "Вземи реална училищна задача, която винаги се обърква, и я пренапиши като номерирани стъпки, които всеки може да следва."
    },
    deliverable: {
      en: "A step list with inputs, decisions and the point where things usually fail.",
      bg: "Списък със стъпки, входни данни, решения и мястото, където обикновено се проваля."
    },
    skills: [
      { en: "Decomposition", bg: "Разделяне на задачи" },
      { en: "Algorithmic thinking", bg: "Алгоритмично мислене" },
      { en: "Documentation", bg: "Документиране" }
    ],
    estimatedMinutes: 45,
    sortOrder: 3
  },
  {
    id: "mission-team-decision-log",
    moduleId: "grade-8-digital-foundation",
    title: { en: "Mission: Decide as a team and prove it", bg: "Мисия: Решете като екип и докажете как" },
    brief: {
      en: "Your group has to pick one option out of three with no obvious winner, and record how you chose.",
      bg: "Групата ви трябва да избере една от три възможности без явен победител и да запише как е избрала."
    },
    deliverable: {
      en: "A decision log: the options, the criteria, who argued what, and the final choice.",
      bg: "Протокол на решението: възможностите, критериите, кой какво е защитавал и крайният избор."
    },
    skills: [
      { en: "Teamwork", bg: "Работа в екип" },
      { en: "Decision making", bg: "Вземане на решения" },
      { en: "Written communication", bg: "Писмена комуникация" }
    ],
    estimatedMinutes: 60,
    sortOrder: 4
  },
  {
    id: "mission-responsible-ai-use",
    moduleId: "grade-8-digital-foundation",
    title: { en: "Mission: Use an AI assistant honestly", bg: "Мисия: Използвай AI помощник честно" },
    brief: {
      en: "Solve one homework task with an AI assistant, then find and fix everything it got wrong.",
      bg: "Реши една домашна задача с AI помощник, след което намери и поправи всичко, което е сбъркал."
    },
    deliverable: {
      en: "Your prompts, the assistant's answer, your corrections, and a note on what you contributed.",
      bg: "Твоите запитвания, отговорът на помощника, поправките ти и бележка какво си добавил самостоятелно."
    },
    skills: [
      { en: "Responsible AI", bg: "Отговорен AI" },
      { en: "Verification", bg: "Проверка на информация" },
      { en: "Academic honesty", bg: "Академична честност" }
    ],
    estimatedMinutes: 60,
    sortOrder: 5
  },
  {
    id: "mission-accessible-material",
    moduleId: "grade-8-digital-foundation",
    title: { en: "Mission: Make a handout readable for everyone", bg: "Мисия: Направи материал четим за всички" },
    brief: {
      en: "Rework a confusing school handout so a classmate with weak eyesight or dyslexia can still use it.",
      bg: "Преработи объркващ училищен материал така, че съученик със слабо зрение или дислексия да може да го ползва."
    },
    deliverable: {
      en: "The improved handout plus a list of the accessibility changes and why each one helps.",
      bg: "Подобреният материал и списък с промените за достъпност и защо всяка от тях помага."
    },
    skills: [
      { en: "Accessibility", bg: "Достъпност" },
      { en: "Empathy", bg: "Съпричастност" },
      { en: "Clear writing", bg: "Ясно писане" }
    ],
    estimatedMinutes: 45,
    sortOrder: 6
  },
  {
    id: "mission-three-minute-pitch",
    moduleId: "grade-8-digital-foundation",
    title: { en: "Mini project: Explain your work in three minutes", bg: "Мини проект: Обясни работата си за три минути" },
    brief: {
      en: "Turn one finished mission from this term into a three-minute presentation for your class.",
      bg: "Превърни една завършена мисия от този срок в триминутна презентация пред класа."
    },
    deliverable: {
      en: "Slides or a poster, a rehearsed three-minute talk, and answers to two questions from the audience.",
      bg: "Слайдове или постер, репетирано триминутно представяне и отговори на два въпроса от публиката."
    },
    skills: [
      { en: "Presentation", bg: "Представяне" },
      { en: "Structuring a story", bg: "Структуриране на разказ" },
      { en: "Confidence", bg: "Увереност" }
    ],
    estimatedMinutes: 90,
    sortOrder: 7
  }
];

const entrepreneurshipMissions: CurriculumMission[] = [
  {
    id: "mission-find-school-problem",
    moduleId: "grade-8-entrepreneurship",
    title: { en: "Mission: Find a problem worth solving", bg: "Мисия: Намери проблем, който си струва" },
    brief: {
      en: "Spend a day noticing what annoys people in your school and pick the problem that hits the most students.",
      bg: "Прекарай един ден в наблюдение какво дразни хората в училището ти и избери проблема, който засяга най-много ученици."
    },
    deliverable: {
      en: "Five observed problems with who suffers and how often, and one chosen problem with a reason.",
      bg: "Пет наблюдавани проблема с кой страда и колко често, и един избран проблем с обосновка."
    },
    skills: [
      { en: "Problem discovery", bg: "Откриване на проблеми" },
      { en: "Observation", bg: "Наблюдение" },
      { en: "Prioritization", bg: "Приоритизиране" }
    ],
    estimatedMinutes: 45,
    sortOrder: 0
  },
  {
    id: "mission-interview-five-users",
    moduleId: "grade-8-entrepreneurship",
    title: { en: "Mission: Interview five real people", bg: "Мисия: Интервюирай пет истински хора" },
    brief: {
      en: "Ask five classmates about your chosen problem without ever suggesting your solution to them.",
      bg: "Разпитай петима съученици за избрания проблем, без нито веднъж да им подсказваш решението си."
    },
    deliverable: {
      en: "Five sets of notes, the sentence that repeated most often, and one assumption you were wrong about.",
      bg: "Пет записа с бележки, изречението, което се е повтаряло най-често, и едно твое предположение, което се е оказало грешно."
    },
    skills: [
      { en: "User interviews", bg: "Интервюта с потребители" },
      { en: "Active listening", bg: "Активно слушане" },
      { en: "Note taking", bg: "Водене на записки" }
    ],
    estimatedMinutes: 60,
    sortOrder: 1
  },
  {
    id: "mission-value-proposition",
    moduleId: "grade-8-entrepreneurship",
    title: { en: "Mission: Say what you offer in one sentence", bg: "Мисия: Кажи какво предлагаш с едно изречение" },
    brief: {
      en: "Compress your idea into a single sentence that names the user, the problem and the benefit.",
      bg: "Свий идеята си в едно изречение, което назовава потребителя, проблема и ползата."
    },
    deliverable: {
      en: "Three sentence drafts, the one you chose, and the reaction of two people who read it cold.",
      bg: "Три варианта на изречението, избраният от теб и реакцията на двама хора, които го четат за пръв път."
    },
    skills: [
      { en: "Value proposition", bg: "Стойностно предложение" },
      { en: "Concise writing", bg: "Стегнато писане" },
      { en: "Feedback", bg: "Обратна връзка" }
    ],
    estimatedMinutes: 45,
    sortOrder: 2
  },
  {
    id: "mission-target-persona",
    moduleId: "grade-8-entrepreneurship",
    title: { en: "Mission: Describe the person you build for", bg: "Мисия: Опиши човека, за когото работиш" },
    brief: {
      en: "Build one concrete persona from your interviews instead of aiming at everybody at once.",
      bg: "Създай една конкретна персона от интервютата си, вместо да се целиш във всички наведнъж."
    },
    deliverable: {
      en: "A persona card with age, daily routine, the exact moment the problem appears, and what they try today.",
      bg: "Карта на персона с възраст, дневен ритъм, точния момент, в който се появява проблемът, и какво прави днес."
    },
    skills: [
      { en: "Target audience", bg: "Целева група" },
      { en: "Synthesis", bg: "Обобщаване" },
      { en: "Customer focus", bg: "Ориентация към потребителя" }
    ],
    estimatedMinutes: 45,
    sortOrder: 3
  },
  {
    id: "mission-costs-and-price",
    moduleId: "grade-8-entrepreneurship",
    title: { en: "Mission: Work out what it costs and what it sells for", bg: "Мисия: Изчисли колко струва и на каква цена се продава" },
    brief: {
      en: "Price your idea honestly: list every cost, then check whether your classmates would actually pay that.",
      bg: "Оцени идеята си честно: изброй всеки разход, после провери дали съучениците ти наистина биха платили толкова."
    },
    deliverable: {
      en: "A cost table, a proposed price, the profit per unit, and the answers of five people you asked.",
      bg: "Таблица с разходите, предложена цена, печалба за единица и отговорите на петима, които си попитал."
    },
    skills: [
      { en: "Cost calculation", bg: "Изчисляване на разходи" },
      { en: "Pricing", bg: "Ценообразуване" },
      { en: "Numeracy", bg: "Работа с числа" }
    ],
    estimatedMinutes: 60,
    sortOrder: 4
  },
  {
    id: "mission-paper-prototype",
    moduleId: "grade-8-entrepreneurship",
    title: { en: "Mission: Build it on paper first", bg: "Мисия: Направи го първо на хартия" },
    brief: {
      en: "Make the cheapest possible version of your idea so someone can try it without a single line of code.",
      bg: "Направи най-евтината възможна версия на идеята си, за да може някой да я пробва без нито един ред код."
    },
    deliverable: {
      en: "A paper or cardboard prototype, photos of it in use, and the first thing a tester got stuck on.",
      bg: "Прототип от хартия или картон, снимки от ползването му и първото нещо, на което тестващият се е препънал."
    },
    skills: [
      { en: "Prototyping", bg: "Прототипиране" },
      { en: "Resourcefulness", bg: "Находчивост" },
      { en: "Iteration", bg: "Подобряване в цикли" }
    ],
    estimatedMinutes: 60,
    sortOrder: 5
  },
  {
    id: "mission-test-with-ten-people",
    moduleId: "grade-8-entrepreneurship",
    title: { en: "Mission: Test the idea with ten people", bg: "Мисия: Тествай идеята с десет души" },
    brief: {
      en: "Put your prototype in front of ten students and count what they do, not what they politely say.",
      bg: "Постави прототипа си пред десет ученици и отчитай какво правят, а не какво казват от учтивост."
    },
    deliverable: {
      en: "A results table for ten testers, the three most common complaints, and one change you made because of them.",
      bg: "Таблица с резултати от десет тестващи, трите най-чести оплаквания и една промяна, направена заради тях."
    },
    skills: [
      { en: "Validation", bg: "Проверка на идея" },
      { en: "Data collection", bg: "Събиране на данни" },
      { en: "Accepting criticism", bg: "Приемане на критика" }
    ],
    estimatedMinutes: 60,
    sortOrder: 6
  },
  {
    id: "mission-pitch-the-idea",
    moduleId: "grade-8-entrepreneurship",
    title: { en: "Mini project: Pitch to a real audience", bg: "Мини проект: Представи идеята пред истинска публика" },
    brief: {
      en: "Present your tested idea to classmates and a teacher, and defend your price with your own numbers.",
      bg: "Представи тестваната си идея пред съученици и учител и защити цената си със собствените си числа."
    },
    deliverable: {
      en: "A three-minute pitch, one slide with your numbers, and written feedback from three listeners.",
      bg: "Триминутен питч, един слайд с числата ти и писмена обратна връзка от трима слушатели."
    },
    skills: [
      { en: "Pitching", bg: "Презентиране на идея" },
      { en: "Persuasion", bg: "Убедителност" },
      { en: "Handling questions", bg: "Отговаряне на въпроси" }
    ],
    estimatedMinutes: 90,
    sortOrder: 7
  }
];

const informationTechnologyMissions: CurriculumMission[] = [
  {
    id: "mission-file-organization",
    moduleId: "grade-8-information-technology",
    title: { en: "Mission: Bring order to your files", bg: "Мисия: Въведи ред във файловете си" },
    brief: {
      en: "Reorganize a messy folder so that any file can be found in under ten seconds.",
      bg: "Подреди разхвърляна папка така, че всеки файл да се намира за под десет секунди."
    },
    deliverable: {
      en: "A folder tree, a naming rule you wrote yourself, and a timed search test with three files.",
      bg: "Дърво от папки, правило за именуване, написано от теб, и тест с измерено време за търсене на три файла."
    },
    skills: [
      { en: "File management", bg: "Управление на файлове" },
      { en: "Naming conventions", bg: "Правила за именуване" },
      { en: "Systematic thinking", bg: "Систематичност" }
    ],
    estimatedMinutes: 45,
    sortOrder: 0
  },
  {
    id: "mission-structured-document",
    moduleId: "grade-8-information-technology",
    title: { en: "Mission: Format a document that stays formatted", bg: "Мисия: Оформи документ, който остава оформен" },
    brief: {
      en: "Use headings, styles and automatic numbering so your document survives editing without falling apart.",
      bg: "Използвай заглавия, стилове и автоматично номериране, за да не се разпадне документът при редакция."
    },
    deliverable: {
      en: "A document with a generated table of contents, consistent styles, and page numbers.",
      bg: "Документ с генерирано съдържание, последователни стилове и номерирани страници."
    },
    skills: [
      { en: "Word processing", bg: "Текстообработка" },
      { en: "Styles and structure", bg: "Стилове и структура" },
      { en: "Attention to detail", bg: "Внимание към детайла" }
    ],
    estimatedMinutes: 45,
    sortOrder: 1
  },
  {
    id: "mission-spreadsheet-formulas",
    moduleId: "grade-8-information-technology",
    title: { en: "Mission: Let the spreadsheet do the maths", bg: "Мисия: Нека таблицата смята вместо теб" },
    brief: {
      en: "Track a month of class expenses so totals and averages update by themselves when a number changes.",
      bg: "Проследи месец разходи на класа така, че сумите и средните да се преизчисляват сами при промяна на число."
    },
    deliverable: {
      en: "A spreadsheet with at least four formulas, a total that recalculates, and one conditional highlight.",
      bg: "Таблица с поне четири формули, сума, която се преизчислява, и едно условно оцветяване."
    },
    skills: [
      { en: "Spreadsheets", bg: "Електронни таблици" },
      { en: "Formulas", bg: "Формули" },
      { en: "Data accuracy", bg: "Точност на данните" }
    ],
    estimatedMinutes: 60,
    sortOrder: 2
  },
  {
    id: "mission-honest-chart",
    moduleId: "grade-8-information-technology",
    title: { en: "Mission: Draw a chart that tells the truth", bg: "Мисия: Направи диаграма, която казва истината" },
    brief: {
      en: "Build one honest chart and one misleading chart from the same data, then explain the trick.",
      bg: "Направи една честна и една подвеждаща диаграма от едни и същи данни, после обясни хитрината."
    },
    deliverable: {
      en: "Both charts side by side and a short note naming the three tricks that distort a chart.",
      bg: "Двете диаграми една до друга и кратка бележка с трите хитрини, които изкривяват диаграма."
    },
    skills: [
      { en: "Data visualization", bg: "Визуализация на данни" },
      { en: "Chart selection", bg: "Избор на тип диаграма" },
      { en: "Critical reading", bg: "Критично четене" }
    ],
    estimatedMinutes: 45,
    sortOrder: 3
  },
  {
    id: "mission-presentation-logic",
    moduleId: "grade-8-information-technology",
    title: { en: "Mission: Build slides nobody has to read aloud", bg: "Мисия: Направи слайдове, които не се четат на глас" },
    brief: {
      en: "Turn a wall of text into slides where each one carries a single idea.",
      bg: "Превърни стена от текст в слайдове, всеки от които носи една единствена мисъл."
    },
    deliverable: {
      en: "Six slides with one message each, consistent fonts and colors, and speaker notes instead of paragraphs.",
      bg: "Шест слайда с по едно послание, последователни шрифтове и цветове и бележки за говорене вместо абзаци."
    },
    skills: [
      { en: "Presentation design", bg: "Дизайн на презентация" },
      { en: "Visual hierarchy", bg: "Визуална йерархия" },
      { en: "Editing", bg: "Редактиране" }
    ],
    estimatedMinutes: 60,
    sortOrder: 4
  },
  {
    id: "mission-collaborative-document",
    moduleId: "grade-8-information-technology",
    title: { en: "Mission: Work in one document without chaos", bg: "Мисия: Работете в един документ без хаос" },
    brief: {
      en: "Four students write one shared document at the same time and nothing gets lost or overwritten.",
      bg: "Четирима ученици пишат едновременно в един споделен документ и нищо не се губи или презаписва."
    },
    deliverable: {
      en: "The shared document, the agreed rules of who edits what, and the version history showing all four.",
      bg: "Споделеният документ, договорените правила кой какво редактира и историята на версиите с приноса на четиримата."
    },
    skills: [
      { en: "Online collaboration", bg: "Онлайн сътрудничество" },
      { en: "Version history", bg: "История на версиите" },
      { en: "Agreements", bg: "Договаряне на правила" }
    ],
    estimatedMinutes: 45,
    sortOrder: 5
  },
  {
    id: "mission-search-and-evaluate",
    moduleId: "grade-8-information-technology",
    title: { en: "Mission: Search like a researcher", bg: "Мисия: Търси като изследовател" },
    brief: {
      en: "Answer one hard factual question using precise search queries instead of the first result you see.",
      bg: "Отговори на един труден фактически въпрос чрез точни заявки за търсене, а не с първия резултат, който видиш."
    },
    deliverable: {
      en: "Your search queries, three sources ranked by reliability, and the answer with a citation.",
      bg: "Заявките ти за търсене, три източника, подредени по надеждност, и отговорът с посочен източник."
    },
    skills: [
      { en: "Search strategies", bg: "Стратегии за търсене" },
      { en: "Source reliability", bg: "Надеждност на източници" },
      { en: "Citation", bg: "Позоваване" }
    ],
    estimatedMinutes: 45,
    sortOrder: 6
  },
  {
    id: "mission-digital-portfolio",
    moduleId: "grade-8-information-technology",
    title: { en: "Mini project: Assemble your digital portfolio", bg: "Мини проект: Събери дигиталното си портфолио" },
    brief: {
      en: "Collect your best work from this term into one place you would be happy to show a stranger.",
      bg: "Събери най-добрите си работи от този срок на едно място, което не би се срамувал да покажеш на непознат."
    },
    deliverable: {
      en: "A portfolio with at least five works, a short description of each, and a clear structure.",
      bg: "Портфолио с поне пет работи, кратко описание на всяка и ясна структура."
    },
    skills: [
      { en: "Portfolio building", bg: "Изграждане на портфолио" },
      { en: "Self-presentation", bg: "Самопредставяне" },
      { en: "Curation", bg: "Подбор" }
    ],
    estimatedMinutes: 90,
    sortOrder: 7
  }
];

const softwareMissions: CurriculumMission[] = [
  {
    id: "mission-school-schedule",
    moduleId: "grade-8-software-digital-technologies",
    title: { en: "Mission: A smarter school schedule", bg: "Мисия: По-умно училищно разписание" },
    brief: {
      en: "Design the logic for a small tool that finds a free classroom without overlapping lessons.",
      bg: "Проектирай логиката на малък инструмент, който намира свободна стая без застъпване на часовете."
    },
    deliverable: {
      en: "Flowchart, three test cases and a paper or screen prototype.",
      bg: "Блок-схема, три тестови примера и прототип на хартия или екран."
    },
    skills: [
      { en: "Algorithmic thinking", bg: "Алгоритмично мислене" },
      { en: "Testing", bg: "Тестване" },
      { en: "Interface planning", bg: "Планиране на интерфейс" }
    ],
    estimatedMinutes: 45,
    sortOrder: 0
  },
  {
    id: "mission-table-to-data-model",
    moduleId: "grade-8-software-digital-technologies",
    title: { en: "Mission: Turn a table into a data structure", bg: "Мисия: Превърни таблица в структура от данни" },
    brief: {
      en: "Take a messy class list and decide exactly which fields a program would need to store it.",
      bg: "Вземи разхвърлян списък на класа и реши точно кои полета би трябвало да пази една програма."
    },
    deliverable: {
      en: "A field list with types, the rules for what is allowed, and three records written out.",
      bg: "Списък с полета и типове, правила какво е допустимо и три записа, изписани изцяло."
    },
    skills: [
      { en: "Data modelling", bg: "Моделиране на данни" },
      { en: "Data types", bg: "Типове данни" },
      { en: "Precision", bg: "Прецизност" }
    ],
    estimatedMinutes: 45,
    sortOrder: 1
  },
  {
    id: "mission-first-class-page",
    moduleId: "grade-8-software-digital-technologies",
    title: { en: "Mission: Ship the first page for your class", bg: "Мисия: Пусни първата страница на класа си" },
    brief: {
      en: "Build a single page that shows who your class is and works on a phone screen.",
      bg: "Направи една страница, която показва кой е класът ти и работи на екран на телефон."
    },
    deliverable: {
      en: "A working page with a heading, a list and an image, checked on a phone and on a laptop.",
      bg: "Работеща страница със заглавие, списък и изображение, проверена на телефон и на лаптоп."
    },
    skills: [
      { en: "Markup", bg: "Структура на страница" },
      { en: "Responsive layout", bg: "Адаптивно оформление" },
      { en: "Publishing", bg: "Публикуване" }
    ],
    estimatedMinutes: 60,
    sortOrder: 2
  },
  {
    id: "mission-form-validation",
    moduleId: "grade-8-software-digital-technologies",
    title: { en: "Mission: A form that refuses bad data", bg: "Мисия: Форма, която не приема грешни данни" },
    brief: {
      en: "Design a sign-up form for a school club that catches mistakes before they are submitted.",
      bg: "Проектирай форма за записване в училищен клуб, която хваща грешките, преди да бъдат изпратени."
    },
    deliverable: {
      en: "The form, a rule for every field, and five deliberately wrong inputs with the message each one triggers.",
      bg: "Формата, правило за всяко поле и пет умишлено грешни попълвания със съобщението, което всяко предизвиква."
    },
    skills: [
      { en: "Input validation", bg: "Проверка на входни данни" },
      { en: "Error messages", bg: "Съобщения за грешка" },
      { en: "User experience", bg: "Потребителско изживяване" }
    ],
    estimatedMinutes: 60,
    sortOrder: 3
  },
  {
    id: "mission-flowchart-calculator",
    moduleId: "grade-8-software-digital-technologies",
    title: { en: "Mission: A grade calculator drawn as a flowchart", bg: "Мисия: Калкулатор за оценки чрез блок-схема" },
    brief: {
      en: "Describe the exact steps that turn a list of marks into a term grade, including the tricky cases.",
      bg: "Опиши точните стъпки, които превръщат списък от оценки в срочна оценка, включително спорните случаи."
    },
    deliverable: {
      en: "A flowchart with at least two decision points and a dry run on three different students.",
      bg: "Блок-схема с поне две точки на решение и ръчно проследяване за трима различни ученици."
    },
    skills: [
      { en: "Flowcharts", bg: "Блок-схеми" },
      { en: "Conditional logic", bg: "Условна логика" },
      { en: "Edge cases", bg: "Гранични случаи" }
    ],
    estimatedMinutes: 45,
    sortOrder: 4
  },
  {
    id: "mission-bug-hunt",
    moduleId: "grade-8-software-digital-technologies",
    title: { en: "Mission: Hunt down five bugs", bg: "Мисия: Открий пет грешки" },
    brief: {
      en: "You get a small broken program and have to find each fault before you are allowed to fix it.",
      bg: "Получаваш малка счупена програма и трябва да откриеш всяка грешка, преди да ти е позволено да я поправиш."
    },
    deliverable: {
      en: "For each bug: what you expected, what happened, the cause, and the fix.",
      bg: "За всяка грешка: какво си очаквал, какво се е случило, причината и поправката."
    },
    skills: [
      { en: "Debugging", bg: "Дебъгване" },
      { en: "Reading code", bg: "Четене на код" },
      { en: "Persistence", bg: "Упоритост" }
    ],
    estimatedMinutes: 45,
    sortOrder: 5
  },
  {
    id: "mission-versions-and-backup",
    moduleId: "grade-8-software-digital-technologies",
    title: { en: "Mission: Never lose your work again", bg: "Мисия: Не губи работата си повече" },
    brief: {
      en: "Set up versions and backups so you can return to any earlier state of your project.",
      bg: "Организирай версии и резервни копия, за да можеш да се върнеш към всяко предишно състояние на проекта си."
    },
    deliverable: {
      en: "Your versioning rule, three saved versions, and proof that you restored an older one.",
      bg: "Правилото ти за версии, три запазени версии и доказателство, че си възстановил по-стара."
    },
    skills: [
      { en: "Version control", bg: "Управление на версии" },
      { en: "Backups", bg: "Резервни копия" },
      { en: "Work discipline", bg: "Работна дисциплина" }
    ],
    estimatedMinutes: 45,
    sortOrder: 6
  },
  {
    id: "mission-interactive-element",
    moduleId: "grade-8-software-digital-technologies",
    title: { en: "Mini project: Make the page react to a click", bg: "Мини проект: Направи страницата да реагира на клик" },
    brief: {
      en: "Add one interactive element to your class page that does something genuinely useful.",
      bg: "Добави един интерактивен елемент към страницата на класа си, който върши нещо наистина полезно."
    },
    deliverable: {
      en: "The working element, a note on how it behaves, and three tests including one wrong action.",
      bg: "Работещият елемент, бележка как се държи и три теста, включително едно грешно действие."
    },
    skills: [
      { en: "Interactivity", bg: "Интерактивност" },
      { en: "Event handling", bg: "Обработка на събития" },
      { en: "Testing", bg: "Тестване" }
    ],
    estimatedMinutes: 90,
    sortOrder: 7
  }
];

const intelligentSystemsMissions: CurriculumMission[] = [
  {
    id: "mission-train-a-classifier",
    moduleId: "grade-8-intelligent-digital-technologies",
    title: { en: "Mission: Teach a computer to sort", bg: "Мисия: Научи компютъра да подрежда" },
    brief: {
      en: "Create a tiny example dataset and rules for sorting school messages into useful categories.",
      bg: "Създай малък примерен набор от данни и правила за подреждане на училищни съобщения в полезни категории."
    },
    deliverable: {
      en: "Twelve labeled examples, a decision rule and a short fairness check.",
      bg: "Дванадесет означени примера, правило за решение и кратка проверка за справедливост."
    },
    skills: [
      { en: "Data literacy", bg: "Работа с данни" },
      { en: "Classification", bg: "Класификация" },
      { en: "Responsible AI", bg: "Отговорен AI" }
    ],
    estimatedMinutes: 45,
    sortOrder: 0
  },
  {
    id: "mission-collect-class-dataset",
    moduleId: "grade-8-intelligent-digital-technologies",
    title: { en: "Mission: Collect a dataset you can trust", bg: "Мисия: Събери данни, на които можеш да вярваш" },
    brief: {
      en: "Gather thirty real measurements from your class and clean out everything unusable.",
      bg: "Събери тридесет истински измервания от класа си и изчисти всичко неизползваемо."
    },
    deliverable: {
      en: "The raw table, the cleaned table, and a log of every row you removed with the reason.",
      bg: "Суровата таблица, изчистената таблица и списък на всеки премахнат ред с причината."
    },
    skills: [
      { en: "Data collection", bg: "Събиране на данни" },
      { en: "Data cleaning", bg: "Изчистване на данни" },
      { en: "Honesty in data", bg: "Честност при данните" }
    ],
    estimatedMinutes: 60,
    sortOrder: 1
  },
  {
    id: "mission-rule-versus-model",
    moduleId: "grade-8-intelligent-digital-technologies",
    title: { en: "Mission: Rule or learned pattern?", bg: "Мисия: Правило или научен модел?" },
    brief: {
      en: "Solve the same task twice: once with a rule you write, once with a pattern found in examples.",
      bg: "Реши една и съща задача два пъти: веднъж с правило, което сам написваш, и веднъж с модел от примери."
    },
    deliverable: {
      en: "Both solutions, the cases where each one fails, and your verdict on which fits this task.",
      bg: "Двете решения, случаите, в които всяко се проваля, и заключението ти кое подхожда на тази задача."
    },
    skills: [
      { en: "Rules vs models", bg: "Правила срещу модели" },
      { en: "Comparison", bg: "Сравняване" },
      { en: "Reasoning", bg: "Аргументиране" }
    ],
    estimatedMinutes: 45,
    sortOrder: 2
  },
  {
    id: "mission-find-the-bias",
    moduleId: "grade-8-intelligent-digital-technologies",
    title: { en: "Mission: Find the bias in the data", bg: "Мисия: Открий пристрастието в данните" },
    brief: {
      en: "Examine a dataset that quietly favours one group and work out who would be treated unfairly.",
      bg: "Разгледай набор от данни, който тихо облагодетелства една група, и открий кой би бил третиран несправедливо."
    },
    deliverable: {
      en: "The group that is under-represented, the harm it would cause, and two ways to fix the dataset.",
      bg: "Групата, която е слабо представена, вредата, която това би причинило, и два начина да се поправят данните."
    },
    skills: [
      { en: "Bias detection", bg: "Откриване на пристрастие" },
      { en: "Fairness", bg: "Справедливост" },
      { en: "Ethical reasoning", bg: "Етично мислене" }
    ],
    estimatedMinutes: 60,
    sortOrder: 3
  },
  {
    id: "mission-rule-based-chatbot",
    moduleId: "grade-8-intelligent-digital-technologies",
    title: { en: "Mission: A chatbot that answers school questions", bg: "Мисия: Чатбот, който отговаря на училищни въпроси" },
    brief: {
      en: "Script a rule-based assistant for the ten questions new students ask most often.",
      bg: "Напиши сценарий на помощник по правила за десетте въпроса, които новите ученици задават най-често."
    },
    deliverable: {
      en: "A dialogue script for ten questions, the fallback for anything unknown, and a test with a real classmate.",
      bg: "Диалогов сценарий за десет въпроса, резервен отговор за непознат въпрос и тест с истински съученик."
    },
    skills: [
      { en: "Dialogue design", bg: "Проектиране на диалог" },
      { en: "Rule systems", bg: "Системи от правила" },
      { en: "User testing", bg: "Тестване с потребител" }
    ],
    estimatedMinutes: 60,
    sortOrder: 4
  },
  {
    id: "mission-grade-an-ai-answer",
    moduleId: "grade-8-intelligent-digital-technologies",
    title: { en: "Mission: Grade an AI answer", bg: "Мисия: Оцени отговор на AI" },
    brief: {
      en: "Judge three AI answers to the same question against criteria you define before you read them.",
      bg: "Оцени три отговора на AI на един въпрос по критерии, които определяш, преди да си ги прочел."
    },
    deliverable: {
      en: "Your scoring criteria, the score for each answer, and the factual error you caught.",
      bg: "Критериите ти за оценяване, оценката на всеки отговор и фактическата грешка, която си хванал."
    },
    skills: [
      { en: "Evaluation criteria", bg: "Критерии за оценка" },
      { en: "Fact checking", bg: "Проверка на факти" },
      { en: "Judgement", bg: "Преценка" }
    ],
    estimatedMinutes: 45,
    sortOrder: 5
  },
  {
    id: "mission-sensor-decision",
    moduleId: "grade-8-intelligent-digital-technologies",
    title: { en: "Mission: A sensor that decides on its own", bg: "Мисия: Сензор, който решава сам" },
    brief: {
      en: "Design the logic for a classroom sensor that reacts to light or temperature without a person watching.",
      bg: "Проектирай логиката на сензор в класната стая, който реагира на светлина или температура без човек да го следи."
    },
    deliverable: {
      en: "The sensor, the threshold, the action it triggers, and what should happen when the reading is faulty.",
      bg: "Сензорът, границата на задействане, действието и какво трябва да стане при грешно отчитане."
    },
    skills: [
      { en: "Embedded thinking", bg: "Мислене за вградени системи" },
      { en: "Thresholds", bg: "Прагови стойности" },
      { en: "Failure handling", bg: "Реакция при отказ" }
    ],
    estimatedMinutes: 45,
    sortOrder: 6
  },
  {
    id: "mission-ai-study-helper",
    moduleId: "grade-8-intelligent-digital-technologies",
    title: { en: "Mini project: An AI helper for one school task", bg: "Мини проект: AI помощник за една училищна задача" },
    brief: {
      en: "Build an assistant that genuinely speeds up one repeated school task, and measure the difference.",
      bg: "Създай помощник, който наистина ускорява една повтаряща се училищна задача, и измери разликата."
    },
    deliverable: {
      en: "The working helper, timings with and without it, and an honest list of what it still gets wrong.",
      bg: "Работещият помощник, измерено време със и без него и честен списък какво още сбърква."
    },
    skills: [
      { en: "Applied AI", bg: "Приложен AI" },
      { en: "Measurement", bg: "Измерване" },
      { en: "Critical evaluation", bg: "Критична оценка" }
    ],
    estimatedMinutes: 90,
    sortOrder: 7
  }
];

const graphicsMissions: CurriculumMission[] = [
  {
    id: "mission-school-poster",
    moduleId: "grade-8-graphics-composition",
    title: { en: "Mission: Poster for a school event", bg: "Мисия: Плакат за училищно събитие" },
    brief: {
      en: "Create a clear visual concept that communicates one school event in three seconds.",
      bg: "Създай ясна визуална концепция, която представя училищно събитие за три секунди."
    },
    deliverable: {
      en: "Color palette, thumbnail sketches and one finished A4 composition.",
      bg: "Цветова палитра, малки композиционни скици и един завършен вариант A4."
    },
    skills: [
      { en: "Composition", bg: "Композиция" },
      { en: "Color", bg: "Цвят" },
      { en: "Visual communication", bg: "Визуална комуникация" }
    ],
    estimatedMinutes: 60,
    sortOrder: 0
  },
  {
    id: "mission-color-wheel-palette",
    moduleId: "grade-8-graphics-composition",
    title: { en: "Mission: Build your school's palette", bg: "Мисия: Изгради палитрата на училището си" },
    brief: {
      en: "Derive a five-color palette from your school's identity and justify every choice on the color wheel.",
      bg: "Извлечи палитра от пет цвята от идентичността на училището си и обоснови всеки избор по цветовия кръг."
    },
    deliverable: {
      en: "Five swatches with their codes, the relationship you used, and the palette applied to one sample.",
      bg: "Пет цветни мостри с кодовете им, използваното отношение и палитрата, приложена върху един пример."
    },
    skills: [
      { en: "Color theory", bg: "Цветознание" },
      { en: "Palette building", bg: "Изграждане на палитра" },
      { en: "Justification", bg: "Обосноваване" }
    ],
    estimatedMinutes: 45,
    sortOrder: 1
  },
  {
    id: "mission-three-hierarchy-versions",
    moduleId: "grade-8-graphics-composition",
    title: { en: "Mission: One notice, three hierarchies", bg: "Мисия: Една обява, три йерархии" },
    brief: {
      en: "Design the same announcement three times, each emphasising a different piece of information.",
      bg: "Оформи една и съща обява три пъти, всеки път с акцент върху различна информация."
    },
    deliverable: {
      en: "Three versions, a note on what each one makes you read first, and the one your classmates chose.",
      bg: "Три версии, бележка какво кара окото да прочете първо всяка от тях и версията, избрана от съучениците ти."
    },
    skills: [
      { en: "Visual hierarchy", bg: "Визуална йерархия" },
      { en: "Emphasis", bg: "Акцентиране" },
      { en: "Iteration", bg: "Работа във варианти" }
    ],
    estimatedMinutes: 60,
    sortOrder: 2
  },
  {
    id: "mission-contrast-readability",
    moduleId: "grade-8-graphics-composition",
    title: { en: "Mission: Make it readable from the back row", bg: "Мисия: Направи го четимо от последния ред" },
    brief: {
      en: "Fix a design that looks nice on screen but becomes unreadable when printed or seen from far away.",
      bg: "Поправи дизайн, който изглежда добре на екран, но става нечетим при печат или отдалеч."
    },
    deliverable: {
      en: "The corrected design, the contrast values before and after, and a test from four metres away.",
      bg: "Поправеният дизайн, стойностите на контраста преди и след и тест от четири метра разстояние."
    },
    skills: [
      { en: "Contrast", bg: "Контраст" },
      { en: "Readability", bg: "Четимост" },
      { en: "Accessibility", bg: "Достъпност" }
    ],
    estimatedMinutes: 45,
    sortOrder: 3
  },
  {
    id: "mission-rule-of-thirds",
    moduleId: "grade-8-graphics-composition",
    title: { en: "Mission: Compose a photo on purpose", bg: "Мисия: Композирай снимка нарочно" },
    brief: {
      en: "Shoot the same subject twice, once centred and once composed, and explain which one holds attention.",
      bg: "Снимай един и същ обект два пъти, веднъж центрирано и веднъж композирано, и обясни кое задържа вниманието."
    },
    deliverable: {
      en: "Both photos with a grid overlay and a short analysis of where the eye travels in each.",
      bg: "Двете снимки с наложена мрежа и кратък анализ накъде пътува окото при всяка."
    },
    skills: [
      { en: "Framing", bg: "Кадриране" },
      { en: "Rule of thirds", bg: "Правило на третините" },
      { en: "Visual analysis", bg: "Визуален анализ" }
    ],
    estimatedMinutes: 45,
    sortOrder: 4
  },
  {
    id: "mission-type-pairing",
    moduleId: "grade-8-graphics-composition",
    title: { en: "Mission: Pick two fonts that work together", bg: "Мисия: Избери два шрифта, които работят заедно" },
    brief: {
      en: "Choose a heading and body font pair for a school publication and prove they stay readable at small sizes.",
      bg: "Избери двойка шрифтове за заглавие и основен текст за училищно издание и докажи, че остават четими в малък размер."
    },
    deliverable: {
      en: "The pairing with sizes and line spacing, one page set in it, and the reason you rejected two other pairs.",
      bg: "Двойката с размери и междуредие, една страница, оформена с нея, и причината да отхвърлиш други две двойки."
    },
    skills: [
      { en: "Typography", bg: "Типография" },
      { en: "Font pairing", bg: "Съчетаване на шрифтове" },
      { en: "Text hierarchy", bg: "Йерархия в текста" }
    ],
    estimatedMinutes: 45,
    sortOrder: 5
  },
  {
    id: "mission-refresh-school-emblem",
    moduleId: "grade-8-graphics-composition",
    title: { en: "Mission: Refresh an emblem without losing it", bg: "Мисия: Освежи емблема, без да я загубиш" },
    brief: {
      en: "Modernise a school or club emblem so it still works as a tiny icon and in one color.",
      bg: "Модернизирай емблема на училище или клуб така, че да работи и като малка иконка, и в един цвят."
    },
    deliverable: {
      en: "The original and your version, tested at 32 pixels and in black and white, with your changes listed.",
      bg: "Оригиналът и твоята версия, тествани при 32 пиксела и в черно-бяло, с изброени промени."
    },
    skills: [
      { en: "Simplification", bg: "Опростяване" },
      { en: "Scalability", bg: "Мащабируемост" },
      { en: "Respecting identity", bg: "Запазване на идентичност" }
    ],
    estimatedMinutes: 60,
    sortOrder: 6
  },
  {
    id: "mission-club-visual-identity",
    moduleId: "grade-8-graphics-composition",
    title: { en: "Mini project: A visual identity for a school club", bg: "Мини проект: Визуална идентичност на училищен клуб" },
    brief: {
      en: "Give one school club a complete look that anyone could apply without asking you.",
      bg: "Дай на един училищен клуб цялостен облик, който всеки може да прилага, без да те пита."
    },
    deliverable: {
      en: "A one-page guide with logo, palette, fonts and rules, plus three items designed with it.",
      bg: "Едностранично ръководство с логотип, палитра, шрифтове и правила и три материала, оформени по него."
    },
    skills: [
      { en: "Visual identity", bg: "Визуална идентичност" },
      { en: "Consistency", bg: "Последователност" },
      { en: "Design systems", bg: "Дизайн системи" }
    ],
    estimatedMinutes: 90,
    sortOrder: 7
  }
];

const cyberEthicsMissions: CurriculumMission[] = [
  {
    id: "mission-protect-school-account",
    moduleId: "grade-8-cyber-communication-ethics",
    title: { en: "Mission: Protect the school account", bg: "Мисия: Защити училищния профил" },
    brief: {
      en: "Investigate a safe fictional phishing scenario and decide what the student should do next.",
      bg: "Разследвай безопасен измислен phishing сценарий и реши какво трябва да направи ученикът."
    },
    deliverable: {
      en: "Risk checklist, incident report and a safe response message.",
      bg: "Списък с рискове, доклад за инцидент и безопасно съобщение за реакция."
    },
    skills: [
      { en: "Digital safety", bg: "Дигитална безопасност" },
      { en: "Incident reporting", bg: "Докладване на инцидент" },
      { en: "Ethical decisions", bg: "Етични решения" }
    ],
    estimatedMinutes: 45,
    sortOrder: 0
  },
  {
    id: "mission-spot-the-phish",
    moduleId: "grade-8-cyber-communication-ethics",
    title: { en: "Mission: Spot the fake among five messages", bg: "Мисия: Открий фалшивото сред пет съобщения" },
    brief: {
      en: "Five messages arrive and some are fake. Decide which, and name the exact clue that gave each away.",
      bg: "Пристигат пет съобщения и някои са фалшиви. Реши кои и назови точния признак, който издава всяко."
    },
    deliverable: {
      en: "A verdict for each message with the clue you used, and the one that almost fooled you.",
      bg: "Оценка за всяко съобщение с признака, който си използвал, и това, което почти те е заблудило."
    },
    skills: [
      { en: "Phishing recognition", bg: "Разпознаване на phishing" },
      { en: "Attention to detail", bg: "Внимание към детайла" },
      { en: "Verification habits", bg: "Навици за проверка" }
    ],
    estimatedMinutes: 45,
    sortOrder: 1
  },
  {
    id: "mission-class-code-of-ethics",
    moduleId: "grade-8-cyber-communication-ethics",
    title: { en: "Mission: Write the ethical code of your class", bg: "Мисия: Напишете етичния кодекс на класа си" },
    brief: {
      en: "Agree as a class on what is never acceptable online, even when it is technically possible.",
      bg: "Договорете се като клас какво никога не е приемливо онлайн, дори когато е технически възможно."
    },
    deliverable: {
      en: "Seven rules everyone signed, each with the reason behind it and the consequence of breaking it.",
      bg: "Седем правила, подписани от всички, всяко с причината зад него и последствието при нарушение."
    },
    skills: [
      { en: "Professional ethics", bg: "Професионална етика" },
      { en: "Group agreement", bg: "Групово споразумение" },
      { en: "Responsibility", bg: "Отговорност" }
    ],
    estimatedMinutes: 45,
    sortOrder: 2
  },
  {
    id: "mission-what-stays-private",
    moduleId: "grade-8-cyber-communication-ethics",
    title: { en: "Mission: Decide what stays private", bg: "Мисия: Реши какво остава лично" },
    brief: {
      en: "Sort a list of real personal details into what may be shared publicly, with a teacher, or with nobody.",
      bg: "Подреди списък с реални лични данни на такива, които може да са публични, само за учител, или за никого."
    },
    deliverable: {
      en: "The sorted list, the rule you used to decide, and two cases where classmates disagreed with you.",
      bg: "Подреденият списък, правилото, по което си решавал, и два случая, в които съученици не са се съгласили с теб."
    },
    skills: [
      { en: "Personal data", bg: "Лични данни" },
      { en: "Classification", bg: "Класифициране" },
      { en: "Boundaries", bg: "Граници" }
    ],
    estimatedMinutes: 45,
    sortOrder: 3
  },
  {
    id: "mission-report-through-right-channel",
    moduleId: "grade-8-cyber-communication-ethics",
    title: { en: "Mission: Report it through the right channel", bg: "Мисия: Докладвай по правилния ред" },
    brief: {
      en: "You discover a security problem in the school system. Work out who to tell, in what order, and how.",
      bg: "Откриваш проблем със сигурността в училищната система. Реши на кого да кажеш, в какъв ред и как."
    },
    deliverable: {
      en: "An escalation path with names or roles, the message you would send first, and what you must not do.",
      bg: "Път за ескалация с имена или роли, съобщението, което би изпратил първо, и какво не бива да правиш."
    },
    skills: [
      { en: "Responsible disclosure", bg: "Отговорно докладване" },
      { en: "Escalation", bg: "Ескалация" },
      { en: "Professional conduct", bg: "Професионално поведение" }
    ],
    estimatedMinutes: 45,
    sortOrder: 4
  },
  {
    id: "mission-voice-social-engineering",
    moduleId: "grade-8-cyber-communication-ethics",
    title: { en: "Mission: The caller who wants your password", bg: "Мисия: Обаждането, което иска паролата ти" },
    brief: {
      en: "Role-play a call from someone claiming to be from the school IT team and practise saying no politely.",
      bg: "Изиграйте обаждане от човек, който твърди, че е от училищния ИТ екип, и упражни учтивия отказ."
    },
    deliverable: {
      en: "A script of the call, the three pressure tactics used, and the exact sentences you used to refuse.",
      bg: "Сценарий на разговора, трите използвани техники за натиск и точните изречения, с които си отказал."
    },
    skills: [
      { en: "Social engineering", bg: "Социално инженерство" },
      { en: "Assertiveness", bg: "Умение да откажеш" },
      { en: "Verbal communication", bg: "Устна комуникация" }
    ],
    estimatedMinutes: 60,
    sortOrder: 5
  },
  {
    id: "mission-password-audit",
    moduleId: "grade-8-cyber-communication-ethics",
    title: { en: "Mission: Audit how your team stores secrets", bg: "Мисия: Провери как екипът ти пази тайни" },
    brief: {
      en: "Review how your project team shares passwords and access, then propose a safer routine they will accept.",
      bg: "Прегледай как екипът ти по проекта споделя пароли и достъп, после предложи по-безопасен ред, който ще приемат."
    },
    deliverable: {
      en: "The current practice, the three biggest risks in it, and a new routine the team agreed to try.",
      bg: "Текущата практика, трите най-големи риска в нея и нов ред, който екипът се е съгласил да пробва."
    },
    skills: [
      { en: "Access management", bg: "Управление на достъпа" },
      { en: "Security audit", bg: "Одит на сигурността" },
      { en: "Persuasion", bg: "Убедителност" }
    ],
    estimatedMinutes: 60,
    sortOrder: 6
  },
  {
    id: "mission-safety-handbook",
    moduleId: "grade-8-cyber-communication-ethics",
    title: { en: "Mini project: A safety handbook for younger students", bg: "Мини проект: Наръчник за безопасност за по-малките" },
    brief: {
      en: "Write the digital safety guide you wish you had been given in fifth grade.",
      bg: "Напиши ръководството за дигитална безопасност, което би искал да получиш в пети клас."
    },
    deliverable: {
      en: "A short handbook with rules, examples and what to do when it goes wrong, tested on one younger student.",
      bg: "Кратък наръчник с правила, примери и какво да правиш, когато нещо се обърка, тестван с един по-малък ученик."
    },
    skills: [
      { en: "Technical writing", bg: "Техническо писане" },
      { en: "Teaching others", bg: "Обучение на други" },
      { en: "Clarity", bg: "Яснота" }
    ],
    estimatedMinutes: 90,
    sortOrder: 7
  }
];

const cyberConflictMissions: CurriculumMission[] = [
  {
    id: "mission-facts-versus-assumptions",
    moduleId: "grade-8-cyber-conflict-communication",
    title: { en: "Mission: Separate facts from assumptions", bg: "Мисия: Раздели фактите от предположенията" },
    brief: {
      en: "Rewrite an emotional complaint about an incident so it contains only what can be proven.",
      bg: "Пренапиши емоционална жалба за инцидент така, че да съдържа само това, което може да се докаже."
    },
    deliverable: {
      en: "The original text and your version, with every sentence marked as fact, assumption or emotion.",
      bg: "Оригиналният текст и твоята версия, с всяко изречение отбелязано като факт, предположение или емоция."
    },
    skills: [
      { en: "Objective reporting", bg: "Обективно докладване" },
      { en: "Analysis", bg: "Анализ" },
      { en: "Precise language", bg: "Точен език" }
    ],
    estimatedMinutes: 45,
    sortOrder: 0
  },
  {
    id: "mission-stop-the-escalation",
    moduleId: "grade-8-cyber-conflict-communication",
    title: { en: "Mission: Stop an online argument escalating", bg: "Мисия: Спри ескалацията на онлайн спор" },
    brief: {
      en: "A group chat is turning hostile. Write the message that lowers the temperature instead of raising it.",
      bg: "Групов чат става враждебен. Напиши съобщението, което понижава напрежението, вместо да го повишава."
    },
    deliverable: {
      en: "Your de-escalating message, two replies you deliberately did not send, and why yours works better.",
      bg: "Твоето успокояващо съобщение, два отговора, които умишлено не си изпратил, и защо твоят работи по-добре."
    },
    skills: [
      { en: "De-escalation", bg: "Деескалация" },
      { en: "Tone control", bg: "Овладяване на тона" },
      { en: "Self-control", bg: "Самоконтрол" }
    ],
    estimatedMinutes: 45,
    sortOrder: 1
  },
  {
    id: "mission-respond-to-cyberbullying",
    moduleId: "grade-8-cyber-conflict-communication",
    title: { en: "Mission: Respond to cyberbullying", bg: "Мисия: Реагирай при кибертормоз" },
    brief: {
      en: "A classmate is being targeted online. Decide what to preserve, who to involve and what to say to them.",
      bg: "Съученик е обект на онлайн тормоз. Реши какво да запазиш, кого да включиш и какво да кажеш на него."
    },
    deliverable: {
      en: "An action plan with evidence to keep, adults to inform, and the supportive message you would send.",
      bg: "План за действие с доказателства за запазване, възрастни за уведомяване и подкрепящото съобщение, което би изпратил."
    },
    skills: [
      { en: "Incident response", bg: "Реакция при инцидент" },
      { en: "Evidence handling", bg: "Работа с доказателства" },
      { en: "Empathy", bg: "Съпричастност" }
    ],
    estimatedMinutes: 60,
    sortOrder: 2
  },
  {
    id: "mission-choose-escalation-path",
    moduleId: "grade-8-cyber-conflict-communication",
    title: { en: "Mission: Pick the right channel for each case", bg: "Мисия: Избери правилния канал за всеки случай" },
    brief: {
      en: "Four conflicts of different severity land on your desk. Route each one to the right person.",
      bg: "Четири конфликта с различна тежест стигат до теб. Насочи всеки към правилния човек."
    },
    deliverable: {
      en: "A routing table with the channel, the urgency and the reason for each of the four cases.",
      bg: "Таблица за насочване с канала, спешността и причината за всеки от четирите случая."
    },
    skills: [
      { en: "Triage", bg: "Приоритизиране на случаи" },
      { en: "Escalation paths", bg: "Пътища за ескалация" },
      { en: "Judgement", bg: "Преценка" }
    ],
    estimatedMinutes: 45,
    sortOrder: 3
  },
  {
    id: "mission-upset-user-conversation",
    moduleId: "grade-8-cyber-conflict-communication",
    title: { en: "Mission: Talk to someone who has lost their data", bg: "Мисия: Говори с човек, който е загубил данните си" },
    brief: {
      en: "Role-play helping an angry, frightened user without promising anything you cannot deliver.",
      bg: "Изиграй помагане на разгневен и изплашен потребител, без да обещаваш нещо, което не можеш да изпълниш."
    },
    deliverable: {
      en: "The conversation script, the three things you said to calm them, and the promise you refused to make.",
      bg: "Сценарият на разговора, трите неща, с които си го успокоил, и обещанието, което си отказал да дадеш."
    },
    skills: [
      { en: "Customer communication", bg: "Комуникация с потребител" },
      { en: "Calm under pressure", bg: "Спокойствие под напрежение" },
      { en: "Honesty", bg: "Честност" }
    ],
    estimatedMinutes: 60,
    sortOrder: 4
  },
  {
    id: "mission-written-incident-report",
    moduleId: "grade-8-cyber-conflict-communication",
    title: { en: "Mission: Write a report someone can act on", bg: "Мисия: Напиши доклад, по който може да се действа" },
    brief: {
      en: "Document one incident so precisely that a person who was not there could take over the case.",
      bg: "Опиши един инцидент толкова точно, че човек, който не е бил там, да може да поеме случая."
    },
    deliverable: {
      en: "A report with timeline, people involved, what was done, and what still needs deciding.",
      bg: "Доклад с хронология, участници, какво е направено и какво още предстои да се реши."
    },
    skills: [
      { en: "Incident documentation", bg: "Документиране на инцидент" },
      { en: "Chronology", bg: "Хронология" },
      { en: "Handover", bg: "Предаване на случай" }
    ],
    estimatedMinutes: 60,
    sortOrder: 5
  },
  {
    id: "mission-mediate-between-classmates",
    moduleId: "grade-8-cyber-conflict-communication",
    title: { en: "Mission: Mediate between two classmates", bg: "Мисия: Помири двама съученици" },
    brief: {
      en: "Two students blame each other for the same mistake. Run a conversation where both feel heard.",
      bg: "Двама ученици взаимно се обвиняват за една и съща грешка. Проведи разговор, в който и двамата се чувстват изслушани."
    },
    deliverable: {
      en: "The rules you set for the conversation, what each side agreed to, and the outcome in one sentence.",
      bg: "Правилата, които си въвел за разговора, с какво се е съгласила всяка страна и резултатът в едно изречение."
    },
    skills: [
      { en: "Mediation", bg: "Медиация" },
      { en: "Neutrality", bg: "Безпристрастност" },
      { en: "Facilitation", bg: "Водене на разговор" }
    ],
    estimatedMinutes: 60,
    sortOrder: 6
  },
  {
    id: "mission-class-response-protocol",
    moduleId: "grade-8-cyber-conflict-communication",
    title: { en: "Mini project: Your class response protocol", bg: "Мини проект: Протокол за реакция на класа" },
    brief: {
      en: "Turn everything you learned this term into a one-page protocol your class will actually use.",
      bg: "Превърни всичко научено този срок в едностраничен протокол, който класът ти наистина ще ползва."
    },
    deliverable: {
      en: "A one-page protocol with steps, contacts and templates, reviewed and approved by your class.",
      bg: "Едностраничен протокол със стъпки, контакти и образци, прегледан и одобрен от класа ти."
    },
    skills: [
      { en: "Procedure design", bg: "Създаване на процедура" },
      { en: "Synthesis", bg: "Обобщаване" },
      { en: "Team approval", bg: "Съгласуване с екип" }
    ],
    estimatedMinutes: 90,
    sortOrder: 7
  }
];

export const gradeEightMissions: CurriculumMission[] = [
  ...digitalFoundationMissions,
  ...entrepreneurshipMissions,
  ...informationTechnologyMissions,
  ...softwareMissions,
  ...intelligentSystemsMissions,
  ...graphicsMissions,
  ...cyberEthicsMissions,
  ...cyberConflictMissions
];
