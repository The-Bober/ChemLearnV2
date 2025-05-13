
"use client";

import { QuizForm, type QuizFormData } from "@/components/admin/quizzes/quiz-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockQuizzesData, mockLecturesData, mockLessonsData } from "@/lib/mock-data";
import type { Quiz } from "@/types";
import { useEffect, useState, use } from "react"; // Import use
import { notFound } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

// Interface for the resolved params object
interface QuizPageParams {
  quizId: string;
}

// Props for the page component, params can be a Promise
interface EditQuizPageProps {
  params: Promise<QuizPageParams> | QuizPageParams;
}

// Simulate fetching a quiz by ID
async function getQuizById(id: string): Promise<Quiz | null> {
  const quiz = mockQuizzesData.find(q => q.id === id);
  if (quiz) { // Ensure questions and options have IDs for the form
    return {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        id: q.id || uuidv4(),
        options: q.options.map(opt => ({...opt, id: opt.id || uuidv4()}))
      }))
    };
  }
  return null;
}

// Simulate updating a quiz
async function handleUpdateQuiz(id: string, data: QuizFormData) {
  console.log(`Updating quiz ${id} with data (mock):`, data);
  const quizIndex = mockQuizzesData.findIndex(q => q.id === id);
  if (quizIndex !== -1) {
    mockQuizzesData[quizIndex] = {
      ...mockQuizzesData[quizIndex],
      id, // ensure id is preserved
      title: data.title,
      description: data.description,
      lessonId: data.associationType === "lesson" ? data.associatedId : undefined,
      lectureId: data.associationType === "lecture" ? data.associatedId : undefined,
      questions: data.questions.map(q => ({...q, id: q.id || uuidv4(), options: q.options.map(opt => ({...opt, id: opt.id || uuidv4()}))})),
    };
  }
  await new Promise(resolve => setTimeout(resolve, 500));
}

const lecturesForSelect = mockLecturesData.map(l => ({id: l.id, title: l.title}));
const lessonsForSelect = mockLessonsData.map(l => ({id: l.id, title: l.title, lectureId: l.lectureId, content: l.content }));

export default function EditQuizPage({ params: paramsProp }: EditQuizPageProps) {
  // Unwrap the promise using React.use() if it's a promise, otherwise use directly
  const params = typeof (paramsProp as any)?.then === 'function' ? use(paramsProp as Promise<QuizPageParams>) : paramsProp as QuizPageParams;

  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);

  useEffect(() => {
    async function fetchQuiz() {
      if (params?.quizId) {
        const fetchedQuiz = await getQuizById(params.quizId);
        setQuiz(fetchedQuiz);
      }
    }
    fetchQuiz();
  }, [params]); // Depend on the resolved params object

  if (quiz === undefined && params?.quizId) {
    return <p>Loading quiz data for {params.quizId}...</p>;
  }

  if (!quiz && params?.quizId) {
    notFound();
  }

  if (!params?.quizId && quiz === undefined) {
    return <p>Loading parameters...</p>;
  }
  
  const onSubmit = async (data: QuizFormData) => {
    await handleUpdateQuiz(params.quizId, data);
  };

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
          {quiz ? (
            <QuizForm initialData={quiz} lectures={lecturesForSelect} lessons={lessonsForSelect} onSubmit={onSubmit} />
          ) : (
            <p>Loading form...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

