import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={i18n.language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('en')}
      >
        EN
      </Button>
      <Button
        variant={i18n.language === 'fr' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('fr')}
      >
        FR
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
