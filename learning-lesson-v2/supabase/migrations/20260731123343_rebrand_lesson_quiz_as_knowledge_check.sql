-- Rebrand the learner-facing lesson quiz to “Самопроверка” / “Knowledge check”.
-- Historic table names, question IDs, topic keys and RPC errors stay unchanged so
-- cached deployments and in-flight lesson attempts remain compatible.

update public.lessons
set
  code_example = $$await fetch('/api/progress', {
  method: 'POST',
  body: JSON.stringify({ lessonId: '1', knowledgeCheckAnswers })
});$$,
  solution = 'Send the lesson id and knowledge-check answers. The protected database function derives user_id, validates unlock order and the knowledge check, then writes fixed XP and completion time.'
where id = '4';

update public.lessons
set
  code_example = $$const prompt = 'Return a JSON lesson summary with title, goals and knowledgeCheck.';$$,
  mission = 'Write a prompt that asks for a short lesson summary and three knowledge-check questions.',
  mission_bg = 'Напиши prompt, който иска кратко резюме на урок и три въпроса за самопроверка.',
  solution = 'Return JSON with title, summary, goals: string[] and knowledgeCheck: {question, answer}[]'
where id = '5';

update public.lessons
set
  explanation = 'Modern frontends load lesson progress, quests and knowledge-check questions from APIs using fetch.',
  explanation_bg = 'Модерните frontend приложения зареждат прогрес, мисии и въпроси за самопроверка от API чрез fetch.'
where id = '11';

update public.lessons
set
  title = 'Knowledge Check Builder Mission',
  title_bg = 'Мисия: Създател на самопроверка',
  explanation = 'A knowledge-check builder picks a topic, filters a question bank and returns a short random practice set.',
  explanation_bg = 'Създателят на самопроверка избира тема, филтрира банка от въпроси и връща кратък случаен набор за упражнение.',
  code_example = $$function generateKnowledgeCheckQuestions(topic, count) {
  const pool = questionBank.filter((q) => q.topic === topic);
  return shuffle(pool).slice(0, count);
}$$,
  mission = 'Write a generateKnowledgeCheckQuestions(topic, count) function that filters by topic and returns count random questions.',
  mission_bg = 'Напиши generateKnowledgeCheckQuestions(topic, count), която филтрира по тема и връща желания брой случайни въпроси.',
  solution = $$function generateKnowledgeCheckQuestions(topic, count, bank) {
  const pool = bank.filter((question) => question.topic === topic);
  return shuffle(pool).slice(0, count);
}$$
where id = '13';

update public.lessons
set
  code_example = $$await fetch('/api/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ lessonId: '4', knowledgeCheckAnswers })
});$$,
  solution = '1) The mission panel sends the lesson id and knowledge-check answers to POST /api/progress. 2) The API validates the session and payload. 3) A protected Supabase RPC validates unlock order and knowledge-check state, then atomically updates progress and XP.'
where id = '19';

update public.lessons
set solution = $$const response = await fetch('/api/progress', { method: 'POST', body: JSON.stringify({ lessonId, knowledgeCheckAnswers }) });
if (!response.ok) {
  const body = await response.json();
  throw new Error(body.error ?? 'Save failed');
}$$
where id = '23';

update public.lessons
set
  title = 'Knowledge Check Prompt Mission',
  title_bg = 'Мисия: Prompt за самопроверка',
  explanation = 'Knowledge-check builders need prompts that return options, one correct index, and a short explanation.',
  explanation_bg = 'Създателите на самопроверки имат нужда от prompts, които връщат отговори, един верен индекс и кратко обяснение.',
  mission = 'Write a prompt that generates three knowledge-check questions for the CSS topic.',
  mission_bg = 'Напиши prompt, който генерира три въпроса за самопроверка по темата CSS.'
where id = '27';

update public.lessons
set
  mission = 'Sketch a protected API route that accepts a topic and returns generated knowledge-check questions.',
  mission_bg = 'Скицирай защитен API route, който приема тема и връща генерирани въпроси за самопроверка.',
  solution = 'POST /api/knowledge-checks/generate → require user → call model with topic → validate JSON → return questions array.'
where id = '29';

update public.lessons
set
  mission = 'Write three validation rules for AI-generated knowledge-check questions before they appear to learners.',
  mission_bg = 'Напиши три правила за валидиране на генерирани от AI въпроси за самопроверка, преди да се покажат на учениците.'
where id = '30';

update public.lessons
set
  hint1 = 'Include quest id, bilingual fields, unlock order, and knowledge-check topic.',
  hint1_bg = 'Включи ID на мисията, двуезични полета, ред на отключване и тема за самопроверка.',
  solution = 'Add Backend mission 19 about POST routes to game-data.ts with EN/BG text, append it to backend.lessonIds, and map the knowledge-check topic to api.'
where id = '37';

update public.lessons
set code_example = $$const lessonSummaryPrompt = 'Return JSON with title, goals, knowledgeCheck.';$$
where id = '52';

update public.quiz_questions
set
  question = 'What input does a knowledge-check builder need at minimum?',
  question_bg = 'Какво трябва да има създателят на самопроверка като минимум?'
where id = 'quiz-gen-1';

update public.quiz_questions
set
  question = 'Why should a knowledge check store an explanation with the correct answer?',
  question_bg = 'Защо самопроверката трябва да пази обяснение към верния отговор?'
where id = 'quiz-gen-2';

update public.quiz_questions
set question_bg = 'Кой въпрос е най-подходящ за справедлива самопроверка?'
where id = 'quiz-gen-3';
