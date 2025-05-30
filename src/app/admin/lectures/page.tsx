
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { LecturesTable } from "@/components/admin/lectures/lectures-table";
import { getAllLectures } from "@/services/lectureService";
import type { Lecture } from "@/types";

export default async function AdminLecturesPage() {
  const lectures: Lecture[] = await getAllLectures();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Lectures</h1>
          <p className="text-muted-foreground">
            Create, edit, and delete chemistry lectures.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/lectures/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Lecture
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Lectures</CardTitle>
          <CardDescription>A list of all lectures in ChemLearn.</CardDescription>
        </CardHeader>
        <CardContent>
          {lectures.length > 0 ? (
            <LecturesTable initialLectures={lectures} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No lectures found.</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/admin/lectures/new">Create your first lecture</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
