import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language || 'en';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase">{currentLang}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute rtl:left-0 ltr:right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
          >
            <div className="p-2 space-y-1">
              <button
                onClick={() => changeLanguage('en')}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between",
                  currentLang === 'en' ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                )}
              >
                English
                {currentLang === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>}
              </button>
              <button
                onClick={() => changeLanguage('ar')}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between",
                  currentLang === 'ar' ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                )}
              >
                العربية
                {currentLang === 'ar' && <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
