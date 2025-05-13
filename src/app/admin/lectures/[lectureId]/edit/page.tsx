
// This page uses client-side state for mock data management.
"use client";

import { LectureForm } from "@/components/admin/lectures/lecture-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockLecturesData } from "@/lib/mock-data"; // For demo purposes
import type { Lecture } from "@/types";
import { useEffect, useState, use } from "react"; // Import use
import { notFound } from "next/navigation";

// Interface for the resolved params object
interface LecturePageParams {
  lectureId: string;
}

// Props for the page component, params can be a Promise
interface EditLecturePageProps {
  params: Promise<LecturePageParams> | LecturePageParams;
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

export default function EditLecturePage({ params: paramsProp }: EditLecturePageProps) {
  // Unwrap the promise using React.use() if it's a promise, otherwise use directly
  const params = typeof (paramsProp as any)?.then === 'function' ? use(paramsProp as Promise<LecturePageParams>) : paramsProp as LecturePageParams;
  
  const [lecture, setLecture] = useState<Lecture | null | undefined>(undefined); // undefined for loading state

  useEffect(() => {
    async function fetchLecture() {
      // params is now the resolved object: { lectureId: string }
      if (params?.lectureId) {
        const fetchedLecture = await getLectureById(params.lectureId);
        setLecture(fetchedLecture);
      }
    }
    fetchLecture();
  }, [params]); // Depend on the resolved params object

  if (lecture === undefined && params?.lectureId) { // Added check for params.lectureId to ensure params is resolved
    return <p>Loading lecture data for {params.lectureId}...</p>; // Or a skeleton loader
  }

  if (!lecture && params?.lectureId) { // if params is resolved but lecture is not found
    notFound(); 
  }
  
  // If params itself hasn't resolved yet (e.g. `use` is suspending)
  if (!params?.lectureId && lecture === undefined) {
    return <p>Loading parameters...</p>;
  }


  const onSubmit = async (data: Omit<Lecture, 'id' | 'lessonsCount'>) => {
    // params.lectureId is available here as params is resolved
    await handleUpdateLecture(params.lectureId, data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Lecture</h1>
        <p className="text-muted-foreground">
          Modify the details for the lecture: {lecture?.title || params.lectureId}.
        </p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lecture Details</CardTitle>
          <CardDescription>Update the information for this lecture.</CardDescription>
        </CardHeader>
        <CardContent>
          {lecture ? (
            <LectureForm initialData={lecture} onSubmit={onSubmit} />
          ) : (
            <p>Loading form...</p> // Or skeleton for form
          )}
        </CardContent>
      </Card>
    </div>
  );
}

