
import { getAllQuizzesEnriched, type EnrichedQuiz as EnrichedQuizListItem } from "@/services/quizService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, HelpCircle, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { translationsStore, type Locale } from "@/lib/translations";
import { Logo } from "@/components/logo"; // Added
import { ModeToggle } from "@/components/mode-toggle"; // Added
import { LanguageSwitcher } from "@/components/language-switcher"; // Added

const getTranslationsForServer = (locale: string = 'en') => {
  return translationsStore[locale as Locale] || translationsStore['en'];
};

export default async function QuizzesPage() {
  const t = getTranslationsForServer('en');
  const quizzes: EnrichedQuizListItem[] = await getAllQuizzesEnriched();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex"> {/* Always show logo */}
            <Logo href="/" />
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center gap-2">
              <ModeToggle />
              <LanguageSwitcher />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="space-y-8">
            <header className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">{t['quizzes.testKnowledge']}</h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                {t['quizzes.challengeYourself']}
              </p>
            </header>

            {quizzes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map(quiz => (
                  <Card key={quiz.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl">{quiz.title}</CardTitle>
                      {quiz.description && (
                        <CardDescription>{quiz.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <HelpCircle className="mr-2 h-4 w-4 text-accent" />
                        <span>{quiz.questionsCount} {t['quizzes.questionsUnit']}</span>
                      </div>
                      {quiz.durationMinutes && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Timer className="mr-2 h-4 w-4 text-accent" />
                          <span>{quiz.durationMinutes} {t['quizzes.durationUnit']}</span>
                        </div>
                      )}
                      {quiz.associatedTitle && quiz.associatedType && quiz.associatedType !== 'N/A' && (
                        <Badge variant="secondary" className="mt-1">
                          {t['quizzes.relatedTo']} {quiz.associatedType}: {quiz.associatedTitle}
                        </Badge>
                      )}
                    </CardContent>
                    <div className="p-6 pt-0 mt-auto">
                      <Button asChild className="w-full">
                        {/* Assuming users need to be logged in to take quizzes, this link might go through auth flow */}
                        <Link href={`/learn/quizzes/${quiz.id}/take`}>
                          {t['quizzes.takeQuiz']} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-10 text-center">
                  <HelpCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold">{t['quizzes.noQuizzesYet']}</p>
                  <p className="text-muted-foreground">{t['quizzes.checkBackLaterQuizzes']}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t bg-background">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} ChemLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
