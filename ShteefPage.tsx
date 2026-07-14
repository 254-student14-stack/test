import { useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   שטיף — דף נחיתה dark-premium (בהשראת hanitdaniel.co.il)

   הוסף לקובץ index.html שלך (בתוך <head>):

   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&family=Epilogue:wght@500;600;700;800;900&display=swap" rel="stylesheet" />

   פרטי חיבור אמיתיים למלא לפני פרסום:
   N8N_WEBHOOK_URL, DOMAIN, LOGO_URL, HERO_IMAGE_URL
───────────────────────────────────────────── */

const N8N_WEBHOOK_URL = "{{N8N_WEBHOOK_URL}}";
const WHATSAPP_NUMBER = "972543379667";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/* ============ data ============ */

type FieldDef =
  | { key: string; label: string; type: "range"; min: number; max: number; step: number; default: number }
  | { key: string; label: string; type: "chip"; options: { value: string; label: string }[]; default: string };

type ServiceDef = {
  id: string;
  title: string;
  hint: string;
  cat: string;
  desc: string;
  icon: React.ReactNode;
  fields: FieldDef[];
  price: (values: Record<string, number | string>) => number;
};

const ICONS = {
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    </svg>
  ),
  sofa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 13h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4zM5 13V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 19v2M19 19v2" />
    </svg>
  ),
  ac: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 8h18M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2M3 8v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8M7 20h10" />
    </svg>
  ),
  floor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h16v16H4z" />
      <path d="M4 12h16M12 4v16" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.02c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.1 8.1 0 0 1-1.24-4.24c0-4.48 3.65-8.13 8.13-8.13 4.48 0 8.13 3.65 8.13 8.13 0 4.48-3.65 8.11-8.13 8.11z" />
    </svg>
  ),
};

const SERVICES: ServiceDef[] = [
  {
    id: "building",
    title: "ניקיון בניינים לאחר שיפוץ",
    hint: "החל מ-₪900",
    cat: "בניינים",
    desc: "הסרת אבק, שאריות צבע ופסולת בנייה — מהלובי ועד חדר המדרגות, עד לניקיון מלא של הבניין.",
    icon: ICONS.building,
    fields: [
      { key: "floors", label: "מספר קומות בבניין", type: "range", min: 1, max: 20, step: 1, default: 4 },
      { key: "apartments", label: "מספר דירות בבניין", type: "range", min: 1, max: 60, step: 1, default: 8 },
    ],
    price: (v) => 900 + Number(v.floors) * 180 + Number(v.apartments) * 95,
  },
  {
    id: "sofa",
    title: "ניקוי ספות ומזרנים",
    hint: "החל מ-₪120 לפריט",
    cat: "ריהוט",
    desc: "מכונת אקסטרקציה מקצועית, חיטוי עמוק וסילוק כתמים וריחות — הספה חוזרת כמו חדשה.",
    icon: ICONS.sofa,
    fields: [
      { key: "items", label: "מספר פריטים (ספות + מזרנים)", type: "range", min: 1, max: 10, step: 1, default: 3 },
      {
        key: "fabric",
        label: "סוג בד",
        type: "chip",
        options: [
          { value: "fabric", label: "בד רגיל" },
          { value: "leather", label: "עור / בד משולב" },
        ],
        default: "fabric",
      },
    ],
    price: (v) => Number(v.items) * (v.fabric === "leather" ? 160 : 120),
  },
  {
    id: "ac",
    title: "ניקוי מזגנים",
    hint: "החל מ-₪180 ליחידה",
    cat: "מיזוג",
    desc: "פירוק, שטיפה תעשייתית וחיטוי מסננים — אוויר נקי ובריא וחיסכון בחשמל.",
    icon: ICONS.ac,
    fields: [
      { key: "units", label: "מספר יחידות מזגן", type: "range", min: 1, max: 15, step: 1, default: 2 },
      {
        key: "type",
        label: "סוג מזגן",
        type: "chip",
        options: [
          { value: "split", label: "עילי / מיני-מרכזי" },
          { value: "central", label: "מרכזי תעשייתי" },
        ],
        default: "split",
      },
    ],
    price: (v) => Number(v.units) * (v.type === "central" ? 320 : 180),
  },
  {
    id: "floor",
    title: "פוליש והברקת רצפות",
    hint: "החל מ-₪450",
    cat: "רצפות",
    desc: "פוליש, ווקס או קריסטליזציה — בהתאם לסוג הרצפה, לברק שמחזיק לאורך זמן.",
    icon: ICONS.floor,
    fields: [
      { key: "sqm", label: "שטח הרצפה במ״ר", type: "range", min: 20, max: 400, step: 10, default: 80 },
      {
        key: "treatment",
        label: "סוג טיפול",
        type: "chip",
        options: [
          { value: "polish", label: "פוליש" },
          { value: "wax", label: "ווקס" },
          { value: "crystal", label: "קריסטליזציה" },
        ],
        default: "polish",
      },
    ],
    price: (v) => {
      const rate = v.treatment === "crystal" ? 35 : v.treatment === "wax" ? 22 : 18;
      return Math.max(450, Number(v.sqm) * rate);
    },
  },
];

const STATS = [
  { target: 4.8, decimals: 1, suffix: "/5", label: "שביעות רצון" },
  { target: 140, decimals: 0, suffix: "+", label: "עבודות הושלמו" },
  { target: 24, decimals: 0, suffix: "", label: "שעות זמן תגובה" },
];

const PROMISES = [
  { b: "מחיר סופי לפני תחילת העבודה", rest: " — ללא הפתעות" },
  { b: "זמינות מלאה", rest: " — מענה תוך 24 שעות" },
  { b: "גישה אישית", rest: " — מכירים כל לקוח לעומק" },
  { b: "צוות מאומת ומבוטח", rest: " — לבתים, משרדים ובניינים" },
];

const PROCESS_STEPS = [
  { title: "פנייה והצעת מחיר", desc: "מחשבון באתר או וואטסאפ — הערכת מחיר תוך דקות, מחיר סופי לפני העבודה." },
  { title: "תיאום מהיר", desc: "קובעים מועד שנוח לכם — ברוב המקרים תוך 24 שעות מהפנייה." },
  { title: "ביצוע מקצועי", desc: "צוות מאומת מגיע בזמן עם ציוד תעשייתי ומבצע עבודה יסודית." },
  { title: "בדיקה ואחריות", desc: "עוברים על התוצאה יחד. לא מרוצים? חוזרים ומשלימים — בלי ויכוחים." },
];

const TESTIMONIALS = [
  { stars: 5, text: "מיכל כ., דיירת בבניין ברחובות — ניקו את כל הבניין אחרי השיפוץ תוך יום אחד, בלי אבק בשום פינה." },
  { stars: 5, text: "אבי ל., מנהל משרד בפתח תקווה — הצוות הגיע בזמן, ניקה 3 ספות ומזגן אחד תוך שעתיים." },
  { stars: 5, text: "דנה מ., בעלת דירה בהוד השרון — ניקוי ספה ומזרון תוך שעה, בלי ריח כלל אחרי הטיפול." },
  { stars: 4, text: "יוסי ב., קבלן שיפוצים בכפר סבא — מזמין את שטיף אחרי כל פרויקט, תמיד מגיעים בזמן שסוכם." },
];

const PROJECTS = [
  { title: "בניין מגורים ברחובות", desc: "ניקיון מלא אחרי שיפוץ כללי בבניין" },
  { title: "משרד בפתח תקווה", desc: "ניקוי 3 ספות ומזגן אחד" },
  { title: "פנטהאוז בהרצליה", desc: "הברקת פרקט בשיטת קריסטליזציה" },
  { title: "בניין מסחרי בכפר סבא", desc: "ניקיון קומות מסחר אחרי שיפוץ" },
  { title: "וילה בהוד השרון", desc: "ניקוי מזגנים מרכזיים תעשייתיים" },
  { title: "דירת 5 חדרים ברעננה", desc: "ניקוי ספות ושטיחים לעומק" },
];

const BLOG_POSTS = [
  {
    tag: "שיפוצים",
    chipClass: "",
    readTime: "5 דק׳",
    grad: "linear-gradient(150deg,#0E3A5C,#08243B)",
    icon: ICONS.building,
    title: "איך להתכונן לניקיון אחרי שיפוץ — צ׳ק-ליסט מלא",
    excerpt: "שיפוץ משאיר אבק בכל פינה. הנה איך לוודא שהניקיון בסוף יעשה עבודה שלמה.",
    body: [
      "שיפוץ נגמר, אבל האבק לא. הנה צ׳ק-ליסט קצר שיעזור לכם להגיע לניקיון הסופי מוכנים, ולוודא שהצוות שמגיע יכול לעבוד ביעילות.",
      "לפני שהצוות מגיע: פנו את הריהוט הזז, כסו רהיטים שלא הוזזו, סגרו ברזים ותריסים, וודאו גישה לחשמל ומים.",
      "בזמן העבודה: ניקוי אחרי שיפוץ כולל הסרת אבק מתקרות ומזגנים, ניקוי שאריות צבע מרצפות וחלונות, ופינוי פסולת בנייה קלה.",
      "אחרי הניקיון: בדקו פינות, מרזבים וארונות עליונים — שם האבק אוהב להסתתר.",
    ],
  },
  {
    tag: "ריהוט",
    chipClass: "chip-mustard",
    readTime: "6 דק׳",
    grad: "linear-gradient(150deg,#123B52,#0A2136)",
    icon: ICONS.sofa,
    title: "כל מה שצריך לדעת על ניקוי ספות מקצועי",
    excerpt: "כתמים, ריחות ואבק בית — למה ניקוי אקסטרקציה עושה את ההבדל.",
    body: [
      "ספה מלוכלכת היא לא רק עניין אסתטי — היא גם אבק בית וחיידקים שנספגים עמוק בבד. הנה למה שווה טיפול מקצועי.",
      "ניקוי אקסטרקציה שואב את הלכלוך מעומק הבד, ולא רק מהשטח כמו שאיבת אבק רגילה. זה מסלק כתמים ישנים וריחות שנספגו לאורך זמן.",
      "סוג הבד קובע את הטיפול: בד רגיל מתנקה במים וחומרי חיטוי, בעוד עור דורש מוצרים ייעודיים שלא יפגעו במרקם.",
      "מומלץ לנקות ספות ומזרנים אחת לחצי שנה, ובמיוחד לפני ואחרי אירוח מרובה או שיפוץ בבית.",
    ],
  },
  {
    tag: "בריאות",
    chipClass: "chip-green",
    readTime: "4 דק׳",
    grad: "linear-gradient(150deg,#0D4055,#082638)",
    icon: ICONS.ac,
    title: "למה חשוב לנקות מזגן פעם בשנה — בריאות וחיסכון בחשמל",
    excerpt: "מזגן מלוכלך פוגע באוויר שאתם נושמים ומייקר את חשבון החשמל.",
    body: [
      "מזגן שלא עבר ניקוי צובר אבק, עובש וחיידקים במסננים — וכל אלה חוזרים אליכם עם כל נשימה בחדר.",
      "מעבר לבריאות, מסננים סתומים מכריחים את המזגן לעבוד קשה יותר כדי לקרר את אותו החדר, מה שמעלה את צריכת החשמל.",
      "ניקוי מקצועי כולל פירוק המכסה, שטיפה תעשייתית של הסליל והמאווררים, וחיטוי המסננים — לא רק ניגוב חיצוני.",
      "ההמלצה: ניקוי יסודי פעם בשנה, לפני עונת הקיץ, ובבתים עם ילדים או אלרגיות — פעמיים בשנה.",
    ],
  },
  {
    tag: "רצפות",
    chipClass: "chip-blue",
    readTime: "5 דק׳",
    grad: "linear-gradient(150deg,#14344E,#0A1E33)",
    icon: ICONS.floor,
    title: "הברקת רצפות — פוליש, ווקס וקריסטליזציה",
    excerpt: "שלוש שיטות שונות לרצפה מבריקה. הנה איך לבחור נכון לפי סוג הרצפה.",
    body: [
      "לא כל רצפה מתאימה לאותו טיפול. הבחירה הנכונה תלויה בחומר הרצפה ובשחיקה שלה.",
      "פוליש מתאים לתחזוקה שוטפת של רצפות אבן וטראצו — מבריק את השטח העליון בלי לשנות אותו מהותית.",
      "ווקס יוצר שכבת הגנה נוספת על הרצפה, מתאים לרצפות עם שחיקה קלה שרוצים להאריך את חייהן.",
      "קריסטליזציה היא טיפול עמוק יותר לשיש ואבן טבעית — יוצרת שכבה קשה ומבריקה שעמידה יותר לאורך זמן.",
      "לא בטוחים מה מתאים לכם? זו בדיוק השאלה שאנחנו עונים עליה בביקור הראשוני, בלי עלות.",
    ],
  },
];

const FAQS = [
  { q: "איך נקבע המחיר הסופי?", a: "המחשבון נותן הערכה מיידית. המחיר הסופי נקבע לאחר תיאום קצר ותמיד לפני תחילת העבודה — בלי הפתעות." },
  { q: "באיזה אזור אתם פועלים?", a: "אנחנו נותנים שירות באזור המרכז והשרון. אם אתם לא בטוחים אם אנחנו מגיעים אליכם — כתבו לנו בוואטסאפ." },
  { q: "תוך כמה זמן אתם מגיעים?", a: "ברוב המקרים ניתן לתאם הגעה תוך 24 שעות מרגע הפנייה, בכפוף לזמינות בלוח הזמנים." },
  { q: "אילו חומרי ניקוי אתם משתמשים?", a: "אנחנו עובדים עם חומרי ניקוי וחיטוי מקצועיים המתאימים לכל סוג משטח, תוך הקפדה על בטיחות הבית והדיירים." },
  { q: "האם הצוות מבוטח ומאומת?", a: "כן, הצוות שלנו מאומת ומבוטח לעבודה בבתים פרטיים, משרדים ובניינים משותפים." },
  { q: "איך קובעים תור?", a: "הכי מהיר — דרך מחשבון המחיר באתר או הודעת וואטסאפ ישירה. נחזור אליכם לתיאום מועד מדויק." },
];

/* Real system prompt: "עוזר וירטואלי של שטיף שעונה על שאלות ניקיון,
   מחירים משוערים, וזמינות." Swap this rule-based logic for a live
   LLM call once a backend endpoint exists. */
const CHAT_RESPONSES: { keys: string[]; a: string }[] = [
  { keys: ["מחיר", "עולה", "עלות"], a: "המחיר תלוי בשירות ובהיקף העבודה. הכי מהיר לקבל הערכה מדויקת דרך מחשבון המחיר למעלה בעמוד — לוקח פחות מדקה." },
  { keys: ["זמין", "מתי", "מגיעים", "תוך כמה זמן"], a: "ברוב המקרים אפשר לתאם הגעה תוך 24 שעות מרגע הפנייה, בכפוף לזמינות." },
  { keys: ["אזור", "איפה", "עובדים ב"], a: "אנחנו נותנים שירות באזור המרכז והשרון." },
  { keys: ["מזגן"], a: "ניקוי מזגנים כולל פירוק, שטיפה תעשייתית וחיטוי מסננים. עלות משוערת מתחילה מ-₪180 ליחידה עילית." },
  { keys: ["ספה", "מזרון"], a: "ניקוי ספות ומזרנים מתבצע במכונת אקסטרקציה עם חיטוי מלא, כולל טיפול בכתמים וריחות." },
  { keys: ["שיפוץ", "בניין"], a: "ניקיון בניינים אחרי שיפוץ כולל הסרת אבק, שאריות צבע ופסולת בנייה עד לניקיון מלא." },
  { keys: ["רצפה", "פוליש", "ווקס"], a: "להברקת רצפות יש לנו שלוש שיטות — פוליש, ווקס וקריסטליזציה — בהתאם לסוג הרצפה שלכם." },
];

const QUICK_REPLIES: { label: string; text?: string; wa?: boolean }[] = [
  { label: "מה המחיר?", text: "מה המחיר של ניקיון?" },
  { label: "תוך כמה זמן מגיעים?", text: "תוך כמה זמן אתם מגיעים?" },
  { label: "באיזה אזור פועלים?", text: "באיזה אזור אתם עובדים?" },
  { label: "לדבר עם נציג", wa: true },
];

const NAV_LINKS = [
  { href: "#services", label: "שירותים" },
  { href: "#calculator", label: "מחשבון מחיר" },
  { href: "#process", label: "איך זה עובד" },
  { href: "#projects", label: "עבודות" },
  { href: "#blog", label: "מאמרים" },
  { href: "#faq", label: "שאלות נפוצות" },
  { href: "#about", label: "אודות" },
];

const TL_THRESHOLDS = [0.18, 0.42, 0.66, 0.9];
const TL_POS = [
  { top: 158, leftPct: 90 },
  { bottom: 158, leftPct: 65.8 },
  { top: 158, leftPct: 40 },
  { bottom: 158, leftPct: 14.2 },
];
const TL_ICONS = [
  <svg key="s" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>,
  <svg key="c" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  <svg key="b" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>,
  <svg key="sh" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>,
];

function usePrefersReducedMotion() {
  return useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
}

/* ============ shared bits ============ */

function Reveal({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}

function EyebrowRow({ text, center }: { text: string; center?: boolean }) {
  return (
    <div className="eyebrow-row" style={center ? { justifyContent: "center" } : undefined}>
      <span className="dash" />
      <span className="eyebrow-text">{text}</span>
    </div>
  );
}

function CountUp({ target, decimals, suffix }: { target: number; decimals: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          if (reduced) {
            el.textContent = target.toFixed(decimals);
            return;
          }
          const dur = 1600;
          let start: number | null = null;
          const tick = (ts: number) => {
            if (start === null) start = ts;
            const p = Math.min(1, (ts - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(decimals);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, decimals, reduced]);
  return (
    <>
      <span ref={ref}>0</span>
      {suffix && <span className="suffix">{suffix}</span>}
    </>
  );
}

function DuoAvatars({ size = 74 }: { size?: number }) {
  return (
    <div className="duo" style={{ display: "flex", gap: 14, justifyContent: "center" }}>
      <div className="avatar-circle" style={{ width: size, height: size, fontSize: size * 0.32 }}>א</div>
      <div className="avatar-circle" style={{ width: size, height: size, fontSize: size * 0.32 }}>מ</div>
    </div>
  );
}

/* ============ before/after project card ============ */

function ProjectCard({ title, desc }: { title: string; desc: string }) {
  const [pct, setPct] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const setFromClientX = (clientX: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.max(6, Math.min(94, next)));
  };
  return (
    <Reveal className="project-card">
      <div
        className="ba-slider"
        ref={sliderRef}
        onPointerDown={(e) => { dragging.current = true; setFromClientX(e.clientX); }}
        onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerLeave={() => (dragging.current = false)}
        onTouchMove={(e) => setFromClientX(e.touches[0].clientX)}
      >
        <div className="ba-after"><span>אחרי</span></div>
        <div className="ba-before" style={{ width: `${pct}%` }}><span>לפני</span></div>
        <div className="ba-handle" style={{ insetInlineStart: `${pct}%` }} />
      </div>
      <div className="project-info">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </Reveal>
  );
}

/* ============ quote calculator ============ */

function QuoteCalculator({ preselect }: { preselect: { id: string; ts: number } | null }) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, number | string>>({});
  const [estimate, setEstimate] = useState(0);
  const [contact, setContact] = useState({ name: "", phone: "", city: "", email: "", website: "" });
  const startTimeRef = useRef(Date.now());

  const service = useMemo(() => SERVICES.find((s) => s.id === serviceId) ?? null, [serviceId]);

  function startService(id: string) {
    const s = SERVICES.find((x) => x.id === id);
    if (!s) return;
    const initial: Record<string, number | string> = {};
    s.fields.forEach((f) => (initial[f.key] = f.default));
    setServiceId(id);
    setValues(initial);
    setStep(1);
  }

  useEffect(() => {
    if (preselect) startService(preselect.id);
  }, [preselect]);

  function goToPrice() {
    if (!service) return;
    setEstimate(Math.round(service.price(values) / 10) * 10);
    setStep(2);
  }

  function submitLead() {
    if (!contact.name.trim() || !contact.phone.trim()) {
      alert("נא למלא שם וטלפון");
      return;
    }
    const isBot = !!contact.website || Date.now() - startTimeRef.current < 2500;
    const lastSubmit = Number(localStorage.getItem("shteef_last_submit") || 0);
    const rateLimited = Date.now() - lastSubmit < 60000;
    if (!isBot && !rateLimited && service) {
      localStorage.setItem("shteef_last_submit", String(Date.now()));
      const payload = {
        service: service.id, params: values, estimate,
        name: contact.name, phone: contact.phone, city: contact.city, email: contact.email,
        source: "quote-calculator",
      };
      if (N8N_WEBHOOK_URL && !N8N_WEBHOOK_URL.includes("{{")) {
        fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      } else {
        console.log("[shteef lead - webhook not configured]", payload);
      }
    }
    setStep(4);
  }

  const low = Math.round((estimate * 0.9) / 10) * 10;
  const high = Math.round((estimate * 1.15) / 10) * 10;

  return (
    <div className="calc-card">
      <div className="calc-progress">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i <= step ? "done" : ""} />
        ))}
      </div>
      <div className="calc-body">
        {step === 0 && (
          <>
            <div className="calc-step-title">איזה שירות מעניין אתכם?</div>
            <div className="calc-step-sub">בחרו שירות כדי לקבל הערכת מחיר מיידית</div>
            <div className="service-pick-grid">
              {SERVICES.map((s) => (
                <button key={s.id} type="button" className="service-pick" onClick={() => startService(s.id)}>
                  <strong>{s.title}</strong>
                  <span>{s.hint}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && service && (
          <>
            <div className="calc-step-title">{service.title}</div>
            <div className="calc-step-sub">כמה פרטים קטנים כדי לחשב הערכת מחיר מדויקת</div>
            {service.fields.map((f) => (
              <div className="field-group" key={f.key}>
                {f.type === "range" ? (
                  <>
                    <label>
                      {f.label} — <span className="range-value">{values[f.key]}</span>
                    </label>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={Number(values[f.key])}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: Number(e.target.value) }))}
                    />
                  </>
                ) : (
                  <>
                    <label>{f.label}</label>
                    <div className="select-row">
                      {f.options.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          className={`chip-option ${values[f.key] === o.value ? "selected" : ""}`}
                          onClick={() => setValues((v) => ({ ...v, [f.key]: o.value }))}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </>
        )}

        {step === 2 && service && (
          <>
            <div className="calc-step-title">המחיר המשוער שלכם</div>
            <div className="calc-step-sub">מחיר סופי ומדויק ייקבע בתיאום מול הצוות, ללא התחייבות</div>
            <div className="price-reveal">
              <div className="label">הערכת מחיר</div>
              <div className="amount">₪{low}–{high}</div>
              <div className="note">{service.title}</div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="calc-step-title">רק שם וטלפון</div>
            <div className="calc-step-sub">נחזור אליכם בהקדם לתיאום מדויק</div>
            <div className="field-group">
              <label>שם מלא *</label>
              <input className="calc-input" type="text" value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} />
            </div>
            <div className="field-group">
              <label>טלפון *</label>
              <input className="calc-input" type="tel" value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
            </div>
            <div className="field-group">
              <label>עיר (אופציונלי)</label>
              <input className="calc-input" type="text" value={contact.city} onChange={(e) => setContact((c) => ({ ...c, city: e.target.value }))} />
            </div>
            <div className="field-group">
              <label>אימייל (אופציונלי)</label>
              <input className="calc-input" type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
            </div>
            <input className="hp-field" type="text" tabIndex={-1} autoComplete="off" value={contact.website} onChange={(e) => setContact((c) => ({ ...c, website: e.target.value }))} />
          </>
        )}

        {step === 4 && (
          <div className="success-box">
            <div className="success-icon">{ICONS.check}</div>
            <div className="calc-step-title">הפנייה התקבלה!</div>
            <p style={{ color: "var(--muted)", fontSize: 14.5 }}>
              ניצור איתכם קשר בהקדם לתיאום ולמחיר סופי. אפשר גם לפנות ישירות בוואטסאפ.
            </p>
          </div>
        )}
      </div>

      <div className="calc-footer">
        {step === 1 && (
          <>
            <button type="button" className="calc-back" onClick={() => setStep(0)}>חזרה</button>
            <button type="button" className="btn btn-primary" onClick={goToPrice}>הצג מחיר משוער</button>
          </>
        )}
        {step === 2 && (
          <>
            <button type="button" className="calc-back" onClick={() => setStep(1)}>חזרה</button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>קבע לי שיחה חוזרת</button>
          </>
        )}
        {step === 3 && (
          <>
            <button type="button" className="calc-back" onClick={() => setStep(2)}>חזרה</button>
            <button type="button" className="btn btn-primary" onClick={submitLead}>שליחה</button>
          </>
        )}
        {step === 4 && (
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp" style={{ width: "100%", justifyContent: "center" }}>
            המשך בוואטסאפ
          </a>
        )}
      </div>
    </div>
  );
}

/* ============ stacked services ============ */

function StackedServices({ onCalcJump }: { onCalcJump: (id: string) => void }) {
  const itemsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth <= 900 || !itemsRef.current) return;
      const cards = Array.from(itemsRef.current.querySelectorAll<HTMLElement>(".stack-card"));
      let a = 0;
      cards.forEach((card, idx) => {
        const top = card.getBoundingClientRect().top;
        if (top <= 96 + idx * 20 + 14) a = idx;
      });
      setActive(a);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const visGrads = [
    "linear-gradient(150deg,#0E3A5C,#08243B)",
    "linear-gradient(150deg,#123B52,#0A2136)",
    "linear-gradient(150deg,#0D4055,#082638)",
    "linear-gradient(150deg,#14344E,#0A1E33)",
  ];

  return (
    <div className="container stack-grid">
      <div className="stack-side">
        <div className="stack-side-inner">
          <Reveal><EyebrowRow text="השירותים שלנו" /></Reveal>
          <Reveal>
            <h2 className="heading-xl">
              <span className="accent">פתרונות ניקיון</span>
              <br />
              בהתאמה אישית
            </h2>
            <div className="mustard-line" />
          </Reveal>
          <Reveal className="reveal-d1">
            <p className="lede">מעטפת שירותים מלאה — מניקיון אחרי שיפוץ ועד הברקת רצפות — לבית נקי ושקט נפשי.</p>
          </Reveal>
          <div className="stack-visual">
            {SERVICES.map((s, i) => (
              <div key={s.id} className={`vis-panel ${i === active ? "active" : ""}`} style={{ background: visGrads[i] }}>
                <div className="vis-icon">{s.icon}</div>
                <span className="vis-tag">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="stack-items" ref={itemsRef}>
        {SERVICES.map((s, i) => (
          <article key={s.id} className={`stack-card ${i < active ? "passed" : ""}`}>
            <div className="ghost-num">{String(i + 1).padStart(2, "0")}</div>
            <div className="card-top">
              <span className="cat-chip">{s.cat}</span>
              <span className="counter">04 / {String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="svc-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p className="svc-desc">{s.desc}</p>
            <div className="svc-footer">
              <span className="svc-price">{s.hint}</span>
              <button type="button" className="btn btn-ghost-accent" onClick={() => onCalcJump(s.id)}>
                לחישוב מחיר ←
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ============ process timeline ============ */

function ProcessTimeline() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap || window.innerWidth <= 900) return;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      let p = (vh * 0.85 - rect.top) / (rect.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      if (reduced) p = rect.top < vh ? 1 : 0;
      setProgress(p);
      if (fillRef.current) fillRef.current.style.strokeDashoffset = String(1 - p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const D = "M1200,140 L1080,140 C960,140 910,280 790,280 C670,280 600,140 480,140 C360,140 300,280 170,280 L40,280";

  return (
    <>
      <div className="tl-wrap" ref={wrapRef}>
        <svg viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true">
          <path className="tl-path-base" d={D} pathLength={1} />
          <path className="tl-path-fill" ref={fillRef} d={D} pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        </svg>
        {PROCESS_STEPS.map((step, i) => {
          const reached = progress >= TL_THRESHOLDS[i];
          const lit = reached && (i === PROCESS_STEPS.length - 1 || progress < TL_THRESHOLDS[i + 1]);
          const pos = TL_POS[i];
          const style: React.CSSProperties = { left: `calc(${pos.leftPct}% - 125px)` };
          if ("top" in pos && pos.top !== undefined) style.top = pos.top;
          if ("bottom" in pos && pos.bottom !== undefined) style.bottom = pos.bottom;
          return (
            <div key={step.title} className={`tl-station ${reached ? "" : "dim"} ${lit ? "lit" : ""} ${"bottom" in pos ? "flip" : ""}`} style={style}>
              <div className="tl-dot">{TL_ICONS[i]}</div>
              <div className="tl-card">
                <div className="tl-ghost">{i + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="tl-mobile">
        {PROCESS_STEPS.map((step, i) => (
          <Reveal key={step.title} className="tl-m-item">
            <h3>{i + 1} · {step.title}</h3>
            <p>{step.desc}</p>
          </Reveal>
        ))}
      </div>
    </>
  );
}

/* ============ blog carousel + modal ============ */

function BlogCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number | null = null;
    const markActive = () => {
      raf = null;
      const cards = Array.from(track.querySelectorAll<HTMLElement>(".blog-card"));
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let best = 0, bestDist = Infinity;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setActive(best);
    };
    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(markActive); };
    track.addEventListener("scroll", onScroll, { passive: true });
    markActive();
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (openIdx !== null) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenIdx(null); };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [openIdx]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>(".blog-card");
    const idx = Math.max(0, Math.min(cards.length - 1, i));
    cards[idx].scrollIntoView({ behavior: reduced ? "auto" : "smooth", inline: "center", block: "nearest" });
  };

  const openPost = openIdx !== null ? BLOG_POSTS[openIdx] : null;

  return (
    <>
      <div className="blog-head-row">
        <Reveal>
          <EyebrowRow text="מהבלוג" />
          <h2 className="heading-xl">מאמרים</h2>
          <div className="mustard-line" />
        </Reveal>
        <Reveal className="blog-controls-wrap">
          <div className="blog-controls">
            <a href="#blog" className="all-articles-link">לכל המאמרים ←</a>
            <button type="button" className="car-btn" aria-label="מאמר קודם" onClick={() => goTo(active - 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 6 6 6-6 6" /></svg>
            </button>
            <button type="button" className="car-btn" aria-label="מאמר הבא" onClick={() => goTo(active + 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m15 6-6 6 6 6" /></svg>
            </button>
          </div>
        </Reveal>
      </div>
      <div className="carousel-track" ref={trackRef}>
        {BLOG_POSTS.map((p, idx) => (
          <article key={p.title} className={`blog-card ${idx === active ? "active" : ""}`}>
            <div className="blog-thumb" style={{ background: p.grad }}>
              {p.icon}
              <span className={`cat-chip ${p.chipClass}`}>{p.tag}</span>
            </div>
            <div className="blog-card-body">
              <h3>{p.title}</h3>
              <p className="excerpt">{p.excerpt}</p>
              <div className="blog-card-foot">
                <button type="button" className="read-more-btn" onClick={() => setOpenIdx(idx)}>קרא עוד ←</button>
                <span className="read-time">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                  {p.readTime}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {openPost && (
        <div id="article-modal" className="open" role="dialog" aria-modal="true" aria-label="מאמר">
          <div className="modal-backdrop" onClick={() => setOpenIdx(null)} />
          <div className="modal-card">
            <button className="modal-close" aria-label="סגור מאמר" onClick={() => setOpenIdx(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <span className={`cat-chip ${openPost.chipClass}`}>{openPost.tag}</span>
            <h3>{openPost.title}</h3>
            {openPost.body.map((par, i) => (
              <p key={i}>{par}</p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ============ chatbot ============ */

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ who: "bot" | "user"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages]);

  function openChat() {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{ who: "bot", text: "היי! אני העוזר הווירטואלי של שטיף. אפשר לשאול אותי על מחירים, זמינות ואזור השירות." }]);
    }
  }
  function reply(userText: string) {
    const found = CHAT_RESPONSES.find((r) => r.keys.some((k) => userText.includes(k)));
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { who: "bot", text: found ? found.a : 'אשמח לחבר אתכם לצוות בוואטסאפ לתשובה מדויקת יותר — לחצו על "לדבר עם נציג" למטה.' },
      ]);
    }, 400);
  }
  function send(text: string) {
    setMessages((m) => [...m, { who: "user", text }]);
    reply(text);
  }

  return (
    <>
      <button id="chatbot-toggle" aria-label="פתח צ׳אט עם שטיף" onClick={() => (open ? setOpen(false) : openChat())}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={26} height={26}>
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-4-1L3 21l1.2-5A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 20 5" />
        </svg>
      </button>
      <div id="chatbot-panel" className={open ? "open" : ""} role="dialog" aria-label="צ׳אט עם שטיף">
        <div className="chat-head">
          <div>
            <strong>עוזר וירטואלי · שטיף</strong>
            <span>שאלו על מחיר, זמינות ואזור שירות</span>
          </div>
          <button className="chat-close icon-btn" aria-label="סגור צ׳אט" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.who}`}>{m.text}</div>
          ))}
        </div>
        <div className="chat-quick">
          {QUICK_REPLIES.map((q) => (
            <button key={q.label} className="quick-reply" onClick={() => (q.wa ? window.open(WHATSAPP_URL, "_blank") : send(q.text!))}>
              {q.label}
            </button>
          ))}
        </div>
        <form
          className="chat-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            const val = input.trim();
            if (!val) return;
            send(val);
            setInput("");
          }}
        >
          <input type="text" placeholder="הקלידו שאלה..." autoComplete="off" value={input} onChange={(e) => setInput(e.target.value)} />
          <button type="submit">שלח</button>
        </form>
      </div>
    </>
  );
}

/* ============ page ============ */

export default function ShteefPage() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [calcPreselect, setCalcPreselect] = useState<{ id: string; ts: number } | null>(null);
  const reduced = usePrefersReducedMotion();

  const bubbles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        size: 6 + ((i * 37) % 22),
        left: (i * 71) % 100,
        duration: 7 + ((i * 13) % 8),
        delay: (i * 5) % 8,
      })),
    [],
  );

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jumpToCalc = (id: string) => {
    setCalcPreselect({ id, ts: Date.now() });
    document.getElementById("calculator")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg0: #061421; --bg1: #081C2E; --bg2: #0A2740; --panel: #0C2C48; --panel-2: #0E3452;
          --line: rgba(14,165,233,0.16); --navy: #0C4A6E; --navy-deep: #082F49;
          --sky: #0EA5E9; --cyan: #06B6D4; --mustard: #EAB308;
          --text: #E8F4FC; --muted: #93B4C9; --whatsapp: #25D366;
          --font-head: 'Epilogue', sans-serif; --font-body: 'Urbanist', sans-serif;
          --radius: 20px; --radius-sm: 12px; --ease: cubic-bezier(0.16, 1, 0.3, 1);
          --shadow-soft: 0 24px 70px -25px rgba(0,0,0,0.65);
          --shadow-glow: 0 0 0 1px rgba(14,165,233,0.18), 0 20px 50px -15px rgba(14,165,233,0.35);
          --grad-border: linear-gradient(135deg, rgba(14,165,233,.45), rgba(56,80,180,.35));
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg1); color: var(--text); font-family: var(--font-body); line-height: 1.6; overflow-x: hidden; }
        h1, h2, h3, h4 { font-family: var(--font-head); line-height: 1.15; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
        ul { list-style: none; }
        .container { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 24px; }
        .btn, .icon-btn, .quick-reply, summary { min-height: 44px; }
        ::selection { background: rgba(14,165,233,.4); }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border-radius: 999px; font-weight: 700; font-size: 16px; transition: transform .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease), border-color .25s; white-space: nowrap; }
        .btn-primary { background: linear-gradient(135deg, var(--sky), var(--cyan)); color: #04121D; box-shadow: var(--shadow-glow); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 25px 55px -15px rgba(14,165,233,0.55); }
        .btn-outline { background: transparent; color: var(--text); border: 1.5px solid rgba(232,244,252,0.3); padding: 12px 24px; font-size: 15px; }
        .btn-outline:hover { border-color: var(--sky); color: #fff; }
        .btn-ghost-accent { background: transparent; color: var(--cyan); border: 1.5px solid rgba(6,182,212,.4); padding: 11px 22px; font-size: 14.5px; }
        .btn-ghost-accent:hover { background: rgba(6,182,212,.1); border-color: var(--cyan); }
        .btn-whatsapp { background: var(--whatsapp); color: #06371C; }
        .eyebrow-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .eyebrow-row .dash { width: 34px; height: 2px; background: var(--cyan); flex-shrink: 0; }
        .eyebrow-row .eyebrow-text { font-size: 12.5px; font-weight: 700; letter-spacing: .35em; color: var(--cyan); text-transform: uppercase; }
        .heading-xl { font-size: clamp(28px, 4vw, 44px); font-weight: 800; color: var(--text); letter-spacing: -0.01em; }
        .heading-xl .accent { color: var(--cyan); }
        .mustard-line { width: 46px; height: 3px; background: var(--mustard); border-radius: 2px; margin-top: 18px; }
        .section-head.center { text-align: center; max-width: 680px; margin: 0 auto 52px; }
        .section-head.center .eyebrow-row { justify-content: center; }
        .section-head.center .mustard-line { margin-inline: auto; }
        .section-head p.lede, .lede { color: var(--muted); font-size: 16.5px; margin-top: 16px; }
        .section { padding: 96px 0; position: relative; }
        .section-alt { background: var(--bg2); }
        .side-label { position: absolute; top: 50%; inset-inline-end: 18px; z-index: 3; writing-mode: vertical-rl; transform: translateY(-50%); font-size: 10.5px; font-weight: 700; letter-spacing: .55em; text-transform: uppercase; color: rgba(147,180,201,0.28); pointer-events: none; }
        @media (max-width: 1100px) { .side-label { display: none; } }
        .reveal { opacity: 0; transform: translateY(26px); transition: opacity .8s var(--ease), transform .8s var(--ease); }
        .reveal.in { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: .12s; } .reveal-d2 { transition-delay: .24s; } .reveal-d3 { transition-delay: .36s; }
        .site-header { position: fixed; top: 0; inset-inline: 0; z-index: 500; padding: 18px 0; transition: background .3s var(--ease), box-shadow .3s var(--ease), padding .3s var(--ease); }
        .site-header.scrolled { background: rgba(6,20,33,0.9); backdrop-filter: blur(12px); padding: 12px 0; box-shadow: 0 10px 30px -15px rgba(0,0,0,0.6); border-bottom: 1px solid var(--line); }
        .header-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .logo { font-family: var(--font-head); font-weight: 800; font-size: 22px; color: #fff; display: flex; align-items: center; gap: 8px; }
        .logo .drop { color: var(--cyan); }
        .nav-links { display: flex; align-items: center; gap: 26px; }
        .nav-links a { color: rgba(232,244,252,0.8); font-weight: 500; font-size: 15px; transition: color .2s; }
        .nav-links a:hover { color: #fff; }
        .header-cta { display: flex; align-items: center; gap: 12px; }
        .nav-toggle { display: none; width: 44px; height: 44px; color: #fff; align-items: center; justify-content: center; }
        @media (max-width: 900px) {
          .nav-links { position: fixed; inset: 72px 16px auto 16px; background: var(--bg0); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; flex-direction: column; align-items: stretch; gap: 4px; box-shadow: var(--shadow-soft); transform: translateY(-12px); opacity: 0; pointer-events: none; transition: all .25s var(--ease); }
          .nav-links.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
          .nav-links a { padding: 12px 14px; border-radius: var(--radius-sm); }
          .nav-links a:hover { background: rgba(255,255,255,0.05); }
          .nav-toggle { display: inline-flex; }
        }
        #hero { position: relative; min-height: 82vh; display: flex; align-items: center; background: radial-gradient(ellipse 120% 90% at 80% -10%, #0D3B5C 0%, var(--bg1) 48%, var(--bg0) 100%); overflow: hidden; padding: 150px 0 80px; }
        @media (max-width: 640px) { #hero { min-height: 64vh; padding: 120px 0 60px; } }
        .hero-glow { position: absolute; inset: 0; pointer-events: none; }
        .ray { position: absolute; top: -20%; width: 2px; height: 140%; background: linear-gradient(to bottom, rgba(6,182,212,0.3), transparent); transform: rotate(12deg); filter: blur(1px); animation: shimmer 6s ease-in-out infinite; }
        .ray:nth-child(1) { right: 14%; animation-delay: 0s; }
        .ray:nth-child(2) { right: 34%; animation-delay: 1.4s; height: 120%; }
        .ray:nth-child(3) { right: 58%; animation-delay: 2.8s; }
        .ray:nth-child(4) { right: 78%; animation-delay: .8s; height: 110%; }
        @keyframes shimmer { 0%,100% { opacity: .2; } 50% { opacity: .6; } }
        .bubble { position: absolute; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), rgba(14,165,233,0.06) 70%); animation: float-up linear infinite; bottom: -40px; }
        @keyframes float-up { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: .7; } 90% { opacity: .4; } 100% { transform: translateY(-680px) translateX(20px); opacity: 0; } }
        .hero-grid { position: relative; z-index: 2; display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 48px; align-items: center; }
        @media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr; gap: 36px; } }
        .hero-content .heading-xl { font-size: clamp(30px, 4.4vw, 50px); }
        .hero-content .subtitle { font-size: clamp(16px, 1.9vw, 18.5px); color: var(--muted); max-width: 520px; margin: 22px 0 30px; }
        .hero-cta-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
        .hero-trust-line { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 14px; font-size: 13.5px; color: var(--muted); }
        .hero-trust-line b { color: var(--text); font-weight: 700; }
        .hero-trust-line .sep { color: rgba(147,180,201,.4); }
        .hero-visual { position: relative; min-height: 380px; }
        @media (max-width: 900px) { .hero-visual { min-height: 300px; } }
        .hero-watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-weight: 900; font-size: clamp(120px, 17vw, 240px); color: rgba(232,244,252,0.05); letter-spacing: -0.04em; pointer-events: none; user-select: none; z-index: 0; }
        .hero-photo-card { position: relative; z-index: 1; margin: 0 auto; width: min(88%, 400px); aspect-ratio: 4/4.6; border-radius: 24px; overflow: hidden; background: radial-gradient(circle at 30% 25%, rgba(14,165,233,.35), transparent 55%), radial-gradient(circle at 75% 80%, rgba(6,182,212,.25), transparent 50%), linear-gradient(160deg, #0E3452, #071B2C 70%); border: 1px solid var(--line); box-shadow: var(--shadow-soft); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
        .hero-photo-card .names { font-family: var(--font-head); font-weight: 700; font-size: 16px; color: var(--text); }
        .hero-photo-card .role { font-size: 12px; letter-spacing: .2em; color: var(--cyan); text-transform: uppercase; }
        .hero-photo-card .photo-note { position: absolute; bottom: 12px; font-size: 10.5px; color: rgba(147,180,201,.45); }
        .avatar-circle { border-radius: 50%; background: linear-gradient(135deg, var(--sky), var(--navy)); display: flex; align-items: center; justify-content: center; color: #fff; font-family: var(--font-head); font-weight: 800; border: 2px solid rgba(255,255,255,.15); }
        #stats { position: relative; padding: 110px 0; overflow: hidden; background-color: var(--bg0);
          background-image: radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(180deg, rgba(6,20,33,0.35), rgba(6,20,33,0.85)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cg fill='%230D3B5C' fill-opacity='0.55'%3E%3Crect x='10' y='60' width='52' height='240'/%3E%3Crect x='75' y='20' width='64' height='280'/%3E%3Crect x='152' y='90' width='46' height='210'/%3E%3Crect x='210' y='40' width='70' height='260'/%3E%3Crect x='292' y='110' width='42' height='190'/%3E%3Crect x='346' y='55' width='48' height='245'/%3E%3C/g%3E%3Cg fill='%2338BDF8' fill-opacity='0.12'%3E%3Crect x='84' y='40' width='8' height='8'/%3E%3Crect x='100' y='40' width='8' height='8'/%3E%3Crect x='116' y='60' width='8' height='8'/%3E%3Crect x='84' y='80' width='8' height='8'/%3E%3Crect x='224' y='60' width='8' height='8'/%3E%3Crect x='240' y='80' width='8' height='8'/%3E%3Crect x='256' y='60' width='8' height='8'/%3E%3Crect x='224' y='120' width='8' height='8'/%3E%3Crect x='24' y='90' width='7' height='7'/%3E%3Crect x='40' y='110' width='7' height='7'/%3E%3Crect x='360' y='90' width='7' height='7'/%3E%3Crect x='306' y='140' width='7' height='7'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 26px 26px, cover, 480px auto; background-attachment: fixed, scroll, fixed; background-position: center, center, bottom center; background-repeat: repeat, no-repeat, repeat-x; }
        @media (max-width: 900px) { #stats { background-attachment: scroll, scroll, scroll; } }
        .stats-grid { display: flex; justify-content: center; gap: clamp(32px, 7vw, 90px); flex-wrap: wrap; margin-bottom: 56px; }
        .stat-item { text-align: center; }
        .stat-num { font-family: var(--font-head); font-weight: 900; font-size: clamp(48px, 7vw, 84px); color: #fff; letter-spacing: -0.02em; line-height: 1; }
        .stat-num .suffix { color: var(--cyan); }
        .stat-label { margin-top: 10px; font-size: 13px; letter-spacing: .18em; color: var(--muted); text-transform: uppercase; }
        .promises { max-width: 560px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
        .promise { display: flex; align-items: center; gap: 12px; justify-content: center; font-size: 16px; color: var(--text); }
        .promise .check { width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid rgba(6,182,212,.5); color: var(--cyan); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .promise .check svg { width: 13px; height: 13px; }
        #about .about-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 56px; align-items: start; }
        @media (max-width: 800px) { #about .about-grid { grid-template-columns: 1fr; gap: 32px; } }
        .about-photo-wrap { position: sticky; top: 110px; }
        @media (max-width: 800px) { .about-photo-wrap { position: static; } }
        .about-photo-card { border-radius: 22px; overflow: hidden; border: 1px solid var(--line); box-shadow: var(--shadow-soft); background: radial-gradient(circle at 30% 25%, rgba(14,165,233,.3), transparent 55%), linear-gradient(160deg, #0E3452, #071B2C 70%); padding: 40px 24px 20px; text-align: center; }
        .about-photo-card .caption-role { font-size: 11px; letter-spacing: .25em; color: var(--cyan); text-transform: uppercase; margin-top: 18px; }
        .about-photo-card .caption-names { font-family: var(--font-head); font-weight: 700; font-size: 17px; margin-top: 4px; padding-bottom: 14px; }
        .about-text p { color: var(--muted); font-size: 16px; margin-top: 18px; max-width: 560px; }
        .about-text p b { color: var(--text); }
        .about-cta { margin-top: 28px; }
        #services { background: var(--bg0); }
        .stack-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 56px; align-items: stretch; }
        @media (max-width: 900px) { .stack-grid { grid-template-columns: 1fr; gap: 24px; } }
        .stack-side-inner { position: sticky; top: 100px; }
        @media (max-width: 900px) { .stack-side-inner { position: static; } }
        .stack-visual { margin-top: 34px; position: relative; height: 320px; border-radius: 20px; overflow: hidden; border: 1px solid var(--line); }
        @media (max-width: 900px) { .stack-visual { display: none; } }
        .stack-visual .vis-panel { position: absolute; inset: 0; opacity: 0; transition: opacity .5s var(--ease); display: flex; align-items: center; justify-content: center; }
        .stack-visual .vis-panel.active { opacity: 1; }
        .stack-visual .vis-icon { width: 96px; height: 96px; border-radius: 26px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); display: flex; align-items: center; justify-content: center; color: #fff; backdrop-filter: blur(4px); }
        .stack-visual .vis-icon svg { width: 46px; height: 46px; }
        .stack-visual .vis-tag { position: absolute; bottom: 16px; inset-inline-start: 16px; background: rgba(6,20,33,.75); border: 1px solid var(--line); border-radius: 999px; padding: 7px 16px; font-size: 13px; font-weight: 700; }
        .stack-items { display: flex; flex-direction: column; }
        .stack-card { position: sticky; top: 96px; margin-bottom: 38vh; background: linear-gradient(var(--panel), var(--panel)) padding-box, var(--grad-border) border-box; border: 1px solid transparent; border-radius: 22px; padding: 30px 28px 26px; box-shadow: var(--shadow-soft); overflow: hidden; transition: transform .45s var(--ease), opacity .45s var(--ease), filter .45s var(--ease); }
        .stack-card:nth-child(2) { top: 116px; }
        .stack-card:nth-child(3) { top: 136px; }
        .stack-card:nth-child(4) { top: 156px; margin-bottom: 60px; }
        .stack-card.passed { transform: scale(0.96) translateY(-8px); opacity: .45; filter: saturate(.6); }
        @media (max-width: 900px) {
          .stack-card, .stack-card:nth-child(n) { position: static; margin-bottom: 18px; }
          .stack-card.passed { transform: none; opacity: 1; filter: none; }
        }
        .stack-card .ghost-num { position: absolute; bottom: -26px; inset-inline-start: 10px; font-family: var(--font-head); font-weight: 900; font-size: 130px; line-height: 1; color: rgba(14,165,233,0.08); pointer-events: none; user-select: none; }
        .stack-card .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .stack-card .counter { font-size: 12.5px; letter-spacing: .15em; color: rgba(147,180,201,.6); font-weight: 600; }
        .cat-chip { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 14px; font-size: 12px; font-weight: 700; background: rgba(6,182,212,.12); color: var(--cyan); border: 1px solid rgba(6,182,212,.3); }
        .cat-chip.chip-mustard { background: rgba(234,179,8,.14); color: var(--mustard); border-color: rgba(234,179,8,.4); }
        .cat-chip.chip-green { background: rgba(34,197,94,.12); color: #4ADE80; border-color: rgba(34,197,94,.35); }
        .cat-chip.chip-blue { background: rgba(59,130,246,.14); color: #93C5FD; border-color: rgba(59,130,246,.4); }
        .stack-card .svc-icon { width: 54px; height: 54px; border-radius: 15px; background: linear-gradient(135deg, var(--sky), var(--cyan)); display: flex; align-items: center; justify-content: center; color: #04121D; margin-bottom: 16px; }
        .stack-card .svc-icon svg { width: 27px; height: 27px; }
        .stack-card h3 { font-size: 21px; margin-bottom: 8px; }
        .stack-card .svc-desc { color: var(--muted); font-size: 15px; max-width: 420px; }
        .stack-card .svc-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; gap: 12px; flex-wrap: wrap; }
        .stack-card .svc-price { font-size: 14px; font-weight: 700; color: var(--mustard); }
        #calculator { background: linear-gradient(180deg, var(--bg2) 0%, var(--bg1) 100%); }
        .calc-card { max-width: 640px; margin: 0 auto; background: linear-gradient(var(--panel), var(--panel)) padding-box, var(--grad-border) border-box; border: 1px solid transparent; border-radius: 24px; box-shadow: var(--shadow-soft); overflow: hidden; }
        .calc-progress { display: flex; gap: 6px; padding: 20px 26px 0; }
        .calc-progress span { flex: 1; height: 4px; border-radius: 999px; background: rgba(255,255,255,.08); }
        .calc-progress span.done { background: linear-gradient(90deg, var(--sky), var(--cyan)); }
        .calc-body { padding: 26px; min-height: 300px; }
        .calc-step-title { font-size: 19px; font-weight: 700; color: var(--text); margin-bottom: 4px; font-family: var(--font-head); }
        .calc-step-sub { font-size: 14px; color: var(--muted); margin-bottom: 20px; }
        .service-pick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .service-pick-grid { grid-template-columns: 1fr; } }
        .service-pick { border: 1.5px solid rgba(255,255,255,.1); border-radius: var(--radius-sm); padding: 16px; text-align: right; transition: all .2s; display: flex; flex-direction: column; gap: 6px; background: rgba(255,255,255,.02); }
        .service-pick:hover { border-color: var(--sky); background: rgba(14,165,233,.06); }
        .service-pick strong { font-size: 14.5px; color: var(--text); }
        .service-pick span { font-size: 12.5px; color: var(--muted); }
        .field-group { margin-bottom: 18px; }
        .field-group label { display: block; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .field-group input[type="range"] { width: 100%; accent-color: var(--sky); }
        .range-value { font-size: 13px; color: var(--cyan); font-weight: 700; }
        .select-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .chip-option { border: 1.5px solid rgba(255,255,255,.14); border-radius: 999px; padding: 9px 16px; font-size: 13.5px; font-weight: 600; color: var(--muted); transition: all .2s; }
        .chip-option:hover { border-color: var(--sky); color: var(--text); }
        .chip-option.selected { background: var(--sky); color: #04121D; border-color: var(--sky); }
        .price-reveal { text-align: center; padding: 10px 0 6px; }
        .price-reveal .label { font-size: 13px; color: var(--muted); margin-bottom: 6px; }
        .price-reveal .amount { font-family: var(--font-head); font-size: 42px; font-weight: 800; background: linear-gradient(135deg, #7DD3FC, var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .price-reveal .note { font-size: 12.5px; color: var(--muted); margin-top: 6px; }
        .calc-input { width: 100%; border: 1.5px solid rgba(255,255,255,.14); background: rgba(255,255,255,.04); color: var(--text); border-radius: var(--radius-sm); padding: 13px 16px; font-size: 15px; font-family: inherit; transition: border-color .2s; }
        .calc-input:focus { outline: none; border-color: var(--sky); }
        .hp-field { position: absolute; opacity: 0; height: 0; width: 0; pointer-events: none; }
        .calc-footer { display: flex; align-items: center; justify-content: space-between; padding: 0 26px 26px; gap: 10px; min-height: 20px; }
        .calc-back { font-size: 14px; color: var(--muted); font-weight: 600; }
        .calc-back:hover { color: var(--text); }
        .success-box { text-align: center; padding: 20px 0; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(6,182,212,.12); color: var(--cyan); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 1px solid rgba(6,182,212,.3); }
        .success-icon svg { width: 30px; height: 30px; }
        #process { background: var(--bg0); background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 26px 26px; overflow: hidden; }
        .tl-wrap { position: relative; height: 560px; margin-top: 20px; }
        .tl-wrap svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .tl-path-base { fill: none; stroke: rgba(147,180,201,.25); stroke-width: 2; stroke-dasharray: 6 8; }
        .tl-path-fill { fill: none; stroke: var(--cyan); stroke-width: 2.5; filter: drop-shadow(0 0 6px rgba(6,182,212,.7)); }
        .tl-station { position: absolute; width: 250px; transition: opacity .5s var(--ease), filter .5s var(--ease); }
        .tl-station.dim { opacity: .3; filter: saturate(.4); }
        .tl-dot { width: 58px; height: 58px; border-radius: 50%; background: #fff; color: var(--navy); display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 6px 24px -6px rgba(0,0,0,.5); position: relative; z-index: 2; }
        .tl-dot svg { width: 24px; height: 24px; }
        .tl-station.lit .tl-dot::after { content: ''; position: absolute; inset: -8px; border-radius: 50%; border: 2px solid rgba(6,182,212,.6); animation: tl-pulse 2.2s ease-out infinite; }
        @keyframes tl-pulse { 0% { transform: scale(.92); opacity: .8; } 100% { transform: scale(1.25); opacity: 0; } }
        .tl-card { position: relative; margin-top: 16px; background: rgba(12,44,72,.85); border: 1px solid var(--line); border-radius: 16px; padding: 18px 18px 16px; backdrop-filter: blur(3px); overflow: hidden; }
        .tl-card .tl-ghost { position: absolute; top: -18px; inset-inline-end: 6px; font-family: var(--font-head); font-weight: 900; font-size: 84px; color: rgba(232,244,252,.06); line-height: 1; pointer-events: none; }
        .tl-card h3 { font-size: 16.5px; margin-bottom: 6px; }
        .tl-card p { font-size: 13.5px; color: var(--muted); }
        .tl-station.flip { display: flex; flex-direction: column-reverse; }
        .tl-station.flip .tl-card { margin-top: 0; margin-bottom: 16px; }
        .tl-mobile { display: none; }
        @media (max-width: 900px) {
          .tl-wrap { display: none; }
          .tl-mobile { display: block; position: relative; padding-inline-start: 34px; }
          .tl-mobile::before { content: ''; position: absolute; top: 8px; bottom: 8px; inset-inline-start: 13px; width: 2px; background: linear-gradient(to bottom, var(--cyan), rgba(147,180,201,.2)); }
          .tl-m-item { position: relative; margin-bottom: 26px; }
          .tl-m-item::before { content: ''; position: absolute; top: 4px; inset-inline-start: -27px; width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 4px rgba(6,182,212,.25); }
          .tl-m-item h3 { font-size: 16px; margin-bottom: 4px; }
          .tl-m-item p { font-size: 13.5px; color: var(--muted); }
        }
        .rating-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.04); border: 1px solid var(--line); border-radius: 999px; padding: 8px 18px; font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 32px; }
        .rating-badge svg { width: 16px; height: 16px; color: var(--mustard); }
        .testi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
        @media (max-width: 700px) { .testi-grid { grid-template-columns: 1fr; } }
        .testi-card { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 24px; }
        .testi-stars { color: var(--mustard); font-size: 14px; margin-bottom: 10px; letter-spacing: 2px; }
        .testi-card p { font-size: 15px; color: var(--text); }
        #projects { background: var(--bg2); }
        .projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        @media (max-width: 900px) { .projects-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .projects-grid { grid-template-columns: 1fr; } }
        .project-card { border-radius: var(--radius); overflow: hidden; border: 1px solid var(--line); background: var(--panel); }
        .ba-slider { position: relative; height: 170px; overflow: hidden; cursor: ew-resize; user-select: none; }
        .ba-after, .ba-before { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-weight: 700; font-size: 13px; color: #fff; }
        .ba-after { background: linear-gradient(135deg, var(--navy), var(--navy-deep)); }
        .ba-before { background: linear-gradient(135deg, #64748B, #3F4B5E); overflow: hidden; border-inline-end: 2px solid #fff; }
        .ba-before span, .ba-after span { width: 100vw; max-width: 400px; text-align: center; }
        .ba-handle { position: absolute; top: 0; bottom: 0; width: 3px; background: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.35); transform: translateX(50%); }
        .ba-handle::after { content: '↔'; position: absolute; top: 50%; inset-inline-start: 50%; transform: translate(-50%,-50%); width: 30px; height: 30px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--navy); font-size: 14px; box-shadow: var(--shadow-soft); }
        .project-info { padding: 16px 18px; }
        .project-info h3 { font-size: 15px; margin-bottom: 4px; }
        .project-info p { font-size: 13px; color: var(--muted); }
        #blog { background: var(--bg1); }
        .blog-head-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 36px; flex-wrap: wrap; }
        .blog-controls { display: flex; align-items: center; gap: 12px; }
        .car-btn { width: 46px; height: 46px; border-radius: 50%; border: 1.5px solid rgba(234,179,8,.55); color: var(--mustard); display: flex; align-items: center; justify-content: center; transition: all .2s; }
        .car-btn:hover { background: rgba(234,179,8,.12); }
        .car-btn svg { width: 18px; height: 18px; }
        .all-articles-link { font-size: 14px; font-weight: 600; color: var(--muted); }
        .all-articles-link:hover { color: var(--text); }
        .carousel-track { display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 8px 4px 22px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .carousel-track::-webkit-scrollbar { display: none; }
        .blog-card { flex: 0 0 min(340px, 82vw); scroll-snap-align: center; background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; transition: opacity .4s var(--ease), transform .4s var(--ease); opacity: .45; transform: scale(.97); display: flex; flex-direction: column; }
        .blog-card.active { opacity: 1; transform: scale(1); border-color: rgba(14,165,233,.35); }
        .blog-thumb { height: 150px; position: relative; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.5); }
        .blog-thumb svg { width: 42px; height: 42px; }
        .blog-thumb .cat-chip { position: absolute; top: 12px; inset-inline-start: 12px; }
        .blog-card-body { padding: 18px 20px 16px; display: flex; flex-direction: column; flex: 1; }
        .blog-card-body h3 { font-size: 16.5px; margin-bottom: 8px; }
        .blog-card-body .excerpt { font-size: 13.5px; color: var(--muted); flex: 1; }
        .blog-card-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
        .read-more-btn { font-size: 13.5px; font-weight: 700; color: var(--cyan); display: inline-flex; align-items: center; gap: 6px; }
        .read-more-btn:hover { color: #7DD3FC; }
        .read-time { font-size: 12px; color: rgba(147,180,201,.6); display: flex; align-items: center; gap: 5px; }
        .read-time svg { width: 13px; height: 13px; }
        #article-modal { position: fixed; inset: 0; z-index: 600; display: none; align-items: center; justify-content: center; padding: 20px; }
        #article-modal.open { display: flex; }
        .modal-backdrop { position: absolute; inset: 0; background: rgba(4,14,23,.8); backdrop-filter: blur(4px); }
        .modal-card { position: relative; max-width: 620px; width: 100%; max-height: 82vh; overflow-y: auto; background: var(--panel); border: 1px solid var(--line); border-radius: 20px; padding: 30px 28px; box-shadow: var(--shadow-soft); }
        .modal-card h3 { font-size: 21px; margin: 12px 0 16px; }
        .modal-card p { font-size: 15px; color: var(--muted); margin-bottom: 12px; }
        .modal-close { position: absolute; top: 14px; inset-inline-start: 14px; width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.06); color: var(--text); display: flex; align-items: center; justify-content: center; }
        .modal-close:hover { background: rgba(255,255,255,.12); }
        #faq { background: var(--bg2); }
        .faq-list { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
        .faq-item { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius-sm); overflow: hidden; }
        .faq-item summary { list-style: none; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-weight: 700; color: var(--text); font-size: 15px; cursor: pointer; }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary .plus { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; background: rgba(6,182,212,.12); color: var(--cyan); display: flex; align-items: center; justify-content: center; font-size: 16px; transition: transform .2s; }
        .faq-item[open] summary .plus { transform: rotate(45deg); }
        .faq-item .faq-answer { padding: 0 20px 18px; font-size: 14.5px; color: var(--muted); }
        footer { background: var(--bg0); color: var(--muted); padding: 80px 0 26px; border-top: 1px solid var(--line); }
        .footer-cta { text-align: center; max-width: 640px; margin: 0 auto 64px; }
        .footer-cta h2 { font-size: clamp(26px, 3.6vw, 40px); color: #fff; margin-bottom: 12px; }
        .footer-cta p { font-size: 16px; margin-bottom: 28px; }
        .footer-cta-row { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
        .contact-icon-btn { width: 50px; height: 50px; border-radius: 50%; border: 1.5px solid rgba(232,244,252,.25); color: var(--text); display: inline-flex; align-items: center; justify-content: center; transition: all .2s; }
        .contact-icon-btn:hover { border-color: var(--cyan); color: var(--cyan); }
        .contact-icon-btn svg { width: 20px; height: 20px; }
        .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 32px; margin-bottom: 36px; }
        @media (max-width: 700px) { .footer-grid { grid-template-columns: 1fr; gap: 24px; } }
        .footer-grid h4 { color: #fff; font-size: 14px; margin-bottom: 14px; }
        .footer-grid ul li { margin-bottom: 9px; font-size: 13.5px; }
        .footer-grid ul li a:hover { color: #fff; }
        .footer-logo { font-family: var(--font-head); font-weight: 800; font-size: 20px; color: #fff; margin-bottom: 10px; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: 12.5px; }
        #whatsapp-float { position: fixed; bottom: 26px; inset-inline-start: 26px; z-index: 400; width: 58px; height: 58px; border-radius: 50%; background: var(--whatsapp); color: #06371C; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px -8px rgba(37,211,102,0.5); transition: bottom .25s var(--ease), transform .2s; }
        #whatsapp-float:hover { transform: scale(1.06); }
        #whatsapp-float svg { width: 28px; height: 28px; }
        #whatsapp-float::before { content: ''; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid var(--whatsapp); opacity: .5; animation: pulse-ring 2.4s ease-out infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: .6; } 100% { transform: scale(1.35); opacity: 0; } }
        #chatbot-toggle { position: fixed; bottom: 26px; inset-inline-end: 26px; z-index: 400; width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, var(--sky), var(--navy)); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-glow); transition: bottom .25s var(--ease), transform .2s; }
        #chatbot-toggle:hover { transform: scale(1.06); }
        #chatbot-panel { position: fixed; bottom: 94px; inset-inline-end: 26px; z-index: 410; width: 320px; max-width: calc(100vw - 32px); background: var(--panel); border-radius: var(--radius); box-shadow: var(--shadow-soft); border: 1px solid var(--line); display: none; flex-direction: column; overflow: hidden; transition: bottom .25s var(--ease); }
        #chatbot-panel.open { display: flex; }
        .chat-head { background: var(--navy-deep); color: #fff; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
        .chat-head strong { font-size: 14.5px; }
        .chat-head span { font-size: 11.5px; color: rgba(240,249,255,0.6); display: block; }
        .chat-close { width: 30px; height: 30px; color: #fff; }
        .chat-body { padding: 14px; height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: var(--bg1); }
        .chat-msg { max-width: 85%; padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; }
        .chat-msg.bot { background: var(--panel); border: 1px solid var(--line); align-self: flex-start; border-start-start-radius: 4px; color: var(--text); }
        .chat-msg.user { background: var(--sky); color: #04121D; align-self: flex-end; border-start-end-radius: 4px; font-weight: 600; }
        .chat-quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 14px; border-top: 1px solid var(--line); }
        .quick-reply { font-size: 12px; background: rgba(6,182,212,.1); color: var(--cyan); padding: 8px 12px; border-radius: 999px; font-weight: 600; border: 1px solid rgba(6,182,212,.25); }
        .quick-reply:hover { background: var(--sky); color: #04121D; }
        .chat-input-row { display: flex; border-top: 1px solid var(--line); }
        .chat-input-row input { flex: 1; border: none; background: transparent; color: var(--text); padding: 12px 14px; font-size: 13.5px; font-family: inherit; }
        .chat-input-row input:focus { outline: none; }
        .chat-input-row button { padding: 0 16px; color: var(--cyan); font-weight: 700; }
        #mobile-sticky-bar { display: none; position: fixed; bottom: 0; inset-inline: 0; z-index: 390; background: rgba(6,20,33,.95); backdrop-filter: blur(10px); border-top: 1px solid var(--line); padding: 10px 14px; gap: 10px; }
        @media (max-width: 720px) {
          #mobile-sticky-bar { display: flex; }
          #whatsapp-float, #chatbot-toggle { bottom: 82px; }
          #chatbot-panel { bottom: 150px; }
        }
        #mobile-sticky-bar .btn { flex: 1; padding: 12px 10px; font-size: 14px; }
        #mobile-sticky-bar .btn-outline { border-color: rgba(232,244,252,.25); }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
          html { scroll-behavior: auto; }
          .reveal { opacity: 1; transform: none; }
        }
      `}</style>

      <header className={`site-header ${headerScrolled ? "scrolled" : ""}`}>
        <div className="container header-inner">
          <a href="#hero" className="logo">
            שטיף <span className="drop">💧</span>
          </a>
          <nav className={`nav-links ${navOpen ? "open" : ""}`}>
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setNavOpen(false)}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="header-cta">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: "9px 18px", fontSize: 13.5 }}>
              וואטסאפ
            </a>
            <a href="#calculator" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>
              קבל הצעת מחיר
            </a>
            <button className="nav-toggle icon-btn" aria-label="פתח תפריט" aria-expanded={navOpen} onClick={() => setNavOpen((v) => !v)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}>
                <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section id="hero">
          <span className="side-label">CLEAN · SHINE</span>
          <div className="hero-glow" aria-hidden="true">
            <div className="ray" /><div className="ray" /><div className="ray" /><div className="ray" />
            {bubbles.map((b) => (
              <div key={b.id} className="bubble" style={{ width: b.size, height: b.size, left: `${b.left}%`, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }} />
            ))}
          </div>
          <div className="container hero-grid">
            <div className="hero-content">
              <EyebrowRow text="ניקיון ואחזקה · מרכז ושרון" />
              <h1 className="heading-xl">
                הבית שלך נקי ומטופל תוך 24 שעות — <span className="accent">בלי כאב ראש.</span>
              </h1>
              <div className="mustard-line" />
              <p className="subtitle">ניקוי בניינים אחרי שיפוץ, ספות, מזגנים ורצפות. צוות מאומת, מחיר ברור מראש, שירות במרכז ובשרון.</p>
              <div className="hero-cta-row">
                <a href="#calculator" className="btn btn-primary">קבל הצעת מחיר תוך דקה</a>
              </div>
              <div className="hero-trust-line">
                <span><b>140+</b> עבודות הושלמו</span><span className="sep">·</span>
                <span>מענה תוך <b>24 שעות</b></span><span className="sep">·</span>
                <span><b>4.8/5</b> שביעות רצון</span>
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="hero-watermark">שטיף</div>
              <div className="hero-photo-card">
                <DuoAvatars size={84} />
                <div className="role">הצוות של שטיף</div>
                <div className="names">אייל שוורץ · מור עטר</div>
                <div className="photo-note">{"{{HERO_IMAGE_URL}}"} — כאן תשובץ תמונת הצוות</div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section id="stats">
          <div className="container">
            <div className="stats-grid">
              {STATS.map((s, i) => (
                <Reveal key={s.label} className={`stat-item reveal-d${i}`}>
                  <div className="stat-num">
                    <CountUp target={s.target} decimals={s.decimals} suffix={s.suffix} />
                  </div>
                  <div className="stat-label">{s.label}</div>
                </Reveal>
              ))}
            </div>
            <div className="promises">
              {PROMISES.map((p, i) => (
                <Reveal key={p.b} className={`promise reveal-d${i}`}>
                  <span className="check">{ICONS.check}</span>
                  <span><b>{p.b}</b>{p.rest}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section">
          <span className="side-label">ABOUT</span>
          <div className="container about-grid">
            <Reveal className="about-photo-wrap">
              <div className="about-photo-card">
                <DuoAvatars />
                <div className="caption-role">שותפים מייסדים</div>
                <div className="caption-names">אייל שוורץ · מור עטר</div>
              </div>
            </Reveal>
            <div className="about-text">
              <Reveal><EyebrowRow text="על שטיף" /></Reveal>
              <Reveal>
                <h2 className="heading-xl">ניסיון שנבנה. <span className="accent">אמון שנרכש.</span></h2>
                <div className="mustard-line" />
              </Reveal>
              <Reveal className="reveal-d1">
                <p>אייל ומור הקימו את שטיף מתוך ניסיון ארוך שנים בתחום האחזקה והניקיון — ומתוך רצון להביא <b>סדר, שקיפות ואמינות</b> לתחום שלא תמיד מתנהל כך.</p>
              </Reveal>
              <Reveal className="reveal-d2">
                <p>הדרך שלנו לשירות פשוטה: מקשיבים קודם. כל בית, משרד או בניין הוא עולם בפני עצמו — עם צרכים שונים, לוח זמנים שונה ורמת גימור שונה. השירות מותאם לך בדיוק — <b>לא תבנית מוכנה</b>.</p>
              </Reveal>
              <Reveal className="reveal-d3">
                <p>היום שטיף מלווה לקוחות פרטיים, ועדי בתים ועסקים באזור המרכז והשרון — עם דגש על מחיר ברור מראש, זמינות אמיתית ואחריות מלאה על התוצאה.</p>
                <div className="about-cta">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-accent">דברו איתנו בוואטסאפ</a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section">
          <span className="side-label">SERVICES</span>
          <StackedServices onCalcJump={jumpToCalc} />
        </section>

        {/* CALCULATOR */}
        <section id="calculator" className="section">
          <div className="container">
            <Reveal className="section-head center">
              <EyebrowRow text="מחשבון מחיר" center />
              <h2 className="heading-xl">קבלו הערכת מחיר <span className="accent">תוך פחות מדקה</span></h2>
              <div className="mustard-line" />
              <p className="lede">שני שלבים קצרים — והמחיר המשוער מוצג לכם מיד, לפני שמסרתם פרט אחד.</p>
            </Reveal>
            <Reveal>
              <QuoteCalculator preselect={calcPreselect} />
            </Reveal>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="section">
          <span className="side-label">PROCESS</span>
          <div className="container">
            <Reveal className="section-head center">
              <EyebrowRow text="איך זה עובד" center />
              <h2 className="heading-xl">התהליך שלנו</h2>
              <div className="mustard-line" />
            </Reveal>
            <ProcessTimeline />
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="section section-alt">
          <div className="container" style={{ textAlign: "center" }}>
            <Reveal className="section-head center" style={{ marginBottom: 20 }}>
              <EyebrowRow text="לקוחות ממליצים" center />
              <h2 className="heading-xl">מה אומרים עלינו</h2>
              <div className="mustard-line" />
            </Reveal>
            <Reveal>
              <span className="rating-badge">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.2l7.1-.6z" /></svg>
                4.8/5 מ-32 ביקורות
              </span>
            </Reveal>
            <div className="testi-grid" style={{ textAlign: "right" }}>
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={i} className={`testi-card reveal-d${i}`}>
                  <div className="testi-stars">{"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}</div>
                  <p>"{t.text}"</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="section">
          <div className="container">
            <Reveal className="section-head center">
              <EyebrowRow text="עבודות אחרונות" center />
              <h2 className="heading-xl">לפני ואחרי — <span className="accent">גררו לבדוק</span></h2>
              <div className="mustard-line" />
              <p className="lede">גררו את החץ על כל תמונה כדי לראות את ההבדל.</p>
            </Reveal>
            <div className="projects-grid">
              {PROJECTS.map((p) => (
                <ProjectCard key={p.title} title={p.title} desc={p.desc} />
              ))}
            </div>
          </div>
        </section>

        {/* BLOG */}
        <section id="blog" className="section">
          <span className="side-label">BLOG</span>
          <div className="container">
            <BlogCarousel />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section">
          <div className="container">
            <Reveal className="section-head center">
              <EyebrowRow text="שאלות נפוצות" center />
              <h2 className="heading-xl">עוד לפני שאתם מתקשרים</h2>
              <div className="mustard-line" />
            </Reveal>
            <div className="faq-list">
              {FAQS.map((f) => (
                <details className="faq-item" key={f.q}>
                  <summary>
                    {f.q}
                    <span className="plus">+</span>
                  </summary>
                  <div className="faq-answer">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="contact">
        <div className="container">
          <div className="footer-cta">
            <EyebrowRow text="צרו קשר" center />
            <h2>מוכנים לבית נקי ומטופל?</h2>
            <p>כתבו לנו — נחזור אליכם תוך 24 שעות עם מחיר ומועד.</p>
            <div className="footer-cta-row">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                <span style={{ width: 18, height: 18, display: "inline-flex" }}>{ICONS.whatsapp}</span>
                WhatsApp
              </a>
              <a href="tel:0543379667" className="contact-icon-btn" aria-label="התקשרו אלינו">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </a>
              <a href="mailto:eyalshwartz1@gmail.com" className="contact-icon-btn" aria-label="שלחו מייל">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
              </a>
            </div>
          </div>
          <div className="footer-grid">
            <div>
              <div className="footer-logo">שטיף 💧</div>
              <p style={{ fontSize: 13.5, maxWidth: 280 }}>ניקיון ואחזקה במרכז ובשרון — אייל שוורץ ומור עטר.</p>
            </div>
            <div>
              <h4>ניווט</h4>
              <ul>
                {NAV_LINKS.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4>יצירת קשר ומשפטי</h4>
              <ul>
                <li><a href="tel:0543379667">054-3379667</a></li>
                <li><a href="mailto:eyalshwartz1@gmail.com">eyalshwartz1@gmail.com</a></li>
                <li>אזור שירות: מרכז ושרון</li>
                <li><a href="#" aria-disabled="true">מדיניות פרטיות</a></li>
                <li><a href="#" aria-disabled="true">תנאי שימוש</a></li>
                <li><a href="#" aria-disabled="true">הצהרת נגישות</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} שטיף — כל הזכויות שמורות</span>
            <span>מרכז ושרון · ניקיון ואחזקה מקצועי</span>
          </div>
        </div>
      </footer>

      <a id="whatsapp-float" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="פתח וואטסאפ">
        {ICONS.whatsapp}
      </a>

      <ChatbotWidget />

      <div id="mobile-sticky-bar">
        <a href="tel:0543379667" className="btn btn-outline">התקשרו</a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">וואטסאפ</a>
        <a href="#calculator" className="btn btn-primary">הצעת מחיר</a>
      </div>
    </>
  );
}
