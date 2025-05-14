
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Logo } from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context'; // Added

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, user, loading, error, clearError } = useAuth();
  const router = useRouter();
  const [clientError, setClientError] = useState<string | null>(null);
  const { t } = useLanguage(); // Added

  useEffect(() => {
    if (user) {
      router.replace('/learn');
    }
  }, [user, router]);

  useEffect(() => {
    clearError();
    setClientError(null);
  }, [email, password, confirmPassword, clearError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setClientError(null);

    if (password !== confirmPassword) {
      setClientError(t('signup.passwordsDoNotMatch'));
      return;
    }
    if (password.length < 6) {
      setClientError(t('signup.passwordTooShort'));
      return;
    }

    const signedUpUser = await signUp(email, password);
    if (signedUpUser) {
      router.push('/learn');
    }
  };
  
  if (loading && !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-8 left-8">
        <Logo href="/" />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">{t('signup.createAccount')}</CardTitle>
          <CardDescription>{t('signup.joinChemLearn')}</CardDescription>
        </CardHeader>
        <CardContent>
          {(error || clientError) && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>{t('signup.failed')}</AlertTitle>
              <AlertDescription>{error || clientError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('signup.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('signup.passwordPlaceholderSecure')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('signup.confirmPasswordLabel')}</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder={t('signup.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('signup.creatingAccountButton') : t('signup.signUpButton')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground">
            {t('signup.alreadyHaveAccount')}{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t('signup.signInLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
