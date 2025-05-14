
'use client';

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/mode-toggle"; // Added ModeToggle

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Logo iconSize={32} textSize="text-2xl" href="/" /> {/* Ensure href is explicitly set */}
        <div className="flex items-center gap-2">
          <ModeToggle /> {/* Added ModeToggle */}
          <LanguageSwitcher />
        </div>
      </header>

      <main className="text-center flex flex-col items-center space-y-8">
        <div className="relative w-48 h-48 md:w-64 md:h-64">
          <Image
            src="https://images.theconversation.com/files/553049/original/file-20231010-21-ljmz9o.jpg?ixlib=rb-4.1.0&rect=49%2C74%2C5450%2C3586&q=45&auto=format&w=926&fit=clip"
            alt="Abstract Chemistry"
            fill
            priority
            className="rounded-full object-cover shadow-2xl"
            data-ai-hint="abstract chemistry"
          />
           <div className="absolute inset-0 bg-primary/30 rounded-full mix-blend-multiply"></div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          {t('welcome.title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          {t('welcome.description')}
        </p>
        <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
          {loading ? (
            <>
              <Skeleton className="h-11 w-40" />
              <Skeleton className="h-11 w-32" />
            </>
          ) : user ? (
            <>
              <Button asChild size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/50 transition-shadow">
                <Link href="/learn">{t('startLearning.button')}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/50 transition-shadow">
                <Link href="/login">{t('login.button')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/signup">{t('signup.button')}</Link>
              </Button>
            </>
          )}
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ChemLearn. All rights reserved.
      </footer>
    </div>
  );
}
