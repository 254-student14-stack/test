import { useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   הוסף לקובץ index.html שלך (בתוך <head>):

   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&family=Epilogue:wght@500;600;700;800;900&display=swap" rel="stylesheet" />

   פרטי חיבור אמיתיים למלא לפני פרסום:
   N8N_WEBHOOK_URL, SUPABASE_URL/ANON_KEY, DOMAIN, LOGO_URL, HERO_IMAGE_URL
───────────────────────────────────────────── */

const N8N_WEBHOOK_URL = "{{N8N_WEBHOOK_URL}}";
const WHATSAPP_NUMBER = "972543379667";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

type FieldDef =
  | { key: string; label: string; type: "range"; min: number; max: number; step: number; default: number }
  | { key: string; label: string; type: "chip"; options: { value: string; label: string }[]; default: string };

type ServiceDef = {
  id: string;
  title: string;
  hint: string;
  fields: FieldDef[];
  price: (values: Record<string, number | string>) => number;
};

const SERVICES: ServiceDef[] = [
  {
    id: "building",
    title: "ניקיון בניינים לאחר שיפוץ",
    hint: "החל מ-₪900",
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

const WHY = [
  { num: "01", title: "מחיר שקוף מראש", desc: "אתם רואים הערכת מחיר לפני שאתם משאירים פרט אחד." },
  { num: "02", title: "זמינות מהירה", desc: "תיאום מהיר ותגובה זריזה בוואטסאפ ובטלפון." },
  { num: "03", title: "צוות מאומת", desc: "אייל ומור, שני שותפים עם ניסיון באחזקה וניקיון." },
  { num: "04", title: "אחריות על העבודה", desc: "לא מרוצים? נחזור ונסיים את העבודה כמו שצריך." },
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
    title: "הברקת רצפות — פוליש, ווקס וקריסטליזציה — מה מתאים לרצפה שלכם",
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
  { href: "#projects", label: "עבודות אחרונות" },
  { href: "#blog", label: "מאמרים" },
  { href: "#faq", label: "שאלות נפוצות" },
  { href: "#about", label: "אודות" },
];

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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.02c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.1 8.1 0 0 1-1.24-4.24c0-4.48 3.65-8.13 8.13-8.13 4.48 0 8.13 3.65 8.13 8.13 0 4.48-3.65 8.11-8.13 8.11z" />
    </svg>
  );
}

/* ── Before/after project card ── */
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
        onPointerDown={(e) => {
          dragging.current = true;
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerLeave={() => (dragging.current = false)}
        onTouchMove={(e) => setFromClientX(e.touches[0].clientX)}
      >
        <div className="ba-after">
          <span>אחרי</span>
        </div>
        <div className="ba-before" style={{ width: `${pct}%` }}>
          <span>לפני</span>
        </div>
        <div className="ba-handle" style={{ insetInlineStart: `${pct}%` }} />
      </div>
      <div className="project-info">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </Reveal>
  );
}

/* ── Quote calculator ── */
function QuoteCalculator() {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, number | string>>({});
  const [estimate, setEstimate] = useState(0);
  const [contact, setContact] = useState({ name: "", phone: "", city: "", email: "", website: "" });
  const startTimeRef = useRef(Date.now());

  const service = useMemo(() => SERVICES.find((s) => s.id === serviceId) ?? null, [serviceId]);

  function pickService(s: ServiceDef) {
    const initial: Record<string, number | string> = {};
    s.fields.forEach((f) => (initial[f.key] = f.default));
    setServiceId(s.id);
    setValues(initial);
    setStep(1);
  }

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
        service: service.id,
        params: values,
        estimate,
        name: contact.name,
        phone: contact.phone,
        city: contact.city,
        email: contact.email,
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
                <button key={s.id} type="button" className="service-pick" onClick={() => pickService(s)}>
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
              <div className="amount">
                ₪{low}–{high}
              </div>
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
              <input
                className="calc-input"
                type="text"
                value={contact.name}
                onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
              />
            </div>
            <div className="field-group">
              <label>טלפון *</label>
              <input
                className="calc-input"
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              />
            </div>
            <div className="field-group">
              <label>עיר (אופציונלי)</label>
              <input
                className="calc-input"
                type="text"
                value={contact.city}
                onChange={(e) => setContact((c) => ({ ...c, city: e.target.value }))}
              />
            </div>
            <div className="field-group">
              <label>אימייל (אופציונלי)</label>
              <input
                className="calc-input"
                type="email"
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              />
            </div>
            <input
              className="hp-field"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={contact.website}
              onChange={(e) => setContact((c) => ({ ...c, website: e.target.value }))}
            />
          </>
        )}

        {step === 4 && (
          <div className="success-box">
            <div className="success-icon">
              <CheckIcon />
            </div>
            <div className="calc-step-title">הפנייה התקבלה!</div>
            <p style={{ color: "var(--ink-muted)", fontSize: 14.5 }}>
              ניצור איתכם קשר בהקדם לתיאום ולמחיר סופי. אפשר גם לפנות ישירות בוואטסאפ.
            </p>
          </div>
        )}
      </div>

      <div className="calc-footer">
        {step === 0 && null}
        {step === 1 && (
          <>
            <button type="button" className="calc-back" onClick={() => setStep(0)}>
              חזרה
            </button>
            <button type="button" className="btn btn-primary" onClick={goToPrice}>
              הצג מחיר משוער
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <button type="button" className="calc-back" onClick={() => setStep(1)}>
              חזרה
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
              קבע לי שיחה חוזרת
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <button type="button" className="calc-back" onClick={() => setStep(2)}>
              חזרה
            </button>
            <button type="button" className="btn btn-primary" onClick={submitLead}>
              שליחה
            </button>
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

/* ── Chatbot widget ── */
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
        {
          who: "bot",
          text: found ? found.a : 'אשמח לחבר אתכם לצוות בוואטסאפ לתשובה מדויקת יותר — לחצו על "לדבר עם נציג" למטה.',
        },
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.who}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="chat-quick">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q.label}
              className="quick-reply"
              onClick={() => (q.wa ? window.open(WHATSAPP_URL, "_blank") : send(q.text!))}
            >
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

export default function ShteefPage() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
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

  return (
    <>
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --navy: #0C4A6E; --navy-deep: #082F49; --sky: #0EA5E9; --cyan: #06B6D4;
          --frost: #F0F9FF; --frost-2: #E0F2FE; --ink: #0F172A; --ink-muted: #475569;
          --white: #FFFFFF; --whatsapp: #25D366; --font-head: 'Epilogue', sans-serif;
          --font-body: 'Urbanist', sans-serif; --radius: 20px; --radius-sm: 12px;
          --ease: cubic-bezier(0.16, 1, 0.3, 1);
          --shadow-soft: 0 20px 60px -20px rgba(12,74,110,0.25);
          --shadow-glow: 0 0 0 1px rgba(14,165,233,0.15), 0 20px 50px -15px rgba(14,165,233,0.35);
        }
        html { scroll-behavior: smooth; }
        body { background: var(--frost); color: var(--ink); font-family: var(--font-body); line-height: 1.6; overflow-x: hidden; }
        h1, h2, h3, h4 { font-family: var(--font-head); line-height: 1.15; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
        ul { list-style: none; }
        .container { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 24px; }
        .btn, .icon-btn, .quick-reply, summary { min-height: 44px; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border-radius: 999px; font-weight: 700; font-size: 16px; transition: transform .25s var(--ease), box-shadow .25s var(--ease), background .25s var(--ease); white-space: nowrap; }
        .btn-primary { background: linear-gradient(135deg, var(--sky), var(--cyan)); color: #fff; box-shadow: var(--shadow-glow); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 25px 55px -15px rgba(14,165,233,0.55); }
        .btn-secondary { background: rgba(255,255,255,0.06); color: #fff; border: 1.5px solid rgba(255,255,255,0.35); padding: 12px 24px; font-size: 15px; }
        .btn-secondary:hover { background: rgba(255,255,255,0.14); }
        .btn-light { background: #fff; color: var(--navy); border: 1.5px solid #DCEFFB; }
        .btn-light:hover { border-color: var(--sky); }
        .btn-whatsapp { background: var(--whatsapp); color: #fff; }
        .site-header { position: fixed; top: 0; inset-inline: 0; z-index: 500; padding: 18px 0; transition: background .3s var(--ease), box-shadow .3s var(--ease), padding .3s var(--ease); }
        .site-header.scrolled { background: rgba(8,47,73,0.92); backdrop-filter: blur(10px); padding: 12px 0; box-shadow: 0 10px 30px -15px rgba(0,0,0,0.4); }
        .header-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .logo { font-family: var(--font-head); font-weight: 800; font-size: 22px; color: #fff; display:flex; align-items:center; gap:8px; }
        .logo .drop { color: var(--cyan); }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-links a { color: rgba(255,255,255,0.85); font-weight: 500; font-size: 15px; transition: color .2s; }
        .nav-links a:hover { color: #fff; }
        .header-cta { display: flex; align-items: center; gap: 12px; }
        .nav-toggle { display: none; width: 44px; height: 44px; color: #fff; align-items:center; justify-content:center; }
        @media (max-width: 900px) {
          .nav-links { position: fixed; inset: 72px 16px auto 16px; background: var(--navy-deep); border-radius: var(--radius); padding: 16px; flex-direction: column; align-items: stretch; gap: 4px; box-shadow: var(--shadow-soft); transform: translateY(-12px); opacity: 0; pointer-events: none; transition: all .25s var(--ease); }
          .nav-links.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
          .nav-links a { padding: 12px 14px; border-radius: var(--radius-sm); }
          .nav-links a:hover { background: rgba(255,255,255,0.06); }
          .header-cta .btn-secondary { display: none; }
          .nav-toggle { display: inline-flex; }
        }
        #hero { position: relative; min-height: 78vh; display: flex; align-items: center; background: radial-gradient(ellipse 120% 80% at 50% -10%, #124e73 0%, var(--navy) 45%, var(--navy-deep) 100%); overflow: hidden; padding: 140px 0 90px; }
        @media (max-width: 640px) { #hero { min-height: 60vh; padding: 120px 0 70px; } }
        .hero-glow { position: absolute; inset: 0; pointer-events: none; }
        .ray { position: absolute; top: -20%; width: 2px; height: 140%; background: linear-gradient(to bottom, rgba(6,182,212,0.35), transparent); transform: rotate(12deg); filter: blur(1px); animation: shimmer 6s ease-in-out infinite; }
        .ray:nth-child(1) { right: 12%; animation-delay: 0s; }
        .ray:nth-child(2) { right: 28%; animation-delay: 1.4s; height: 120%; }
        .ray:nth-child(3) { right: 46%; animation-delay: 2.8s; }
        .ray:nth-child(4) { right: 65%; animation-delay: .8s; height: 110%; }
        @keyframes shimmer { 0%,100% { opacity: .25; } 50% { opacity: .7; } }
        .bubble { position: absolute; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(14,165,233,0.08) 70%); animation: float-up linear infinite; bottom: -40px; }
        @keyframes float-up { 0% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: .8; } 90% { opacity: .5; } 100% { transform: translateY(-620px) translateX(20px); opacity: 0; } }
        .hero-inner { position: relative; z-index: 2; text-align: center; max-width: 780px; margin: 0 auto; }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); color: var(--frost); font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 999px; margin-bottom: 22px; }
        .hero-eyebrow .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 12px var(--cyan); }
        #hero h1 { font-size: clamp(30px, 4.6vw, 52px); font-weight: 800; color: #fff; letter-spacing: -0.01em; margin-bottom: 18px; }
        #hero .subtitle { font-size: clamp(16px, 2vw, 19px); color: rgba(240,249,255,0.82); max-width: 600px; margin: 0 auto 34px; }
        .hero-cta-row { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; margin-bottom: 26px; }
        .trust-badges { display: flex; align-items: center; justify-content: center; gap: 22px; flex-wrap: wrap; }
        .trust-badges span { display: flex; align-items: center; gap: 7px; font-size: 13px; color: rgba(240,249,255,0.72); }
        .trust-badges svg { color: var(--cyan); flex-shrink: 0; }
        .section { padding: 88px 0; }
        .section-tight { padding: 64px 0; }
        .eyebrow { display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: .06em; color: var(--sky); background: var(--frost-2); padding: 6px 14px; border-radius: 999px; margin-bottom: 14px; }
        .section-head { text-align: center; max-width: 640px; margin: 0 auto 48px; }
        .section-head h2 { font-size: clamp(24px, 3.2vw, 36px); color: var(--navy-deep); margin-bottom: 12px; }
        .section-head p { color: var(--ink-muted); font-size: 16px; }
        .bento-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        @media (max-width: 900px) { .bento-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .bento-grid { grid-template-columns: 1fr; } }
        .bento-card { background: #fff; border: 1px solid #E0F2FE; border-radius: var(--radius); padding: 28px 22px; transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .3s; display: flex; flex-direction: column; gap: 12px; }
        .bento-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-soft); border-color: transparent; }
        .bento-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, var(--sky), var(--cyan)); display: flex; align-items: center; justify-content: center; color: #fff; }
        .bento-card h3 { font-size: 18px; color: var(--navy-deep); }
        .bento-card p { font-size: 14.5px; color: var(--ink-muted); }
        #calculator { background: linear-gradient(180deg, var(--frost-2) 0%, var(--frost) 100%); }
        .calc-card { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 24px; box-shadow: var(--shadow-soft); border: 1px solid #E0F2FE; overflow: hidden; }
        .calc-progress { display: flex; gap: 6px; padding: 20px 26px 0; }
        .calc-progress span { flex: 1; height: 4px; border-radius: 999px; background: #E0F2FE; }
        .calc-progress span.done { background: linear-gradient(90deg, var(--sky), var(--cyan)); }
        .calc-body { padding: 26px; min-height: 300px; }
        .calc-step-title { font-size: 19px; font-weight: 700; color: var(--navy-deep); margin-bottom: 4px; }
        .calc-step-sub { font-size: 14px; color: var(--ink-muted); margin-bottom: 20px; }
        .service-pick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .service-pick-grid { grid-template-columns: 1fr; } }
        .service-pick { border: 1.5px solid #E0F2FE; border-radius: var(--radius-sm); padding: 16px; text-align: right; transition: all .2s; display:flex; flex-direction:column; gap:6px; }
        .service-pick:hover { border-color: var(--sky); background: var(--frost); }
        .service-pick strong { font-size: 14.5px; color: var(--navy-deep); }
        .service-pick span { font-size: 12.5px; color: var(--ink-muted); }
        .field-group { margin-bottom: 18px; }
        .field-group label { display: block; font-size: 14px; font-weight: 600; color: var(--navy-deep); margin-bottom: 8px; }
        .field-group input[type="range"] { width: 100%; accent-color: var(--sky); }
        .range-value { font-size: 13px; color: var(--sky); font-weight: 700; }
        .select-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .chip-option { border: 1.5px solid #E0F2FE; border-radius: 999px; padding: 9px 16px; font-size: 13.5px; font-weight: 600; color: var(--ink-muted); transition: all .2s; }
        .chip-option:hover { border-color: var(--sky); }
        .chip-option.selected { background: var(--navy); color: #fff; border-color: var(--navy); }
        .price-reveal { text-align: center; padding: 10px 0 6px; }
        .price-reveal .label { font-size: 13px; color: var(--ink-muted); margin-bottom: 6px; }
        .price-reveal .amount { font-family: var(--font-head); font-size: 40px; font-weight: 800; background: linear-gradient(135deg, var(--navy), var(--sky)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .price-reveal .note { font-size: 12.5px; color: var(--ink-muted); margin-top: 6px; }
        .calc-input { width: 100%; border: 1.5px solid #E0F2FE; border-radius: var(--radius-sm); padding: 13px 16px; font-size: 15px; font-family: inherit; transition: border-color .2s; }
        .calc-input:focus { outline: none; border-color: var(--sky); }
        .hp-field { position: absolute; opacity: 0; height: 0; width: 0; pointer-events: none; }
        .calc-footer { display: flex; align-items: center; justify-content: space-between; padding: 0 26px 26px; gap: 10px; min-height: 20px; }
        .calc-back { font-size: 14px; color: var(--ink-muted); font-weight: 600; }
        .calc-back:hover { color: var(--navy); }
        .success-box { text-align: center; padding: 20px 0; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--frost-2); color: var(--sky); display:flex; align-items:center; justify-content:center; margin: 0 auto 16px; }
        .why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        @media (max-width: 900px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .why-grid { grid-template-columns: 1fr; } }
        .why-card { text-align: center; padding: 26px 18px; }
        .why-num { font-family: var(--font-head); font-size: 34px; font-weight: 800; color: var(--frost-2); -webkit-text-stroke: 1.5px var(--sky); margin-bottom: 10px; }
        .why-card h3 { font-size: 16.5px; color: var(--navy-deep); margin-bottom: 6px; }
        .why-card p { font-size: 13.5px; color: var(--ink-muted); }
        .rating-badge { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #E0F2FE; border-radius: 999px; padding: 8px 18px; font-size: 14px; font-weight: 700; color: var(--navy-deep); margin-bottom: 32px; }
        .rating-badge svg { color: #F59E0B; }
        .testi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
        @media (max-width: 700px) { .testi-grid { grid-template-columns: 1fr; } }
        .testi-card { background: #fff; border: 1px solid #E0F2FE; border-radius: var(--radius); padding: 24px; }
        .testi-stars { color: #F59E0B; font-size: 14px; margin-bottom: 10px; letter-spacing: 2px; }
        .testi-card p { font-size: 15px; color: var(--ink); }
        .projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        @media (max-width: 900px) { .projects-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .projects-grid { grid-template-columns: 1fr; } }
        .project-card { border-radius: var(--radius); overflow: hidden; border: 1px solid #E0F2FE; background: #fff; }
        .ba-slider { position: relative; height: 170px; overflow: hidden; cursor: ew-resize; user-select: none; }
        .ba-after, .ba-before { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-weight: 700; font-size: 13px; color: #fff; }
        .ba-after { background: linear-gradient(135deg, var(--navy), var(--navy-deep)); }
        .ba-before { background: linear-gradient(135deg, #94a3b8, #64748b); overflow: hidden; border-inline-end: 2px solid #fff; }
        .ba-before span, .ba-after span { width: 100vw; max-width: 400px; text-align: center; }
        .ba-handle { position: absolute; top: 0; bottom: 0; width: 3px; background: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.4); transform: translateX(50%); }
        .ba-handle::after { content: '↔'; position: absolute; top: 50%; inset-inline-start: 50%; transform: translate(-50%,-50%); width: 30px; height: 30px; background: #fff; border-radius: 50%; display:flex; align-items:center; justify-content:center; color: var(--navy); font-size: 14px; box-shadow: var(--shadow-soft); }
        .project-info { padding: 16px 18px; }
        .project-info h3 { font-size: 15px; color: var(--navy-deep); margin-bottom: 4px; }
        .project-info p { font-size: 13px; color: var(--ink-muted); }
        .blog-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
        @media (max-width: 700px) { .blog-grid { grid-template-columns: 1fr; } }
        .blog-card { background: #fff; border: 1px solid #E0F2FE; border-radius: var(--radius); overflow: hidden; }
        .blog-card summary { list-style: none; padding: 22px; cursor: pointer; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .blog-card summary::-webkit-details-marker { display: none; }
        .blog-card summary .plus { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--frost-2); color: var(--sky); display:flex; align-items:center; justify-content:center; font-size: 18px; transition: transform .2s; }
        .blog-card[open] summary .plus { transform: rotate(45deg); }
        .blog-card summary .blog-tag { font-size: 12px; font-weight: 700; color: var(--sky); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 6px; display:block; }
        .blog-card summary h3 { font-size: 16.5px; color: var(--navy-deep); }
        .blog-card .blog-excerpt { font-size: 13.5px; color: var(--ink-muted); margin-top: 4px; }
        .blog-body { padding: 0 22px 22px; font-size: 14.5px; color: var(--ink); }
        .blog-body p { margin-bottom: 12px; }
        .faq-list { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
        .faq-item { background: #fff; border: 1px solid #E0F2FE; border-radius: var(--radius-sm); overflow: hidden; }
        .faq-item summary { list-style: none; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-weight: 700; color: var(--navy-deep); font-size: 15px; cursor: pointer; }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary .plus { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; background: var(--frost-2); color: var(--sky); display:flex; align-items:center; justify-content:center; font-size: 16px; transition: transform .2s; }
        .faq-item[open] summary .plus { transform: rotate(45deg); }
        .faq-item .faq-answer { padding: 0 20px 18px; font-size: 14.5px; color: var(--ink-muted); }
        .about-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 40px; align-items: center; }
        @media (max-width: 800px) { .about-grid { grid-template-columns: 1fr; } }
        .about-avatars { display: flex; gap: 16px; }
        .avatar-card { flex: 1; background: #fff; border: 1px solid #E0F2FE; border-radius: var(--radius); padding: 20px; text-align: center; }
        .avatar-circle { width: 68px; height: 68px; border-radius: 50%; margin: 0 auto 12px; background: linear-gradient(135deg, var(--sky), var(--navy)); display:flex; align-items:center; justify-content:center; color:#fff; font-family: var(--font-head); font-weight: 800; font-size: 22px; }
        .avatar-card h4 { font-size: 15px; color: var(--navy-deep); }
        .avatar-card span { font-size: 12.5px; color: var(--ink-muted); }
        .about-text h2 { font-size: clamp(22px, 3vw, 30px); color: var(--navy-deep); margin-bottom: 16px; }
        .about-text p { color: var(--ink-muted); font-size: 15px; margin-bottom: 12px; }
        footer { background: var(--navy-deep); color: rgba(240,249,255,0.75); padding: 56px 0 26px; }
        .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 32px; margin-bottom: 36px; }
        @media (max-width: 700px) { .footer-grid { grid-template-columns: 1fr; gap: 24px; } }
        .footer-grid h4 { color: #fff; font-size: 14px; margin-bottom: 14px; }
        .footer-grid ul li { margin-bottom: 9px; font-size: 13.5px; }
        .footer-grid ul li a:hover { color: #fff; }
        .footer-logo { font-family: var(--font-head); font-weight: 800; font-size: 20px; color: #fff; margin-bottom: 10px; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size: 12.5px; }
        #whatsapp-float { position: fixed; bottom: 26px; inset-inline-start: 26px; z-index: 400; width: 58px; height: 58px; border-radius: 50%; background: var(--whatsapp); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px -8px rgba(37,211,102,0.6); transition: bottom .25s var(--ease), transform .2s; }
        #whatsapp-float:hover { transform: scale(1.06); }
        #whatsapp-float::before { content: ''; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid var(--whatsapp); opacity: .5; animation: pulse-ring 2.4s ease-out infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: .6; } 100% { transform: scale(1.35); opacity: 0; } }
        #chatbot-toggle { position: fixed; bottom: 26px; inset-inline-end: 26px; z-index: 400; width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, var(--sky), var(--navy)); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-glow); transition: bottom .25s var(--ease), transform .2s; }
        #chatbot-toggle:hover { transform: scale(1.06); }
        #chatbot-panel { position: fixed; bottom: 94px; inset-inline-end: 26px; z-index: 410; width: 320px; max-width: calc(100vw - 32px); background: #fff; border-radius: var(--radius); box-shadow: var(--shadow-soft); border: 1px solid #E0F2FE; display: none; flex-direction: column; overflow: hidden; transition: bottom .25s var(--ease); }
        #chatbot-panel.open { display: flex; }
        .chat-head { background: var(--navy); color: #fff; padding: 14px 18px; display:flex; align-items:center; justify-content:space-between; }
        .chat-head strong { font-size: 14.5px; }
        .chat-head span { font-size: 11.5px; color: rgba(240,249,255,0.7); display:block; }
        .chat-close { width: 30px; height: 30px; color: #fff; }
        .chat-body { padding: 14px; height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: var(--frost); }
        .chat-msg { max-width: 85%; padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; }
        .chat-msg.bot { background: #fff; border: 1px solid #E0F2FE; align-self: flex-start; border-start-start-radius: 4px; }
        .chat-msg.user { background: var(--sky); color: #fff; align-self: flex-end; border-start-end-radius: 4px; }
        .chat-quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 14px; border-top: 1px solid #E0F2FE; }
        .quick-reply { font-size: 12px; background: var(--frost-2); color: var(--navy); padding: 8px 12px; border-radius: 999px; font-weight: 600; }
        .quick-reply:hover { background: var(--sky); color: #fff; }
        .chat-input-row { display: flex; border-top: 1px solid #E0F2FE; }
        .chat-input-row input { flex: 1; border: none; padding: 12px 14px; font-size: 13.5px; font-family: inherit; }
        .chat-input-row input:focus { outline: none; }
        .chat-input-row button { padding: 0 16px; color: var(--sky); font-weight: 700; }
        #mobile-sticky-bar { display: none; position: fixed; bottom: 0; inset-inline: 0; z-index: 390; background: #fff; border-top: 1px solid #E0F2FE; padding: 10px 14px; box-shadow: 0 -10px 30px -20px rgba(0,0,0,0.2); gap: 10px; }
        @media (max-width: 720px) {
          #mobile-sticky-bar { display: flex; }
          #whatsapp-float, #chatbot-toggle { bottom: 82px; }
          #chatbot-panel { bottom: 150px; }
        }
        #mobile-sticky-bar .btn { flex: 1; padding: 12px 10px; font-size: 14px; }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s var(--ease), transform .7s var(--ease); }
        .reveal.in { opacity: 1; transform: translateY(0); }
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
            <a href="#calculator" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>
              קבל הצעת מחיר
            </a>
            <button
              className="nav-toggle icon-btn"
              aria-label="פתח תפריט"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section id="hero">
          <div className="hero-glow" aria-hidden="true">
            <div className="ray" />
            <div className="ray" />
            <div className="ray" />
            <div className="ray" />
            {bubbles.map((b) => (
              <div
                key={b.id}
                className="bubble"
                style={{
                  width: b.size,
                  height: b.size,
                  left: `${b.left}%`,
                  animationDuration: `${b.duration}s`,
                  animationDelay: `${b.delay}s`,
                }}
              />
            ))}
          </div>
          <div className="container hero-inner">
            <span className="hero-eyebrow">
              <span className="dot" /> שטיף · ניקיון ואחזקה במרכז ובשרון
            </span>
            <h1>הבית שלך נקי ומטופל תוך 24 שעות — בלי כאב ראש</h1>
            <p className="subtitle">ניקוי בניינים אחרי שיפוץ, ספות, מזגנים ורצפות. צוות מאומת, מחיר ברור מראש, שירות במרכז ובשרון.</p>
            <div className="hero-cta-row">
              <a href="#calculator" className="btn btn-primary">
                קבל הצעת מחיר תוך דקה
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <WhatsAppIcon />
                וואטסאפ מיידי
              </a>
            </div>
            <div className="trust-badges">
              <span>
                <CheckIcon /> צוות מאומת ומבוטח
              </span>
              <span>
                <CheckIcon /> מחיר סופי לפני תחילת העבודה
              </span>
              <span>
                <CheckIcon /> מענה מהיר בוואטסאפ
              </span>
            </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">השירותים שלנו</span>
              <h2>כל מה שהבית או המשרד שלך צריך</h2>
              <p>ארבעה שירותי ליבה, ביצוע מקצועי וניקיון יסודי בכל פעם.</p>
            </Reveal>
            <div className="bento-grid">
              <Reveal className="bento-card">
                <div className="bento-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={26} height={26}>
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                  </svg>
                </div>
                <h3>ניקיון בניינים לאחר שיפוץ</h3>
                <p>הסרת אבק, שאריות צבע ופסולת בנייה — עד לניקיון מלא של הבניין.</p>
              </Reveal>
              <Reveal className="bento-card">
                <div className="bento-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={26} height={26}>
                    <path d="M3 13h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4zM5 13V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 19v2M19 19v2" />
                  </svg>
                </div>
                <h3>ניקוי ספות ומזרנים</h3>
                <p>מכונת אקסטרקציה מקצועית, חיטוי וסילוק כתמים וריחות.</p>
              </Reveal>
              <Reveal className="bento-card">
                <div className="bento-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={26} height={26}>
                    <path d="M3 8h18M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2M3 8v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8M7 20h10" />
                  </svg>
                </div>
                <h3>ניקוי מזגנים</h3>
                <p>פירוק, שטיפה תעשייתית וחיטוי מסננים לאוויר נקי ובריא.</p>
              </Reveal>
              <Reveal className="bento-card">
                <div className="bento-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={26} height={26}>
                    <path d="M4 4h16v16H4z" />
                    <path d="M4 12h16M12 4v16" />
                  </svg>
                </div>
                <h3>פוליש והברקת רצפות</h3>
                <p>טיפול תחזוקתי לרצפות — פוליש, ווקס או קריסטליזציה.</p>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="calculator" className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">מחשבון מחיר</span>
              <h2>קבלו הערכת מחיר תוך פחות מדקה</h2>
              <p>שני שלבים קצרים — והמחיר המשוער מוצג לכם מיד, לפני שמסרתם פרט אחד.</p>
            </Reveal>
            <Reveal>
              <QuoteCalculator />
            </Reveal>
          </div>
        </section>

        <section id="why" className="section section-tight" style={{ background: "#fff" }}>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">למה שטיף</span>
              <h2>שקיפות ואמינות בכל עבודה</h2>
            </Reveal>
            <div className="why-grid">
              {WHY.map((w) => (
                <Reveal className="why-card" key={w.num}>
                  <div className="why-num">{w.num}</div>
                  <h3>{w.title}</h3>
                  <p>{w.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <Reveal className="section-head" style={{ marginBottom: 20 }}>
              <span className="eyebrow">לקוחות ממליצים</span>
              <h2>מה אומרים עלינו</h2>
            </Reveal>
            <Reveal>
              <span className="rating-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
                  <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.2l7.1-.6z" />
                </svg>
                4.8/5 מ-32 ביקורות
              </span>
            </Reveal>
            <div className="testi-grid" style={{ textAlign: "right" }}>
              {TESTIMONIALS.map((t, i) => (
                <Reveal className="testi-card" key={i}>
                  <div className="testi-stars">{"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}</div>
                  <p>"{t.text}"</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section" style={{ background: "#fff" }}>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">עבודות אחרונות</span>
              <h2>לפני ואחרי — גררו לבדוק</h2>
              <p>גררו את החץ על כל תמונה כדי לראות את ההבדל.</p>
            </Reveal>
            <div className="projects-grid">
              {PROJECTS.map((p) => (
                <ProjectCard key={p.title} title={p.title} desc={p.desc} />
              ))}
            </div>
          </div>
        </section>

        <section id="blog" className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">מהבלוג</span>
              <h2>טיפים לניקיון ואחזקה</h2>
            </Reveal>
            <div className="blog-grid">
              {BLOG_POSTS.map((post) => (
                <details className="blog-card" key={post.title}>
                  <summary>
                    <div>
                      <span className="blog-tag">{post.tag}</span>
                      <h3>{post.title}</h3>
                      <p className="blog-excerpt">{post.excerpt}</p>
                    </div>
                    <span className="plus">+</span>
                  </summary>
                  <div className="blog-body">
                    {post.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section" style={{ background: "#fff" }}>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">שאלות נפוצות</span>
              <h2>עוד לפני שאתם מתקשרים</h2>
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

        <section id="about" className="section">
          <div className="container about-grid">
            <Reveal className="about-avatars">
              <div className="avatar-card">
                <div className="avatar-circle">א</div>
                <h4>אייל שוורץ</h4>
                <span>שותף מייסד</span>
              </div>
              <div className="avatar-card">
                <div className="avatar-circle">מ</div>
                <h4>מור עטר</h4>
                <span>שותף מייסד</span>
              </div>
            </Reveal>
            <Reveal className="about-text">
              <span className="eyebrow">מי אנחנו</span>
              <h2>שני שותפים, סטנדרט אחד לניקיון</h2>
              <p>אייל ומור הקימו את שטיף מתוך ניסיון ארוך שנים בתחום האחזקה והניקיון, מתוך רצון להביא סדר, שקיפות ואמינות לתחום שלא תמיד מתנהל כך.</p>
              <p>היום שטיף מספקת שירותי ניקיון ואחזקה לבניינים, משרדים ובתים פרטיים באזור המרכז והשרון — עם דגש על מחיר ברור מראש וזמינות אמיתית.</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-light">
                דברו איתנו בוואטסאפ
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <footer id="contact">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">שטיף 💧</div>
              <p style={{ fontSize: 13.5, maxWidth: 280 }}>ניקיון ואחזקה במרכז ובשרון — אייל שוורץ ומור עטר.</p>
            </div>
            <div>
              <h4>ניווט</h4>
              <ul>
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>צור קשר</h4>
              <ul>
                <li>
                  <a href="tel:0543379667">054-3379667</a>
                </li>
                <li>
                  <a href="mailto:eyalshwartz1@gmail.com">eyalshwartz1@gmail.com</a>
                </li>
                <li>אזור שירות: מרכז ושרון</li>
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
        <WhatsAppIcon size={28} />
      </a>

      <ChatbotWidget />

      <div id="mobile-sticky-bar">
        <a href="tel:0543379667" className="btn btn-light">
          התקשרו
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          וואטסאפ
        </a>
        <a href="#calculator" className="btn btn-primary">
          הצעת מחיר
        </a>
      </div>
    </>
  );
}
