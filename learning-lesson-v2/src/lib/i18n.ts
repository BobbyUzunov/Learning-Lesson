import type { GameLesson, GameQuest } from "./game-data";

export type Language = "bg" | "en";

export const languageCookie = "ll_lang";

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

export function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }, template);
}

export function formatMissionsProgress(language: Language, available: number, planned: number) {
  if (language === "bg") {
    const suffix = available === 1 ? "а" : "и";
    return `${available} наличн${suffix} / ${planned} планирани мисии`;
  }

  return `${available} available / ${planned} planned missions`;
}

export function formatStreakDays(language: Language, count: number) {
  if (language === "bg") {
    return count === 1 ? `${count} ден` : `${count} дни`;
  }

  return count === 1 ? `${count} Day` : `${count} Days`;
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
      startJourney: "Започни пътуването",
      nextReward: "Следваща награда",
      recentAchievements: "Последни постижения",
      achievements: "Постижения",
      levelProgress: "Прогрес на ниво",
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
      continueQuest: "Продължи мисия",
      guestBanner: "Пробвай първата мисия без регистрация. Създай акаунт, за да запазиш прогреса.",
      guestFreeMission: "Първата мисия е безплатна. Създай акаунт, за да запазиш прогреса и да отключиш останалите.",
      guestLockMessage: "Влез в акаунт, за да отключиш следващите мисии.",
      lessonLockMessage: "Завърши предишната мисия, за да отключиш тази.",
      timeLabel: "Време",
      xpRewardsLabel: "XP награди",
      availableLabel: "Налични",
      plannedLabel: "Планирани"
    },
    streak: {
      title: "Дневна серия",
      milestone: "{count} дни"
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
      missionInstructions: "Мисия и инструкции",
      yourSolution: "Твоето решение",
      solutionPlaceholder: "Напиши своя код тук...",
      missionCompletionArea: "Зона за завършване",
      missionCompletionHint: "Напиши решение или отключи всички подсказки, за да завършиш мисията.",
      allHintsRevealed: "Всички подсказки",
      hintButton: "Подсказка {n}",
      hintLabel: "Подсказка {n}:",
      hintsUsed: "Подсказки използвани: {used} / {total}",
      completeBeforeFinish: "Напиши решение или използвай подсказките преди да завършиш мисията.",
      allHintsUnlocked: "Всички подсказки вече са отключени.",
      tryFirstOrHint: "Опитай първо сам или използвай подсказка.",
      defaultHint: "Разбий задачата на малки стъпки и започни от основната структура.",
      defaultHint2: "Фокусирай се първо върху минимално работещ вариант по мисията.",
      defaultHint3: "Ако блокираш, тръгни от примерната структура:\n{codeExample}\nи я адаптирай към \"{mission}\".",
      guestModalTitle: "Браво! Завърши първата мисия 🎉",
      guestModalBody: "Създай безплатен акаунт, за да запазиш прогреса си, XP и отключените мисии.",
      guestModalRegister: "Създай акаунт",
      guestModalContinue: "Продължи като гост",
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
      subtitle: "Управление на quest blueprint, unlock ред, XP стойности и покритие на мисиите.",
      quests: "Мисии",
      paths: "Пътеки",
      lessons: "Уроци",
      totalXp: "Общо XP",
      questCoverage: "Покритие на мисии",
      pathCoverage: "Покритие на пътеки",
      lesson: "Урок",
      quest: "Мисия",
      path: "Пътека",
      order: "Ред",
      unlockRule: "Unlock правило",
      open: "Отворен",
      planned: "планирани",
      viewPaths: "Виж мисиите"
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
      startJourney: "Start Your Journey",
      nextReward: "Next Reward",
      recentAchievements: "Recent Achievements",
      achievements: "Achievements",
      levelProgress: "Level Progress",
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
      continueQuest: "Continue Quest",
      guestBanner: "Try the first mission without signing up. Create an account to save your progress.",
      guestFreeMission: "The first mission is free. Create an account to save progress and unlock the rest.",
      guestLockMessage: "Sign in to unlock the next missions.",
      lessonLockMessage: "Complete the previous mission to unlock this one.",
      timeLabel: "Time",
      xpRewardsLabel: "XP Rewards",
      availableLabel: "Available",
      plannedLabel: "Planned"
    },
    streak: {
      title: "Daily Streak",
      milestone: "{count} Days"
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
      missionInstructions: "Mission & Instructions",
      yourSolution: "Your solution",
      solutionPlaceholder: "Write your code here...",
      missionCompletionArea: "Mission completion area",
      missionCompletionHint: "Write a solution or unlock all hints to complete the mission.",
      allHintsRevealed: "All hints",
      hintButton: "Hint {n}",
      hintLabel: "Hint {n}:",
      hintsUsed: "Hints used: {used} / {total}",
      completeBeforeFinish: "Write a solution or use the hints before completing the mission.",
      allHintsUnlocked: "All hints are already unlocked.",
      tryFirstOrHint: "Try on your own first or use a hint.",
      defaultHint: "Break the task into small steps and start with the core structure.",
      defaultHint2: "Focus on a minimal working version of the mission first.",
      defaultHint3: "If you are stuck, start from the example structure:\n{codeExample}\nand adapt it to \"{mission}\".",
      guestModalTitle: "Great job! You finished the first mission 🎉",
      guestModalBody: "Create a free account to save your progress, XP, and unlocked missions.",
      guestModalRegister: "Create account",
      guestModalContinue: "Continue as guest",
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
      subtitle: "Manage the quest blueprint, unlock order, XP values, and quest coverage.",
      quests: "Quests",
      paths: "Paths",
      lessons: "Lessons",
      totalXp: "Total XP",
      questCoverage: "Quest coverage",
      pathCoverage: "Path coverage",
      lesson: "Lesson",
      quest: "Quest",
      path: "Path",
      order: "Order",
      unlockRule: "Unlock rule",
      open: "Open",
      planned: "planned",
      viewPaths: "View quests"
    }
  }
} as const;

export function t(language: Language) {
  return dictionary[language];
}
