import { createRoot } from 'react-dom/client';
import { useCallback, useState } from 'react';
import App from './App.tsx';
import SplashScreen from './components/splash-screen';
import './index.css';

const Main = () => {
  const [showSplash, setShowSplash] = useState(
    () => localStorage.getItem('splashShown') !== 'true'
  );

  const handleFinish = useCallback(() => {
    localStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  }, []);

  return showSplash ? <SplashScreen onFinish={handleFinish} /> : <App />;
};

export default Main;

createRoot(document.getElementById('root')!).render(<Main />);
