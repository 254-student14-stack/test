import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const faqs = [
  {
    q: 'כמה עולה להשתמש בפלטפורמה?',
    a: 'הצטרפות ופרסום פרויקטים בחינם לגמרי לקבלנים. חברות ניקיון משלמות עמלה קטנה רק על עבודות שהושלמו.',
  },
  {
    q: 'איך מאמתים חברות ניקיון?',
    a: 'כל חברה עוברת בדיקת רישיון עסק, ביטוח, ועבר פלילי. בנוסף, דירוגים אמיתיים מקבלנים.',
  },
  {
    q: 'כמה זמן לוקח למצוא ניקיון?',
    a: 'בממוצע 2-4 שעות. בפרויקטים דחופים ניתן לקבל מענה תוך שעה.',
  },
  {
    q: 'האם יש ביטוח לנזקים?',
    a: 'כן. כל חברות הניקיון מחויבות בביטוח צד ג׳. בנוסף יש לנו מנגנון הגנה לקבלנים.',
  },
  {
    q: 'מה קורה אם לא מרוצה מהשירות?',
    a: 'יש לנו מדיניות החזר כספי מלאה ב-48 שעות אם השירות לא עמד בסטנדרטים.',
  },
  {
    q: 'באיזה אזורים הפלטפורמה פעילה?',
    a: 'כרגע פעילים במרכז הארץ, גוש דן ושרון. מתרחבים לכל הארץ ב-2024.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="faq" className="py-24 bg-gray-50" ref={ref}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-gray-900 mb-16"
        >
          שאלות נפוצות
        </motion.h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-right px-6 py-5 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`text-blue-600 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
