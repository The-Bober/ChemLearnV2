
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, user, loading, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/learn';
  const { t } = useLanguage(); // Added

  useEffect(() => {
    if (user) {
      router.replace(redirectPath);
    }
  }, [user, router, redirectPath]);
  
  useEffect(() => {
    // Clear errors when the component mounts or when email/password changes
    clearError();
  }, [email, password, clearError]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    const loggedInUser = await signIn(email, password);
    if (loggedInUser) {
      router.push(redirectPath);
    }
  };
  
  if (loading && !user) { // Show loading only if not yet authenticated and loading
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user) { // If user becomes available (e.g. already logged in and state loaded)
    return null; // Redirect is handled by useEffect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-8 left-8">
        <Logo href="/" />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">{t('login.welcomeBack')}</CardTitle>
          <CardDescription>{t('login.signInContinue')}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>{t('login.failed')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('login.signingInButton') : t('login.signInButton')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground">
            {t('login.dontHaveAccount')}{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              {t('login.signUpLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

