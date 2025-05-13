
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { QuizzesTable } from "@/components/admin/quizzes/quizzes-table";
import { getAllQuizzesEnriched, type EnrichedQuiz } from "@/services/quizService";


export default async function AdminQuizzesPage() {
  const quizzes: EnrichedQuiz[] = await getAllQuizzesEnriched();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Quizzes</h1>
          <p className="text-muted-foreground">
            Create, edit, and assign quizzes to lessons or lectures.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quizzes/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Quiz
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
          <CardDescription>A list of all quizzes in ChemLearn.</CardDescription>
        </CardHeader>
        <CardContent>
          {quizzes.length > 0 ? (
            <QuizzesTable initialQuizzes={quizzes} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No quizzes found.</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/admin/quizzes/new">Create your first quiz</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
