import { useEffect, useState } from 'react';

const translations = {
  en: {
    createAccount: 'Create account',
    joinPartner: 'Join partner',
    invitePartner: 'Invite partner',
    useFaceID: 'Use Face ID',
  },
  fr: {
    createAccount: 'Créer un compte',
    joinPartner: 'Rejoindre mon/ma partenaire',
    invitePartner: 'Inviter mon/ma partenaire',
    useFaceID: 'Utiliser Face ID',
  },
} as const;

export type TranslationKey = keyof typeof translations['en'];
type Lang = keyof typeof translations;

const STORAGE_KEY = 'lang';

let currentLang: Lang = (typeof localStorage !== 'undefined' &&
  (localStorage.getItem(STORAGE_KEY) as Lang | null)) ||
  (navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en');

const listeners = new Set<() => void>();

export const setLang = (lang: Lang) => {
  currentLang = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
  listeners.forEach((l) => l());
};

export const useTranslation = () => {
  const [lang, setLangState] = useState<Lang>(currentLang);

  useEffect(() => {
    const listener = () => setLangState(currentLang);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const t = (key: TranslationKey) => translations[lang][key];
  return { t, lang, setLang };
};


