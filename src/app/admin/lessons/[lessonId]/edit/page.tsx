
"use client";

import { LessonForm } from "@/components/admin/lessons/lesson-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLessonById, getLecturesForSelect } from "@/services/lessonService";
import type { Lesson, Lecture } from "@/types";
import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";

interface LessonPageParams {
  lessonId: string;
}

interface EditLessonPageProps {
  params: Promise<LessonPageParams> | LessonPageParams;
}

export default function EditLessonPage({ params: paramsProp }: EditLessonPageProps) {
  const params = typeof (paramsProp as any)?.then === 'function' ? use(paramsProp as Promise<LessonPageParams>) : paramsProp as LessonPageParams;
  
  const [lesson, setLesson] = useState<Lesson | null | undefined>(undefined);
  const [lecturesForSelect, setLecturesForSelect] = useState<Pick<Lecture, 'id' | 'title'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (params?.lessonId) {
        setLoading(true);
        try {
          const [fetchedLesson, fetchedLectures] = await Promise.all([
            getLessonById(params.lessonId),
            getLecturesForSelect()
          ]);
          setLesson(fetchedLesson);
          setLecturesForSelect(fetchedLectures);
        } catch (error) {
          console.error("Failed to fetch lesson or lectures", error);
          // Potentially set an error state here
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    if (params?.lessonId) {
        fetchData();
    } else {
      // Handle case where params.lessonId might not be immediately available if params is a promise not yet resolved.
      // This might require a loading state before params is resolved.
      // However, `use(paramsProp)` should suspend until params is resolved.
      setLoading(false); 
    }
  }, [params]);

  if (loading || (lesson === undefined && params?.lessonId)) {
    return <p>Loading lesson data for {params?.lessonId || '...'}...</p>;
  }

  if (!lesson && params?.lessonId) {
    notFound();
  }

  if (!params?.lessonId && lesson === undefined) {
    return <p>Loading parameters...</p>;
  }
  
  // onSubmit is now handled within LessonForm
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
          {lesson && lecturesForSelect.length > 0 ? (
            <LessonForm initialData={lesson} lectures={lecturesForSelect} lessonId={params.lessonId} />
          ) : (
            <p>Loading form...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
