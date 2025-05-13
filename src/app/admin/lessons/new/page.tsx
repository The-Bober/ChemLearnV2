
"use client";

import { LessonForm, type LessonFormData } from "@/components/admin/lessons/lesson-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockLessonsData, mockLecturesData } from "@/lib/mock-data";
import type { Lesson, Lecture } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Simulate adding a lesson
async function handleAddLesson(data: LessonFormData) {
  console.log("Submitting new lesson data (mock):", data);
  const newLesson: Lesson = {
    ...data,
    id: uuidv4(),
  };
  mockLessonsData.push(newLesson);
  await new Promise(resolve => setTimeout(resolve, 500));
}

const lecturesForSelect = mockLecturesData.map(l => ({id: l.id, title: l.title}));

export default function NewLessonPage() {
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
          <LessonForm lectures={lecturesForSelect} onSubmit={handleAddLesson} />
        </CardContent>
      </Card>
    </div>
  );
}
