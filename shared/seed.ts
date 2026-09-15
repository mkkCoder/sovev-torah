import { splitDailyTime } from "./allocation";
import { addDaysIso, todayIso } from "./dates";
import { CATEGORY_LABEL, type AppState, type Book, type Chapter, type Flashcard, type WeeklyAssignment } from "./types";

function id(prefix: string, n: string | number): string {
  return `${prefix}-${n}`;
}

const NETZACH_CHAPTERS: { title: string; text: string }[] = [
  {
    title: "מעלת נצח ישראל",
    text: "המהר\"ל פותח בכך שנצחיות ישראל אינה מקרה היסטורי אלא שייכות עצמית. האומות נמדדות בזמן ובמקום; ישראל נמדדים בדביקותם בצורה האלוקית שניתנה להם. מכאן שגלות אינה מבטלת את הנצח אלא מעלימה אותו. הלימוד היום: להבחין בין היעלמות בפועל לבין ביטול בעצם — זו אבן היסוד של הספר כולו.",
  },
  {
    title: "גלות כהעדר ולא כהפך",
    text: "הגלות מתוארת כהעדר גילוי המלכות, לא כמציאות עצמאית שכנגד הקדושה. כשם שחושך אינו ישות אלא העדר אור, כך השעבוד הוא הסתר ולא החלפה. מי שמבין כך אינו נבהל מאריכות הגלות: ההעדר יכול להתמשך, והצורה ממתינה.",
  },
  {
    title: "ייחוד הצורה של ישראל",
    text: "ישראל הם עם של צורה, לא רק קיבוץ של יחידים. הצורה מחייבת אחדות פנימית גם כשהפיזור גדול. המהר\"ל לומד מכאן שפיזור הגלות אינו ראיה לפירוד עצמי, אלא ניסיון לצורה להתגלות מתוך הריבוי.",
  },
  {
    title: "סיבת הגלות",
    text: "הגלות באה מפגם בדבקות, לא מגזירה שרירותית. כשהצינור מתעמעם, המלכות אינה נראית בעולם. לימוד זה דורש אחריות: אם הסיבה פנימית, גם התיקון פנימי — בלימוד, במידת האחדות ובקדושת הדיבור.",
  },
  {
    title: "אריכות הגלות",
    text: "אריכות אינה סתירה לנצח. להפך: דבר נצחי אינו נמדד בקצב של מלכויות נופלות. המהר\"ל מדגיש שהשואל \"עד מתי\" צריך לשאול גם \"מאיזה מדד אתה שואל\". זמן האומות אינו זמן התורה.",
  },
  {
    title: "השכינה בגלות",
    text: "שכינה בגלות פירושה שהקדושה אינה נסוגה מן העולם אלא יורדת עמו. זו נחמה וזו תביעה: אם השכינה גולה, אין מקום לניתוק בין לימוד לבין מציאות. בית המדרש עצמו נעשה מקום גילוי במסתרים.",
  },
  {
    title: "שעבוד מלכויות",
    text: "ארבע המלכויות הן סדר של הסתר הולך ומתעבה. כל מלכות מגלה פן אחר של הריחוק: כוח, תרבות, שכחה. ישראל עוברים בכולן בלי להיבלע, משום שאין להם שורש באותה צורה.",
  },
  {
    title: "בחינת הקץ",
    text: "הקץ אינו תאריך בלוח אלא השלמת תיקון הצורה. מי שמחשב קצים בלי תיקון מחליף סימן במסומן. המהר\"ל מקרב את הלומד לראות בקץ תהליך של התגלות, לא הפתעה חיצונית בלבד.",
  },
  {
    title: "הגאולה כהשלמה",
    text: "גאולה היא השבת הדבר אל שלמותו, לא המצאת מציאות חדשה. לכן הגאולה \"שייכת\" לישראל מעיקרא. הלימוד: לחכות לגאולה פירושו לחיות כבר עתה לפי הצורה שתתגלה בשלמות.",
  },
  {
    title: "אחדות האומה",
    text: "פירוד הלבבות הוא פגם בצורה עצמה. המהר\"ל רואה במחלוקת שאינה לשם שמים סדק בנצח הנגלה. התיקון מתחיל בהקשבה בבית המדרש: מחלוקת המבררת מאחדת, מחלוקת המבזה מפזרת.",
  },
  {
    title: "התורה כצורת ישראל",
    text: "התורה אינה תוספת על העם אלא נשמתו הפועלת. בלי תורה נשארת האומה כגוף בלא צורה. מכאן חומרת ביטול תורה בגלות: זו לא רק עבירה אלא פגיעה בצינור הנצח.",
  },
  {
    title: "הנסתר שבגאולה",
    text: "יש גאולה נגלית ויש בחינה נסתרת שכבר פועלת. הלומד נדרש לזהות ניצנים: שיבת לימוד, קיבוץ לבבות, חיות של אמונה. הנסתר אינו פוטר מן המעשה; הוא מחייב דיוק בראייה.",
  },
  {
    title: "הטבע והנס",
    text: "אצל ישראל אין פירוד גמור בין טבע לנס. המהר\"ל מסביר שהטבע עצמו כלי לגילוי. בגלות נראה הטבע כשולט; בגאולה מתגלה שהוא משרת. הלימוד היומי: לראות את הטבע כשפה, לא כאדון.",
  },
  {
    title: "מעלת ארץ ישראל",
    text: "הארץ שייכת לצורה: מקום שמיועד לגילוי השלם. גלות מן הארץ היא גלות מן ההתאמה בין עם למקום. אף בחוץ לארץ נשארת השייכות, כשלהבת בגחלת — חלשה בנראות, קיימת בעצם.",
  },
  {
    title: "הלשון והייחוד",
    text: "לשון הקודש נושאת את הצורה. איבוד הלשון בגלות הוא סימן להסתר, לא סוף. כל מילה של תורה שמחזירים לפה היא קיבוץ גלויות של הדיבור.",
  },
  {
    title: "הזמן של ישראל",
    text: "שבת, מועד ומחזורי פרשה בונים זמן אחר. המהר\"ל רואה בלוח העברי התנגדות לשעבוד הזמן הגויי. מי שחי את סדר הפרשה חי בתוך נצח מתגלגל, לא בתוך דדליין של מלכות.",
  },
  {
    title: "הייסורים כבירור",
    text: "ייסורי גלות אינם נקמה גרידא אלא בירור הסיגים מן הצורה. הבנה זו אינה מבטלת את הכאב; היא מונעת את הייאוש. הלומד שואל: מה מתברר בי עכשיו, לא רק מדוע כואב.",
  },
  {
    title: "תפילה כעמידה בגלות",
    text: "תפילה היא העמדת הצורה מול ההעדר. שלוש התפילות הן קצב של אי-כניעה לשעבוד השעה. בבית המדרש, גם הלימוד עצמו נעשה תפילה ארוכה — דיבור שמחזיר שכינה לתוך השפה.",
  },
  {
    title: "המלכות הנסתרת",
    text: "מלכות בית דוד גולה אך לא בטלה. זרע המלכות הוא אפשרות שמונחת באומה. לימוד נצח ישראל מחייב לראות מנהיגות כגילוי צורה, לא ככוח פוליטי בלבד.",
  },
  {
    title: "השפל והרוממות",
    text: "המהר\"ל חוזר על הכלל שכל שפל של ישראל הוא הכנה לרוממות. אין זו אופטימיות זולה אלא מבנה מטאפיזי: הקצה התחתון מעיד על גובה הצורה. לכן אין למדוד את ישראל בשעת השפל במדד חיצוני.",
  },
  {
    title: "החכמה והאמונה",
    text: "חכמת האומות תופסת את הנמצא; אמונת ישראל תופסת את הצורה שמעבר לנמצא. אין לבטל חכמה, אך אין להמליך אותה על הנצח. בית המדרש מאמן את השכל להיות כלי לאמונה, לא תחליף לה.",
  },
  {
    title: "הפיזור כניסיון לאחדות",
    text: "ריבוי קהילות בגלות עלול להיראות ככישלון. המהר\"ל הופך את הקערה: הפיזור בוחן אם הצורה אחת. כשלומדים אותה גמרא בריחוק גיאוגרפי, מתגלה שהמקום אינו בעלים על התורה.",
  },
  {
    title: "הגאולה בלימוד",
    text: "כל סוגיא שמתיישבת היא בחינת גאולה פרטית: הסתר שהתבהר. לכן שיטת הלימוד — עיון, סברא, חזרה — אינה טכניקה בלבד אלא תרגול של יציאת מצרים שכלית.",
  },
  {
    title: "מדת הביטחון",
    text: "ביטחון אצל המהר\"ל אינו פסיביות. הוא ידיעה שהצורה לא תונח. מי שבוטח לומד כמי שיש לו זמן של נצח, ואינו בורח לקיצורי דרך של ייאוש או של חשבון קצים קל.",
  },
  {
    title: "הדור האחרון",
    text: "דור של הסתר מופלג הוא גם דור של אפשרות גילוי מופלג. הסימן אינו הנוחות אלא הצמא. כשיש צמא לתורה בתוך ריחוק — זו עדות שהצורה דופקת על הדלת.",
  },
  {
    title: "תחיית המתים כמשל לנצח",
    text: "תחייה מלמדת שאין כליון מוחלט לצורה שניתנה. הגוף נופל והצורה ממתינה. כך ישראל: נפילות מדיניות אינן קבורה סופית. הלימוד מחבר בין אמונת התחייה לבין אמונת האומה.",
  },
  {
    title: "השלום כשלמות הצורה",
    text: "שלום אינו היעדר מחלוקת אלא חיבור האיברים לגוף אחד. המהר\"ל רואה בשלום הגאולה את גילוי האחדות שהיתה שם תמיד. כל פיוס בבית המדרש הוא דגם קטן של אותה שלמות.",
  },
  {
    title: "האור הגנוז",
    text: "יש אור שנגנז לצדיקים לעתיד, ויש בחינתו בלימוד העיון. סוגיא עמוקה היא מגע באור שאינו של שימוש יומיומי. לכן אין לוותר על השאלה הקשה — היא פתח לגנוז.",
  },
  {
    title: "שמירת הברית",
    text: "הברית היא החוזה של הנצח. שמירתה בגלות היא האחיזה האחרונה כשהארץ והמלכות אינן ביד. המהר\"ל מחבר ברית מילה, ברית תורה וברית אומה לרצף אחד של שייכות שאינה ניתנת לביטול.",
  },
  {
    title: "נצח הנגלה",
    text: "סיום המהלך: הנצח שבהסתר עתיד להיות נצח שבגילוי. הלומד אינו צופה מן הצד. הוא חלק מן הגילוי כשהוא משלים את פרקו, חוזר על כרטיסיותיו, ומחבר אמונה להלכה ולש\"ס ביום אחד שלם.",
  },
];

const HALACHA_CHAPTERS: { title: string; text: string }[] = [
  {
    title: "מצוות תלמוד תורה",
    text: "תלמוד תורה כנגד כולם — לא כסיסמה אלא כסדר חיים. החיוב הוא קביעות עיתים ביום ובלילה, איש לפי כוחו. הלימוד היומי כאן: לקבוע שיעור שאינו נדחה מפני טרדה קלה, ולהבין שגם חזרה על הישן היא תלמוד.",
  },
  {
    title: "סדר העדיפויות בלימוד",
    text: "יש לקבוע עיתים למקרא, למשנה ולגמרא, ולחזור על ההלכה המעשית. אין האחד דוחה את האחר לגמרי. ב\"סובב תורה\" מתורגם סדר זה לחלוקת הזמן: רוב היום לטקסט, מיעוטו לחזרה — כדי שהלימוד יישאר.",
  },
  {
    title: "כבוד התורה ולומדיה",
    text: "כבוד תורה אינו נימוס חיצוני. הוא יחס של מורא שמכשיר את הלב לקבל. זלזול בסוגיא, בכרטיסייה או בחברותא הוא פרצה בכבוד. הלימוד: לנהוג בחומר כבדבר חי.",
  },
  {
    title: "ביטול תורה",
    text: "ביטול תורה חמור במיוחד כשיש עת קבועה ונזנחה. אונס רחמנא פטריה, אך הרגל של דחייה אינו אונס. סימון \"סיימתי את הלימוד היומי\" הוא עדות לקיום העת — לא לסימון בעלמא.",
  },
];

const SHAS_CHAPTERS: { title: string; text: string }[] = [
  {
    title: "מאימתי קורין — זמן קריאת שמע",
    text: "המשנה פותחת בזמן: מאימתי קורין את שמע בערבית. הזמן אינו מסגרת טכנית אלא כניסה לעול מלכות שמים. מחלוקת רבי אליעזר וחכמים מלמדת שגבולות היום הם עצמם סוגיא של עמידה לפני המקום.",
  },
  {
    title: "ברכות השחר והכוונה",
    text: "ברכות השחר מסדרות את היקיצה אל עולם של מצוות. הגמרא בברכות דנה בכוונה, בהפסקה ובטעות. עיון: מה נחשב \"לב\" בברכה, ומה די בהוצאת שפתיים. הסברא מחייבת שלא יהיה הדיבור ריק.",
  },
  {
    title: "תפילה בכוונה ובזמן",
    text: "תפילת העמידה עומדת בתווך בין זמן קבוע לבין עבודה שבלב. הסוגיות על טעות, על חזרה ועל מקום התפילה בונות משמעת: יש מסגרת, ויש פנים. בלי המסגרת אין בית; בלי הפנים אין שכינה.",
  },
];

function makeChapters(bookId: string, rows: { title: string; text: string }[]): Chapter[] {
  return rows.map((row, i) => ({
    id: id("ch", `${bookId}-${i + 1}`),
    bookId,
    number: i + 1,
    title: row.title,
    text: row.text,
    studyCompleted: false,
  }));
}

function card(partial: Omit<Flashcard, "ease" | "reviews" | "createdAt" | "difficulty"> & Partial<Flashcard>): Flashcard {
  return {
    ease: 2.5,
    reviews: 0,
    difficulty: 3,
    createdAt: `${todayIso()}T08:00:00.000Z`,
    ...partial,
  };
}

export function createSeedState(now = new Date()): AppState {
  const today = todayIso(now);
  const { studyMinutes, reviewMinutes } = splitDailyTime(90);

  const books: Book[] = [
    {
      id: "netzach-yisrael",
      title: "נצח ישראל",
      author: 'מהר"ל מפראג',
      category: "emuna",
      chapterCount: NETZACH_CHAPTERS.length,
    },
    {
      id: "hilchot-talmud-torah",
      title: "הלכות תלמוד תורה",
      author: "רמב\"ם / שו\"ע",
      category: "halacha",
      chapterCount: HALACHA_CHAPTERS.length,
    },
    {
      id: "berakhot",
      title: "מסכת ברכות",
      author: "תלמוד בבלי",
      category: "shas",
      chapterCount: SHAS_CHAPTERS.length,
    },
  ];

  const chapters: Chapter[] = [
    ...makeChapters("netzach-yisrael", NETZACH_CHAPTERS),
    ...makeChapters("hilchot-talmud-torah", HALACHA_CHAPTERS),
    ...makeChapters("berakhot", SHAS_CHAPTERS),
  ];

  const weekly: WeeklyAssignment[] = [
    { day: 0, category: "emuna", seferId: "netzach-yisrael", note: 'אמונה — מהר"ל' },
    { day: 1, category: "shas", seferId: "berakhot", note: "גמרא — ברכות" },
    { day: 2, category: "halacha", seferId: "hilchot-talmud-torah", note: "הלכה" },
    { day: 3, category: "emuna", seferId: "netzach-yisrael", note: "אמונה" },
    { day: 4, category: "shas", seferId: "berakhot", note: "גמרא" },
    { day: 5, category: "halacha", seferId: "hilchot-talmud-torah", note: "הלכה להלכה למעשה" },
    { day: 6, category: "emuna", seferId: "netzach-yisrael", note: "אמונה / חזרה שקטה" },
  ];

  const n1 = "ch-netzach-yisrael-1";
  const n2 = "ch-netzach-yisrael-2";
  const h1 = "ch-hilchot-talmud-torah-1";
  const b1 = "ch-berakhot-1";

  const netzach1 = chapters.find((c) => c.id === n1);
  const berakhot1 = chapters.find((c) => c.id === b1);
  if (netzach1) {
    netzach1.studyCompleted = true;
    netzach1.completedAt = addDaysIso(today, -2);
  }
  if (berakhot1) {
    berakhot1.studyCompleted = true;
    berakhot1.completedAt = addDaysIso(today, -1);
  }

  const cards: Flashcard[] = [
    card({
      id: "c-n1-iyun",
      question: "מהו היסוד העיוני של המהר\"ל: כיצד נצחיות ישראל עומדת גם כשהגילוי ההיסטורי נעלם?",
      answer:
        "הנצח הוא שייכות עצמית לצורה האלוקית, לא רצף הצלחות מדיניות. גלות מעלימה את הגילוי ואינה מבטלת את העצם. לכן מודדים את ישראל במדד הצורה, לא במדד האומות.",
      archetype: "iyun",
      category: "emuna",
      sefer: "נצח ישראל",
      subTag: "פרק א — מעלת נצח ישראל",
      chapterId: n1,
      bookId: "netzach-yisrael",
      source: "chapter",
      locked: false,
      status: "review",
      intervalDays: 2,
      nextReview: today,
      difficulty: 3.6,
      reviews: 1,
      firstReviewedAt: addDaysIso(today, -2),
    }),
    card({
      id: "c-n1-sevara",
      question: "מדוע לפי הסברא אין אריכות הגלות ראיה נגד נצח ישראל?",
      answer:
        "דבר נצחי אינו נמדד בקצב נפילת מלכויות. אם הנצח היה תלוי בהצלחה נראית, די היה בגלות אחת כדי לבטלו. הסברא הופכת: דווקא העמידה בתוך העדר מוכיחה שהצורה אינה תלויה בזמן הקצר.",
      archetype: "sevara",
      category: "emuna",
      sefer: "נצח ישראל",
      subTag: "פרק א",
      chapterId: n1,
      bookId: "netzach-yisrael",
      source: "chapter",
      locked: false,
      status: "review",
      intervalDays: 1,
      nextReview: today,
      difficulty: 4,
      reviews: 1,
    }),
    card({
      id: "c-n1-cloze",
      question: "השלימו: הגלות מתוארת אצל המהר\"ל כ______ גילוי המלכות, לא כמציאות עצמאית שכנגד הקדושה.",
      answer: "העדר (או: הסתר) — לא הפך חיובי.",
      archetype: "cloze",
      category: "emuna",
      sefer: "נצח ישראל",
      subTag: "פרק א",
      chapterId: n1,
      bookId: "netzach-yisrael",
      source: "chapter",
      locked: false,
      status: "review",
      intervalDays: 3,
      nextReview: addDaysIso(today, -1),
      difficulty: 2.8,
      reviews: 1,
    }),
    card({
      id: "c-n1-context",
      question: "באיזה הקשר עומד ספר נצח ישראל ביחס לגלות וגאולה, ולמה הפרק הראשון חייב לבוא לפני דיון בקץ?",
      answer:
        "בלי יסוד הנצח, דיון בקץ נעשה חשבון תאריכים. הפרק הראשון מניח שהאומה שייכת לצורה נצחית; רק אחר כך נשאלת שאלת ההתגלות בזמן.",
      archetype: "context",
      category: "emuna",
      sefer: "נצח ישראל",
      subTag: "מבנה הספר",
      chapterId: n1,
      bookId: "netzach-yisrael",
      source: "chapter",
      locked: false,
      status: "review",
      intervalDays: 2,
      nextReview: today,
      difficulty: 3.2,
      reviews: 1,
    }),
    card({
      id: "c-n2-iyun",
      question: "כיצד מבחין המהר\"ל בין גלות כהעדר לבין גלות כהפך, ומה נפקא־מינה לאמונה?",
      answer:
        "העדר פירושו שהקדושה קיימת והגילוי חסר; הפך היה אומר שמציאות אחרת ניצחה. הנפקא־מינה: אין להתייאש ואין להמליך את השעבוד כ\"מציאות אמיתית יותר\".",
      archetype: "iyun",
      category: "emuna",
      sefer: "נצח ישראל",
      subTag: "פרק ב — גלות כהעדר",
      chapterId: n2,
      bookId: "netzach-yisrael",
      source: "chapter",
      locked: true,
      status: "locked",
      intervalDays: 0,
      nextReview: null,
    }),
    card({
      id: "c-n2-sevara",
      question: "איזו סברא מתחייבת אם החושך הוא העדר אור ולא ישות עצמאית — לגבי שעבוד מלכויות?",
      answer:
        "השעבוד אינו \"עולם אחר\" אלא מיעוט גילוי. לכן אין לעצב זהות ישראלית מתוך ערכי המלכות השלטת כאילו הם העצם.",
      archetype: "sevara",
      category: "emuna",
      sefer: "נצח ישראל",
      subTag: "פרק ב",
      chapterId: n2,
      bookId: "netzach-yisrael",
      source: "chapter",
      locked: true,
      status: "locked",
      intervalDays: 0,
      nextReview: null,
    }),
    card({
      id: "c-h1-iyun",
      question: "מהו היסוד העיוני ב\"תלמוד תורה כנגד כולם\" — האם זה שקלול כמותי או הגדרת צורת החיים?",
      answer:
        "זו הגדרת צורה: בלי תורה שאר המצוות חסרות את הנשמה המארגנת. לכן קביעת עיתים אינה \"עוד משימה\" אלא שמירת הצינור.",
      archetype: "iyun",
      category: "halacha",
      sefer: "הלכות תלמוד תורה",
      subTag: "פרק א — מצוות תלמוד תורה",
      chapterId: h1,
      bookId: "hilchot-talmud-torah",
      source: "chapter",
      locked: true,
      status: "locked",
      intervalDays: 0,
      nextReview: null,
    }),
    card({
      id: "c-h1-sevara",
      question: "מדוע לפי הסברא חזרה על הישן נחשבת תלמוד ולא בטלה, גם כשאין \"דף חדש\"?",
      answer:
        "המצווה היא עסק התורה, לא ציד חידושים. בלי חזרה הידיעה מתפוגגת והמצווה נעקרת בפועל. לכן שינון מסודר הוא קיום, לא תוספת רשות.",
      archetype: "sevara",
      category: "halacha",
      sefer: "הלכות תלמוד תורה",
      subTag: "פרק א",
      chapterId: h1,
      bookId: "hilchot-talmud-torah",
      source: "chapter",
      locked: true,
      status: "locked",
      intervalDays: 0,
      nextReview: null,
    }),
    card({
      id: "c-h1-cloze",
      question: "השלימו את הכלל: תלמוד תורה כנגד ______.",
      answer: "כולם",
      archetype: "cloze",
      category: "halacha",
      sefer: "הלכות תלמוד תורה",
      subTag: "פרק א",
      chapterId: h1,
      bookId: "hilchot-talmud-torah",
      source: "chapter",
      locked: true,
      status: "locked",
      intervalDays: 0,
      nextReview: null,
    }),
    card({
      id: "c-h1-context",
      question: "באיזה הקשר הלכתי עומדת קביעת עיתים ביום ובלילה, ומה יחסה לחלוקת 80/20 בלומדים היום?",
      answer:
        "החיוב הוא קביעות, לא אקראיות. חלוקת רוב הזמן לטקסט ומיעוטו לחזרה מממשת את החיוב בלי לשרוף את הלומד — העת לתורה נשמרת, והחזרה מונעת ביטול בפועל.",
      archetype: "context",
      category: "halacha",
      sefer: "הלכות תלמוד תורה",
      subTag: "קביעת עיתים",
      chapterId: h1,
      bookId: "hilchot-talmud-torah",
      source: "chapter",
      locked: true,
      status: "locked",
      intervalDays: 0,
      nextReview: null,
    }),
    card({
      id: "c-h1-iyun2",
      question: "כיצד מבחינים בין אונס שפוטר מביטול תורה לבין הרגל של דחיית השיעור הקבוע?",
      answer:
        "אונס הוא מניעה שאינה בידו. דחייה חוזרת מפני טרדה קלה היא בחירה שהפכה להרגל, ולכן קרובה לביטול. סימון סיום הלימוד היומי נועד לייצב את העת.",
      archetype: "iyun",
      category: "halacha",
      sefer: "הלכות תלמוד תורה",
      subTag: "ביטול תורה",
      chapterId: h1,
      bookId: "hilchot-talmud-torah",
      source: "chapter",
      locked: true,
      status: "locked",
      intervalDays: 0,
      nextReview: null,
    }),
    card({
      id: "c-h1-sevara2",
      question: "איזו סברא מצדיקה לא לפתוח כרטיסיות של פרק לפני שסיימו את גוף הלימוד?",
      answer:
        "חזרה בלי יגיעת הטקסט הופכת את הכרטיסייה לסיסמה. הסברא: קניין בא מלימוד רצוף; השינון שומר קניין, אינו מחליף אותו. לכן הכרטיסים נעולים עד \"סיימתי\".",
      archetype: "sevara",
      category: "halacha",
      sefer: "הלכות תלמוד תורה",
      subTag: "סדר לימוד וחזרה",
      chapterId: h1,
      bookId: "hilchot-talmud-torah",
      source: "chapter",
      locked: true,
      status: "locked",
      intervalDays: 0,
      nextReview: null,
    }),
    card({
      id: "c-b1-iyun",
      question: "מהי השאלה העיונית ב\"מאימתי קורין\" — האם זו שאלה של שעון או של כניסה לעול מלכות שמים?",
      answer:
        "הזמן מגדיר מתי האדם ראוי לקבל עול. הגבול בין יום ללילה אינו טכני בלבד: הוא רגע של עמידה. לכן פתיחת ש\"ס בזמן קריאת שמע היא פתיחה בעבודת הלב.",
      archetype: "iyun",
      category: "shas",
      sefer: "ברכות",
      subTag: "מאימתי קורין",
      chapterId: b1,
      bookId: "berakhot",
      source: "chapter",
      locked: false,
      status: "review",
      intervalDays: 1,
      nextReview: today,
      difficulty: 3.4,
      reviews: 1,
      firstReviewedAt: addDaysIso(today, -1),
    }),
    card({
      id: "c-b1-cloze",
      question: "השלימו את פתיחת המשנה: מאימתי קורין את שמע ______.",
      answer: "בערבית",
      archetype: "cloze",
      category: "shas",
      sefer: "ברכות",
      subTag: "דף ב ע\"א",
      chapterId: b1,
      bookId: "berakhot",
      source: "chapter",
      locked: false,
      status: "learning",
      intervalDays: 2,
      nextReview: today,
      difficulty: 2.5,
      reviews: 1,
    }),
    card({
      id: "c-b1-context",
      question: "מדוע נפתחת מסכת ברכות בזמן קריאת שמע של ערבית ולא בשחרית, ומה ההקשר הסידורי?",
      answer:
        "היום ההלכתי מתחיל בלילה. הפתיחה בערבית ממקמת את הלומד בסדר הבריאה (ויהי ערב) ובסדר המצוות. ההקשר: ברכות כמסכת של עול, לא של נימוס אמירה.",
      archetype: "context",
      category: "shas",
      sefer: "ברכות",
      subTag: "סדר המסכת",
      chapterId: b1,
      bookId: "berakhot",
      source: "chapter",
      locked: false,
      status: "review",
      intervalDays: 3,
      nextReview: addDaysIso(today, -3),
      difficulty: 4.2,
      reviews: 2,
    }),
    card({
      id: "c-bonus-1",
      question: "מה הסברא שחלוקת זמן 80/20 בין לימוד לחזרה אינה ביטול תורה אלא קיומה?",
      answer:
        "בלי חזרה הלימוד נעקר. הקצאת כחמישית לחזרה משמרת את הארבע חמישיות. זו מדת אנטי-שחיקה: לא למעט בתורה אלא למנוע אשליה של כיסוי בלי קניין.",
      archetype: "sevara",
      category: "emuna",
      sefer: "סובב תורה",
      subTag: "שיטת הלימוד",
      source: "bonus",
      locked: false,
      status: "review",
      intervalDays: 7,
      nextReview: today,
      difficulty: 2.2,
      reviews: 3,
    }),
    card({
      id: "c-bonus-2",
      question: "השלימו: כרטיסיות של פרק נשארות ______ עד שמסמנים \"סיימתי את הלימוד היומי\".",
      answer: "נעולות",
      archetype: "cloze",
      category: "halacha",
      sefer: "סובב תורה",
      subTag: "סדר היום",
      source: "bonus",
      locked: false,
      status: "review",
      intervalDays: 4,
      nextReview: today,
      difficulty: 1.8,
      reviews: 2,
    }),
    card({
      id: "c-bonus-3",
      question: "באיזה הקשר שייכת כרטיסיית \"שאלה עיונית מעמיקה\" ביחס לשאר הארכיטיפים?",
      answer:
        "היא העיקר: לברר יסוד. סברא בוחנת הכרח, cloze משמר ניסוח, מיקום משיב לסוגיא. בלי עיון, השאר נשארים טכניקה.",
      archetype: "iyun",
      category: "emuna",
      sefer: "סובב תורה",
      subTag: "ארכיטיפים",
      source: "bonus",
      locked: false,
      status: "review",
      intervalDays: 10,
      nextReview: addDaysIso(today, 5),
      difficulty: 3,
      reviews: 1,
    }),
  ];

  for (let i = 3; i <= 8; i++) {
    const chId = `ch-netzach-yisrael-${i}`;
    cards.push(
      card({
        id: `c-n${i}-lock`,
        question: `שאלה עיונית לפרק ${i} בנצח ישראל: כיצד מתקשר נושא הפרק לנצחיות ישראל?`,
        answer: chapters.find((c) => c.id === chId)?.text.slice(0, 280) ?? "עיינו בפרק.",
        archetype: "iyun",
        category: "emuna",
        sefer: "נצח ישראל",
        subTag: `פרק ${i}`,
        chapterId: chId,
        bookId: "netzach-yisrael",
        source: "chapter",
        locked: true,
        status: "locked",
        intervalDays: 0,
        nextReview: null,
      }),
    );
  }

  for (const ch of chapters) {
    if (cards.some((c) => c.chapterId === ch.id)) continue;
    const book = books.find((b) => b.id === ch.bookId);
    cards.push(
      card({
        id: `c-auto-${ch.id}`,
        question: `שאלה עיונית ל«${ch.title}»: מהו היסוד שמארגן את הפרק, וכיצד הוא מתקשר לקטגוריית ${book ? CATEGORY_LABEL[book.category] : "הלימוד"}?`,
        answer: ch.text.slice(0, 320),
        archetype: "iyun",
        category: book?.category ?? "emuna",
        sefer: book?.title ?? "",
        subTag: `פרק ${ch.number}`,
        chapterId: ch.id,
        bookId: ch.bookId,
        source: "chapter",
        locked: !ch.studyCompleted,
        status: ch.studyCompleted ? "new" : "locked",
        intervalDays: 0,
        nextReview: null,
      }),
    );
  }

  return {
    version: 2,
    settings: {
      dailyMinutes: 90,
      studyMinutes,
      reviewMinutes,
      onboarded: false,
      isAdmin: false,
      profileName: "לומד",
    },
    weekly,
    books,
    chapters,
    cards,
    reviewsLog: [],
    deferredCardIds: [],
    deferredOn: null,
  };
}
