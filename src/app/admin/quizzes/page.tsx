
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { QuizzesTable } from "@/components/admin/quizzes/quizzes-table";
import { mockQuizzesData, mockLessonsData, mockLecturesData } from "@/lib/mock-data";
import type { Quiz } from "@/types";

interface EnrichedQuiz extends Quiz {
  associatedWithTitle?: string; // Title of lesson or lecture
  associatedWithType?: 'Lesson' | 'Lecture' | 'N/A';
}

async function getQuizzes(): Promise<EnrichedQuiz[]> {
  // Simulate fetching and enriching quiz data
  return mockQuizzesData.map(quiz => {
    let associatedWithTitle: string | undefined;
    let associatedWithType: 'Lesson' | 'Lecture' | 'N/A' = 'N/A';

    if (quiz.lessonId) {
      const lesson = mockLessonsData.find(l => l.id === quiz.lessonId);
      associatedWithTitle = lesson?.title;
      associatedWithType = 'Lesson';
    } else if (quiz.lectureId) {
      const lecture = mockLecturesData.find(l => l.id === quiz.lectureId);
      associatedWithTitle = lecture?.title;
      associatedWithType = 'Lecture';
    }
    return {
      ...quiz,
      associatedWithTitle: associatedWithTitle || "Not Associated",
      associatedWithType,
    };
  });
}

export default async function AdminQuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Quizzes</h1>
          <p className="text-muted-foreground">
            Create, edit, and assign quizzes to lessons or lectures.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quizzes/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Quiz
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
          <CardDescription>A list of all quizzes in ChemLearn.</CardDescription>
        </CardHeader>
        <CardContent>
          {quizzes.length > 0 ? (
            <QuizzesTable initialQuizzes={quizzes} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No quizzes found.</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/admin/quizzes/new">Create your first quiz</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
