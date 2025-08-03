import { useCallback, useEffect, useRef } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const timer = setTimeout(finish, 1000);
    const events: Array<keyof DocumentEventMap> = ['click', 'keydown', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, finish));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, finish));
    };
  }, [finish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <img
        src="/placeholder.svg"
        alt="Logo"
        className="h-32 w-32 animate-pulse"
        style={{ animationDuration: '1s' }}
      />
    </div>
  );
};

export default SplashScreen;
