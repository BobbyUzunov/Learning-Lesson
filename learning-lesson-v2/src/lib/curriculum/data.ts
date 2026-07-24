import type { SchoolCurriculum } from "./types";

const admissionsUrl = "https://pgknma.com/priem/";

const sourceUrls = {
  software: "https://pgknma.com/media/uploads/2026/04/Разработка-на-софтуер-УП.pdf",
  intelligent: "https://pgknma.com/media/uploads/2026/04/Интелигентни-системи-УП.pdf",
  graphics: "https://pgknma.com/media/uploads/2026/04/Компютърна-графика-УП.pdf",
  cyber: "https://pgknma.com/media/uploads/2026/04/Киберсигурност-УП.pdf"
} as const;

export const fallbackSchoolCurriculum: SchoolCurriculum = {
  source: "fallback",
  specialties: [
    {
      id: "software-development",
      professionCode: "061303",
      title: { en: "Software Development", bg: "Разработка на софтуер" },
      description: {
        en: "Build web, mobile and server applications through programming, databases and software engineering.",
        bg: "Създавай уеб, мобилни и сървърни приложения чрез програмиране, бази данни и софтуерно инженерство."
      },
      accent: "violet",
      icon: "code",
      sourceUrl: sourceUrls.software,
      sortOrder: 0
    },
    {
      id: "intelligent-systems",
      professionCode: "061301",
      title: { en: "Intelligent Systems", bg: "Интелигентни системи" },
      description: {
        en: "Explore data, machine learning, generative AI and intelligent embedded systems.",
        bg: "Изследвай данни, машинно обучение, генеративен AI и интелигентни вградени системи."
      },
      accent: "mint",
      icon: "brain",
      sourceUrl: sourceUrls.intelligent,
      sortOrder: 1
    },
    {
      id: "computer-graphics",
      professionCode: "021102",
      title: { en: "Computer Graphics", bg: "Компютърна графика" },
      description: {
        en: "Turn ideas into visual systems through composition, color, typography, graphics and multimedia.",
        bg: "Превръщай идеи във визуални системи чрез композиция, цвят, типография, графика и мултимедия."
      },
      accent: "coral",
      icon: "palette",
      sourceUrl: sourceUrls.graphics,
      sortOrder: 2
    },
    {
      id: "cybersecurity",
      professionCode: "103202",
      title: { en: "Cybersecurity", bg: "Киберсигурност" },
      description: {
        en: "Protect people, accounts and systems through ethics, access control, incident response and defensive technologies.",
        bg: "Защитавай хора, профили и системи чрез етика, контрол на достъпа, реакция при инциденти и защитни технологии."
      },
      accent: "ink",
      icon: "shield",
      sourceUrl: sourceUrls.cyber,
      sortOrder: 3
    }
  ],
  modules: [
    {
      id: "grade-8-digital-foundation",
      specialtyId: null,
      gradeLevel: 8,
      type: "foundation",
      status: "pilot",
      title: { en: "Digital foundations", bg: "Обща дигитална основа" },
      description: {
        en: "A shared start for every eighth-grader: digital citizenship, problem solving, teamwork and responsible use of AI.",
        bg: "Общ старт за всеки осмокласник: дигитална култура, решаване на проблеми, работа в екип и отговорно използване на AI."
      },
      learningOutcomes: [
        { en: "Recognize trustworthy and unsafe digital behavior.", bg: "Разпознаваш надеждно и рисково дигитално поведение." },
        { en: "Break a practical problem into clear steps.", bg: "Разделяш практически проблем на ясни стъпки." },
        { en: "Document and present a team decision.", bg: "Документираш и представяш екипно решение." }
      ],
      theoryHours: null,
      practiceHours: null,
      sourceUrl: admissionsUrl,
      sortOrder: 0
    },
    {
      id: "grade-8-software-digital-technologies",
      specialtyId: "software-development",
      gradeLevel: 8,
      type: "sectoral",
      status: "pilot",
      title: { en: "Digital Technologies", bg: "Дигитални технологии" },
      description: {
        en: "The official eighth-grade professional subject introduces digital tools, computational thinking and the first software solution.",
        bg: "Официалният професионален предмет за VIII клас въвежда дигитални инструменти, алгоритмично мислене и първо софтуерно решение."
      },
      learningOutcomes: [
        { en: "Describe a problem with inputs, steps and expected output.", bg: "Описваш проблем чрез вход, стъпки и очакван резултат." },
        { en: "Create a simple algorithm or interface prototype.", bg: "Създаваш прост алгоритъм или прототип на интерфейс." },
        { en: "Test the solution with at least three cases.", bg: "Тестваш решението с поне три примера." }
      ],
      theoryHours: 18,
      practiceHours: 18,
      sourceUrl: sourceUrls.software,
      sortOrder: 1
    },
    {
      id: "grade-8-intelligent-digital-technologies",
      specialtyId: "intelligent-systems",
      gradeLevel: 8,
      type: "sectoral",
      status: "pilot",
      title: { en: "Digital Technologies", bg: "Дигитални технологии" },
      description: {
        en: "The official eighth-grade subject builds the digital and logical foundation needed for data and intelligent systems.",
        bg: "Официалният предмет за VIII клас изгражда дигиталната и логическата основа, необходима за данни и интелигентни системи."
      },
      learningOutcomes: [
        { en: "Organize examples into useful data categories.", bg: "Организираш примери в полезни категории от данни." },
        { en: "Explain the difference between a rule and a learned pattern.", bg: "Обясняваш разликата между правило и научен модел." },
        { en: "Identify bias and privacy risks in a small AI scenario.", bg: "Откриваш риск от пристрастие и нарушена поверителност в AI сценарий." }
      ],
      theoryHours: 18,
      practiceHours: 18,
      sourceUrl: sourceUrls.intelligent,
      sortOrder: 1
    },
    {
      id: "grade-8-graphics-composition",
      specialtyId: "computer-graphics",
      gradeLevel: 8,
      type: "sectoral",
      status: "pilot",
      title: { en: "Composition and Color Theory", bg: "Композиция и цветознание" },
      description: {
        en: "The official eighth-grade subject develops visual hierarchy, color relationships and purposeful composition.",
        bg: "Официалният предмет за VIII клас развива визуална йерархия, цветови отношения и целенасочена композиция."
      },
      learningOutcomes: [
        { en: "Build a clear focal point and visual hierarchy.", bg: "Изграждаш ясен фокус и визуална йерархия." },
        { en: "Choose a readable and meaningful color palette.", bg: "Избираш четима и смислена цветова палитра." },
        { en: "Explain design choices using visual principles.", bg: "Аргументираш дизайнерски решения с визуални принципи." }
      ],
      theoryHours: 18,
      practiceHours: 18,
      sourceUrl: sourceUrls.graphics,
      sortOrder: 1
    },
    {
      id: "grade-8-cyber-communication-ethics",
      specialtyId: "cybersecurity",
      gradeLevel: 8,
      type: "sectoral",
      status: "pilot",
      title: { en: "Professional Communication and Ethics", bg: "Професионална комуникация и етика" },
      description: {
        en: "The official eighth-grade subject starts with responsible behavior, clear communication and ethical decisions in security situations.",
        bg: "Официалният предмет за VIII клас започва с отговорно поведение, ясна комуникация и етични решения при ситуации, свързани със сигурността."
      },
      learningOutcomes: [
        { en: "Recognize social-engineering warning signs.", bg: "Разпознаваш предупредителни знаци за социално инженерство." },
        { en: "Respond to a suspected incident without destroying evidence.", bg: "Реагираш при съмнение за инцидент, без да унищожаваш доказателства." },
        { en: "Communicate a security problem calmly and ethically.", bg: "Съобщаваш проблем със сигурността спокойно и етично." }
      ],
      theoryHours: 18,
      practiceHours: null,
      sourceUrl: sourceUrls.cyber,
      sortOrder: 1
    },
    {
      id: "grade-8-cyber-conflict-communication",
      specialtyId: "cybersecurity",
      gradeLevel: 8,
      type: "sectoral",
      status: "pilot",
      title: { en: "Communication in Conflict Situations", bg: "Професионална комуникация в конфликтни ситуации" },
      description: {
        en: "Practical scenarios train students to collect facts, de-escalate tension and report an incident through the correct channel.",
        bg: "Практически сценарии учат учениците да събират факти, да намаляват напрежението и да докладват инцидент по правилния ред."
      },
      learningOutcomes: [
        { en: "Separate facts, assumptions and emotions in a report.", bg: "Разделяш факти, предположения и емоции в доклад." },
        { en: "Choose an appropriate escalation path.", bg: "Избираш подходящ ред за ескалация." }
      ],
      theoryHours: null,
      practiceHours: 18,
      sourceUrl: sourceUrls.cyber,
      sortOrder: 2
    }
  ],
  missions: [
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
      estimatedMinutes: 45
    },
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
      estimatedMinutes: 45
    },
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
      estimatedMinutes: 60
    },
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
      estimatedMinutes: 45
    }
  ],
  courseLinks: [
    { moduleId: "grade-8-software-digital-technologies", courseId: "frontend", sortOrder: 0 },
    { moduleId: "grade-8-software-digital-technologies", courseId: "backend", sortOrder: 1 },
    { moduleId: "grade-8-software-digital-technologies", courseId: "fullstack", sortOrder: 2 },
    { moduleId: "grade-8-software-digital-technologies", courseId: "mobile", sortOrder: 3 },
    { moduleId: "grade-8-intelligent-digital-technologies", courseId: "ai", sortOrder: 0 },
    { moduleId: "grade-8-intelligent-digital-technologies", courseId: "ai-product-builder", sortOrder: 1 },
    { moduleId: "grade-8-intelligent-digital-technologies", courseId: "backend", sortOrder: 2 },
    { moduleId: "grade-8-graphics-composition", courseId: "frontend", sortOrder: 0 },
    { moduleId: "grade-8-graphics-composition", courseId: "mobile", sortOrder: 1 },
    { moduleId: "grade-8-cyber-communication-ethics", courseId: "backend", sortOrder: 0 },
    { moduleId: "grade-8-cyber-communication-ethics", courseId: "fullstack", sortOrder: 1 }
  ]
};
