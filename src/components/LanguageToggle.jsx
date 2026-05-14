import { FiGlobe } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

export const LanguageToggle = () => {
  const { language, toggleLanguage, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-navy-800 transition"
        title={language === 'en' ? 'Switch to Swahili' : 'Switch to English'}
      >
        <FiGlobe className="w-4 h-4" />
        <span className="text-sm font-semibold uppercase">
          {language === 'en' ? 'EN' : 'SW'}
        </span>
      </button>
    </div>
  );
};

export const LanguageSelector = () => {
  const { language, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-sand-100 rounded-xl p-1">
      <button
        onClick={() => setLang('sw')}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
          language === 'sw'
            ? 'bg-amber-500 text-white shadow-sm'
            : 'text-sand-500 hover:text-navy-800'
        }`}
      >
        Kiswahili
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
          language === 'en'
            ? 'bg-amber-500 text-white shadow-sm'
            : 'text-sand-500 hover:text-navy-800'
        }`}
      >
        English
      </button>
    </div>
  );
};

export default LanguageToggle;
