
'use client';

import type { PropsWithChildren } from 'react';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

type Locale = 'en' | 'de' | 'ro';

interface Translations {
  [key: string]: string;
}

interface LocaleTranslations {
  [locale: string]: Translations;
}

// Sample translations (for a real app, these would come from JSON files)
const translationsStore: LocaleTranslations = {
  en: {
    'welcome.title': 'Welcome to ChemLearn',
    'welcome.description': 'Unlock the fascinating world of chemistry with engaging lessons, interactive quizzes, and a personalized learning experience.',
    'nav.learnDashboard': 'Learn Dashboard',
    'nav.allLectures': 'All Lectures',
    'nav.quizzes': 'Quizzes',
    'nav.adminPanel': 'Admin Panel',
    'languageSwitcher.changeLanguage': 'Change Language',
    'language.english': 'English',
    'language.german': 'German',
    'language.romanian': 'Romanian',
    'login.button': 'Login to Learn',
    'signup.button': 'Sign Up',
    'startLearning.button': 'Start Learning Now',

  },
  de: {
    'welcome.title': 'Willkommen bei ChemLearn',
    'welcome.description': 'Entdecken Sie die faszinierende Welt der Chemie mit spannenden Lektionen, interaktiven Quizfragen und einer personalisierten Lernerfahrung.',
    'nav.learnDashboard': 'Lern-Dashboard',
    'nav.allLectures': 'Alle Vorlesungen',
    'nav.quizzes': 'Quizze',
    'nav.adminPanel': 'Admin-Panel',
    'languageSwitcher.changeLanguage': 'Sprache ändern',
    'language.english': 'Englisch',
    'language.german': 'Deutsch',
    'language.romanian': 'Rumänisch',
    'login.button': 'Zum Lernen anmelden',
    'signup.button': 'Registrieren',
    'startLearning.button': 'Jetzt mit dem Lernen beginnen',
  },
  ro: {
    'welcome.title': 'Bun venit la ChemLearn',
    'welcome.description': 'Descoperiți lumea fascinantă a chimiei cu lecții captivante, chestionare interactive și o experiență de învățare personalizată.',
    'nav.learnDashboard': 'Panou Învățare',
    'nav.allLectures': 'Toate Prelegerile',
    'nav.quizzes': 'Chestionare',
    'nav.adminPanel': 'Panou Admin',
    'languageSwitcher.changeLanguage': 'Schimbă Limba',
    'language.english': 'Engleză',
    'language.german': 'Germană',
    'language.romanian': 'Română',
    'login.button': 'Autentifică-te pentru a învăța',
    'signup.button': 'Înregistrează-te',
    'startLearning.button': 'Începe să înveți acum',
  },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>('en'); // Default to English

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string): string => {
    return translationsStore[locale]?.[key] || translationsStore['en']?.[key] || key;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
