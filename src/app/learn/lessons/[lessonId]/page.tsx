
import { getLessonById, getLessonsByLectureId } from "@/services/lessonService";
import { getQuizByLessonId } from "@/services/quizService";
import { getLectureById } from "@/services/lectureService";
import type { Lesson, Quiz, Lecture } from "@/types";
import { LessonContentRenderer } from "@/components/learn/lesson-content-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardDescription as it's not used
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileQuestion, Timer, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { translationsStore, type Locale } from "@/lib/translations";
// import { Badge } from "@/components/ui/badge"; // Badge not used here

interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

// Helper to get translations on the server for a specific locale
const getTranslationsForServer = (locale: string = 'en') => {
  return translationsStore[locale as Locale] || translationsStore['en'];
};

async function getLessonDetails(lessonId: string): Promise<{
  lesson: Lesson | null;
  quiz: Quiz | null;
  lectureTitle: string | null;
  lectureId: string | null;
  previousLessonId: string | null;
  nextLessonId: string | null;
}> {
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return { lesson: null, quiz: null, lectureTitle: null, lectureId: null, previousLessonId: null, nextLessonId: null };
  }

  const quiz = await getQuizByLessonId(lessonId);
  
  let lecture: Lecture | null = null;
  if (lesson.lectureId) {
    lecture = await getLectureById(lesson.lectureId);
  }
  const lectureTitle = lecture?.title || null;
  const lectureId = lecture?.id || null;

  let previousLessonId: string | null = null;
  let nextLessonId: string | null = null;

  if (lesson.lectureId) {
    const lessonsInLecture = await getLessonsByLectureId(lesson.lectureId); // Already sorted by order
    const currentIndex = lessonsInLecture.findIndex(l => l.id === lessonId);

    if (currentIndex > 0) {
      previousLessonId = lessonsInLecture[currentIndex - 1].id;
    }
    if (currentIndex < lessonsInLecture.length - 1) {
      nextLessonId = lessonsInLecture[currentIndex + 1].id;
    }
  }

  return { lesson, quiz, lectureTitle, lectureId, previousLessonId, nextLessonId };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lesson, quiz, lectureTitle, lectureId, previousLessonId, nextLessonId } = await getLessonDetails(params.lessonId);
  const t = getTranslationsForServer('en'); // Assuming 'en' for now, or pass locale

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          {lectureTitle && lectureId && (
             <Link href={`/learn/lectures/${lectureId}`} className="text-sm text-primary hover:underline flex items-center mb-2">
                <BookOpen className="mr-2 h-4 w-4" /> {t['lessonDetail.backToLecture']} {lectureTitle}
            </Link>
          )}
          <CardTitle className="text-4xl font-bold text-primary">{lesson.title}</CardTitle>
          {lesson.estimatedTimeMinutes && (
            <div className="flex items-center text-muted-foreground mt-2">
              <Timer className="mr-2 h-5 w-5" />
              <span>{t['lessonDetail.estimatedTime']} {lesson.estimatedTimeMinutes} {t['lessonDetail.minutes']}</span>
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
                <ChevronLeft className="mr-2 h-4 w-4" /> {t['lessonDetail.previousLesson']}
                </Link>
            </Button>
            ) : <div className="flex-1 sm:flex-none"/>}

            {nextLessonId ? (
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
                <Link href={`/learn/lessons/${nextLessonId}`}>
                {t['lessonDetail.nextLesson']} <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
            ) : <div className="flex-1 sm:flex-none"/>}
        </div>

        {quiz && (
          <Button asChild size="lg" className="w-full sm:w-auto mt-4 sm:mt-0">
            <Link href={`/learn/quizzes/${quiz.id}/take`}>
              <FileQuestion className="mr-2 h-5 w-5" /> {t['lessonDetail.takeQuiz']}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
