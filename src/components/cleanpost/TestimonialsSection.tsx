import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const testimonials = [
  {
    name: 'יוסי כהן',
    role: 'קבלן בניה',
    text: 'CleanPost חסכה לי שעות של חיפוש. עכשיו אני מוצא ניקיון תוך דקות לכל פרויקט.',
  },
  {
    name: 'מירה לוי',
    role: 'מנכ"לית חברת ניקיון',
    text: 'מאז שהצטרפנו לCleanPost, הכנסות החברה גדלו ב-40%. עבודות רציפות ולקוחות איכותיים.',
  },
  {
    name: 'דוד אברהם',
    role: 'קבלן שיפוצים',
    text: 'הפלטפורמה הכי טובה בשוק. שקיפות מחירים, חברות מאומתות, שירות מעולה.',
  },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="testimonials" className="py-24 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-gray-900 mb-16"
        >
          מה אומרים עלינו
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-blue-50 rounded-2xl p-8"
            >
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">"{t.text}"</p>
              <div>
                <div className="font-bold text-gray-900">{t.name}</div>
                <div className="text-gray-500 text-sm">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
