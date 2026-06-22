import { useState, useEffect } from 'react';

interface HeaderProps {
  onSignup: (type: 'builder' | 'cleaner') => void;
}

export default function Header({ onSignup }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-blue-600">CleanPost | קלינפוסט</div>
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <a href="#how" className="hover:text-blue-600 transition-colors">איך זה עובד</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">יתרונות</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">המלצות</a>
          <a href="#faq" className="hover:text-blue-600 transition-colors">שאלות נפוצות</a>
        </nav>
        <button
          onClick={() => onSignup('builder')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          הצטרף בחינם
        </button>
      </div>
    </header>
  );
}
