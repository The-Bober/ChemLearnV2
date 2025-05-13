
"use client";

import { LectureForm } from "@/components/admin/lectures/lecture-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLectureById } from "@/services/lectureService";
import type { Lecture } from "@/types";
import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";

interface LecturePageParams {
  lectureId: string;
}

interface EditLecturePageProps {
  params: Promise<LecturePageParams> | LecturePageParams;
}

export default function EditLecturePage({ params: paramsProp }: EditLecturePageProps) {
  const params = typeof (paramsProp as any)?.then === 'function' ? use(paramsProp as Promise<LecturePageParams>) : paramsProp as LecturePageParams;
  
  const [lecture, setLecture] = useState<Lecture | null | undefined>(undefined); 

  useEffect(() => {
    async function fetchLecture() {
      if (params?.lectureId) {
        const fetchedLecture = await getLectureById(params.lectureId);
        setLecture(fetchedLecture);
      }
    }
    if (params?.lectureId) { // Ensure params is resolved before fetching
        fetchLecture();
    }
  }, [params]);

  if (lecture === undefined && params?.lectureId) {
    return <p>Loading lecture data for {params.lectureId}...</p>; 
  }

  if (!lecture && params?.lectureId) { 
    notFound(); 
  }
  
  if (!params?.lectureId && lecture === undefined) {
    return <p>Loading parameters...</p>;
  }

  // onSubmit is now handled within LectureForm
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
            <LectureForm initialData={lecture} lectureId={params.lectureId} />
          ) : (
            <p>Loading form...</p> 
          )}
        </CardContent>
      </Card>
    </div>
  );
}
