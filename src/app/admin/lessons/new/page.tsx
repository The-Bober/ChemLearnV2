
import { LessonForm } from "@/components/admin/lessons/lesson-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLecturesForSelect } from "@/services/lessonService"; // Fetch lectures for the dropdown
import type { Lecture } from "@/types";

export default async function NewLessonPage() {
  const lecturesForSelect: Pick<Lecture, 'id' | 'title'>[] = await getLecturesForSelect();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Lesson</h1>
        <p className="text-muted-foreground">
          Fill in the details to add a new lesson.
        </p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>Provide information for the new lesson and associate it with a lecture.</CardDescription>
        </CardHeader>
        <CardContent>
          <LessonForm lectures={lecturesForSelect} />
        </CardContent>
      </Card>
    </div>
  );
}
