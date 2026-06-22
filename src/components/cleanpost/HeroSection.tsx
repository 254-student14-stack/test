import { motion } from 'framer-motion';

interface HeroProps {
  onSignup: (type: 'builder' | 'cleaner') => void;
}

export default function HeroSection({ onSignup }: HeroProps) {
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center pt-20">
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
        >
          הפלטפורמה שמחברת בין קבלנים
          <br />
          <span className="text-blue-600">לחברות ניקיון לאחר שיפוץ</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
        >
          מצא חברות ניקיון מקצועיות לפרויקט שלך, או קבל עבודות ניקיון רציפות כחברת ניקיון
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button
            onClick={() => onSignup('builder')}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            אני קבלן — מחפש ניקיון
          </button>
          <button
            onClick={() => onSignup('cleaner')}
            className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
          >
            אני חברת ניקיון — רוצה עבודות
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6 text-gray-600"
        >
          {['500+ קבלנים', '200+ חברות ניקיון', '98% שביעות רצון'].map((stat) => (
            <div key={stat} className="flex items-center gap-2">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-semibold">{stat}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
