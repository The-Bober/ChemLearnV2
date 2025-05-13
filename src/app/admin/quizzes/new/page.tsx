
import { QuizForm } from "@/components/admin/quizzes/quiz-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLecturesForSelect } from "@/services/lessonService"; // Can reuse this
import { getLessonsForSelect } from "@/services/quizService";
import type { Lecture, Lesson } from "@/types";

export default async function NewQuizPage() {
  const [lecturesForSelect, lessonsForSelect] = await Promise.all([
    getLecturesForSelect(),
    getLessonsForSelect() 
  ]);

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
          <QuizForm lectures={lecturesForSelect} lessons={lessonsForSelect} />
        </CardContent>
      </Card>
    </div>
  );
}
