import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const problems = [
  {
    icon: '🔨',
    title: 'קבלנים',
    text: 'מבזבזים שעות למצוא חברת ניקיון אמינה בלחץ גמר הפרויקט',
  },
  {
    icon: '🧹',
    title: 'חברות ניקיון',
    text: 'מתקשות למצוא עבודות רציפות ולבנות בסיס לקוחות יציב',
  },
  {
    icon: '⏰',
    title: 'זמן יקר',
    text: 'תיאומים ידניים, ביטולי דקה אחרונה, חוסר שקיפות במחירים',
  },
];

export default function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 bg-gray-50" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-gray-900 mb-16"
        >
          הבעיה שכולם מכירים
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-md text-center"
            >
              <div className="text-5xl mb-4">{p.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
              <p className="text-gray-600 leading-relaxed">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
