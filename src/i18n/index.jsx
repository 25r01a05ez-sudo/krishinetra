/**
 * Minimal i18n. To add Hindi / Telugu, fill in src/i18n/hi.js and te.js with VERIFIED
 * translations (keys identical to en.js) and set `available: true` below.
 * Any missing key automatically falls back to English.
 */
import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import en from './en';
import hi from './hi';
import te from './te';

export const LANGUAGES = [
  { code: 'en', label: 'English', dict: en, available: true },
  { code: 'hi', label: 'हिन्दी (Hindi)', dict: hi, available: false },
  { code: 'te', label: 'తెలుగు (Telugu)', dict: te, available: false },
];

const I18nContext = createContext({ t: (k) => k, lang: 'en', setLang: () => {} });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('krishinetra.lang');
      return LANGUAGES.find((l) => l.code === saved && l.available) ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = useCallback((code) => {
    const target = LANGUAGES.find((l) => l.code === code && l.available);
    if (!target) return;
    setLangState(code);
    try {
      localStorage.setItem('krishinetra.lang', code);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => {
    const dict = LANGUAGES.find((l) => l.code === lang)?.dict || en;
    return { lang, setLang, t: (key) => dict[key] ?? en[key] ?? key };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useT = () => useContext(I18nContext);
