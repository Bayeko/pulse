import { useEffect, useState } from 'react';

const translations = {
  en: {
    addFirstAvailability: 'Add your first availability',
    createAccount: 'Create account',
    joinPartner: 'Join partner',
    invitePartner: 'Invite partner',
    notLinked: 'Not linked to a partner',
    useFaceID: 'Use Face ID',
    autoDelete30d: 'Auto delete messages after 30 days',
    sent: 'Pulse sent!',
 codex/extract-and-reference-carousel-texts
    introCodePulseTitle: 'Code Pulse',
    introCodePulseDescription: 'Express your desires through subtle pulses.',
    introStatusTitle: 'Status',
    introStatusDescription: 'Share your availability in real time.',
    introAgendaTitle: 'Agenda',
    introAgendaDescription: 'Plan moments together effortlessly.',

    statusReadyLabel: 'Ready',
    statusReadyDescription: 'Available for connection',
    statusBusyLabel: 'Busy',
    statusBusyDescription: 'Catch you later',
    statusNotAvailableLabel: 'Not Available',
    statusNotAvailableDescription: 'Need a moment',
 main
  },
  fr: {
    addFirstAvailability: 'Ajoutez votre première disponibilité',
    createAccount: 'Créer un compte',
    joinPartner: 'Rejoindre mon/ma partenaire',
    invitePartner: 'Inviter mon/ma partenaire',
    notLinked: 'Pas de partenaire lié',
    useFaceID: 'Utiliser Face ID',
    autoDelete30d: 'Supprimer automatiquement les messages après 30 jours',
    sent: 'Pulse envoyé !',
 codex/extract-and-reference-carousel-texts
    introCodePulseTitle: 'Code Pulse',
    introCodePulseDescription: 'Exprime tes envies par de discrètes pulsations.',
    introStatusTitle: 'Statut',
    introStatusDescription: 'Partage ta disponibilité en temps réel.',
    introAgendaTitle: 'Agenda',
    introAgendaDescription: 'Planifie des moments à deux en toute simplicité.',

    statusReadyLabel: 'Prêt',
    statusReadyDescription: 'Disponible pour se connecter',
    statusBusyLabel: 'Occupé',
    statusBusyDescription: 'À plus tard',
    statusNotAvailableLabel: 'Indisponible',
    statusNotAvailableDescription: "Besoin d'un moment",
 main
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


