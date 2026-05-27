import { getPathLessons, learningPaths, lessons } from "./data";
import { isLessonUnlocked } from "./level";
import type { Language } from "./i18n";

export function getPathById(pathId: string) {
  return learningPaths.find((path) => path.id === pathId);
}

export function getNextLesson(completedLessonIds: Set<string>) {
  return lessons
    .filter((lesson) => !completedLessonIds.has(lesson.id))
    .find((lesson) => isLessonUnlocked(lesson, completedLessonIds));
}

export function getPathProgress(pathId: string, completedLessonIds: Set<string>) {
  const pathLessons = getPathLessons(pathId);
  const completed = pathLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;

  return {
    completed,
    total: pathLessons.length,
    percent: pathLessons.length ? Math.round((completed / pathLessons.length) * 100) : 0
  };
}

export function getLessonExample(lessonId: string) {
  const examples: Record<string, string> = {
    "js-variables": "const course = 'JavaScript Fundamentals';\nlet xp = 40;\nxp = xp + 10;",
    "js-functions": "function addXp(currentXp: number, lessonXp: number) {\n  return currentXp + lessonXp;\n}",
    "js-arrays": "const lessons = ['Variables', 'Functions', 'Arrays'];\nconst titles = lessons.map((lesson) => lesson.toUpperCase());",
    "py-variables": "course = 'Python Basics'\nxp = 40\nxp = xp + 10",
    "py-loops": "lessons = ['variables', 'loops']\nfor lesson in lessons:\n    print(lesson)",
    "api-basics": "GET /api/lessons\nPOST /api/progress\nPATCH /api/lessons/:id",
    "auth-flow": "1. User signs in\n2. App receives a session\n3. API checks the user before saving progress"
  };

  return examples[lessonId] ?? "Complete the reading, then apply the idea in a small exercise.";
}

export function getLessonPractice(lessonId: string, language: Language = "en") {
  const practice: Record<string, string> = {
    "js-variables": "Create three variables for course name, current XP, and completed lesson count.",
    "js-functions": "Write a function that receives current XP and lesson XP, then returns the new total.",
    "js-arrays": "Create an array of lesson titles and render only the titles that include the letter a.",
    "py-variables": "Create variables for a learner profile and print a short progress message.",
    "py-loops": "Loop over a list of lesson names and print a numbered learning plan.",
    "api-basics": "Sketch three routes for lessons, paths, and progress using the correct HTTP method.",
    "auth-flow": "Write the steps an app follows from login to protected progress save."
  };

  const practiceBg: Record<string, string> = {
    "js-variables": "Създай три променливи за име на курс, текущ XP и брой завършени уроци.",
    "js-functions": "Напиши функция, която приема текущ XP и XP от урок, после връща новия total.",
    "js-arrays": "Създай масив с имена на уроци и покажи само тези, които съдържат буквата a.",
    "py-variables": "Създай променливи за learner profile и отпечатай кратко progress съобщение.",
    "py-loops": "Минѝ през списък с имена на уроци и отпечатай номериран learning план.",
    "api-basics": "Скицирай три routes за lessons, paths и progress с правилния HTTP метод.",
    "auth-flow": "Опиши стъпките от login до защитено записване на progress."
  };

  if (language === "bg") {
    return practiceBg[lessonId] ?? "Напиши кратък пример, който прилага основната идея от урока.";
  }

  return practice[lessonId] ?? "Write a short example that applies the main idea from this lesson.";
}
