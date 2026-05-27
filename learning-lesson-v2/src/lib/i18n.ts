import type { LearningPath, Lesson } from "./types";

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

export const dictionary = {
  bg: {
    nav: {
      dashboard: "Табло",
      paths: "Пътеки",
      admin: "Админ",
      login: "Вход"
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
      subtitle:
        "По-чиста основа за learning platform с вход, пътеки, уроци, XP, нива и Supabase progress.",
      openDashboard: "Отвори таблото",
      browsePaths: "Разгледай пътеките",
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
      subtitle: "Следи прогреса, отключвай уроци и продължавай от правилното място.",
      continueLearning: "Продължи ученето",
      level: "Ниво",
      xp: "XP",
      completed: "Завършени",
      progress: "Прогрес",
      currentPath: "Текуща пътека",
      startLearning: "Започни учене",
      pickPath: "Избери пътека и завърши първия си урок.",
      nextLessons: "Следващи уроци",
      lessons: "урока"
    },
    paths: {
      badge: "Learning пътеки",
      title: "Избери пътека",
      subtitle: "Всяка пътека отключва уроците по ред. Данните са чист MVP blueprint за v2.",
      level: "Ниво"
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
      login: "Login"
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
      subtitle:
        "A cleaner learning platform foundation with auth, paths, lessons, XP, levels, and Supabase progress.",
      openDashboard: "Open dashboard",
      browsePaths: "Browse paths",
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
      startLearning: "Start learning",
      pickPath: "Pick a learning path and complete your first lesson.",
      nextLessons: "Next lessons",
      lessons: "lessons"
    },
    paths: {
      badge: "Learning paths",
      title: "Choose a path",
      subtitle: "Each path unlocks one lesson at a time. This local data is a clean MVP blueprint for v2.",
      level: "Level"
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
