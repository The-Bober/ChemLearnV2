
"use client";

import { QuizForm, type QuizFormData } from "@/components/admin/quizzes/quiz-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockQuizzesData, mockLecturesData, mockLessonsData } from "@/lib/mock-data";
import type { Quiz } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Simulate adding a quiz
async function handleAddQuiz(data: QuizFormData) {
  console.log("Submitting new quiz data (mock):", data);
  const newQuiz: Quiz = {
    id: uuidv4(),
    title: data.title,
    description: data.description,
    lessonId: data.associationType === "lesson" ? data.associatedId : undefined,
    lectureId: data.associationType === "lecture" ? data.associatedId : undefined,
    questions: data.questions.map(q => ({...q, id: q.id || uuidv4(), options: q.options.map(opt => ({...opt, id: opt.id || uuidv4()}))})),
  };
  mockQuizzesData.push(newQuiz);
  await new Promise(resolve => setTimeout(resolve, 500));
}

const lecturesForSelect = mockLecturesData.map(l => ({id: l.id, title: l.title}));
const lessonsForSelect = mockLessonsData.map(l => ({id: l.id, title: l.title, lectureId: l.lectureId, content: l.content }));


export default function NewQuizPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Quiz</h1>
        <p className="text-muted-foreground">
          Fill in the details to add a new quiz.
        </p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>Provide information for the new quiz, add questions, and associate it if needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuizForm lectures={lecturesForSelect} lessons={lessonsForSelect} onSubmit={handleAddQuiz} />
        </CardContent>
      </Card>
    </div>
  );
}
