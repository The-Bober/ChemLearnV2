
// This page uses client-side state for mock data management.
"use client"; 

import { LectureForm } from "@/components/admin/lectures/lecture-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockLecturesData } from "@/lib/mock-data"; // For demo purposes
import type { Lecture } from "@/types"; // Ensure Lecture type is defined
import { v4 as uuidv4 } from 'uuid';

// Simulate adding a lecture (in a real app, this would be a server action/API call)
async function handleAddLecture(data: Omit<Lecture, 'id' | 'lessonsCount'>) {
  console.log("Submitting new lecture data (mock):", data);
  const newLecture: Lecture = {
    ...data,
    id: uuidv4(), // Generate new ID
    lessonsCount: 0, // New lectures start with 0 lessons
  };
  mockLecturesData.push(newLecture); // Add to mock data array (for demo only)
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real app, you'd revalidate paths or handle state updates differently
}


export default function NewLecturePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Lecture</h1>
        <p className="text-muted-foreground">
          Fill in the details to add a new lecture to ChemLearn.
        </p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lecture Details</CardTitle>
          <CardDescription>Provide information for the new lecture.</CardDescription>
        </CardHeader>
        <CardContent>
          <LectureForm onSubmit={handleAddLecture} />
        </CardContent>
      </Card>
    </div>
  );
}
