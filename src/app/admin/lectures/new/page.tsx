
"use client"; 

import { LectureForm } from "@/components/admin/lectures/lecture-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewLecturePage() {
  // The onSubmit logic is now handled within LectureForm using services
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
          <LectureForm />
        </CardContent>
      </Card>
    </div>
  );
}
