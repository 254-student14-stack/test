import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const builderSteps = [
  { num: '1', title: 'פרסם פרויקט', text: 'תאר את הפרויקט, גודל השטח ומועד הסיום הרצוי' },
  { num: '2', title: 'קבל הצעות', text: 'חברות ניקיון מאומתות ישלחו הצעות מחיר תוך שעות' },
  { num: '3', title: 'בחר וסיים', text: 'בחר את ההצעה המתאימה, שלם בטוח וקבל ניקיון מקצועי' },
];

const cleanerSteps = [
  { num: '1', title: 'הירשם בחינם', text: 'צור פרופיל חברה עם תיאור שירותים ואזורי פעילות' },
  { num: '2', title: 'קבל התראות', text: 'קבל התראות על פרויקטים חדשים באזורך בזמן אמת' },
  { num: '3', title: 'עבוד ותרוויח', text: 'השלם עבודות, קבל דירוגים ובנה מוניטין חזק' },
];

function Steps({ steps, color }: { steps: typeof builderSteps; color: string }) {
  return (
    <div className="flex flex-col gap-6">
      {steps.map((s, i) => (
        <div key={s.num} className="flex gap-4 items-start">
          <div className={`w-10 h-10 rounded-full ${color} text-white flex items-center justify-center font-bold text-lg flex-shrink-0`}>
            {s.num}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg">{s.title}</h4>
            <p className="text-gray-600 mt-1">{s.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how" className="py-24 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-gray-900 mb-16"
        >
          איך זה עובד?
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-blue-50 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-blue-700 mb-8">לקבלנים</h3>
            <Steps steps={builderSteps} color="bg-blue-600" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-green-50 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-green-700 mb-8">לחברות ניקיון</h3>
            <Steps steps={cleanerSteps} color="bg-green-500" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
