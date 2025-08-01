import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useGuestGuard } from '@/hooks/useAuthGuard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
        </div>
        <AuthForm mode={mode} onModeChange={handleModeChange} />
      </div>
    </div>
  );
}