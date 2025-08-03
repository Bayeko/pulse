const translations = {
  en: {
    createAccount: 'Create account',
    joinPartner: 'Join partner',
  },
  fr: {
    createAccount: 'Créer un compte',
    joinPartner: 'Rejoindre mon/ma partenaire',
  },
} as const;

export type TranslationKey = keyof typeof translations['en'];

export const useTranslation = () => {
  const lang = navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  const t = (key: TranslationKey) => translations[lang][key];
  return { t, lang };
};

