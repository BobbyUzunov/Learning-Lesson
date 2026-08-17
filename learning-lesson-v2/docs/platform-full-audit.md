# Пълен одит — Learning Lesson v2

Актуален статус след stabilization release-а.  
**Дата:** 13 Aug 2026 · **Repo:** learning-lesson-v2 · **Production commit:** `943fd48` · **PR:** #8 merged

> **Вердикт за училищен пилот:** Ядрото за VIII клас + класна стая + уроци + AI наставник е готово за пилот с 1–2 учители. GitHub, локалният `main`, Vercel и Supabase са синхронизирани. Остават реален browser smoke с два акаунта, live mentor заявка и по-късни product gaps (известия, дневник, tenancy).

| Метрика | Стойност |
| --- | --- |
| Production commit | `943fd48` |
| Unit тестове | 401 зелени |
| E2E тестове | 32/32 зелени |
| Supabase migrations | до `20260813150000` |
| Production сайт | READY |

---

## Какво завършихме

- Подредихме ученическата, учителската и администраторската навигация.
- Свързахме учебните мисии с лабораториите, XP прогреса и курсовете.
- Защитихме guest progress merge-а — браузърът вече не може сам да си присвоява XP.
- Добавихме стабилен CI с lint, TypeScript, unit, build и Playwright.
- Защитихме `main`: PR, verify, 1 approval и забранени force-push/delete.
- Teacher регистрацията вече не дава автоматично teacher права — админът промотира.
- Добавихме опционален server-side `ADMIN_EMAIL_ALLOWLIST`.
- Спряхме изтичането на Supabase/Postgres грешки към клиентите.
- Loaders вече различават реална DB повреда от валиден празен резултат.
- Co-teacher вече може да създава задания, да ревюира и да управлява assessments.
- Owner/admin може да кани и премахва co-teacher от настройките на класа.
- Поправихме production RPC дефекти при:
  - classroom `grade_level`;
  - project submission;
  - assignment submission;
  - assessment submission.
- Добавихме подробно contract покритие за основния teacher/student workflow.
- Приложихме всички Supabase миграции до `20260813150000`.
- Изтрихме безопасно всички вече merge-нати стари branches.

---

## Проверено и качено

| Обхват | Състояние |
| --- | --- |
| Последен production commit | `943fd48` |
| PR #8 | merge-нат |
| Production сайт | READY |
| Unit тестове | 401 зелени |
| E2E тестове | 32/32 зелени |
| Supabase DB lint | без schema грешки |
| Live rollback smoke | минаха без останали тестови данни |
| Синхронизация | GitHub, локален `main`, Vercel и Supabase |

Допълнителни runtime проверки:

- `SUPABASE_SECRET_KEY` е server-side sensitive secret; `OPENAI_API_KEY` присъства; `ENABLE_ADMIN_CONTENT_SEED` липсва в prod.
- Classroom, assignment, assessment, membership и project-submission loader-ите различават outage от валиден празен/not-found резултат.
- Co-teacher classwork authorization е live (`20260812170000`); assign/review/assessment правата минаха rollback SQL smoke.
- `20260812180000` подравнява classroom `smallint`/RPC `integer`; `20260812190000` поправя project/assignment upsert и assessment JSON броенето.
- `20260813150000` добавя list/add/remove co-teacher RPCs; приложена live.

---

## Какво остава

| Prio | Задача | Защо |
| --- | --- | --- |
| P0 | Browser smoke с два реални акаунта — teacher и student | Rollback SQL smoke не валидира браузър с реални Auth сесии, навигация и UI |
| P0 | Реална AI mentor заявка в production | Наличен `OPENAI_API_KEY` не гарантира работещ OpenAI streaming path |
| P1 | Календар и push известия | Inbox вече показва срокове/feedback; липсват календар и real-time alerts |
| P1 | Real Supabase RLS integration CI | Текущият CI използва fake auth и placeholder env |
| P2 | Gradebook / bulk assign | Дневник + CSV са готови; липсва копиране на задачи между класове |
| P2 | Mentor analytics | Оперативен контрол върху квоти/разходи |
| P2 | School-level tenancy | „Админ на училище“ отделно от platform admin |
| P2 | Curriculum 9–12 | README roadmap; сега само VIII клас foundation |
| P2 | CMS create/delete + lesson discoverability | По-лесно съдържателно управление |

---

## Готовност по зони

| Зона | Готово | Частично | Липсва | Оценка |
| --- | ---: | ---: | ---: | --- |
| Ученик | 18 | 6 | 7 | Pilot-ready |
| Учител | 16 | 4 | 8 | Pilot-ready |
| Админ / платформа | 14 | 5 | 5 | Операторски ready |
| AI наставник | 8 | 3 | 2 | Работи с ключ; липсва live request smoke |
| Инфра / сигурност | 12 | 5 | 3 | Силна база |

Бройките са ориентировъчни групирания от първоначалния одит (не line-count).

---

## Карта на функционалностите

| Домейн | Функция | Статус | Бележка |
| --- | --- | --- | --- |
| Ученик | Регистрация / вход / reset | Готово | /register, /login, verify, forgot/reset |
| Ученик | Днес (dashboard) | Готово | Следваща стъпка: assessment → задача → урок |
| Ученик | Обучение (Програма \| Лаборатории) | Готово | /paths с табове; /courses → redirect |
| Ученик | Урок Learn/Do/Check + hints | Готово | lesson-stages + knowledge check + progress API |
| Ученик | AI наставник в урок | Готово | Видим в задачата; 1 CTA; история; дневен лимит |
| Ученик | Клас hub + join + assignments | Готово | /classes, submit assignment API |
| Ученик | Classroom assessments | Готово | Списък, submit, review след опит |
| Ученик | Проекти + сертификати + профил | Готово | Capstone review + certificate page |
| Ученик | Inbox / известия / календар | Частично | /inbox + сигнали на Днес от задачи/проверки; няма календар/push |
| Ученик | Index /assignments и /projects | Частично | Само detail routes; overview липсва |
| Учител | Класове + join code + roster names | Готово | Create, rotate, enable, rename students |
| Учител | Задачи + ревю опашка | Готово | Assign mission, approve/needs_changes |
| Учител | Classroom assessments + analysis | Готово | Create, close, report, question analysis |
| Учител | Transfer / archive status | Готово | Ownership transfer + classroom status |
| Учител | Co-teacher classwork | Готово | Може да създава задания, да ревюира и да управлява assessments |
| Учител | Co-teacher invite/remove UI | Готово | Owner/admin кани и премахва от настройките на класа |
| Учител | Gradebook / export / bulk assign | Частично | Дневник по клас + CSV без имейли; няма bulk assign между класове |
| Учител | Родители / съобщения | Липсва | Няма guardian модел или messaging |
| Админ | Hub + пълен достъп | Готово | Управление + teacher/student/mentor shortcuts |
| Админ | CMS курсове/уроци/проекти/KC | Готово | Edit existing entities; seed при flag |
| Админ | Capstone reviews + роли | Готово | Queue + promote teacher/student |
| Админ | Create/delete съдържание в UI | Частично | Само PATCH на съществуващи записи |
| Админ | School-scoped admin (училище) | Липсва | Само глобален platform admin |
| Админ | Mentor analytics dashboard | Липсва | README TODO; само on/off статус |
| Админ | Admin allowlist enforcement | Готово | Опционален server-side `ADMIN_EMAIL_ALLOWLIST` |
| Инфра | RLS / private RPCs / guest claims | Готово | Guest merge е защитен; браузърът не си присвоява XP |
| Инфра | CI lint+unit+e2e | Готово | 401 unit + 32/32 Playwright; protected `main` |
| Инфра | Live Supabase/OpenAI CI | Частично | Няма ephemeral DB / real mentor integration |
| Инфра | Curriculum 9–12 клас | Липсва | README roadmap: само VIII клас foundation |

---

## Какво имаме — резюме

### Ученик
Пълен цикъл: регистрация → Днес → Обучение → урок (3 етапа) → клас/задачи/проверки → проекти/сертификат/профил.  
Guest само първи урок. AI наставник е в задачата с 1 CTA и дневен лимит.

### Учител
Класове, join код, roster имена, assign mission, ревюта, assessments с анализ, transfer/archive.  
Co-teacher може да създава задания, да ревюира и да управлява assessments. Owner/admin кани и премахва съучители от настройките на класа.

### Админ (platform)
CMS edit, capstone reviews, роли, seed (flag), пълен достъп към teacher/student/mentor изгледи.  
Това е супер-админ на платформата — още няма „админ на училище“.

### Инфра / сигурност
Private RPCs, RLS, guest claims, CSP, mentor guardrails, CI verify (lint/unit/e2e), protected `main`.  
CI не тества live Supabase policies или реален OpenAI път.

---

## Източници

- Student / teacher / admin / infra explore agents (първоначален одит, 12 Aug 2026)
- Stabilization release + live rollback SQL smoke
- Production sync: GitHub `main`, Vercel, Supabase до `20260813150000`

Ключови файлове: `src/app/(dashboard|paths|classes|teacher|admin|lesson)`, `src/app/api/*`, `supabase/migrations/*`, README roadmap, `.github/workflows/learning-lesson-v2.yml`
