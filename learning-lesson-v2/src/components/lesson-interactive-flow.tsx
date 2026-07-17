"use client";

import { useState } from "react";
import { LessonSection } from "@/components/lesson-section";
import { MissionPanel } from "@/components/mission-panel";
import { QuizGenerator } from "@/components/quiz-generator";
import type { GameLesson, GameQuest } from "@/lib/game-data";
import { t, type Language } from "@/lib/i18n";
import type { QuizAttempt, QuizContent } from "@/lib/quiz/types";

export function LessonInteractiveFlow({
  completedLessonIds,
  courses,
  isAuthenticated,
  language,
  lesson,
  quizContent
}: {
  completedLessonIds: string[];
  courses: GameQuest[];
  isAuthenticated: boolean;
  language: Language;
  lesson: GameLesson;
  quizContent: QuizContent;
}) {
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const copy = t(language);

  return (
    <>
      <LessonSection number={3} title={copy.syllabus.sectionTask}>
        <MissionPanel
          completedLessonIds={completedLessonIds}
          courses={courses}
          isAuthenticated={isAuthenticated}
          language={language}
          lesson={lesson}
          quizAttempt={quizAttempt}
        />
      </LessonSection>

      <LessonSection number={4} title={copy.syllabus.sectionCheck}>
        <QuizGenerator
          language={language}
          lessonId={lesson.id}
          onResult={setQuizAttempt}
          quizContent={quizContent}
        />
      </LessonSection>
    </>
  );
}
