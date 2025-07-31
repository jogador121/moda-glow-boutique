import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useGuestGuard } from '@/hooks/useAuthGuard';

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  
  // Redirect authenticated users
  useGuestGuard();

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup' || modeParam === 'reset') {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleModeChange = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    setSearchParams({ mode: newMode });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm mode={mode} onModeChange={handleModeChange} />
      </div>
    </div>
  );
}