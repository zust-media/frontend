import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, languages } = useContext(LanguageContext);

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[1];

  return (
    <div className="dropdown dropdown-top w-full">
      <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 w-full justify-start">
        <Globe size={18} />
        <span className="flex-1 text-left">{currentLang.nativeName}</span>
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
        {languages.map((lang) => (
          <li key={lang.code}>
            <a
              className={currentLanguage === lang.code ? 'active' : ''}
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.nativeName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LanguageSwitcher;