
// This page uses client-side state for mock data management.
"use client";

import { LectureForm } from "@/components/admin/lectures/lecture-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockLecturesData } from "@/lib/mock-data"; // For demo purposes
import type { Lecture } from "@/types";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

interface EditLecturePageProps {
  params: {
    lectureId: string;
  };
}

// Simulate fetching a lecture by ID
async function getLectureById(id: string): Promise<Lecture | null> {
  const lecture = mockLecturesData.find(l => l.id === id);
  return lecture || null;
}

// Simulate updating a lecture
async function handleUpdateLecture(id: string, data: Partial<Omit<Lecture, 'id' | 'lessonsCount'>>) {
  console.log(`Updating lecture ${id} with data (mock):`, data);
  const lectureIndex = mockLecturesData.findIndex(l => l.id === id);
  if (lectureIndex !== -1) {
    mockLecturesData[lectureIndex] = { ...mockLecturesData[lectureIndex], ...data };
  }
  await new Promise(resolve => setTimeout(resolve, 500));
}

export default function EditLecturePage({ params }: EditLecturePageProps) {
  const [lecture, setLecture] = useState<Lecture | null | undefined>(undefined); // undefined for loading state

  useEffect(() => {
    async function fetchLecture() {
      const fetchedLecture = await getLectureById(params.lectureId);
      setLecture(fetchedLecture);
    }
    fetchLecture();
  }, [params.lectureId]);

  if (lecture === undefined) {
    return <p>Loading lecture data...</p>; // Or a skeleton loader
  }

  if (!lecture) {
    notFound(); // If lecture is null after fetching
  }
  
  const onSubmit = async (data: Omit<Lecture, 'id' | 'lessonsCount'>) => {
    await handleUpdateLecture(params.lectureId, data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Lecture</h1>
        <p className="text-muted-foreground">
          Modify the details for the lecture: {lecture?.title}.
        </p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lecture Details</CardTitle>
          <CardDescription>Update the information for this lecture.</CardDescription>
        </CardHeader>
        <CardContent>
          <LectureForm initialData={lecture} onSubmit={onSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
