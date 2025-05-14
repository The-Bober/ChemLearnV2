
import { getAllQuizzesEnriched, type EnrichedQuiz as EnrichedQuizListItem } from "@/services/quizService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, HelpCircle, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// For server component i18n, direct import or passed props are alternatives. See note in learn/page.tsx
import { translationsStore } from "@/contexts/language-context"; 

// Helper to get translations on the server for a specific locale
const getTranslationsForServer = (locale: string = 'en') => {
  return translationsStore[locale as keyof typeof translationsStore] || translationsStore['en'];
};


export default async function QuizzesPage() {
  const t = getTranslationsForServer('en'); // Or pass locale if available
  const quizzes: EnrichedQuizListItem[] = await getAllQuizzesEnriched();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t['quizzes.testKnowledge']}</h1>
        <p className="text-muted-foreground text-lg">
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
          <CardContent className="p-6 text-center">
            <HelpCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold">{t['quizzes.noQuizzesYet']}</p>
            <p className="text-muted-foreground">{t['quizzes.checkBackLaterQuizzes']}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
