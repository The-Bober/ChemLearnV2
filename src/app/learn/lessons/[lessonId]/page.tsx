
import { mockLessonsData, mockQuizzesData, mockLecturesData } from "@/lib/mock-data";
import type { Lesson, Quiz } from "@/types";
import { LessonContentRenderer } from "@/components/learn/lesson-content-renderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileQuestion, Timer, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

// Simulate fetching a lesson, its associated quiz, and navigation links
async function getLessonDetails(lessonId: string): Promise<{
  lesson: Lesson | null;
  quiz: Quiz | null;
  lectureTitle: string | null;
  previousLessonId: string | null;
  nextLessonId: string | null;
}> {
  const lesson = mockLessonsData.find(l => l.id === lessonId) || null;
  if (!lesson) {
    return { lesson: null, quiz: null, lectureTitle: null, previousLessonId: null, nextLessonId: null };
  }

  const quiz = mockQuizzesData.find(q => q.lessonId === lessonId) || null;
  const lecture = mockLecturesData.find(l => l.id === lesson.lectureId);
  const lectureTitle = lecture?.title || null;

  let previousLessonId: string | null = null;
  let nextLessonId: string | null = null;

  if (lecture) {
    const lessonsInLecture = mockLessonsData
      .filter(l => l.lectureId === lesson.lectureId)
      .sort((a, b) => a.order - b.order);
    const currentIndex = lessonsInLecture.findIndex(l => l.id === lessonId);

    if (currentIndex > 0) {
      previousLessonId = lessonsInLecture[currentIndex - 1].id;
    }
    if (currentIndex < lessonsInLecture.length - 1) {
      nextLessonId = lessonsInLecture[currentIndex + 1].id;
    }
  }

  return { lesson, quiz, lectureTitle, previousLessonId, nextLessonId };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lesson, quiz, lectureTitle, previousLessonId, nextLessonId } = await getLessonDetails(params.lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          {lectureTitle && (
             <Link href={`/learn/lectures/${lesson.lectureId}`} className="text-sm text-primary hover:underline flex items-center mb-2">
                <BookOpen className="mr-2 h-4 w-4" /> Back to {lectureTitle}
            </Link>
          )}
          <CardTitle className="text-4xl font-bold text-primary">{lesson.title}</CardTitle>
          {lesson.estimatedTimeMinutes && (
            <div className="flex items-center text-muted-foreground mt-2">
              <Timer className="mr-2 h-5 w-5" />
              <span>Estimated read time: {lesson.estimatedTimeMinutes} minutes</span>
            </div>
          )}
        </CardHeader>
        <Separator />
        <CardContent className="py-6 space-y-6">
          {lesson.content.map(block => (
            <LessonContentRenderer key={block.id} block={block} />
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg border bg-card shadow">
        <div className="flex gap-2 w-full sm:w-auto">
            {previousLessonId ? (
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
                <Link href={`/learn/lessons/${previousLessonId}`}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Link>
            </Button>
            ) : <div className="flex-1 sm:flex-none"/>}

            {nextLessonId ? (
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
                <Link href={`/learn/lessons/${nextLessonId}`}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
            ) : <div className="flex-1 sm:flex-none"/>}
        </div>

        {quiz && (
          <Button asChild size="lg" className="w-full sm:w-auto mt-4 sm:mt-0">
            <Link href={`/learn/quizzes/${quiz.id}/take`}>
              <FileQuestion className="mr-2 h-5 w-5" /> Take Quiz
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
