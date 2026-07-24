# Learning Lesson

Практическа учебна платформа за **професионални гимназии** — учениците избират дигитална професия, изпълняват кратки мисии с реален резултат, а учителите следят напредъка на класа.

[![Live Demo](https://img.shields.io/badge/Live-learning--lesson--v2.vercel.app-black)](https://learning-lesson-v2.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Active-success)](#)

**Живо приложение:** [learning-lesson-v2.vercel.app](https://learning-lesson-v2.vercel.app)

Пилотът следва учебните планове на [ПГКНМА](https://pgknma.com) за прием 2026/2027 · VIII клас.

---

## За какво е платформата

Learning Lesson свързва **официалната училищна програма** с работа в час:

- ученикът избира едно от **четирите дигитални направления**;
- получава **практическа мисия** с ясно „какво ще направиш“ и „какво ще предадеш“;
- събира измерим резултат (портфолио), а не само тест;
- учителят създава **клас с код**, възлага мисии и вижда кой е активен.

Целта не е още един курс по програмиране за самоуки. Целта е **урочна среда за професионална гимназия**: мисии, клас, напредък и реални deliverables.

---

## Четири направления (VIII клас)

| Направление | Какво тренира |
|-------------|---------------|
| Разработка на софтуер | Алгоритмично мислене, логика, прототипи |
| Интелигентни системи | Данни, автоматизация, практични AI сценарии |
| Компютърна графика | Композиция, цвят, визуална комуникация |
| Киберсигурност | Защита на акаунти, дигитална хигиена, рискове |

Плюс общи предмети (ИТ, предприемачество и др.), подредени по модули за учебната година.

---

## За кого е

### Ученици
- избират професия и започват с препоръчана мисия;
- разглеждат мисиите по модули (без да се претрупват с десетки задачи наведнъж);
- влизат в клас с код от учителя;
- предават задания и получават обратна връзка;
- следят XP, ниво и прогрес в таблото.

### Учители
- създават клас с учебна година и код за присъединяване;
- архивират клас, въртят или спират кода, прехвърлят собственост;
- възлагат училищни мисии и рецензират предаденото;
- виждат справки по клас **без** ученически имейл (име + кратък идентификатор).

### Администратори
- назначават учителска роля;
- управляват каталог с уроци, проекти и ревюта.

---

## Какво включва (v2)

- училищна програма и мисии за VIII клас по официалните планове;
- класни стаи, join код, задания и рецензии;
- практически курсове в платформата (теория → задача → quiz);
- AI помощник за подсказки в урок (без готови решения);
- прогрес, XP, сертификати;
- интерфейс на **български и английски**.

---

## Структура на хранилището

| Папка | Статус |
|-------|--------|
| [`learning-lesson-v2/`](learning-lesson-v2/) | **Активен продукт** — Next.js 15, Supabase, Vercel |
| [`learning-lesson-v1/`](learning-lesson-v1/) | Legacy MVP |

Технически детайли за разработка: [learning-lesson-v2/README.md](learning-lesson-v2/README.md)

---

## Бърз старт

```bash
git clone https://github.com/BobbyUzunov/Learning-Lesson.git
cd Learning-Lesson/learning-lesson-v2
npm install
cp .env.local.example .env.local
npm run dev
```

Отвори [http://localhost:3000](http://localhost:3000)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key   # по желание — AI подсказки
```

Миграциите са в `learning-lesson-v2/supabase/migrations/`.

---

## English summary

**Learning Lesson** is a vocational high-school learning platform for digital careers. Students pick a profession, complete short practical missions with real deliverables, and join classes with a teacher code. Teachers assign missions, review submissions, and track class progress. The grade 8 pilot follows [PGKNMA](https://pgknma.com) curricula for Software Development, Intelligent Systems, Computer Graphics, and Cybersecurity.
