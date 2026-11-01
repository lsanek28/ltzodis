import { AppLanguage } from '../types/grammar';

export const UI_TEXT: Record<
  AppLanguage,
  {
    appName: string;
    appSubtitle: string;
    nav: {
      home: string;
      practice: string;
      dictionary: string;
      reference: string;
      stats: string;
      androidCode: string;
      settings: string;
    };
    ctaStartPractice: string;
    heroTagline: string;
    heroDescription: string;
    kpiVerifiedNouns: string;
    kpiVerifiedForms: string;
    kpiMasteredWords: string;
    kpiAccuracy: string;
    kpiDailyStreak: string;
    dailyGoalTitle: string;
    dailyGoalCompleted: string;
    selectDifficultyTitle: string;
    autoDifficultyLabel: string;
    autoDifficultyDesc: string;
    selectModeTitle: string;
    filterByCase: string;
    filterByDeclension: string;
    filterByNumber: string;
    filterByTopic: string;
    singularLabel: string;
    pluralLabel: string;
    bothNumbersLabel: string;
    exercise: {
      sessionProgress: string;
      baseWordLabel: string;
      translationLabel: string;
      hiddenInAdvanced: string;
      targetCaseLabel: string;
      targetNumberLabel: string;
      questionLabel: string;
      inputPlaceholder: string;
      checkBtn: string;
      retryBtn: string;
      revealAnswerBtn: string;
      hintBtn: string;
      skipBtn: string;
      nextWordBtn: string;
      favoriteToggle: string;
      diacriticBarLabel: string;
      correctBanner: string;
      incorrectBanner: string;
      tryAgainPrompt: string;
      stemLabel: string;
      endingLabel: string;
      expectedFormLabel: string;
      yourAnswerLabel: string;
      grammarRuleTitle: string;
      dictionaryExampleTitle: string;
      hintBoxTitle: string;
      sentenceContextLabel: string;
      prepositionNote: string;
      fullParadigmInstruction: string;
      checkAllFormsBtn: string;
      examProgressLabel: string;
      examCompleteTitle: string;
      examRestartBtn: string;
    };
    dictionary: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      allTopics: string;
      allDeclensions: string;
      onlyFavorites: string;
      onlyExceptions: string;
      showingCount: string;
      viewFullTable: string;
      practiceThisWord: string;
      stemAlternationBadge: string;
      tabForms: string;
      tabUsage: string;
      usageCollocationsTitle: string;
      usageCollocationsDesc: string;
      usageIdiomsTitle: string;
      usageIdiomsDesc: string;
      usageGovernanceTitle: string;
      usageGovernanceDesc: string;
      usageConversationalTitle: string;
      usageConversationalDesc: string;
    };
    reference: {
      title: string;
      subtitle: string;
      viewOriginalPdf: string;
      hideOriginalPdf: string;
      prepositionsTitle: string;
      prepositionsSubtitle: string;
      singularHeader: string;
      pluralHeader: string;
      caseColumn: string;
    };
    stats: {
      title: string;
      subtitle: string;
      learnedWords: string;
      unlearnedWords: string;
      totalExercises: string;
      overallAccuracy: string;
      currentStreak: string;
      bestStreak: string;
      byCaseTitle: string;
      byDeclensionTitle: string;
      byTopicTitle: string;
      hardestWordsTitle: string;
      recentMistakesTitle: string;
      noMistakesYet: string;
      masteryRuleNote: string;
      exportProgressBtn: string;
      importProgressBtn: string;
      resetProgressBtn: string;
      automatedTestsTitle: string;
      runTestsBtn: string;
      badgesTitle: string;
      badgesSubtitle: string;
      badgeUnlockedLabel: string;
      badgeLockedLabel: string;
      weeklyActivityTitle: string;
      weeklyActivitySubtitle: string;
      weeklyGoalLine: string;
      weeklyActiveDays: string;
      weeklyTotalLabel: string;
      weeklyCorrectLabel: string;
      weeklyIncorrectLabel: string;
      weeklyAvgLabel: string;
    };
    settings: {
      title: string;
      languageLabel: string;
      themeLabel: string;
      lightTheme: string;
      darkTheme: string;
      dailyGoalLabel: string;
      exercisesPerDay: string;
      difficultyModeLabel: string;
      reminderTitle: string;
      reminderEnableLabel: string;
      reminderTimeLabel: string;
      reminderPermissionGranted: string;
      reminderPermissionRequest: string;
      reminderPermissionDenied: string;
      reminderPermissionUnsupported: string;
      reminderTestBtn: string;
      feedbackSectionTitle: string;
      soundEffectsLabel: string;
      soundEffectsDesc: string;
      hapticFeedbackLabel: string;
      hapticFeedbackDesc: string;
      testCorrectSoundBtn: string;
      testIncorrectSoundBtn: string;
      enabledStatus: string;
      disabledStatus: string;
    };
  }
> = {
  uk: {
    appName: 'Lietuvių žodžių galūnės',
    appSubtitle: 'Інтерактивний тренажер відмінювання литовських іменників',
    nav: {
      home: 'Головна',
      practice: 'Тренування',
      dictionary: 'Словник',
      reference: 'Таблиця',
      stats: 'Статистика',
      androidCode: 'Android Kotlin',
      settings: 'Налаштування',
    },
    ctaStartPractice: 'Почати навчання',
    heroTagline: 'Daiktavardžių linksniavimas · 5 типів відмінювання · 7 відмінків',
    heroDescription:
      'Практикуйте закінчення литовських іменників в однині та множині: вводьте форми з клавіатури, перевіряйте чергування основи й вивчайте граматичні правила.',
    kpiVerifiedNouns: 'Перевірених слів',
    kpiVerifiedForms: 'Відмінкових форм',
    kpiMasteredWords: 'Вивчено слів',
    kpiAccuracy: 'Точність відповідей',
    kpiDailyStreak: 'Серія правильних',
    dailyGoalTitle: 'Щоденна ціль навчання',
    dailyGoalCompleted: 'вправ виконано сьогодні',
    selectDifficultyTitle: 'Рівень складності',
    autoDifficultyLabel: 'Автоматичний підбір',
    autoDifficultyDesc: 'Система адаптує складність на основі вашої точності',
    selectModeTitle: 'Режим навчання',
    filterByCase: 'Виберіть відмінок для тренування',
    filterByDeclension: 'Виберіть тип відмінювання (linksniuotė)',
    filterByNumber: 'Виберіть число',
    filterByTopic: 'Виберіть тему словника',
    singularLabel: 'Однина (Vienaskaita)',
    pluralLabel: 'Множина (Daugiskaita)',
    bothNumbersLabel: 'Однина + Множина',
    exercise: {
      sessionProgress: 'Сесія',
      baseWordLabel: 'Початкове слово (Vardininkas)',
      translationLabel: 'Переклад',
      hiddenInAdvanced: 'Приховано на Рівні 4 (контекстний режим)',
      targetCaseLabel: 'Потрібний відмінок',
      targetNumberLabel: 'Число',
      questionLabel: 'Питання',
      inputPlaceholder: 'Введіть форму литовською...',
      checkBtn: 'Перевірити',
      retryBtn: 'Спробувати ще раз',
      revealAnswerBtn: 'Показати правильну відповідь',
      hintBtn: 'Підказка',
      skipBtn: 'Пропустити',
      nextWordBtn: 'Наступне слово',
      favoriteToggle: 'В обране',
      diacriticBarLabel: 'Литовські літери:',
      correctBanner: 'Чудово! Відповідь правильна',
      incorrectBanner: 'Помилка у закінченні або основі',
      tryAgainPrompt:
        'Неправильно. Ви можете виправити відповідь і спробувати ще раз або натиснути «Показати правильну відповідь».',
      stemLabel: 'Основа (kamienas)',
      endingLabel: 'Закінчення (galūnė)',
      expectedFormLabel: 'Правильна форма',
      yourAnswerLabel: 'Ваша відповідь',
      grammarRuleTitle: 'Граматичне пояснення',
      dictionaryExampleTitle: 'Приклад відмінювання слова в реченні (зі словника)',
      hintBoxTitle: 'Граматична підказка (без розкриття повної відповіді)',
      sentenceContextLabel: 'Речення з контекстом',
      prepositionNote: 'Керування прийменника',
      fullParadigmInstruction:
        'Введіть усі 7 відмінкових форм вибраного іменника для перевірки повної парадигми:',
      checkAllFormsBtn: 'Перевірити всі 7 форм',
      examProgressLabel: 'Завдання іспиту',
      examCompleteTitle: 'Результати іспиту без підказок',
      examRestartBtn: 'Почати новий іспит (15 завдань)',
    },
    dictionary: {
      title: 'Перевірений каталог литовських іменників',
      subtitle:
        '1000 унікальних литовських іменників (14 000 перевірених відмінкових форм) рівнів A0–B2 у 14 темах із виділенням основи, закінчень та чергувань.',
      searchPlaceholder: 'Пошук за литовським словом або перекладом (namas, будинок, house)...',
      allTopics: 'Усі 14 тем',
      allDeclensions: 'Усі 5 типів відмінювання',
      onlyFavorites: 'Лише обрані',
      onlyExceptions: 'З чергуванням / винятками',
      showingCount: 'Знайдено слів:',
      viewFullTable: 'Таблиця відмінювання',
      practiceThisWord: 'Тренувати це слово',
      stemAlternationBadge: 'Чергування / особливість основи',
      tabForms: 'Відмінювання (Форми)',
      tabUsage: 'Вживання та ідіоми',
      usageCollocationsTitle: 'Поширені словосполучення',
      usageCollocationsDesc: 'Типові та частотні сполучення з дієсловами, прикметниками та прийменниками',
      usageIdiomsTitle: 'Ідіоми, стійкі вирази та приказки',
      usageIdiomsDesc: 'Автентичні литовські фразеологізми, метафори та прислів’я',
      usageGovernanceTitle: 'Граматичне керування та прийменники',
      usageGovernanceDesc: 'Відмінки та прийменникові моделі, характерні для цього іменника',
      usageConversationalTitle: 'Розмовні фрази та ситуативне вживання',
      usageConversationalDesc: 'Живі фрази для щоденного спілкування та діалогів у реальному житті',
    },
    reference: {
      title: 'Довідник: Daiktavardžių linksniavimas',
      subtitle:
        'Інтерактивна таблиця 5 типів відмінювання литовських іменників (однина і множина) та прийменникового керування.',
      viewOriginalPdf: 'Переглянути оригінальний PDF-аркуш',
      hideOriginalPdf: 'Приховати PDF-аркуш',
      prepositionsTitle: 'Прийменники (Prielinksniai) та їхні відмінки',
      prepositionsSubtitle:
        'У литовській мові кожен прийменник вимагає певного відмінка (родового, знахідного або орудного). Місцевий відмінок (Vietininkas) вживається без прийменників.',
      singularHeader: 'VIENASKAITA (Однина)',
      pluralHeader: 'DAUGISKAITA (Множина)',
      caseColumn: 'Відмінок / Питання',
    },
    stats: {
      title: 'Статистика, прогрес та перевірка якості',
      subtitle:
        'Аналітика ваших відповідей за відмінками, типами відмінювання, темами та автоматичні тести бази даних.',
      learnedWords: 'Вивчено слів',
      unlearnedWords: 'Ще вивчається',
      totalExercises: 'Виконано вправ',
      overallAccuracy: 'Відсоток правильних',
      currentStreak: 'Поточна серія',
      bestStreak: 'Найкраща серія',
      byCaseTitle: 'Результати за кожним відмінком',
      byDeclensionTitle: 'Результати за типом відмінювання (1–5 linksniuotė)',
      byTopicTitle: 'Прогрес за темами',
      weeklyActivityTitle: 'Тижнева активність (останні 7 днів)',
      weeklyActivitySubtitle: 'Графік виконаних вправ щодня для відстеження регулярності навчання та досягнення мети',
      weeklyGoalLine: 'Щоденна ціль',
      weeklyActiveDays: 'Активні дні',
      weeklyTotalLabel: 'Всього за 7 днів',
      weeklyCorrectLabel: 'Правильні відповіді',
      weeklyIncorrectLabel: 'З помилкою (виправлено)',
      weeklyAvgLabel: 'Сер. на день',
      hardestWordsTitle: 'Слова, які даються найважче',
      recentMistakesTitle: 'Історія останніх помилок',
      noMistakesYet: 'Поки що помилок не зафіксовано. Розпочніть тренування!',
      masteryRuleNote:
        'Слово позначається як «Вивчене» після щонайменше 4 правильних відповідей у різних сесіях або 5 безпомилкових відповідей поспіль.',
      exportProgressBtn: 'Експортувати прогрес (JSON)',
      importProgressBtn: 'Імпортувати резервну копію',
      resetProgressBtn: 'Скинути статистику',
      automatedTestsTitle: 'Автоматичні тести граматичних форм і логіки перевірки',
      runTestsBtn: 'Перезапустити тести',
      badgesTitle: 'Досягнення та нагороди (Badges)',
      badgesSubtitle: 'Відкривайте відзнаки за серії правильних відповідей, ранкові тренування та опанування відмінків',
      badgeUnlockedLabel: 'Відкрито',
      badgeLockedLabel: 'Заблоковано',
    },
    settings: {
      title: 'Налаштування додатка',
      languageLabel: 'Мова інтерфейсу (Interface Language)',
      themeLabel: 'Тема оформлення',
      lightTheme: 'Світла',
      darkTheme: 'Темна',
      dailyGoalLabel: 'Щоденна ціль',
      exercisesPerDay: 'вправ на день',
      difficultyModeLabel: 'Керування рівнем складності',
      reminderTitle: 'Щоденне нагадування (Web Notifications)',
      reminderEnableLabel: 'Увімкнути щоденне push-нагадування',
      reminderTimeLabel: 'Час нагадування',
      reminderPermissionGranted: 'Дозвіл браузера на сповіщення надано',
      reminderPermissionRequest: 'Надати дозвіл на сповіщення у браузері',
      reminderPermissionDenied: 'Сповіщення заблоковані в налаштуваннях браузера (активне внутрішнє нагадування)',
      reminderPermissionUnsupported: 'Web Notifications не підтримуються у цьому вікні (активне внутрішнє нагадування)',
      reminderTestBtn: 'Надіслати тестове сповіщення',
      feedbackSectionTitle: 'Звукові ефекти та вібрація (Офлайн)',
      soundEffectsLabel: 'Звукові ефекти відповідей',
      soundEffectsDesc: 'Короткі м’які сигнали для правильних і неправильних відповідей без інтернету',
      hapticFeedbackLabel: 'Тактильний відгук (вібрація)',
      hapticFeedbackDesc: 'Легка вібрація при перевірці відповіді',
      testCorrectSoundBtn: 'Звук «Правильно»',
      testIncorrectSoundBtn: 'Звук «Помилка»',
      enabledStatus: 'Увімкнено',
      disabledStatus: 'Вимкнено',
    },
  },
  lt: {
    appName: 'Lietuvių žodžių galūnės',
    appSubtitle: 'Interaktyvus lietuvių kalbos daiktavardžių linksniavimo treniruoklis',
    nav: {
      home: 'Pradžia',
      practice: 'Treniruotė',
      dictionary: 'Žodynas',
      reference: 'Lentelė',
      stats: 'Statistika',
      androidCode: 'Android Kotlin',
      settings: 'Nustatymai',
    },
    ctaStartPractice: 'Pradėti mokymąsi',
    heroTagline: 'Daiktavardžių linksniavimas · 5 linksniuotės · 7 linksniai',
    heroDescription:
      'Praktikuokite lietuvių kalbos daiktavardžių galūnes vienaskaitoje ir daugiskaitoje: įveskite formas klaviatūra, stebėkite kamieno kaitą ir mokykitės taisyklių.',
    kpiVerifiedNouns: 'Patikrinti žodžiai',
    kpiVerifiedForms: 'Linksnių formos',
    kpiMasteredWords: 'Išmokta žodžių',
    kpiAccuracy: 'Teisingų atsakymų %',
    kpiDailyStreak: 'Teisingų serija',
    dailyGoalTitle: 'Dienos mokymosi tikslas',
    dailyGoalCompleted: 'pratimų atlikta šiandien',
    selectDifficultyTitle: 'Sudėtingumo lygis',
    autoDifficultyLabel: 'Automatinis parinkimas',
    autoDifficultyDesc: 'Sistema parenka sudėtingumą pagal jūsų rezultatus',
    selectModeTitle: 'Mokymosi režimas',
    filterByCase: 'Pasirinkite linksnį treniruotei',
    filterByDeclension: 'Pasirinkite linksniuotę (1–5)',
    filterByNumber: 'Pasirinkite skaičių',
    filterByTopic: 'Pasirinkite žodyno temą',
    singularLabel: 'Vienaskaita',
    pluralLabel: 'Daugiskaita',
    bothNumbersLabel: 'Vienaskaita + Daugiskaita',
    exercise: {
      sessionProgress: 'Sesija',
      baseWordLabel: 'Pradinis žodis (Vardininkas)',
      translationLabel: 'Vertimas',
      hiddenInAdvanced: 'Paslėpta 4 lygyje (kontekstinis režimas)',
      targetCaseLabel: 'Reikiamas linksnis',
      targetNumberLabel: 'Skaičius',
      questionLabel: 'Klausimas',
      inputPlaceholder: 'Įveskite lietuvišką formą...',
      checkBtn: 'Patikrinti',
      retryBtn: 'Bandyti dar kartą',
      revealAnswerBtn: 'Rodyti teisingą atsakymą',
      hintBtn: 'Užuomina',
      skipBtn: 'Praleisti',
      nextWordBtn: 'Kitas žodis',
      favoriteToggle: 'Įsiminti',
      diacriticBarLabel: 'Lietuviškos raidės:',
      correctBanner: 'Puiku! Atsakymas teisingas',
      incorrectBanner: 'Klaida galūnėje arba kamiene',
      tryAgainPrompt:
        'Neteisingai. Galite pataisyti atsakymą ir bandyti dar kartą arba paspausti „Rodyti teisingą atsakymą“.',
      stemLabel: 'Kamienas',
      endingLabel: 'Galūnė',
      expectedFormLabel: 'Teisinga forma',
      yourAnswerLabel: 'Jūsų atsakymas',
      grammarRuleTitle: 'Gramatinis paaiškinimas',
      dictionaryExampleTitle: 'Žodžio linksniavimo pavyzdys sakinyje (iš žodyno)',
      hintBoxTitle: 'Gramatinė užuomina (neatskleidžiant pilno žodžio)',
      sentenceContextLabel: 'Sakinio kontekstas',
      prepositionNote: 'Prielinksnio valdymas',
      fullParadigmInstruction:
        'Įveskite visas 7 pasirinkto daiktavardžio linksnių formas:',
      checkAllFormsBtn: 'Patikrinti visas 7 formas',
      examProgressLabel: 'Egzamino užduotis',
      examCompleteTitle: 'Egzamino be užuominų rezultatai',
      examRestartBtn: 'Pradėti naują egzaminą (15 užduočių)',
    },
    dictionary: {
      title: 'Patikrintas lietuvių daiktavardžių katalogas',
      subtitle:
        '1000 unikalių daiktavardžių (14 000 patikrintų linksnių formų) A0–B2 lygiais 14-oje temų su kamieno ir galūnės išskyrimu.',
      searchPlaceholder: 'Ieškoti pagal lietuvišką žodį arba vertimą (namas, будинок, house)...',
      allTopics: 'Visos 14 temų',
      allDeclensions: 'Visos 5 linksniuotės',
      onlyFavorites: 'Tik įsiminti',
      onlyExceptions: 'Su kamieno kaita / išimtys',
      showingCount: 'Rasta žodžių:',
      viewFullTable: 'Linksniavimo lentelė',
      practiceThisWord: 'Treniruoti šį žodį',
      stemAlternationBadge: 'Kamieno kaita / ypatybė',
      tabForms: 'Linksniavimas (Formos)',
      tabUsage: 'Vartosena ir junginiai',
      usageCollocationsTitle: 'Dažni žodžių junginiai',
      usageCollocationsDesc: 'Dažniausios kombinacijos su veiksmažodžiais, būdvardžiais ir prielinksniais',
      usageIdiomsTitle: 'Frazeologizmai ir posakiai',
      usageIdiomsDesc: 'Autentiški lietuviški posakiai, metaforos ir patarlės su šiuo žodžiu',
      usageGovernanceTitle: 'Gramatinis valdymas ir prielinksniai',
      usageGovernanceDesc: 'Linksnių ir prielinksnių konstrukcijos, būdingos šiam daiktavardžiui',
      usageConversationalTitle: 'Šnekamosios frazės ir pavyzdžiai',
      usageConversationalDesc: 'Gyvos frazės kasdieniam bendravimui ir dialogams',
    },
    reference: {
      title: 'Žinynas: Daiktavardžių linksniavimas',
      subtitle:
        'Interaktyvi 5 linksniuočių lentelė (vienaskaita ir daugiskaita) bei prielinksnių valdymas.',
      viewOriginalPdf: 'Peržiūrėti originalų PDF lapą',
      hideOriginalPdf: 'Slėpti PDF lapą',
      prepositionsTitle: 'Prielinksniai ir jų reikalaujami linksniai',
      prepositionsSubtitle:
        'Kiekvienas lietuvių kalbos prielinksnis reikalauja tam tikro linksnio (kilmininko, galininko arba įnagininko). Vietininkas vartojamas be prielinksnių.',
      singularHeader: 'VIENASKAITA',
      pluralHeader: 'DAUGISKAITA',
      caseColumn: 'Linksnis / Klausimas',
    },
    stats: {
      title: 'Statistika, pažanga ir kokybės testai',
      subtitle:
        'Jūsų atsakymų analizė pagal linksnius, linksniuotes, temas ir automatiniai duomenų bazės testai.',
      learnedWords: 'Išmokti žodžiai',
      unlearnedWords: 'Dar mokomasi',
      totalExercises: 'Atlikta pratimų',
      overallAccuracy: 'Teisingų atsakymų %',
      currentStreak: 'Dabartinė serija',
      bestStreak: 'Geriausia serija',
      byCaseTitle: 'Rezultatai pagal kiekvieną linksnį',
      byDeclensionTitle: 'Rezultatai pagal linksniuotę (1–5)',
      byTopicTitle: 'Pažanga pagal temas',
      weeklyActivityTitle: 'Savaitės aktyvumas (paskutinės 7 dienos)',
      weeklyActivitySubtitle: 'Kasdienių atliktų pratimų diagrama mokymosi nuoseklumui ir dienos tikslui stebėti',
      weeklyGoalLine: 'Dienos tikslas',
      weeklyActiveDays: 'Aktyvios dienos',
      weeklyTotalLabel: 'Iš viso per 7 d.',
      weeklyCorrectLabel: 'Teisingi atsakymai',
      weeklyIncorrectLabel: 'Su klaidomis (ištaisyta)',
      weeklyAvgLabel: 'Vid. per dieną',
      hardestWordsTitle: 'Sunkiausi žodžiai',
      recentMistakesTitle: 'Paskutinių klaidų istorija',
      noMistakesYet: 'Klaidų dar nėra. Pradėkite treniruotę!',
      masteryRuleNote:
        'Žodis pažymimas kaip „Išmoktas“ po bent 4 teisingų atsakymų skirtingose sesijose arba 5 teisingų atsakymų iš eilės.',
      exportProgressBtn: 'Eksportuoti pažangą (JSON)',
      importProgressBtn: 'Importuoti atsarginę kopiją',
      resetProgressBtn: 'Išvalyti statistiką',
      automatedTestsTitle: 'Automatiniai gramatinių formų ir vertinimo logikos testai',
      runTestsBtn: 'Paleisti testus iš naujo',
      badgesTitle: 'Pasiekimai ir ženkleliai (Badges)',
      badgesSubtitle: 'Atrakinkite apdovanojimus už teisingų atsakymų serijas, rytines treniruotes ir išmoktus žodžius',
      badgeUnlockedLabel: 'Atrakinta',
      badgeLockedLabel: 'Užrakinta',
    },
    settings: {
      title: 'Programėlės nustatymai',
      languageLabel: 'Sąsajos kalba (Interface Language)',
      themeLabel: 'Apipavidalinimo tema',
      lightTheme: 'Šviesi',
      darkTheme: 'Tamsi',
      dailyGoalLabel: 'Dienos tikslas',
      exercisesPerDay: 'pratimų per dieną',
      difficultyModeLabel: 'Sudėtingumo lygio valdymas',
      reminderTitle: 'Kasdienis priminimas (Web Notifications)',
      reminderEnableLabel: 'Įjungti kasdienį priminimą',
      reminderTimeLabel: 'Priminimo laikas',
      reminderPermissionGranted: 'Naršyklės pranešimų leidimas suteiktas',
      reminderPermissionRequest: 'Suteikti naršyklės pranešimų leidimą',
      reminderPermissionDenied: 'Pranešimai užblokuoti naršyklėje (veikia vidinis priminimas)',
      reminderPermissionUnsupported: 'Web Notifications nepalaikomi šiame lange (veikia vidinis priminimas)',
      reminderTestBtn: 'Siųsti bandomąjį pranešimą',
      feedbackSectionTitle: 'Garso efektai ir vibracija (neprisijungus)',
      soundEffectsLabel: 'Atsakymų garso efektai',
      soundEffectsDesc: 'Trumpi, švelnūs teisingų ir klaidingų atsakymų garsai be interneto',
      hapticFeedbackLabel: 'Lytėjimo grįžtamasis ryšys (vibracija)',
      hapticFeedbackDesc: 'Švelni vibracija tikrinant atsakymą',
      testCorrectSoundBtn: 'Garsas „Teisingai“',
      testIncorrectSoundBtn: 'Garsas „Klaida“',
      enabledStatus: 'Įjungta',
      disabledStatus: 'Išjungta',
    },
  },
  en: {
    appName: 'Lietuvių žodžių galūnės',
    appSubtitle: 'Interactive Lithuanian Noun Declension Trainer',
    nav: {
      home: 'Home',
      practice: 'Practice',
      dictionary: 'Dictionary',
      reference: 'Table',
      stats: 'Statistics',
      androidCode: 'Android Kotlin',
      settings: 'Settings',
    },
    ctaStartPractice: 'Start Learning',
    heroTagline: 'Daiktavardžių linksniavimas · 5 Declensions · 7 Cases',
    heroDescription:
      'Master Lithuanian noun endings across singular and plural forms: type answers actively, inspect stem alternations, and learn normative grammar rules.',
    kpiVerifiedNouns: 'Verified Nouns',
    kpiVerifiedForms: 'Verified Case Forms',
    kpiMasteredWords: 'Words Mastered',
    kpiAccuracy: 'Answer Accuracy',
    kpiDailyStreak: 'Current Streak',
    dailyGoalTitle: 'Daily Learning Goal',
    dailyGoalCompleted: 'exercises completed today',
    selectDifficultyTitle: 'Difficulty Level',
    autoDifficultyLabel: 'Adaptive Auto-Level',
    autoDifficultyDesc: 'Automatically scales difficulty based on your accuracy',
    selectModeTitle: 'Training Mode',
    filterByCase: 'Select target grammatical case',
    filterByDeclension: 'Select declension type (1–5 linksniuotė)',
    filterByNumber: 'Select grammatical number',
    filterByTopic: 'Select vocabulary topic',
    singularLabel: 'Singular (Vienaskaita)',
    pluralLabel: 'Plural (Daugiskaita)',
    bothNumbersLabel: 'Singular + Plural',
    exercise: {
      sessionProgress: 'Session',
      baseWordLabel: 'Base Word (Vardininkas)',
      translationLabel: 'Translation',
      hiddenInAdvanced: 'Hidden in Level 4 (Contextual Mode)',
      targetCaseLabel: 'Required Case',
      targetNumberLabel: 'Number',
      questionLabel: 'Question',
      inputPlaceholder: 'Type the Lithuanian form...',
      checkBtn: 'Check Answer',
      retryBtn: 'Try Again',
      revealAnswerBtn: 'Show Correct Answer',
      hintBtn: 'Hint',
      skipBtn: 'Skip',
      nextWordBtn: 'Next Word',
      favoriteToggle: 'Bookmark',
      diacriticBarLabel: 'Lithuanian letters:',
      correctBanner: 'Excellent! Correct form',
      incorrectBanner: 'Error in ending or stem',
      tryAgainPrompt:
        'Not quite right. You can edit your answer and try again, or click "Show Correct Answer".',
      stemLabel: 'Stem (kamienas)',
      endingLabel: 'Ending (galūnė)',
      expectedFormLabel: 'Correct Form',
      yourAnswerLabel: 'Your Answer',
      grammarRuleTitle: 'Grammatical Explanation',
      dictionaryExampleTitle: 'Example of the declined word in a sentence (from dictionary)',
      hintBoxTitle: 'Grammar Hint (without revealing the answer)',
      sentenceContextLabel: 'Sentence Context',
      prepositionNote: 'Preposition governance',
      fullParadigmInstruction:
        'Type all 7 grammatical case forms of the selected noun:',
      checkAllFormsBtn: 'Check All 7 Forms',
      examProgressLabel: 'Exam Question',
      examCompleteTitle: 'No-Hint Exam Results',
      examRestartBtn: 'Start New Exam (15 Questions)',
    },
    dictionary: {
      title: 'Verified Lithuanian Noun Catalog',
      subtitle:
        '1,000 unique Lithuanian nouns (14,000 verified inflected forms) across CEFR A0–B2 and 14 topics with explicit stem/ending segmentation.',
      searchPlaceholder: 'Search by Lithuanian lemma or translation (namas, будинок, house)...',
      allTopics: 'All 14 Topics',
      allDeclensions: 'All 5 Declensions',
      onlyFavorites: 'Bookmarked Only',
      onlyExceptions: 'With Stem Alternations / Exceptions',
      showingCount: 'Words found:',
      viewFullTable: 'Declension Table',
      practiceThisWord: 'Practice This Word',
      stemAlternationBadge: 'Stem Alternation / Irregularity',
      tabForms: 'Declension (Forms)',
      tabUsage: 'Usage & Collocations',
      usageCollocationsTitle: 'Common Collocations',
      usageCollocationsDesc: 'Frequent combinations with verbs, adjectives, and prepositions',
      usageIdiomsTitle: 'Idioms & Proverbial Phrases',
      usageIdiomsDesc: 'Authentic Lithuanian idioms, metaphors, and sayings using this noun',
      usageGovernanceTitle: 'Case Governance & Prepositions',
      usageGovernanceDesc: 'Case patterns and prepositional frames typically governed by this noun',
      usageConversationalTitle: 'Conversational Phrases & Real-life Usage',
      usageConversationalDesc: 'Natural phrases for everyday conversations and dialogues',
    },
    reference: {
      title: 'Grammar Reference: Daiktavardžių linksniavimas',
      subtitle:
        'Interactive 5-declension paradigm table (singular and plural) and preposition case governance.',
      viewOriginalPdf: 'View Original PDF Sheet',
      hideOriginalPdf: 'Hide Original PDF Sheet',
      prepositionsTitle: 'Prepositions (Prielinksniai) & Case Governance',
      prepositionsSubtitle:
        'Each Lithuanian preposition governs a specific case (Genitive, Accusative, or Instrumental). The Locative (Vietininkas) is always used without prepositions.',
      singularHeader: 'VIENASKAITA (Singular)',
      pluralHeader: 'DAUGISKAITA (Plural)',
      caseColumn: 'Case / Question',
    },
    stats: {
      title: 'Statistics, Progress & Quality Verification',
      subtitle:
        'Detailed accuracy breakdown by case, declension, and topic, plus automated dictionary & evaluation unit tests.',
      learnedWords: 'Words Mastered',
      unlearnedWords: 'Still Learning',
      totalExercises: 'Exercises Completed',
      overallAccuracy: 'Overall Accuracy',
      currentStreak: 'Current Streak',
      bestStreak: 'Best Streak',
      byCaseTitle: 'Accuracy by Grammatical Case',
      byDeclensionTitle: 'Accuracy by Declension Type (1–5)',
      byTopicTitle: 'Progress by Topic',
      weeklyActivityTitle: 'Weekly Activity (Last 7 Days)',
      weeklyActivitySubtitle: 'Daily completed exercises chart to track practice consistency and daily goal progress',
      weeklyGoalLine: 'Daily goal',
      weeklyActiveDays: 'Active days',
      weeklyTotalLabel: '7-day total',
      weeklyCorrectLabel: 'Correct answers',
      weeklyIncorrectLabel: 'Mistakes (fixed)',
      weeklyAvgLabel: 'Avg. per day',
      hardestWordsTitle: 'Most Challenging Words',
      recentMistakesTitle: 'Recent Mistakes History',
      noMistakesYet: 'No mistakes recorded yet. Start practicing!',
      masteryRuleNote:
        'A noun is marked as "Mastered" only after at least 4 correct answers across multiple sessions or 5 consecutive error-free answers.',
      exportProgressBtn: 'Export Progress (JSON)',
      importProgressBtn: 'Import Backup',
      resetProgressBtn: 'Reset Statistics',
      automatedTestsTitle: 'Automated Grammar Forms & Evaluation Logic Tests',
      runTestsBtn: 'Re-run Unit Tests',
      badgesTitle: 'Achievements & Badges',
      badgesSubtitle: 'Unlock milestones for answer streaks, early morning sessions, and mastering Lithuanian cases',
      badgeUnlockedLabel: 'Unlocked',
      badgeLockedLabel: 'Locked',
    },
    settings: {
      title: 'Application Settings',
      languageLabel: 'Interface Language',
      themeLabel: 'Appearance Theme',
      lightTheme: 'Light',
      darkTheme: 'Dark',
      dailyGoalLabel: 'Daily Goal',
      exercisesPerDay: 'exercises per day',
      difficultyModeLabel: 'Difficulty Level Control',
      reminderTitle: 'Daily Practice Reminder (Web Notifications)',
      reminderEnableLabel: 'Enable daily push reminder',
      reminderTimeLabel: 'Reminder time',
      reminderPermissionGranted: 'Browser notification permission granted',
      reminderPermissionRequest: 'Grant browser notification permission',
      reminderPermissionDenied: 'Notifications blocked in browser settings (in-app reminder active)',
      reminderPermissionUnsupported: 'Web Notifications unsupported in this frame (in-app reminder active)',
      reminderTestBtn: 'Send test notification',
      feedbackSectionTitle: 'Sound Effects & Vibration (Offline)',
      soundEffectsLabel: 'Answer sound effects',
      soundEffectsDesc: 'Short, gentle offline chimes for correct and incorrect answers',
      hapticFeedbackLabel: 'Tactile feedback (vibration)',
      hapticFeedbackDesc: 'Subtle vibration when checking answers',
      testCorrectSoundBtn: 'Test "Correct"',
      testIncorrectSoundBtn: 'Test "Incorrect"',
      enabledStatus: 'Enabled',
      disabledStatus: 'Disabled',
    },
  },
};
