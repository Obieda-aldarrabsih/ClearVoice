import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

const savedLanguage = localStorage.getItem('appLanguage') || 'en';

// Set initial document direction based on language
document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('appLanguage', lng);
});

export default i18n;
