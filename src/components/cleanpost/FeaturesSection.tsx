import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  { icon: '✅', title: 'מאומת ומדורג', text: 'כל חברות הניקיון עוברות אימות ומקבלות דירוגים מקבלנים' },
  { icon: '💰', title: 'תמחור שקוף', text: 'השוואת מחירים בקלות, ללא הפתעות' },
  { icon: '⚡', title: 'מהיר ויעיל', text: 'מציאת ניקיון תוך שעות, לא ימים' },
  { icon: '📱', title: 'ממשק פשוט', text: 'פלטפורמה קלה לשימוש גם בנייד' },
  { icon: '🔒', title: 'תשלום מאובטח', text: 'תשלום דרך הפלטפורמה עם הגנה מלאה' },
  { icon: '📊', title: 'ניהול פרויקטים', text: 'מעקב אחרי כל הניקיונות במקום אחד' },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-24 bg-gray-50" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-gray-900 mb-16"
        >
          למה CleanPost?
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
