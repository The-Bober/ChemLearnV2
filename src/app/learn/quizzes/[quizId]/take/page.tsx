
import { getQuizById } from "@/services/quizService";
import type { Quiz } from "@/types";
import { QuizTaker } from "@/components/learn/quiz-taker";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { translationsStore, type Locale } from "@/lib/translations";

interface QuizPageProps {
  params: {
    quizId: string;
  };
}

const getTranslationsForServer = (locale: string = 'en') => {
  return translationsStore[locale as Locale] || translationsStore['en'];
};

export default async function TakeQuizPage({ params }: QuizPageProps) {
  const quiz = await getQuizById(params.quizId);
  const t = getTranslationsForServer('en'); // Assuming 'en' for now, or pass locale

  if (!quiz) {
    notFound();
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <Card className="w-full max-w-md p-8 shadow-xl">
            <CardHeader>
                <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
                <CardTitle className="text-2xl font-semibold">{t['quiz.quizNotReadyTitle']}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-lg text-muted-foreground">
                {t['quiz.quizNotReadyDescription'].replace('{quizTitle}', quiz.title)}
                </CardDescription>
                <Button asChild className="mt-6">
                    <Link href="/quizzes">
                        <ChevronLeft className="mr-2 h-4 w-4"/> {t['quiz.backToQuizzes']}
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <QuizTaker quiz={quiz} />
    </div>
  );
}
