export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="text-white text-xl font-bold mb-3">CleanPost | קלינפוסט</div>
            <p className="text-sm leading-relaxed">מחברים בין קבלנים לניקיון מקצועי</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">קישורים</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="hover:text-white transition-colors">אודות</a>
              <a href="#" className="hover:text-white transition-colors">צור קשר</a>
              <a href="#" className="hover:text-white transition-colors">תנאי שימוש</a>
              <a href="#" className="hover:text-white transition-colors">פרטיות</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">יצירת קשר</h4>
            <div className="flex flex-col gap-2 text-sm">
              <span>info@cleanpost.co.il</span>
              <span>03-1234567</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          © 2024 CleanPost. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
}
