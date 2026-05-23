import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import en from '../i18n/locales/en.json';
import am from '../i18n/locales/am.json';
import om from '../i18n/locales/om.json';

const PACKS = { en, am, om };
const STORAGE_KEY = 'finoteschool_locale';

const I18nContext = createContext(null);

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), obj);
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return PACKS[saved] ? saved : 'en';
  });

  const setLocale = useCallback((code) => {
    if (!PACKS[code]) return;
    localStorage.setItem(STORAGE_KEY, code);
    setLocaleState(code);
    document.documentElement.lang = code === 'am' ? 'am' : code === 'om' ? 'om' : 'en';
  }, []);

  const t = useCallback((key, fallbackOrVars, maybeVars) => {
    let fallback = typeof fallbackOrVars === 'string' ? fallbackOrVars : undefined;
    const vars = typeof fallbackOrVars === 'object' && fallbackOrVars !== null
      ? fallbackOrVars
      : maybeVars;
    let v = get(PACKS[locale], key);
    if (v == null) v = get(PACKS.en, key);
    if (v == null) v = fallback ?? key;
    if (vars && typeof v === 'string') {
      return v.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''));
    }
    return v;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t, locales: ['en', 'am', 'om'] }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export default I18nContext;
