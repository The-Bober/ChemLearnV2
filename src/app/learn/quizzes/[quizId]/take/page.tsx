
import { mockQuizzesData } from "@/lib/mock-data";
import type { Quiz } from "@/types";
import { QuizTaker } from "@/components/learn/quiz-taker";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizPageProps {
  params: {
    quizId: string;
  };
}

// Simulate fetching a quiz by ID
async function getQuiz(quizId: string): Promise<Quiz | null> {
  // Ensure questions always have an options array, even if empty for true/false
  const quiz = mockQuizzesData.find(q => q.id === quizId);
  if (quiz) {
    return {
      ...quiz,
      questions: quiz.questions.map(question => ({
        ...question,
        options: question.options || [] 
      }))
    };
  }
  return null;
}

export default async function TakeQuizPage({ params }: QuizPageProps) {
  const quiz = await getQuiz(params.quizId);

  if (!quiz) {
    notFound();
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <Card className="w-full max-w-md p-8 shadow-xl">
            <CardHeader>
                <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
                <CardTitle className="text-2xl font-semibold">Quiz Not Ready</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-lg text-muted-foreground">
                This quiz &quot;{quiz.title}&quot; currently has no questions. Please check back later or contact an administrator.
                </CardDescription>
                <Button asChild className="mt-6">
                    <Link href="/quizzes">
                        <ChevronLeft className="mr-2 h-4 w-4"/> Go Back to Quizzes
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
