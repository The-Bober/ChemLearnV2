
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { LessonsTable } from "@/components/admin/lessons/lessons-table";
import { mockLessonsData, mockLecturesData } from "@/lib/mock-data";
import type { Lesson } from "@/types";

interface EnrichedLesson extends Lesson {
  lectureTitle?: string;
}

async function getLessons(): Promise<EnrichedLesson[]> {
  // Simulate fetching and enriching lesson data
  return mockLessonsData.map(lesson => {
    const lecture = mockLecturesData.find(l => l.id === lesson.lectureId);
    return {
      ...lesson,
      lectureTitle: lecture?.title || "N/A",
    };
  });
}

export default async function AdminLessonsPage() {
  const lessons = await getLessons();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Lessons</h1>
          <p className="text-muted-foreground">
            Create, edit, and assign lessons to lectures.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/lessons/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Lesson
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Lessons</CardTitle>
          <CardDescription>A list of all lessons in ChemLearn.</CardDescription>
        </CardHeader>
        <CardContent>
          {lessons.length > 0 ? (
            <LessonsTable initialLessons={lessons} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No lessons found.</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/admin/lessons/new">Create your first lesson</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
