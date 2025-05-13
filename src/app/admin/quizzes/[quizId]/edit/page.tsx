
"use client";

import { QuizForm } from "@/components/admin/quizzes/quiz-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuizById, getLessonsForSelect } from "@/services/quizService";
import { getLecturesForSelect } from "@/services/lessonService";
import type { Quiz, Lecture, Lesson } from "@/types";
import { useEffect, useState, use } from "react";
import { notFound, useSearchParams } from "next/navigation"; // Added useSearchParams
import { v4 as uuidv4 } from 'uuid';


interface QuizPageParams {
  quizId: string;
}

interface EditQuizPageProps {
  params: Promise<QuizPageParams> | QuizPageParams;
}

export default function EditQuizPage({ params: paramsProp }: EditQuizPageProps) {
  const params = typeof (paramsProp as any)?.then === 'function' ? use(paramsProp as Promise<QuizPageParams>) : paramsProp as QuizPageParams;
  const searchParams = useSearchParams(); // For AI generation trigger

  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [lectures, setLectures] = useState<Pick<Lecture, 'id' | 'title'>[]>([]);
  const [lessons, setLessons] = useState<Pick<Lesson, 'id' | 'title' | 'lectureId' | 'content'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (params?.quizId) {
        setLoading(true);
        try {
          const [fetchedQuiz, fetchedLectures, fetchedLessons] = await Promise.all([
            getQuizById(params.quizId),
            getLecturesForSelect(),
            getLessonsForSelect()
          ]);

          if (fetchedQuiz) {
            // Ensure questions and options have IDs for the form
            const quizWithEnsuredIds = {
              ...fetchedQuiz,
              questions: fetchedQuiz.questions.map(q => ({
                ...q,
                id: q.id || uuidv4(),
                options: q.options ? q.options.map(opt => ({...opt, id: opt.id || uuidv4()})) : []
              }))
            };
            setQuiz(quizWithEnsuredIds);
          } else {
            setQuiz(null);
          }
          setLectures(fetchedLectures);
          setLessons(fetchedLessons);

        } catch (error) {
            console.error("Failed to fetch data for quiz edit", error);
        } finally {
            setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
     if (params?.quizId) {
        fetchData();
    } else {
      setLoading(false);
    }
  }, [params]);

  // Effect to trigger AI generation if query param is set
  // This is a placeholder for how the QuizForm could be hinted to start AI generation.
  // The actual AI call is within QuizForm.
  useEffect(() => {
    if (searchParams.get('ai-generate') === 'true' && quiz) {
      // Logic to trigger AI generation or set a flag for QuizForm can go here
      // For now, QuizForm itself will handle the AI button click.
      // This is more of a conceptual note if direct triggering from URL was needed.
    }
  }, [searchParams, quiz]);


  if (loading || (quiz === undefined && params?.quizId)) {
    return <p>Loading quiz data for {params?.quizId || '...'}...</p>;
  }

  if (!quiz && params?.quizId) {
    notFound();
  }

  if (!params?.quizId && quiz === undefined) {
    return <p>Loading parameters...</p>;
  }
  
  // onSubmit is handled by QuizForm
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Quiz</h1>
        <p className="text-muted-foreground">
          Modify the details for the quiz: {quiz?.title || params.quizId}.
        </p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>Update the information for this quiz.</CardDescription>
        </CardHeader>
        <CardContent>
          {quiz && lectures.length > 0 && lessons.length > 0 ? (
            <QuizForm initialData={quiz} lectures={lectures} lessons={lessons} quizId={params.quizId} />
          ) : (
            <p>Loading form...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
