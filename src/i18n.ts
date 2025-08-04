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
    statusReady: 'Ready',
    statusAway: 'Away',
    statusOffline: 'Offline',
    statusUnknown: 'Unknown',
    snoozedTitle: 'Snoozed',
    snoozedDescription: 'You are currently snoozed.',
    partnerSnoozedTitle: 'Partner snoozed',
    partnerSnoozedDescription: 'Your partner is currently snoozed.',
    catchUpLater: "Thanks, we'll catch up later!",
    notAvailable: '⏰ Not available',
    messagingUnavailableSnooze: 'Messaging unavailable during snooze',
    typeMessagePlaceholder: 'Type your message...',
    onboardingCodePulseTitle: 'Pulse Code',
    onboardingCodePulseDesc: 'Express your feelings with discreet pulses.',
    onboardingStatusTitle: 'Status',
    onboardingStatusDesc: 'Share your availability in real time.',
    onboardingAgendaTitle: 'Agenda',
    onboardingAgendaDesc: 'Plan moments together effortlessly.',
    connectionRequired: 'Connection required',
  },
  fr: {
    addFirstAvailability: 'Ajoutez votre première disponibilité',
    createAccount: 'Créer un compte',
    joinPartner: 'Rejoindre mon/ma partenaire',
    invitePartner: 'Inviter mon/ma partenaire',
    notLinked: 'Pas de partenaire lié',
    useFaceID: 'Utiliser Face ID',
    autoDelete30d: 'Supprimer automatiquement les messages après 30 jours',
    sent: 'Pulse envoyé !',
    statusReady: 'Prêt',
    statusAway: 'Absent',
    statusOffline: 'Hors ligne',
    statusUnknown: 'Inconnu',
    snoozedTitle: 'En pause',
    snoozedDescription: 'Vous êtes actuellement en pause.',
    partnerSnoozedTitle: 'Partenaire en pause',
    partnerSnoozedDescription: 'Votre partenaire est actuellement en pause.',
    catchUpLater: 'Merci, on se retrouve plus tard !',
    notAvailable: '⏰ Pas dispo',
    messagingUnavailableSnooze: 'Messagerie indisponible pendant la pause',
    typeMessagePlaceholder: 'Écrivez votre message…',
    onboardingCodePulseTitle: 'Code Pulse',
    onboardingCodePulseDesc: 'Exprimez vos envies par pulsations discrètes.',
    onboardingStatusTitle: 'Statut',
    onboardingStatusDesc: 'Partagez votre disponibilité en temps réel.',
    onboardingAgendaTitle: 'Agenda',
    onboardingAgendaDesc: 'Planifiez des moments à deux facilement.',
    connectionRequired: 'Connexion requise',
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


