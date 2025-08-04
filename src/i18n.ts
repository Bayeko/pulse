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
 codex/add-translation-key-for-refusal-text
    laterThanks: 'Thanks for letting us know. We\'ll check back later!',

 codex/remove-merge-markers-and-update-translations
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
 main
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
 codex/remove-merge-markers-and-update-translations
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

    sent: 'Pulse envoyé !',
 codex/add-translation-key-for-refusal-text
    laterThanks: 'Merci de nous l\'avoir signalé ! On se retrouve plus tard !',

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
 main
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


