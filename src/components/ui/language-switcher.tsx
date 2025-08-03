import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useTranslation } from '@/i18n';

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useTranslation();

  return (
    <Select value={lang} onValueChange={(value: string) => setLang(value as 'en' | 'fr')}>
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
      </SelectContent>
    </Select>
  );
};
