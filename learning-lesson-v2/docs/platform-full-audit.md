# Пълен одит — Learning Lesson v2

Кодов одит от 4 паралелни агента (ученик, учител, админ, инфра/AI). Без runtime browser smoke.
**Дата:** 12 Aug 2026 · **Repo:** learning-lesson-v2

> **Вердикт за училищен пилот:** Ядрото за VIII клас + класна стая + уроци + AI наставник е достатъчно за пилот с 1–2 учители, ако production env (Supabase migrations + OpenAI) е настроен. Липсват още отчетност (дневник), известия, school-scoped admin и по-дълбоки e2e за teacher потоци.

| Метрика | Стойност |
| --- | --- |
| Готови способности | ~68 |
| Частични / слаби места | ~23 |
| Липси / backlog | ~25 |
| Зони одитирани | 4 |

## Статус след стабилизацията

| Обхват | Статус | Текущо състояние |
| --- | --- | --- |
| Production конфигурация на `e393f87` | Решено | `SUPABASE_SECRET_KEY` е server-side sensitive secret; `OPENAI_API_KEY` присъства; migrations съвпадат до `20260812160000`; `ENABLE_ADMIN_CONTENT_SEED` липсва |
| Teacher signup + admin allowlist | Решено | Регистрацията остава с роля `user`; админ промотира; опционалният `ADMIN_EMAIL_ALLOWLIST` се прилага server-side |
| DB load error semantics | Решено в основните потоци | Classroom, assignment, assessment, membership и project-submission loader-ите вече различават outage от валиден празен/not-found резултат |
| Teacher flow coverage | Частично | Има базов Playwright и route contracts за create/join/assign/submit/review/create assessment/submit/close |
| Co-teacher classwork authorization | Частично | Миграцията `20260812170000_authorize_co_teachers_for_classwork.sql` е готова и dry-run проверена; още не е приложена live и липсва invite/remove UI |
| Реална пилотна валидация | Отворено | Няма истински teacher + student multi-user smoke срещу live Supabase/RLS и реален mentor request |

---

## Готовност по зони

| Зона | Готово | Частично | Липсва | Оценка |
| --- | ---: | ---: | ---: | --- |
| Ученик | 18 | 6 | 7 | Pilot-ready |
| Учител | 16 | 4 | 8 | Pilot-ready |
| Админ / платформа | 14 | 5 | 5 | Операторски ready |
| AI наставник | 8 | 3 | 2 | Работи с ключ |
| Инфра / сигурност | 12 | 5 | 3 | Силна база |

Бройките са ориентировъчни групирания от одита (не line-count).

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
| Ученик | Inbox / известия / календар | Липсва | Няма централни alerts за deadlines/feedback |
| Ученик | Index /assignments и /projects | Частично | Само detail routes; overview липсва |
| Учител | Класове + join code + roster names | Готово | Create, rotate, enable, rename students |
| Учител | Задачи + ревю опашка | Готово | Assign mission, approve/needs_changes |
| Учител | Classroom assessments + analysis | Готово | Create, close, report, question analysis |
| Учител | Transfer / archive status | Готово | Ownership transfer + classroom status |
| Учител | Co-teacher управление | Частично | Classwork RPC authorization е готов в migration code; липсват invite/remove UI, live apply и multi-user smoke |
| Учител | Gradebook / export / bulk assign | Липсва | Няма дневник, CSV, копиране между класове |
| Учител | Родители / съобщения | Липсва | Няма guardian модел или messaging |
| Админ | Hub + пълен достъп | Готово | Управление + teacher/student/mentor shortcuts |
| Админ | CMS курсове/уроци/проекти/KC | Готово | Edit existing entities; seed при flag |
| Админ | Capstone reviews + роли | Готово | Queue + promote teacher/student |
| Админ | Create/delete съдържание в UI | Частично | Само PATCH на съществуващи записи |
| Админ | School-scoped admin (училище) | Липсва | Само глобален platform admin |
| Админ | Mentor analytics dashboard | Липсва | README TODO; само on/off статус |
| Админ | Admin allowlist enforcement | Готово | Опционален server-side `ADMIN_EMAIL_ALLOWLIST`; празна стойност запазва role-only admin access |
| Инфра | RLS / private RPCs / guest claims | Готово | Много hardening миграции |
| Инфра | CI lint+unit+e2e | Готово | Placeholder Supabase + fake auth |
| Инфра | Live Supabase/OpenAI CI | Частично | Няма ephemeral DB / real mentor integration |
| Инфра | Curriculum 9–12 клас | Липсва | README roadmap: само VIII клас foundation |

---

## Какво имаме — резюме

### Ученик
Пълен цикъл: регистрация → Днес → Обучение → урок (3 етапа) → клас/задачи/проверки → проекти/сертификат/профил.
Guest само първи урок. AI наставник е в задачата с 1 CTA и дневен лимит.

### Учител
Класове, join код, roster имена, assign mission, ревюта, assessments с анализ, transfer/archive.
Админът в DB вече е учител за всички класове (`is_classroom_teacher` + is_admin).

### Админ (platform)
CMS edit, capstone reviews, роли, seed (flag), пълен достъп към teacher/student/mentor изгледи.
Това е супер-админ на платформата — още няма „админ на училище“.

### Инфра / сигурност
Private RPCs, RLS, guest claims, CSP, mentor guardrails, CI verify (lint/unit/e2e).
CI не тества live Supabase policies или реален OpenAI път.

---

## Какво не е готово / рискове

### Оперативни рискове за пилот
Основните loader-и вече показват DB проблемите като грешки, а teacher signup не дава автоматично teacher role. Route contract тестовете покриват целия pilot API цикъл, но няма истински multi-user browser/RLS happy-path с отделни teacher и student акаунти.

### Production зависимости
Production secrets са конфигурирани и migrations съвпадат до `20260812160000`. Наличието на `OPENAI_API_KEY` още не доказва успешен live mentor request. Новата co-teacher миграция `20260812170000` остава за прилагане и live проверка.

### Product gaps (частично)
- Известия / inbox
- Gradebook + CSV
- Bulk assign / co-teacher UI
- Mentor analytics
- Curriculum 9–12

### Tenancy (липсва)
- School-scoped admin
- `school_id` в профили
- Изолация между училища

### Quality (технически дълг)
- Real multi-user teacher/student browser smoke
- Live Supabase RLS integration CI
- CMS create/delete

---

## Приоритизиран backlog

| Prio | Задача | Защо |
| --- | --- | --- |
| P0 | Приложи `20260812170000_authorize_co_teachers_for_classwork.sql` | Новият co-teacher достъп още не е live |
| P0 | Live pilot smoke с отделни teacher/student акаунти | Route contract тестовете не изпълняват реалните RLS policies |
| P0 | Live mentor smoke | Наличен secret не гарантира работещ OpenAI streaming path |
| P1 | Real Supabase RLS integration CI | Текущият CI използва fake auth и placeholder env |
| P1 | Student notifications (нов feedback / due date) | Пилотът иначе разчита на устни напомняния |
| P1 | Admin mentor usage dashboard | Оперативен контрол върху квоти/разходи |
| P2 | School-level admin (tenant) | За „админ на училище“ отделно от platform admin |
| P2 | Gradebook / CSV export / bulk assign | Училищна отчетност |
| P2 | Curriculum 9–12 | README roadmap |
| P2 | CMS create/delete + lesson discoverability | По-лесно съдържателно управление |

---

## Източници на одита

- Student explore agent
- Teacher explore agent
- Admin explore agent
- Infra/AI explore agent

Ключови файлове: `src/app/(dashboard|paths|classes|teacher|admin|lesson)`, `src/app/api/*`, `supabase/migrations/*`, README roadmap, `.github/workflows/learning-lesson-v2.yml`

> **Забележка:** Базовите метрики остават snapshot от първоначалния одит. Текущите статуси отразяват `main` на `e393f87` и локалния stabilization slice. SQL contract тестовете и fake-auth E2E не заменят истински multi-user RLS/live pilot smoke.
