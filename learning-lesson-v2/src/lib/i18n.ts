import type { LearningPath, Lesson } from "./types";
import type { GameLesson, GameQuest } from "./game-data";

export type Language = "bg" | "en";

export const languageCookie = "ll_lang";

export function localizePath(path: LearningPath, language: Language): LearningPath {
  if (language === "en") {
    return path;
  }

  return {
    ...path,
    title: path.titleBg ?? path.title,
    description: path.descriptionBg ?? path.description
  };
}

export function localizeLesson(lesson: Lesson, language: Language): Lesson {
  if (language === "en") {
    return lesson;
  }

  return {
    ...lesson,
    title: lesson.titleBg ?? lesson.title,
    summary: lesson.summaryBg ?? lesson.summary,
    content: lesson.contentBg ?? lesson.content
  };
}

export function localizeGameQuest(quest: GameQuest, language: Language): GameQuest {
  if (language === "en") {
    return quest;
  }

  return {
    ...quest,
    title: quest.titleBg ?? quest.title,
    description: quest.descriptionBg ?? quest.description,
    difficulty: quest.difficultyBg ?? quest.difficulty,
    estimatedTime: quest.estimatedTimeBg ?? quest.estimatedTime,
    rewardBadge: quest.rewardBadgeBg ?? quest.rewardBadge
  };
}

export function localizeGameLesson(lesson: GameLesson, language: Language): GameLesson {
  if (language === "en") {
    return lesson;
  }

  return {
    ...lesson,
    title: lesson.titleBg ?? lesson.title,
    explanation: lesson.explanationBg ?? lesson.explanation,
    mission: lesson.missionBg ?? lesson.mission,
    hint: lesson.hintBg ?? lesson.hint,
    hint1: lesson.hint1Bg ?? lesson.hint1,
    hint2: lesson.hint2Bg ?? lesson.hint2,
    hint3: lesson.hint3Bg ?? lesson.hint3
  };
}

export const dictionary = {
  bg: {
    nav: {
      dashboard: "Табло",
      paths: "Пътеки",
      admin: "Админ",
      login: "Вход",
      logout: "Изход",
      profile: "Профил",
      register: "Създай акаунт"
    },
    common: {
      lesson: "Урок",
      completed: "Завършен",
      unlocked: "Отключен",
      locked: "Заключен",
      start: "Старт",
      openLesson: "Отвори урока",
      backToPaths: "Назад към пътеките"
    },
    home: {
      badge: "Версия 2 MVP",
      title: "Стани Full-Stack Developer",
      subtitle:
        "Учи стъпка по стъпка чрез мисии, XP, нива и реални проекти.",
      startLearning: "Започни учене",
      continueLearning: "Продължи ученето",
      openDashboard: "Продължи ученето",
      browsePaths: "Започни учене",
      features: [
        { title: "Структурирани пътеки", text: "Уроците са групирани в ясни tracks." },
        { title: "XP и нива", text: "Завършването на уроци дава видим прогрес." },
        { title: "Supabase връзка", text: "Auth и progress записът са свързани." }
      ]
    },
    dashboard: {
      title: "Табло",
      guest: "Гост",
      demo: "Демо режим",
      subtitle: "Следи ниво, XP, текуща мисия, прогрес и серия.",
      continueLearning: "Продължи ученето",
      level: "Ниво",
      xp: "XP",
      completed: "Завършени",
      progress: "Прогрес",
      currentPath: "Текуща пътека",
      currentQuest: "Текуща мисия",
      currentMission: "Текущ урок",
      userLevel: "Ниво на потребителя",
      currentStreak: "Текуща серия",
      lessonsCompleted: "Завършени уроци",
      totalXp: "Общо XP",
      openMission: "Отвори урока",
      chooseQuest: "Избери мисия",
      supabaseTodo:
        "TODO Supabase Auth: замени localStorage прогреса с per-user Supabase progress, когато auth и profile roles са финализирани.",
      startLearning: "Започни учене",
      pickPath: "Избери пътека и завърши първия си урок.",
      nextLessons: "Следващи уроци",
      lessons: "урока"
    },
    paths: {
      badge: "Learning мисии",
      title: "Избери мисия",
      subtitle: "Всяка мисия отключва уроците по ред. Това е чист MVP blueprint за v2.",
      level: "Ниво",
      levels: "нива",
      missions: "урока",
      startQuest: "Започни мисия",
      continueQuest: "Продължи мисия"
    },
    login: {
      badge: "Supabase Auth",
      title: "Вход или регистрация",
      subtitle: "MVP версията използва Supabase email/password auth и пази прогреса за всеки потребител.",
      login: "Вход",
      register: "Регистрация",
      email: "Имейл",
      password: "Парола",
      createAccount: "Създай акаунт",
      working: "Работи...",
      missingConfig: "Добави Supabase keys в .env.local, за да включиш auth.",
      loggedIn: "Влезе успешно. Пренасочвам към таблото.",
      registered: "Акаунтът е създаден. Потвърди имейла, ако Supabase го изисква."
    },
    lesson: {
      understand: "Какво трябва да разбереш",
      bullets: [
        "Как тази концепция се вписва в текущата пътека.",
        "Кога да я използваш в малък реален проект.",
        "Коя грешка да избегнеш преди следващия урок."
      ],
      practice: "Практическа задача",
      example: "Пример",
      mission: "Мисия",
      missionTask: "Мисия / Задача",
      codeExample: "Примерен код",
      showHint: "Покажи подсказка",
      showSolution: "Покажи решение",
      completeMission: "Завърши мисията",
      completeMessage: "Мисията е завършена. +100 XP. Вече си Ниво",
      fallbackMission: "Приложи основната идея от този урок в малък пример.",
      fallbackHint: "Дръж примера малък и се фокусирай върху една концепция.",
      lockedMessage: "Завърши предишния урок, за да отключиш този.",
      demoSave: "Свържи Supabase и влез в профил, за да пазиш реален прогрес.",
      complete: "Завърши урока",
      saved: "Запазено",
      needsLogin: "Нужен е вход"
    },
    admin: {
      accessRequired: "Нужен е админ достъп",
      permissionRequired: "Нужни са админ права",
      signInMessage: "Админ зоната е защитена със Supabase Auth. Влез, преди да управляваш уроци и пътеки.",
      allowlistMessage: "Влязъл си в профил, но този имейл не е в admin allowlist.",
      goToLogin: "Към вход",
      protected: "Защитен админ",
      title: "Админ за уроци",
      subtitle: "Управление на MVP lesson blueprint, unlock ред, XP стойности и покритие на пътеките.",
      paths: "Пътеки",
      lessons: "Уроци",
      totalXp: "Общо XP",
      pathCoverage: "Покритие на пътеки",
      lesson: "Урок",
      path: "Пътека",
      order: "Ред",
      unlockRule: "Unlock правило",
      open: "Отворен",
      viewPaths: "Виж пътеки"
    }
  },
  en: {
    nav: {
      dashboard: "Dashboard",
      paths: "Paths",
      admin: "Admin",
      login: "Login",
      logout: "Logout",
      profile: "Profile",
      register: "Create Account"
    },
    common: {
      lesson: "Lesson",
      completed: "Completed",
      unlocked: "Unlocked",
      locked: "Locked",
      start: "Start",
      openLesson: "Open lesson",
      backToPaths: "Back to paths"
    },
    home: {
      badge: "Version 2 MVP",
      title: "Become a Full-Stack Developer",
      subtitle:
        "Learn step-by-step through quests, XP, levels and real projects.",
      startLearning: "Start Learning",
      continueLearning: "Continue Learning",
      openDashboard: "Continue Learning",
      browsePaths: "Start Learning",
      features: [
        { title: "Structured paths", text: "Lessons are grouped into clear tracks." },
        { title: "XP and levels", text: "Completion creates visible progression." },
        { title: "Supabase-ready", text: "Auth and progress persistence are wired in." }
      ]
    },
    dashboard: {
      title: "Dashboard",
      guest: "Guest",
      demo: "Demo mode",
      subtitle: "Track progress, unlock lessons, and keep the next learning step obvious.",
      continueLearning: "Continue learning",
      level: "Level",
      xp: "XP",
      completed: "Completed",
      progress: "Progress",
      currentPath: "Current path",
      currentQuest: "Current Quest",
      currentMission: "Current Mission",
      userLevel: "User Level",
      currentStreak: "Current Streak",
      lessonsCompleted: "Lessons Completed",
      totalXp: "Total XP",
      openMission: "Open Mission",
      chooseQuest: "Choose Quest",
      supabaseTodo:
        "TODO Supabase Auth: replace localStorage progress with per-user Supabase progress after auth and profile roles are finalized.",
      startLearning: "Start learning",
      pickPath: "Pick a learning path and complete your first lesson.",
      nextLessons: "Next lessons",
      lessons: "lessons"
    },
    paths: {
      badge: "Learning paths",
      title: "Choose Your Quest",
      subtitle: "Each path unlocks one lesson at a time. This local data is a clean MVP blueprint for v2.",
      level: "Level",
      levels: "levels",
      missions: "missions",
      startQuest: "Start Quest",
      continueQuest: "Continue Quest"
    },
    login: {
      badge: "Supabase Auth",
      title: "Login or create an account",
      subtitle: "This MVP uses Supabase email/password auth and stores lesson progress per user.",
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      createAccount: "Create account",
      working: "Working...",
      missingConfig: "Add Supabase keys in .env.local to enable auth.",
      loggedIn: "Logged in. Redirecting to dashboard.",
      registered: "Account created. Confirm email if required."
    },
    lesson: {
      understand: "What you should understand",
      bullets: [
        "How this concept fits inside the current path.",
        "When to use it in a small real project.",
        "What mistake to avoid before moving forward."
      ],
      practice: "Practice task",
      example: "Example",
      mission: "Mission",
      missionTask: "Mission / Task",
      codeExample: "Code Example",
      showHint: "Show Hint",
      showSolution: "Show Solution",
      completeMission: "Complete Mission",
      completeMessage: "Mission complete. +100 XP. You are now Level",
      fallbackMission: "Apply the main idea from this lesson in a small example.",
      fallbackHint: "Keep the example small and focus on one concept.",
      lockedMessage: "Complete the previous lesson to unlock this one.",
      demoSave: "Connect Supabase and log in to save real progress.",
      complete: "Complete lesson",
      saved: "Saved",
      needsLogin: "Needs login"
    },
    admin: {
      accessRequired: "Admin access required",
      permissionRequired: "Admin permission required",
      signInMessage: "The admin area is protected by Supabase Auth. Sign in before managing lessons and paths.",
      allowlistMessage: "Your account is signed in, but it is not included in the admin allowlist.",
      goToLogin: "Go to login",
      protected: "Protected admin",
      title: "Lessons admin",
      subtitle: "Manage the MVP lesson blueprint, unlock order, XP values, and path coverage.",
      paths: "Paths",
      lessons: "Lessons",
      totalXp: "Total XP",
      pathCoverage: "Path coverage",
      lesson: "Lesson",
      path: "Path",
      order: "Order",
      unlockRule: "Unlock rule",
      open: "Open",
      viewPaths: "View paths"
    }
  }
} as const;

export function t(language: Language) {
  return dictionary[language];
}
