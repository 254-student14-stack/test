import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SignupModalProps {
  defaultTab: 'builder' | 'cleaner';
  onClose: () => void;
}

export default function SignupModal({ defaultTab, onClose }: SignupModalProps) {
  const [tab, setTab] = useState<'builder' | 'cleaner'>(defaultTab);
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">הצטרף לCleanPost</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            <button
              onClick={() => setTab('builder')}
              className={`flex-1 py-3 font-semibold transition-colors ${tab === 'builder' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              קבלן
            </button>
            <button
              onClick={() => setTab('cleaner')}
              className={`flex-1 py-3 font-semibold transition-colors ${tab === 'cleaner' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              חברת ניקיון
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">נרשמת בהצלחה!</h3>
              <p className="text-gray-600">ניצור איתך קשר בקרוב.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                required
                type="text"
                placeholder="שם מלא"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                required
                type="tel"
                placeholder="טלפון"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                required
                type="email"
                placeholder="אימייל"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                required
                type="text"
                placeholder="עיר"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className={`py-4 rounded-xl font-bold text-white text-lg transition-colors ${
                  tab === 'builder' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                הצטרף עכשיו
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
