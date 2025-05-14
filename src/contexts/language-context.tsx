
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

    // Login Page
    'login.welcomeBack': 'Welcome Back!',
    'login.signInContinue': 'Sign in to continue your ChemLearn journey.',
    'login.emailLabel': 'Email',
    'login.emailPlaceholder': 'you@example.com',
    'login.passwordLabel': 'Password',
    'login.passwordPlaceholder': '••••••••',
    'login.signInButton': 'Sign In',
    'login.signingInButton': 'Signing In...',
    'login.dontHaveAccount': "Don't have an account?",
    'login.signUpLink': 'Sign Up',
    'login.failed': 'Login Failed',

    // Signup Page
    'signup.createAccount': 'Create Your Account',
    'signup.joinChemLearn': 'Join ChemLearn and start your chemistry adventure.',
    'signup.emailLabel': 'Email',
    'signup.emailPlaceholder': 'you@example.com',
    'signup.passwordLabel': 'Password',
    'signup.passwordPlaceholderSecure': '•••••••• (min. 6 characters)',
    'signup.confirmPasswordLabel': 'Confirm Password',
    'signup.confirmPasswordPlaceholder': '••••••••',
    'signup.signUpButton': 'Sign Up',
    'signup.creatingAccountButton': 'Creating Account...',
    'signup.alreadyHaveAccount': 'Already have an account?',
    'signup.signInLink': 'Sign In',
    'signup.failed': 'Sign Up Failed',
    'signup.passwordsDoNotMatch': 'Passwords do not match.',
    'signup.passwordTooShort': 'Password should be at least 6 characters long.',

    // UserNav
    'userNav.profile': 'Profile',
    'userNav.billing': 'Billing',
    'userNav.settings': 'Settings',
    'userNav.logout': 'Log out',
    'userNav.quizzesCompleted': 'Quizzes Completed:',
    'userNav.login': 'Login',
    'userNav.signUp': 'Sign Up',

    // Learn Page (src/app/(app)/learn/page.tsx)
    'learn.welcome': 'Welcome to Your Learning Journey!',
    'learn.explore': 'Explore lectures, dive into lessons, and test your knowledge with quizzes.',
    'learn.featuredLectures': 'Featured Lectures',
    'learn.noLectures': 'No lectures available yet. Check back soon!',
    'learn.startLecture': 'Start Lecture',
    'learn.lessonsUnit': 'Lessons', // e.g., "3 Lessons"
    'learn.quickActions': 'Quick Actions',
    'learn.periodicTable': 'Periodic Table',
    'learn.exploreElements': 'Explore the elements.',
    'learn.viewTable': 'View Table',
    'learn.glossary': 'Glossary',
    'learn.chemistryTerms': 'Chemistry terms explained.',
    'learn.openGlossary': 'Open Glossary',

    // All Lectures Page (src/app/(app)/learn/lectures/page.tsx)
    'lectures.allLectures': 'All Lectures',
    'lectures.browse': 'Browse through all available chemistry lectures.',
    'lectures.viewLecture': 'View Lecture',
    'lectures.noLecturesYet': 'No Lectures Available Yet',
    'lectures.checkBackLater': 'Please check back later for new content!',

    // Quizzes Page (src/app/quizzes/page.tsx)
    'quizzes.testKnowledge': 'Test Your Knowledge',
    'quizzes.challengeYourself': 'Challenge yourself with our chemistry quizzes. Select a quiz below to begin.',
    'quizzes.questionsUnit': 'Questions', // e.g., "10 Questions"
    'quizzes.durationUnit': 'Minutes', // e.g., "15 Minutes"
    'quizzes.relatedTo': 'Related to', // e.g., "Related to Lesson: Intro to Acids"
    'quizzes.takeQuiz': 'Take Quiz',
    'quizzes.noQuizzesYet': 'No Quizzes Available Yet',
    'quizzes.checkBackLaterQuizzes': 'Please check back later for new quizzes!',
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

    // Login Page
    'login.welcomeBack': 'Willkommen zurück!',
    'login.signInContinue': 'Melden Sie sich an, um Ihre ChemLearn-Reise fortzusetzen.',
    'login.emailLabel': 'E-Mail',
    'login.emailPlaceholder': 'deine@email.com',
    'login.passwordLabel': 'Passwort',
    'login.passwordPlaceholder': '••••••••',
    'login.signInButton': 'Anmelden',
    'login.signingInButton': 'Anmelden...',
    'login.dontHaveAccount': 'Sie haben noch kein Konto?',
    'login.signUpLink': 'Registrieren',
    'login.failed': 'Anmeldung fehlgeschlagen',

    // Signup Page
    'signup.createAccount': 'Konto erstellen',
    'signup.joinChemLearn': 'Treten Sie ChemLearn bei und beginnen Sie Ihr Chemie-Abenteuer.',
    'signup.emailLabel': 'E-Mail',
    'signup.emailPlaceholder': 'deine@email.com',
    'signup.passwordLabel': 'Passwort',
    'signup.passwordPlaceholderSecure': '•••••••• (mind. 6 Zeichen)',
    'signup.confirmPasswordLabel': 'Passwort bestätigen',
    'signup.confirmPasswordPlaceholder': '••••••••',
    'signup.signUpButton': 'Registrieren',
    'signup.creatingAccountButton': 'Konto wird erstellt...',
    'signup.alreadyHaveAccount': 'Haben Sie bereits ein Konto?',
    'signup.signInLink': 'Anmelden',
    'signup.failed': 'Registrierung fehlgeschlagen',
    'signup.passwordsDoNotMatch': 'Passwörter stimmen nicht überein.',
    'signup.passwordTooShort': 'Passwort muss mindestens 6 Zeichen lang sein.',

    // UserNav
    'userNav.profile': 'Profil',
    'userNav.billing': 'Abrechnung',
    'userNav.settings': 'Einstellungen',
    'userNav.logout': 'Abmelden',
    'userNav.quizzesCompleted': 'Abgeschlossene Quizze:',
    'userNav.login': 'Anmelden',
    'userNav.signUp': 'Registrieren',
    
    // Learn Page (src/app/(app)/learn/page.tsx)
    'learn.welcome': 'Willkommen auf Ihrer Lernreise!',
    'learn.explore': 'Entdecken Sie Vorlesungen, vertiefen Sie sich in Lektionen und testen Sie Ihr Wissen mit Quizzen.',
    'learn.featuredLectures': 'Empfohlene Vorlesungen',
    'learn.noLectures': 'Noch keine Vorlesungen verfügbar. Schauen Sie bald wieder vorbei!',
    'learn.startLecture': 'Vorlesung starten',
    'learn.lessonsUnit': 'Lektionen',
    'learn.quickActions': 'Schnellaktionen',
    'learn.periodicTable': 'Periodensystem',
    'learn.exploreElements': 'Entdecken Sie die Elemente.',
    'learn.viewTable': 'Tabelle anzeigen',
    'learn.glossary': 'Glossar',
    'learn.chemistryTerms': 'Chemische Begriffe erklärt.',
    'learn.openGlossary': 'Glossar öffnen',

    // All Lectures Page (src/app/(app)/learn/lectures/page.tsx)
    'lectures.allLectures': 'Alle Vorlesungen',
    'lectures.browse': 'Durchsuchen Sie alle verfügbaren Chemie-Vorlesungen.',
    'lectures.viewLecture': 'Vorlesung ansehen',
    'lectures.noLecturesYet': 'Noch keine Vorlesungen verfügbar',
    'lectures.checkBackLater': 'Bitte schauen Sie später wieder für neue Inhalte vorbei!',

    // Quizzes Page (src/app/quizzes/page.tsx)
    'quizzes.testKnowledge': 'Testen Sie Ihr Wissen',
    'quizzes.challengeYourself': 'Fordern Sie sich mit unseren Chemie-Quizzen heraus. Wählen Sie unten ein Quiz aus, um zu beginnen.',
    'quizzes.questionsUnit': 'Fragen',
    'quizzes.durationUnit': 'Minuten',
    'quizzes.relatedTo': 'Bezogen auf',
    'quizzes.takeQuiz': 'Quiz starten',
    'quizzes.noQuizzesYet': 'Noch keine Quizze verfügbar',
    'quizzes.checkBackLaterQuizzes': 'Bitte schauen Sie später wieder für neue Quizze vorbei!',
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

    // Login Page
    'login.welcomeBack': 'Bine ai revenit!',
    'login.signInContinue': 'Autentifică-te pentru a continua călătoria ta ChemLearn.',
    'login.emailLabel': 'Email',
    'login.emailPlaceholder': 'emailul@tau.ro',
    'login.passwordLabel': 'Parolă',
    'login.passwordPlaceholder': '••••••••',
    'login.signInButton': 'Autentificare',
    'login.signingInButton': 'Autentificare...',
    'login.dontHaveAccount': 'Nu ai un cont?',
    'login.signUpLink': 'Înregistrează-te',
    'login.failed': 'Autentificare eșuată',

    // Signup Page
    'signup.createAccount': 'Creează Contul Tău',
    'signup.joinChemLearn': 'Alătură-te ChemLearn și începe aventura ta în chimie.',
    'signup.emailLabel': 'Email',
    'signup.emailPlaceholder': 'emailul@tau.ro',
    'signup.passwordLabel': 'Parolă',
    'signup.passwordPlaceholderSecure': '•••••••• (min. 6 caractere)',
    'signup.confirmPasswordLabel': 'Confirmă Parola',
    'signup.confirmPasswordPlaceholder': '••••••••',
    'signup.signUpButton': 'Înregistrează-te',
    'signup.creatingAccountButton': 'Se creează contul...',
    'signup.alreadyHaveAccount': 'Ai deja un cont?',
    'signup.signInLink': 'Autentificare',
    'signup.failed': 'Înregistrare eșuată',
    'signup.passwordsDoNotMatch': 'Parolele nu se potrivesc.',
    'signup.passwordTooShort': 'Parola trebuie să aibă cel puțin 6 caractere.',

    // UserNav
    'userNav.profile': 'Profil',
    'userNav.billing': 'Facturare',
    'userNav.settings': 'Setări',
    'userNav.logout': 'Deconectare',
    'userNav.quizzesCompleted': 'Chestionare finalizate:',
    'userNav.login': 'Autentificare',
    'userNav.signUp': 'Înregistrare',

    // Learn Page (src/app/(app)/learn/page.tsx)
    'learn.welcome': 'Bun venit în călătoria ta de învățare!',
    'learn.explore': 'Explorează prelegeri, aprofundează lecții și testează-ți cunoștințele cu chestionare.',
    'learn.featuredLectures': 'Prelegeri Recomandate',
    'learn.noLectures': 'Nicio prelegere disponibilă momentan. Revino în curând!',
    'learn.startLecture': 'Începe Prelegerea',
    'learn.lessonsUnit': 'Lecții',
    'learn.quickActions': 'Acțiuni Rapide',
    'learn.periodicTable': 'Tabelul Periodic',
    'learn.exploreElements': 'Explorează elementele.',
    'learn.viewTable': 'Vezi Tabelul',
    'learn.glossary': 'Glosar',
    'learn.chemistryTerms': 'Termeni de chimie explicați.',
    'learn.openGlossary': 'Deschide Glosarul',

    // All Lectures Page (src/app/(app)/learn/lectures/page.tsx)
    'lectures.allLectures': 'Toate Prelegerile',
    'lectures.browse': 'Răsfoiește toate prelegerile de chimie disponibile.',
    'lectures.viewLecture': 'Vezi Prelegerea',
    'lectures.noLecturesYet': 'Nicio Prelegere Disponibilă Momentan',
    'lectures.checkBackLater': 'Te rugăm să revii mai târziu pentru conținut nou!',

    // Quizzes Page (src/app/quizzes/page.tsx)
    'quizzes.testKnowledge': 'Testează-ți Cunoștințele',
    'quizzes.challengeYourself': 'Provoacă-te cu chestionarele noastre de chimie. Selectează un chestionar de mai jos pentru a începe.',
    'quizzes.questionsUnit': 'Întrebări',
    'quizzes.durationUnit': 'Minute',
    'quizzes.relatedTo': 'Legat de',
    'quizzes.takeQuiz': 'Începe Chestionarul',
    'quizzes.noQuizzesYet': 'Niciun Chestionar Disponibil Momentan',
    'quizzes.checkBackLaterQuizzes': 'Te rugăm să revii mai târziu pentru chestionare noi!',
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

