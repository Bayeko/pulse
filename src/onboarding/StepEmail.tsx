import React, { useState } from 'react';
import { AuthCard } from '../components/auth/auth-card';

export const StepEmail: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'connect'>('login');

  return (
    <div className="w-full flex justify-center">
      <AuthCard mode={mode} onModeChange={setMode} />
    </div>
  );
};
