
import { mockQuizzesData, mockLecturesData, mockLessonsData } from "@/lib/mock-data";
import type { Quiz } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, HelpCircle, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EnrichedQuizListItem extends Omit<Quiz, 'questions'> {
  associatedTitle?: string;
  associatedType?: 'Lesson' | 'Lecture';
  questionCount: number;
}

// Simulate fetching quizzes and enriching them
async function getQuizzesForListing(): Promise<EnrichedQuizListItem[]> {
  return mockQuizzesData.map(quiz => {
    let associatedTitle: string | undefined;
    let associatedType: 'Lesson' | 'Lecture' | undefined;

    if (quiz.lessonId) {
      const lesson = mockLessonsData.find(l => l.id === quiz.lessonId);
      associatedTitle = lesson?.title;
      associatedType = 'Lesson';
    } else if (quiz.lectureId) {
      const lecture = mockLecturesData.find(l => l.id === quiz.lectureId);
      associatedTitle = lecture?.title;
      associatedType = 'Lecture';
    }

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      durationMinutes: quiz.durationMinutes,
      associatedTitle,
      associatedType,
      questionCount: quiz.questions.length,
    };
  });
}

export default async function QuizzesPage() {
  const quizzes = await getQuizzesForListing();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Test Your Knowledge</h1>
        <p className="text-muted-foreground text-lg">
          Challenge yourself with our chemistry quizzes. Select a quiz below to begin.
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
                  <span>{quiz.questionCount} Questions</span>
                </div>
                {quiz.durationMinutes && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Timer className="mr-2 h-4 w-4 text-accent" />
                    <span>{quiz.durationMinutes} Minutes</span>
                  </div>
                )}
                {quiz.associatedTitle && quiz.associatedType && (
                  <Badge variant="secondary" className="mt-1">
                    Related to {quiz.associatedType}: {quiz.associatedTitle}
                  </Badge>
                )}
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button asChild className="w-full">
                  <Link href={`/learn/quizzes/${quiz.id}/take`}>
                    Take Quiz <ArrowRight className="ml-2 h-4 w-4" />
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
            <p className="text-xl font-semibold">No Quizzes Available Yet</p>
            <p className="text-muted-foreground">Please check back later for new quizzes!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
