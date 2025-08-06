import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';

const NetworkStatusBanner = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="w-full bg-red-600 text-white text-center py-2 text-sm">
      {t('connectionRequired')}
    </div>
  );
};

export default NetworkStatusBanner;
