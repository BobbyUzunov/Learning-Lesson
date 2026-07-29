import type { AssessmentType } from "./types";

export type AssessmentTemplateSpecialty =
  | "software-development"
  | "intelligent-systems"
  | "computer-graphics"
  | "cybersecurity";

type LocalizedText = {
  bg: string;
  en: string;
};

export type AssessmentTemplateQuestion = {
  id: string;
  prompt: LocalizedText;
  options: LocalizedText[];
  correctOption: number;
  explanation: LocalizedText;
  points: number;
};

export type AssessmentTemplate = {
  id: string;
  moduleId: string;
  specialtyId: AssessmentTemplateSpecialty | null;
  gradeLevel: 8;
  suggestedType: AssessmentType;
  durationMinutes: number;
  title: LocalizedText;
  description: LocalizedText;
  questions: AssessmentTemplateQuestion[];
};

export type LocalizedAssessmentTemplate = {
  id: string;
  specialtyId: AssessmentTemplateSpecialty | null;
  title: string;
  description: string;
  durationMinutes: number;
  suggestedType: AssessmentType;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    correctOption: number;
    explanation: string;
    points: number;
  }>;
};

const question = (
  id: string,
  promptBg: string,
  promptEn: string,
  options: Array<[bg: string, en: string]>,
  correctOption: number,
  explanationBg: string,
  explanationEn: string
): AssessmentTemplateQuestion => ({
  id,
  prompt: { bg: promptBg, en: promptEn },
  options: options.map(([bg, en]) => ({ bg, en })),
  correctOption,
  explanation: { bg: explanationBg, en: explanationEn },
  points: 1
});

export const assessmentTemplates: AssessmentTemplate[] = [
  {
    id: "grade-8-digital-foundation-check",
    moduleId: "grade-8-digital-foundation",
    specialtyId: null,
    gradeLevel: 8,
    suggestedType: "diagnostic",
    durationMinutes: 15,
    title: {
      bg: "Обща дигитална основа — 8. клас",
      en: "Digital foundations — Grade 8"
    },
    description: {
      bg: "Проверка на общи умения за надеждна информация, безопасност, работа в екип и отговорно използване на AI.",
      en: "A check of shared skills in reliable information, safety, teamwork, and responsible AI use."
    },
    questions: [
      question(
        "digital-source",
        "Кой е най-надеждният начин да провериш твърдение, намерено онлайн?",
        "What is the most reliable way to verify a claim found online?",
        [
          ["Да го приемеш, ако има много харесвания", "Accept it if it has many likes"],
          ["Да го сравниш с няколко независими надеждни източника", "Compare it with several independent reliable sources"],
          ["Да прочетеш само заглавието", "Read only the headline"],
          ["Да го препратиш и да попиташ дали е вярно", "Forward it and ask whether it is true"]
        ],
        1,
        "Надеждната проверка сравнява автора, датата, доказателствата и повече от един независим източник.",
        "Reliable verification compares the author, date, evidence, and more than one independent source."
      ),
      question(
        "digital-account",
        "Коя практика защитава най-добре училищен профил?",
        "Which practice best protects a school account?",
        [
          ["Една кратка парола за всички сайтове", "One short password for every website"],
          ["Парола с името на училището", "A password containing the school name"],
          ["Уникална дълга парола и двуфакторна защита", "A unique long password and two-factor authentication"],
          ["Записване на паролата в публичен документ", "Saving the password in a public document"]
        ],
        2,
        "Уникалната дълга парола ограничава щетите при пробив, а вторият фактор добавя още една защита.",
        "A unique long password limits damage from a breach, while a second factor adds another layer of protection."
      ),
      question(
        "digital-problem",
        "Коя е най-добрата първа стъпка при сложна дигитална задача?",
        "What is the best first step when facing a complex digital task?",
        [
          ["Да започнеш на случаен принцип", "Start at random"],
          ["Да разделиш проблема на по-малки ясни стъпки", "Break the problem into smaller clear steps"],
          ["Да копираш първото готово решение", "Copy the first ready-made solution"],
          ["Да пропуснеш проверката на резултата", "Skip checking the result"]
        ],
        1,
        "Разделянето на проблема прави работата измерима и позволява всяка стъпка да бъде проверена.",
        "Breaking down a problem makes the work manageable and allows each step to be checked."
      ),
      question(
        "digital-ai",
        "AI помощник дава убедителен отговор без източници. Какво трябва да направиш?",
        "An AI assistant gives a convincing answer without sources. What should you do?",
        [
          ["Да го предадеш като сигурен факт", "Submit it as a certain fact"],
          ["Да провериш твърденията в надеждни източници и да посочиш използването на AI", "Verify the claims with reliable sources and disclose the use of AI"],
          ["Да добавиш лично данни, за да стане по-точен", "Add personal data to make it more accurate"],
          ["Да премахнеш всички различни мнения", "Remove all differing viewpoints"]
        ],
        1,
        "Генерираният отговор може да съдържа грешки или пристрастия; човекът носи отговорност за проверката.",
        "Generated answers can contain errors or bias; the human remains responsible for verification."
      ),
      question(
        "digital-teamwork",
        "Двама ученици редактират един файл и част от работата изчезва. Коя практика помага най-много?",
        "Two students edit one file and part of the work disappears. Which practice helps most?",
        [
          ["Всеки да пази различна версия без имена", "Each person keeps an unnamed separate version"],
          ["Да се използват споделен файл, ясни роли и история на версиите", "Use a shared file, clear roles, and version history"],
          ["Да се изтрият старите версии веднага", "Delete old versions immediately"],
          ["Само един ученик да знае какво е променено", "Only one student knows what changed"]
        ],
        1,
        "Ясните роли и историята на версиите позволяват промяната да бъде проследена и възстановена.",
        "Clear roles and version history make changes traceable and recoverable."
      ),
      question(
        "digital-privacy",
        "Коя информация не бива да публикуваш в общодостъпна училищна презентация?",
        "Which information should not be published in a publicly accessible school presentation?",
        [
          ["Заглавието на проекта", "The project title"],
          ["Имената на използваните източници", "The names of the sources used"],
          ["Личен адрес, телефон и пароли", "A home address, phone number, and passwords"],
          ["Обобщени резултати без лични данни", "Aggregated results without personal data"]
        ],
        2,
        "Чувствителните лични данни и тайните за достъп не трябва да бъдат публични.",
        "Sensitive personal data and access secrets must not be made public."
      ),
      question(
        "digital-accessibility",
        "Как правиш важна инструкция по-достъпна за повече ученици?",
        "How do you make an important instruction accessible to more students?",
        [
          ["Използваш само цвят, за да покажеш значението", "Use color alone to show meaning"],
          ["Пишеш с много дребен декоративен шрифт", "Use a very small decorative font"],
          ["Добавяш ясен текст, добър контраст и описание на важните изображения", "Add clear text, good contrast, and descriptions for important images"],
          ["Слагаш всичко в едно дълго изречение", "Put everything in one long sentence"]
        ],
        2,
        "Ясният текст, контрастът и текстовите алтернативи помагат при различни зрителни и учебни потребности.",
        "Clear text, contrast, and text alternatives support different visual and learning needs."
      ),
      question(
        "digital-feedback",
        "Коя обратна връзка е най-полезна за екип?",
        "Which feedback is most useful to a team?",
        [
          ["„Не ми харесва.“", "‘I do not like it.’"],
          ["„Всичко е перфектно.“", "‘Everything is perfect.’"],
          ["„Не разбирам бутона за предаване; добавете ясен надпис до него.“", "‘I cannot understand the submit button; add a clear label next to it.’"],
          ["„Направете го като другия проект.“", "‘Make it like the other project.’"]
        ],
        2,
        "Полезната обратна връзка описва конкретен проблем и предлага проверима посока за подобрение.",
        "Useful feedback describes a specific problem and suggests a testable direction for improvement."
      )
    ]
  },
  {
    id: "grade-8-information-technology-check",
    moduleId: "grade-8-information-technology",
    specialtyId: null,
    gradeLevel: 8,
    suggestedType: "formative",
    durationMinutes: 15,
    title: {
      bg: "Информационни технологии — 8. клас",
      en: "Information Technology — Grade 8"
    },
    description: {
      bg: "Обща проверка за документи, електронни таблици, диаграми, източници и безопасна съвместна работа.",
      en: "A shared check on documents, spreadsheets, charts, sources, and safe collaboration."
    },
    questions: [
      question(
        "it-file-name",
        "Кое име на файл е най-ясно за екипен проект?",
        "Which file name is clearest for a team project?",
        [
          ["ново(7).docx", "new(7).docx"],
          ["проект.docx", "project.docx"],
          ["8a_energy_report_v03_2026-10-14.docx", "8a_energy_report_v03_2026-10-14.docx"],
          ["asdf.docx", "asdf.docx"]
        ],
        2,
        "Ясното име съдържа тема, екип или клас, версия и дата, без двусмислие.",
        "A clear name includes the topic, team or class, version, and date without ambiguity."
      ),
      question(
        "it-headings",
        "Защо е по-добре да използваш стилове „Заглавие 1“ и „Заглавие 2“, вместо само да увеличиш шрифта?",
        "Why is it better to use Heading 1 and Heading 2 styles instead of only enlarging the font?",
        [
          ["Стиловете дават структура и позволяват автоматично съдържание", "Styles provide structure and enable an automatic table of contents"],
          ["Стиловете винаги правят файла по-малък", "Styles always make the file smaller"],
          ["Стиловете скриват правописните грешки", "Styles hide spelling mistakes"],
          ["Стиловете забраняват редакцията", "Styles prevent editing"]
        ],
        0,
        "Стиловете описват логическата структура и подобряват навигацията и достъпността.",
        "Styles describe the logical structure and improve navigation and accessibility."
      ),
      question(
        "it-sum",
        "Коя формула събира стойностите от клетки B2 до B6?",
        "Which formula adds the values from cells B2 through B6?",
        [
          ["=SUM(B2:B6)", "=SUM(B2:B6)"],
          ["=B2:B6", "=B2:B6"],
          ["SUM=B2+B6", "SUM=B2+B6"],
          ["=COUNT(B2:B6)", "=COUNT(B2:B6)"]
        ],
        0,
        "SUM със диапазона B2:B6 събира всички стойности в този диапазон.",
        "SUM with the range B2:B6 adds all values in that range."
      ),
      question(
        "it-chart",
        "Коя диаграма е най-подходяща за промяната на температурата през седем дни?",
        "Which chart is most suitable for showing temperature changes over seven days?",
        [
          ["Линейна диаграма", "Line chart"],
          ["Кръгова диаграма", "Pie chart"],
          ["Случайна колекция от икони", "A random collection of icons"],
          ["Текст без стойности", "Text without values"]
        ],
        0,
        "Линейната диаграма ясно показва промяна и тенденция във времето.",
        "A line chart clearly shows change and trends over time."
      ),
      question(
        "it-misleading-chart",
        "Коя промяна може да направи диаграмата подвеждаща?",
        "Which change can make a chart misleading?",
        [
          ["Ясно заглавие и мерни единици", "A clear title and units"],
          ["Посочен източник на данните", "A stated data source"],
          ["Отрязана ос, която преувеличава малка разлика", "A truncated axis that exaggerates a small difference"],
          ["Еднакъв мащаб за сравняваните стойности", "A consistent scale for compared values"]
        ],
        2,
        "Отрязаната ос може визуално да представи малка разлика като огромна.",
        "A truncated axis can visually turn a small difference into a huge one."
      ),
      question(
        "it-collaboration",
        "Как е най-добре да предложиш промяна в споделен документ, без да изтриеш чужда работа?",
        "What is the best way to propose a change in a shared document without deleting someone else's work?",
        [
          ["Изтриваш целия раздел", "Delete the entire section"],
          ["Използваш коментар или режим за предложения", "Use a comment or suggestion mode"],
          ["Сваляш файла и не казваш на екипа", "Download the file and do not tell the team"],
          ["Създаваш десет копия с еднакви имена", "Create ten copies with identical names"]
        ],
        1,
        "Коментарите и предложенията пазят оригинала и правят решението на екипа проследимо.",
        "Comments and suggestions preserve the original and make the team decision traceable."
      ),
      question(
        "it-citation",
        "Какво трябва да запишеш, когато използваш информация от уеб страница?",
        "What should you record when using information from a web page?",
        [
          ["Само цвета на сайта", "Only the website color"],
          ["Автор или организация, заглавие, адрес и дата на достъп", "Author or organization, title, address, and access date"],
          ["Само първото изречение", "Only the first sentence"],
          ["Личната си парола", "Your personal password"]
        ],
        1,
        "Тези данни позволяват източникът да бъде намерен и проверен.",
        "These details allow the source to be found and verified."
      ),
      question(
        "it-sharing",
        "Трябва да покажеш проект на външно жури, без то да го редактира. Какво право за достъп избираш?",
        "You need to show a project to an external jury without allowing edits. Which access level do you choose?",
        [
          ["Редактор за всеки в интернет", "Editor for anyone on the internet"],
          ["Собственик", "Owner"],
          ["Само преглед чрез ограничен линк", "View-only through a restricted link"],
          ["Пълен достъп до целия училищен диск", "Full access to the entire school drive"]
        ],
        2,
        "Дава се само минималното право, необходимо за задачата — в случая преглед.",
        "Grant only the minimum permission needed for the task—in this case, viewing."
      )
    ]
  },
  {
    id: "grade-8-entrepreneurship-check",
    moduleId: "grade-8-entrepreneurship",
    specialtyId: null,
    gradeLevel: 8,
    suggestedType: "formative",
    durationMinutes: 15,
    title: {
      bg: "Предприемачество — 8. клас",
      en: "Entrepreneurship — Grade 8"
    },
    description: {
      bg: "Обща проверка за откриване на реален проблем, потребители, разходи, прототип и представяне на решение.",
      en: "A shared check on real problems, users, costs, prototypes, and presenting a solution."
    },
    questions: [
      question(
        "business-problem",
        "Кое е добро описание на проблем за ученически проект?",
        "Which is a good problem statement for a student project?",
        [
          ["„Искаме да направим приложение.“", "‘We want to make an app.’"],
          ["„Новите ученици трудно намират свободните кабинети при промяна в програмата.“", "‘New students struggle to find available rooms when the timetable changes.’"],
          ["„Всички трябва да харесат идеята ни.“", "‘Everyone must like our idea.’"],
          ["„Технологиите са интересни.“", "‘Technology is interesting.’"]
        ],
        1,
        "Доброто описание посочва конкретни хора, ситуация и наблюдаема трудност.",
        "A good problem statement identifies specific people, a situation, and an observable difficulty."
      ),
      question(
        "business-interview",
        "Кой въпрос към потребител е най-неутрален?",
        "Which user interview question is the most neutral?",
        [
          ["„Нали нашата идея е страхотна?“", "‘Our idea is great, isn't it?’"],
          ["„Ще платиш ли веднага за това?“", "‘Will you pay for this immediately?’"],
          ["„Разкажи ми как последно реши този проблем.“", "‘Tell me how you solved this problem last time.’"],
          ["„Защо не използваш нашето решение?“", "‘Why don't you use our solution?’"]
        ],
        2,
        "Неутралният въпрос търси реално минало поведение, без да подсказва желания отговор.",
        "A neutral question asks about real past behavior without suggesting the desired answer."
      ),
      question(
        "business-user",
        "Какво означава „целева група“?",
        "What does ‘target group’ mean?",
        [
          ["Всички хора без разлика", "Every person without distinction"],
          ["Хората с обща нужда, за които създаваме решението", "People with a shared need for whom we create the solution"],
          ["Само членовете на екипа", "Only the team members"],
          ["Само хората, които вече са купили продукта", "Only people who have already bought the product"]
        ],
        1,
        "Целевата група помага решението и комуникацията да бъдат насочени към ясна нужда.",
        "A target group helps focus the solution and communication on a clear need."
      ),
      question(
        "business-value",
        "Кое твърдение е ясно предложение за стойност?",
        "Which statement is a clear value proposition?",
        [
          ["„Имаме много функции.“", "‘We have many features.’"],
          ["„Помагаме на осмокласници да намерят правилния кабинет за по-малко от минута.“", "‘We help eighth-graders find the right classroom in under a minute.’"],
          ["„Нашият проект е най-добрият.“", "‘Our project is the best.’"],
          ["„Използваме модерен цвят.“", "‘We use a modern color.’"]
        ],
        1,
        "Предложението за стойност свързва конкретен потребител, нужда и измерима полза.",
        "A value proposition connects a specific user, need, and measurable benefit."
      ),
      question(
        "business-profit",
        "Изработката на един продукт струва 8 лв., а продажната цена е 12 лв. Каква е общата печалба от 10 продадени броя?",
        "One item costs BGN 8 to make and sells for BGN 12. What is the total profit from 10 items sold?",
        [
          ["4 лв.", "BGN 4"],
          ["20 лв.", "BGN 20"],
          ["40 лв.", "BGN 40"],
          ["120 лв.", "BGN 120"]
        ],
        2,
        "Печалбата на брой е 12 − 8 = 4 лв.; за 10 броя е 40 лв.",
        "Profit per item is 12 − 8 = BGN 4; for 10 items it is BGN 40."
      ),
      question(
        "business-prototype",
        "Каква е основната цел на първия прототип?",
        "What is the main purpose of a first prototype?",
        [
          ["Да бъде напълно завършен продукт", "To be a completely finished product"],
          ["Бързо да провери най-рисковото допускане с потребители", "To quickly test the riskiest assumption with users"],
          ["Да съдържа всяка възможна функция", "To contain every possible feature"],
          ["Да избегне всякаква обратна връзка", "To avoid all feedback"]
        ],
        1,
        "Прототипът е евтин и бърз начин да научим дали решението е разбираемо и полезно.",
        "A prototype is a cheap and quick way to learn whether the solution is understandable and useful."
      ),
      question(
        "business-evidence",
        "Кое е най-силното доказателство, че прототипът решава проблема?",
        "Which is the strongest evidence that a prototype solves the problem?",
        [
          ["Екипът много го харесва", "The team likes it very much"],
          ["Петима подходящи потребители изпълняват основната задача и описват ползата", "Five relevant users complete the main task and describe the benefit"],
          ["Има красиво лого", "It has a beautiful logo"],
          ["Презентацията има много слайдове", "The presentation has many slides"]
        ],
        1,
        "Наблюдаваното поведение на реални представители на целевата група е по-силно от мнение на екипа.",
        "Observed behavior from real target users is stronger evidence than the team's opinion."
      ),
      question(
        "business-pitch",
        "Коя последователност прави краткото представяне най-ясно?",
        "Which sequence makes a short pitch clearest?",
        [
          ["Цветове → име на екипа → край", "Colors → team name → end"],
          ["Проблем → целева група → решение → доказателство → следваща стъпка", "Problem → target group → solution → evidence → next step"],
          ["Всички технически детайли → проблем", "All technical details → problem"],
          ["Обещание без данни → цена", "Promise without data → price"]
        ],
        1,
        "Тази структура показва защо решението е нужно, за кого е и как е проверено.",
        "This structure shows why the solution is needed, who it is for, and how it was tested."
      )
    ]
  },
  {
    id: "grade-8-software-digital-technologies-check",
    moduleId: "grade-8-software-digital-technologies",
    specialtyId: "software-development",
    gradeLevel: 8,
    suggestedType: "formative",
    durationMinutes: 20,
    title: {
      bg: "Разработка на софтуер: Дигитални технологии — 8. клас",
      en: "Software Development: Digital Technologies — Grade 8"
    },
    description: {
      bg: "Проверка на алгоритмично мислене, вход и изход, условия, повторения, тестване и отстраняване на грешки.",
      en: "A check on computational thinking, input and output, conditions, repetition, testing, and debugging."
    },
    questions: [
      question(
        "software-ipo",
        "Програма изчислява среден успех от въведени оценки. Кое е входът?",
        "A program calculates an average from entered grades. What is the input?",
        [
          ["Въведените оценки", "The entered grades"],
          ["Изчисленият среден успех", "The calculated average"],
          ["Съобщението „Готово“", "The ‘Done’ message"],
          ["Цветът на бутона", "The button color"]
        ],
        0,
        "Входът са данните, които системата получава; средният успех е резултатът.",
        "Input is the data the system receives; the average is the output."
      ),
      question(
        "software-algorithm",
        "Кое описание е алгоритъм?",
        "Which description is an algorithm?",
        [
          ["Красива илюстрация", "A beautiful illustration"],
          ["Крайна и подредена поредица от ясни стъпки за решаване на задача", "A finite ordered sequence of clear steps for solving a task"],
          ["Списък с произволни идеи", "A list of random ideas"],
          ["Резултат без обяснение", "A result without an explanation"]
        ],
        1,
        "Алгоритъмът има ясни, подредени и изпълними стъпки и трябва да приключва.",
        "An algorithm has clear, ordered, executable steps and must eventually finish."
      ),
      question(
        "software-condition",
        "Коя конструкция е нужна за правилото „ако точките са поне 60, покажи ‘успешно’, иначе ‘опитай отново’“?",
        "Which construct is needed for the rule ‘if the score is at least 60, show pass; otherwise show try again’ ?",
        [
          ["Условие с два клона", "A condition with two branches"],
          ["Само повторение", "Only a loop"],
          ["Само коментар", "Only a comment"],
          ["Случайна стойност", "A random value"]
        ],
        0,
        "Условието избира различно действие според това дали проверката е вярна или невярна.",
        "A condition chooses a different action depending on whether a test is true or false."
      ),
      question(
        "software-loop",
        "Трябва да покажеш една и съща инструкция за всеки от 24 ученици. Коя идея е най-подходяща?",
        "You need to show the same instruction for each of 24 students. Which idea is most suitable?",
        [
          ["Повторение за всеки ученик", "A loop for each student"],
          ["24 различни програми", "24 different programs"],
          ["Изтриване на списъка", "Deleting the list"],
          ["Условие без действие", "A condition without an action"]
        ],
        0,
        "Повторението изпълнява една и съща логика за всеки елемент, без ненужно дублиране.",
        "A loop runs the same logic for each item without unnecessary duplication."
      ),
      question(
        "software-variable",
        "Каква е ролята на променлива в алгоритъм?",
        "What is the role of a variable in an algorithm?",
        [
          ["Пази стойност, която алгоритъмът може да използва или промени", "Store a value that the algorithm can use or change"],
          ["Винаги рисува изображение", "Always draw an image"],
          ["Свързва компютъра с ток", "Connect the computer to power"],
          ["Забранява всички грешки", "Prevent all errors"]
        ],
        0,
        "Променливата дава име на стойност, която участва в изчисления и решения.",
        "A variable gives a name to a value used in calculations and decisions."
      ),
      question(
        "software-flowchart",
        "Какво обикновено означава ромбът в блок-схема?",
        "What does a diamond usually represent in a flowchart?",
        [
          ["Начало или край", "Start or end"],
          ["Въпрос или условие с разклонение", "A question or condition with branching"],
          ["Само заглавие", "Only a title"],
          ["Файл с изображение", "An image file"]
        ],
        1,
        "Ромбът представя решение, от което излизат пътища като „да“ и „не“.",
        "A diamond represents a decision with paths such as yes and no."
      ),
      question(
        "software-test",
        "Форма приема възраст от 14 до 18 години. Кой набор тества най-добре границите?",
        "A form accepts ages from 14 to 18. Which set best tests the boundaries?",
        [
          ["15, 16, 17", "15, 16, 17"],
          ["13, 14, 18, 19", "13, 14, 18, 19"],
          ["Само 16", "Only 16"],
          ["1, 100", "1, 100"]
        ],
        1,
        "Стойностите точно на границата и непосредствено извън нея разкриват чести грешки.",
        "Values exactly on and immediately outside the boundaries reveal common errors."
      ),
      question(
        "software-debug",
        "Резултатът на алгоритъма е грешен. Каква е най-добрата следваща стъпка?",
        "An algorithm produces the wrong result. What is the best next step?",
        [
          ["Да промениш много неща наведнъж", "Change many things at once"],
          ["Да проследиш входа и стойностите стъпка по стъпка с известен пример", "Trace the input and values step by step with a known example"],
          ["Да скриеш грешния резултат", "Hide the wrong result"],
          ["Да приемеш, че потребителят е виновен", "Assume the user is at fault"]
        ],
        1,
        "Проследяването с контролиран пример показва на коя стъпка очакваното и реалното поведение се разделят.",
        "Tracing a controlled example shows where expected and actual behavior diverge."
      )
    ]
  },
  {
    id: "grade-8-intelligent-systems-check",
    moduleId: "grade-8-intelligent-digital-technologies",
    specialtyId: "intelligent-systems",
    gradeLevel: 8,
    suggestedType: "formative",
    durationMinutes: 20,
    title: {
      bg: "Интелигентни системи: Дигитални технологии — 8. клас",
      en: "Intelligent Systems: Digital Technologies — Grade 8"
    },
    description: {
      bg: "Проверка на основни понятия за данни, правила и модели, пристрастие, поверителност, сензори и човешки контрол.",
      en: "A check on basic concepts in data, rules and models, bias, privacy, sensors, and human oversight."
    },
    questions: [
      question(
        "ai-data-row",
        "В таблица за растения всеки ред съдържа височина, цвят и вид на едно растение. Какво представлява един ред?",
        "In a plant table, each row contains the height, color, and species of one plant. What does one row represent?",
        [
          ["Един пример или наблюдение", "One example or observation"],
          ["Целият модел", "The entire model"],
          ["Парола", "A password"],
          ["Грешка в данните", "A data error"]
        ],
        0,
        "Редът описва един наблюдаван обект чрез неговите характеристики.",
        "A row describes one observed object through its features."
      ),
      question(
        "ai-feature-label",
        "Модел трябва да разпознава вид растение. Кое е етикетът, който искаме да предвидим?",
        "A model must identify a plant species. Which value is the label we want to predict?",
        [
          ["Височината", "Height"],
          ["Цветът", "Color"],
          ["Видът на растението", "The plant species"],
          ["Номерът на реда", "The row number"]
        ],
        2,
        "Етикетът е желаният резултат; височината и цветът могат да бъдат входни характеристики.",
        "The label is the desired output; height and color can be input features."
      ),
      question(
        "ai-rule-model",
        "Кое най-добре описва разликата между зададено правило и научен модел?",
        "Which statement best describes the difference between a fixed rule and a learned model?",
        [
          ["Правилото е написано от човек, а моделът открива закономерности от примери", "A rule is written by a person, while a model finds patterns from examples"],
          ["Моделът винаги е верен", "A model is always correct"],
          ["Правилото се нуждае от милиони снимки", "A rule needs millions of images"],
          ["Няма разлика", "There is no difference"]
        ],
        0,
        "Моделът се настройва по данни и може да греши; правило като „ако/тогава“ е зададено пряко.",
        "A model is fitted from data and can be wrong; an if/then rule is specified directly."
      ),
      question(
        "ai-test-set",
        "Защо отделяме част от данните за тестване, вместо да обучим модела с всички примери?",
        "Why keep some data for testing instead of training the model on every example?",
        [
          ["За да проверим поведението върху невиждани примери", "To check performance on unseen examples"],
          ["За да скрием грешките", "To hide errors"],
          ["За да направим файла по-цветен", "To make the file more colorful"],
          ["За да гарантираме 100% точност", "To guarantee 100% accuracy"]
        ],
        0,
        "Невижданите примери показват дали моделът е научил обща закономерност, а не само е запомнил обучението.",
        "Unseen examples show whether the model learned a general pattern rather than merely memorizing training data."
      ),
      question(
        "ai-bias",
        "Система за училищен клуб е обучена само с данни от един клас. Какъв е основният риск?",
        "A school club system is trained using data from only one class. What is the main risk?",
        [
          ["Резултатите може да не са справедливи или точни за останалите ученици", "Results may be unfair or inaccurate for other students"],
          ["Компютърът непременно ще се изключи", "The computer will certainly shut down"],
          ["Всички данни ще станат изображения", "All data will become images"],
          ["Няма риск, ако таблицата е голяма", "There is no risk if the table is large"]
        ],
        0,
        "Непредставителната извадка може да пренесе систематично пристрастие към други групи.",
        "An unrepresentative sample can carry systematic bias into results for other groups."
      ),
      question(
        "ai-privacy",
        "Кой е най-отговорният начин да използваш ученически данни за учебен експеримент?",
        "What is the most responsible way to use student data in a classroom experiment?",
        [
          ["Публикуваш имената и оценките", "Publish names and grades"],
          ["Използваш минимално нужните, обезличени данни с разрешение и ясна цел", "Use the minimum necessary anonymized data with permission and a clear purpose"],
          ["Изпращаш таблицата на случаен AI сайт", "Send the table to a random AI website"],
          ["Пазиш данните завинаги", "Keep the data forever"]
        ],
        1,
        "Минимизирането, обезличаването и разрешението намаляват риска за хората зад данните.",
        "Data minimization, anonymization, and permission reduce risk to the people represented."
      ),
      question(
        "ai-sensor",
        "В автоматична оранжерия кое устройство е сензор?",
        "In an automated greenhouse, which device is a sensor?",
        [
          ["Устройството, което измерва влажността на почвата", "The device that measures soil moisture"],
          ["Помпата, която пуска вода", "The pump that releases water"],
          ["Лампата, която осветява", "The lamp that produces light"],
          ["Вратата на оранжерията", "The greenhouse door"]
        ],
        0,
        "Сензорът измерва средата; помпата е изпълнителен механизъм, който извършва действие.",
        "A sensor measures the environment; the pump is an actuator that performs an action."
      ),
      question(
        "ai-oversight",
        "Модел дава 92% увереност, че ученик има нужда от помощ. Какво означава това?",
        "A model reports 92% confidence that a student needs support. What does this mean?",
        [
          ["Решението е доказан факт и не се проверява", "The decision is proven fact and needs no review"],
          ["Това е оценка на модела, която трябва да се провери от човек с допълнителен контекст", "It is a model estimate that a human should review with additional context"],
          ["Ученикът задължително е сгрешил", "The student must have done something wrong"],
          ["Моделът може сам да наказва ученика", "The model may punish the student by itself"]
        ],
        1,
        "Увереността не е доказателство; решенията за хора изискват човешка преценка и право на проверка.",
        "Confidence is not proof; decisions about people require human judgment and review."
      )
    ]
  },
  {
    id: "grade-8-graphics-composition-check",
    moduleId: "grade-8-graphics-composition",
    specialtyId: "computer-graphics",
    gradeLevel: 8,
    suggestedType: "formative",
    durationMinutes: 20,
    title: {
      bg: "Компютърна графика: Композиция и цветознание — 8. клас",
      en: "Computer Graphics: Composition and Color Theory — Grade 8"
    },
    description: {
      bg: "Проверка на визуална йерархия, баланс, контраст, цветови отношения, формати и достъпност.",
      en: "A check on visual hierarchy, balance, contrast, color relationships, formats, and accessibility."
    },
    questions: [
      question(
        "graphics-focal-point",
        "Как най-ясно създаваш фокусна точка в плакат?",
        "How do you create a clear focal point in a poster?",
        [
          ["Правиш всички елементи еднакво големи", "Make every element the same size"],
          ["Използваш размер, позиция и контраст, за да откроиш най-важното", "Use size, position, and contrast to emphasize the most important element"],
          ["Поставяш текста извън страницата", "Place the text outside the page"],
          ["Добавяш възможно най-много шрифтове", "Add as many fonts as possible"]
        ],
        1,
        "Фокусната точка насочва първия поглед към основното послание чрез видима разлика.",
        "A focal point directs the first glance to the main message through visible difference."
      ),
      question(
        "graphics-hierarchy",
        "Коя подредба има най-ясна визуална йерархия?",
        "Which arrangement has the clearest visual hierarchy?",
        [
          ["Заглавие, подзаглавие и текст с ясно различени размери", "A heading, subheading, and body text with clearly differentiated sizes"],
          ["Всички думи с еднакъв размер и тегло", "All words at the same size and weight"],
          ["Всеки ред с различен случаен шрифт", "Every line in a different random font"],
          ["Най-важният текст е най-дребен", "The most important text is the smallest"]
        ],
        0,
        "Йерархията показва кое се чете първо, второ и след това.",
        "Hierarchy shows what should be read first, second, and next."
      ),
      question(
        "graphics-balance",
        "Какво означава асиметричен баланс?",
        "What does asymmetrical balance mean?",
        [
          ["Двете половини са огледално еднакви", "Both halves are mirror images"],
          ["Различни елементи създават равновесие чрез визуалната си тежест", "Different elements create equilibrium through their visual weight"],
          ["Всички елементи са в един ъгъл", "All elements are in one corner"],
          ["Няма връзка между елементите", "There is no relationship between the elements"]
        ],
        1,
        "Асиметричният баланс не е огледален, но композицията все пак се усеща стабилна.",
        "Asymmetrical balance is not mirrored, yet the composition still feels stable."
      ),
      question(
        "graphics-complementary",
        "Кои цветове са допълнителни в традиционния цветови кръг?",
        "Which colors are complementary on the traditional color wheel?",
        [
          ["Червено и зелено", "Red and green"],
          ["Червено и оранжево", "Red and orange"],
          ["Синьо и зелено", "Blue and green"],
          ["Жълто и оранжево", "Yellow and orange"]
        ],
        0,
        "Допълнителните цветове са срещуположни в цветовия кръг и създават силен контраст.",
        "Complementary colors sit opposite each other on the color wheel and create strong contrast."
      ),
      question(
        "graphics-saturation",
        "Как се променя цвят, когато запази нюанса си, но се доближи до сивото?",
        "How does a color change when it keeps its hue but moves closer to gray?",
        [
          ["Наситеността му намалява", "Its saturation decreases"],
          ["Става допълнителен цвят", "It becomes a complementary color"],
          ["Получава по-силен визуален ритъм", "It gains a stronger visual rhythm"],
          ["Формата му се променя", "Its shape changes"]
        ],
        0,
        "По-ниската наситеност означава по-малко чист и по-близък до сивото цвят.",
        "Lower saturation means a less pure color that is closer to gray."
      ),
      question(
        "graphics-rhythm",
        "Какво създава повторението на форми през определени интервали?",
        "What is created by repeating shapes at regular intervals?",
        [
          ["Визуален ритъм", "Visual rhythm"],
          ["Файлова резолюция", "File resolution"],
          ["Перспектива с една убежна точка", "One-point perspective"],
          ["Случайна йерархия", "Random hierarchy"]
        ],
        0,
        "Повторението и интервалът водят погледа и създават усещане за движение и ритъм.",
        "Repetition and spacing guide the eye and create a sense of movement and rhythm."
      ),
      question(
        "graphics-context",
        "Защо един и същ сив квадрат може да изглежда по-светъл върху черен фон?",
        "Why can the same gray square look lighter on a black background?",
        [
          ["Заради контраста със заобикалящия фон", "Because of contrast with the surrounding background"],
          ["Защото формата му става кръгла", "Because its shape becomes circular"],
          ["Защото автоматично сменя нюанса си", "Because it automatically changes its hue"],
          ["Заради симетрията на страницата", "Because of the page symmetry"]
        ],
        0,
        "Възприемането на светлота зависи и от съседните тонове, не само от самия цвят.",
        "Perceived lightness depends on neighboring tones, not only on the color itself."
      ),
      question(
        "graphics-light-shadow",
        "Светлината идва от горе вляво. Къде обичайно пада хвърлената сянка?",
        "Light comes from the upper left. Where does the cast shadow usually fall?",
        [
          ["Надолу и надясно", "Down and to the right"],
          ["Нагоре и наляво", "Up and to the left"],
          ["Винаги точно под обекта", "Always directly below the object"],
          ["Посоката на светлината няма значение", "The light direction does not matter"]
        ],
        0,
        "Хвърлената сянка обикновено се разполага в посока, противоположна на източника на светлина.",
        "A cast shadow usually falls in the direction opposite the light source."
      )
    ]
  },
  {
    id: "grade-8-cyber-communication-check",
    moduleId: "grade-8-cyber-communication-ethics",
    specialtyId: "cybersecurity",
    gradeLevel: 8,
    suggestedType: "formative",
    durationMinutes: 20,
    title: {
      bg: "Киберсигурност: Комуникация и етика — 8. клас",
      en: "Cybersecurity: Communication and Ethics — Grade 8"
    },
    description: {
      bg: "Проверка на етично поведение, разпознаване на измами, запазване на факти и спокойна комуникация при инцидент.",
      en: "A check on ethical conduct, scam recognition, preserving facts, and calm incident communication."
    },
    questions: [
      question(
        "cyber-authorization",
        "Съученик ти предлага да проверите слабост в училищен профил без разрешение. Как постъпваш?",
        "A classmate suggests testing a weakness in a school account without permission. What do you do?",
        [
          ["Пробваш, ако обещаете да не казвате", "Try it if you promise not to tell"],
          ["Отказваш и съобщаваш по одобрения училищен ред", "Refuse and report it through the approved school process"],
          ["Публикуваш профила онлайн", "Publish the account online"],
          ["Използваш чужда парола само веднъж", "Use someone else's password just once"]
        ],
        1,
        "Достъпът и тестването изискват изрично разрешение, определен обхват и отговорно докладване.",
        "Access and testing require explicit authorization, a defined scope, and responsible reporting."
      ),
      question(
        "cyber-phishing",
        "Кое е най-силен предупредителен знак за фишинг съобщение?",
        "Which is the strongest warning sign of a phishing message?",
        [
          ["Очаквано съобщение от известен учител в училищната система", "An expected message from a known teacher in the school system"],
          ["Спешна заплаха, странен адрес и линк за незабавно въвеждане на парола", "An urgent threat, an unusual sender address, and a link demanding an immediate password"],
          ["Правописно коректно заглавие", "A correctly spelled subject line"],
          ["Прикачен учебен план от официалния портал", "An attached curriculum from the official portal"]
        ],
        1,
        "Комбинацията от натиск, несъответстващ подател и искане за тайна е типичен сигнал за измама.",
        "Pressure, a mismatched sender, and a request for a secret are typical signs of a scam."
      ),
      question(
        "cyber-phishing-action",
        "Получаваш съмнителен линк за смяна на парола. Кое е най-безопасното действие?",
        "You receive a suspicious password-reset link. What is the safest action?",
        [
          ["Отваряш линка, за да провериш", "Open the link to check"],
          ["Отговаряш с текущата парола", "Reply with the current password"],
          ["Не използваш линка; отваряш официалния портал директно и сигнализираш", "Do not use the link; open the official portal directly and report the message"],
          ["Препращаш го на целия клас", "Forward it to the entire class"]
        ],
        2,
        "Официалният адрес се въвежда отделно, а съмнителното съобщение се докладва без взаимодействие с линка.",
        "Open the official address separately and report the suspicious message without interacting with its link."
      ),
      question(
        "cyber-facts",
        "Кое изречение е факт, подходящ за доклад за инцидент?",
        "Which sentence is a fact suitable for an incident report?",
        [
          ["„Хакер със сигурност е виновен.“", "‘A hacker is definitely responsible.’"],
          ["„В 10:14 видях три неуспешни влизания в показания журнал.“", "‘At 10:14 I observed three failed sign-ins in the displayed log.’"],
          ["„Системата е ужасна.“", "‘The system is terrible.’"],
          ["„Вероятно някой нарочно ни пречи.“", "‘Someone is probably sabotaging us on purpose.’"]
        ],
        1,
        "Докладът отделя наблюдавани факти с време и източник от предположенията.",
        "An incident report separates observed facts with time and source from assumptions."
      ),
      question(
        "cyber-evidence",
        "Забелязваш подозрителна активност на училищен компютър. Какво не трябва да правиш?",
        "You notice suspicious activity on a school computer. What should you avoid doing?",
        [
          ["Записваш часа и видимото съобщение", "Record the time and visible message"],
          ["Уведомяваш отговорния учител или администратор", "Notify the responsible teacher or administrator"],
          ["Изтриваш журналите и файловете, за да „почистиш“", "Delete logs and files to ‘clean up’"],
          ["Следваш училищната процедура", "Follow the school procedure"]
        ],
        2,
        "Самоволното изтриване може да унищожи доказателства и да затрудни безопасното възстановяване.",
        "Deleting data without authorization can destroy evidence and hinder safe recovery."
      ),
      question(
        "cyber-least-privilege",
        "Какво означава принципът „минимални права“?",
        "What does the principle of least privilege mean?",
        [
          ["Всеки получава администраторски достъп", "Everyone receives administrator access"],
          ["Всеки получава само достъпа, нужен за конкретната му задача", "Each person receives only the access needed for their specific task"],
          ["Паролите се споделят в екипа", "Passwords are shared within the team"],
          ["Достъпът никога не се преглежда", "Access is never reviewed"]
        ],
        1,
        "Ограничаването на правата намалява грешките и щетите при злоупотреба или компрометиран профил.",
        "Limiting permissions reduces mistakes and damage from misuse or a compromised account."
      ),
      question(
        "cyber-conflict",
        "Потребител е ядосан след блокиран профил. Кой отговор е най-професионален?",
        "A user is upset after their account is locked. Which response is most professional?",
        [
          ["„Ти сам си виновен.“", "‘It is your own fault.’"],
          ["„Успокой се или няма да помогна.“", "‘Calm down or I will not help.’"],
          ["„Разбирам, че ситуацията е неприятна. Нека потвърдим фактите и да следваме стъпките за възстановяване.“", "‘I understand this is frustrating. Let us confirm the facts and follow the recovery steps.’"],
          ["„Ще ти дам чужд профил временно.“", "‘I will give you someone else's account temporarily.’"]
        ],
        2,
        "Спокойният език признава проблема, не обвинява и насочва към разрешена процедура.",
        "Calm language acknowledges the problem, avoids blame, and follows an approved procedure."
      ),
      question(
        "cyber-report",
        "Как трябва да съобщиш открита слабост?",
        "How should you report a discovered weakness?",
        [
          ["Публично с данни за засегнатите профили", "Publicly with details of affected accounts"],
          ["Поверително до определеното отговорно лице, с факти и без ненужно разпространение", "Confidentially to the designated responsible person, with facts and no unnecessary disclosure"],
          ["Като я използваш, за да докажеш, че е истинска", "Exploit it to prove that it is real"],
          ["Като я изпратиш в групов чат", "Send it to a group chat"]
        ],
        1,
        "Отговорното докладване ограничава информацията до хората, които могат безопасно да реагират.",
        "Responsible reporting limits information to the people who can respond safely."
      )
    ]
  }
];

export function getAssessmentTemplatesForClassroom(
  specialtyId: string | null,
  gradeLevel: number
): AssessmentTemplate[] {
  if (gradeLevel !== 8) {
    return [];
  }

  return assessmentTemplates.filter(
    (template) => template.specialtyId === null || template.specialtyId === specialtyId
  );
}

export function localizeAssessmentTemplate(
  template: AssessmentTemplate,
  language: "bg" | "en"
): LocalizedAssessmentTemplate {
  const answerPositions = [2, 0, 3, 1, 3, 1, 0, 2];

  return {
    id: template.id,
    specialtyId: template.specialtyId,
    title: template.title[language],
    description: template.description[language],
    durationMinutes: template.durationMinutes,
    suggestedType: template.suggestedType,
    questions: template.questions.map((item, index) => {
      const options = item.options.map((option) => option[language]);
      const correctAnswer = options[item.correctOption];
      const arrangedOptions = options.filter((_, optionIndex) => optionIndex !== item.correctOption);
      const correctOption = answerPositions[index % answerPositions.length] % options.length;
      arrangedOptions.splice(correctOption, 0, correctAnswer);

      return {
        id: item.id,
        prompt: item.prompt[language],
        options: arrangedOptions,
        correctOption,
        explanation: item.explanation[language],
        points: item.points
      };
    })
  };
}
