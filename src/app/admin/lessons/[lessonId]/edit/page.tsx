
"use client";

import { LessonForm, type LessonFormData } from "@/components/admin/lessons/lesson-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockLessonsData, mockLecturesData } from "@/lib/mock-data";
import type { Lesson } from "@/types";
import { useEffect, useState, use } from "react"; // Import use
import { notFound } from "next/navigation";

// Interface for the resolved params object
interface LessonPageParams {
  lessonId: string;
}

// Props for the page component, params can be a Promise
interface EditLessonPageProps {
  params: Promise<LessonPageParams> | LessonPageParams;
}

// Simulate fetching a lesson by ID
async function getLessonById(id: string): Promise<Lesson | null> {
  const lesson = mockLessonsData.find(l => l.id === id);
  return lesson || null;
}

// Simulate updating a lesson
async function handleUpdateLesson(id: string, data: LessonFormData) {
  console.log(`Updating lesson ${id} with data (mock):`, data);
  const lessonIndex = mockLessonsData.findIndex(l => l.id === id);
  if (lessonIndex !== -1) {
    mockLessonsData[lessonIndex] = { ...mockLessonsData[lessonIndex], ...data, id }; // ensure id is preserved
  }
  await new Promise(resolve => setTimeout(resolve, 500));
}

const lecturesForSelect = mockLecturesData.map(l => ({id: l.id, title: l.title}));

export default function EditLessonPage({ params: paramsProp }: EditLessonPageProps) {
  // Unwrap the promise using React.use() if it's a promise, otherwise use directly
  const params = typeof (paramsProp as any)?.then === 'function' ? use(paramsProp as Promise<LessonPageParams>) : paramsProp as LessonPageParams;
  
  const [lesson, setLesson] = useState<Lesson | null | undefined>(undefined);

  useEffect(() => {
    async function fetchLesson() {
      if (params?.lessonId) {
        const fetchedLesson = await getLessonById(params.lessonId);
        setLesson(fetchedLesson);
      }
    }
    fetchLesson();
  }, [params]); // Depend on the resolved params object

  if (lesson === undefined && params?.lessonId) {
    return <p>Loading lesson data for {params.lessonId}...</p>;
  }

  if (!lesson && params?.lessonId) {
    notFound();
  }

  if (!params?.lessonId && lesson === undefined) {
    return <p>Loading parameters...</p>;
  }
  
  const onSubmit = async (data: LessonFormData) => {
    await handleUpdateLesson(params.lessonId, data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Lesson</h1>
        <p className="text-muted-foreground">
          Modify the details for the lesson: {lesson?.title || params.lessonId}.
        </p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>Update the information for this lesson.</CardDescription>
        </CardHeader>
        <CardContent>
          {lesson ? (
            <LessonForm initialData={lesson} lectures={lecturesForSelect} onSubmit={onSubmit} />
          ) : (
            <p>Loading form...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

