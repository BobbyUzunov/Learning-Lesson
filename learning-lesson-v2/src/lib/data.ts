import type { LearningPath, Lesson } from "./types";

export const learningPaths: LearningPath[] = [
  {
    id: "javascript",
    title: "JavaScript Fundamentals",
    description: "Core syntax, functions, arrays, objects, and DOM thinking.",
    color: "bg-mint",
    difficulty: "beginner",
    requiredLevel: 1,
    lessonIds: ["js-variables", "js-functions", "js-arrays"]
  },
  {
    id: "python",
    title: "Python Basics",
    description: "Readable programming foundations with practical examples.",
    color: "bg-coral",
    difficulty: "beginner",
    requiredLevel: 1,
    lessonIds: ["py-variables", "py-loops"]
  },
  {
    id: "backend",
    title: "Backend Starter",
    description: "APIs, data models, authentication, and server-side habits.",
    color: "bg-violet",
    difficulty: "intermediate",
    requiredLevel: 2,
    lessonIds: ["api-basics", "auth-flow"]
  }
];

export const lessons: Lesson[] = [
  {
    id: "js-variables",
    pathId: "javascript",
    title: "Variables and Values",
    summary: "Learn how JavaScript stores and updates values.",
    content:
      "Variables are named references to values. Use const by default, let when the value changes, and avoid var in modern code.",
    xp: 40,
    order: 1
  },
  {
    id: "js-functions",
    pathId: "javascript",
    title: "Functions",
    summary: "Package behavior into reusable blocks.",
    content:
      "Functions accept input, run logic, and return output. Small functions make code easier to test and change.",
    xp: 55,
    order: 2,
    lockedBy: "js-variables"
  },
  {
    id: "js-arrays",
    pathId: "javascript",
    title: "Arrays",
    summary: "Work with ordered lists of data.",
    content:
      "Arrays keep values in order. Methods like map, filter, and reduce help transform collections without noisy loops.",
    xp: 65,
    order: 3,
    lockedBy: "js-functions"
  },
  {
    id: "py-variables",
    pathId: "python",
    title: "Python Variables",
    summary: "Store data with clean, readable names.",
    content:
      "Python variables do not need explicit type declarations. Clear names and simple expressions keep programs readable.",
    xp: 40,
    order: 1
  },
  {
    id: "py-loops",
    pathId: "python",
    title: "Loops",
    summary: "Repeat work with for and while loops.",
    content:
      "Use for loops for known collections and while loops when repetition depends on a condition that changes over time.",
    xp: 55,
    order: 2,
    lockedBy: "py-variables"
  },
  {
    id: "api-basics",
    pathId: "backend",
    title: "API Basics",
    summary: "Understand routes, requests, and responses.",
    content:
      "An API exposes predictable operations. Good routes use clear nouns, proper HTTP methods, and consistent response shapes.",
    xp: 70,
    order: 1
  },
  {
    id: "auth-flow",
    pathId: "backend",
    title: "Authentication Flow",
    summary: "Connect identity to protected user data.",
    content:
      "Authentication proves who a user is. Authorization decides what that user can do after signing in.",
    xp: 80,
    order: 2,
    lockedBy: "api-basics"
  }
];

export function getLesson(id: string) {
  return lessons.find((lesson) => lesson.id === id);
}

export function getPathLessons(pathId: string) {
  return lessons.filter((lesson) => lesson.pathId === pathId).sort((a, b) => a.order - b.order);
}
