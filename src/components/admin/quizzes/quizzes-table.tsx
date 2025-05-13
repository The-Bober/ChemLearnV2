
"use client";

import type { Quiz } from "@/types"; // Quiz type includes questions array
import type { EnrichedQuiz as EnrichedQuizTypeFromService } from "@/services/quizService"; // Service type
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteQuiz } from "@/services/quizService";


interface QuizzesTableProps {
  initialQuizzes: EnrichedQuizTypeFromService[];
}

export function QuizzesTable({ initialQuizzes }: QuizzesTableProps) {
  const [quizzes, setQuizzes] = useState<EnrichedQuizTypeFromService[]>(initialQuizzes);
  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
      toast({
        title: "Quiz Deleted",
        description: `Quiz has been successfully deleted.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error Deleting Quiz",
        description: `Failed to delete quiz. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
    }
  };

  const handleAIGenerate = (quizId: string) => {
     // For now, this navigates to the edit page where AI generation can be triggered from the form.
     router.push(`/admin/quizzes/${quizId}/edit?ai-generate=true`);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Associated With</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell"># Questions</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell className="font-medium">{quiz.title}</TableCell>
              <TableCell>{quiz.associatedWithTitle}</TableCell>
              <TableCell className="hidden md:table-cell">{quiz.associatedType}</TableCell>
              <TableCell className="hidden md:table-cell">{quiz.questionsCount}</TableCell>
              <TableCell>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleAIGenerate(quiz.id)}>
                        <Bot className="mr-2 h-4 w-4" /> AI Generate Questions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        quiz &quot;{quiz.title}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {quizzes.length === 0 && (
        <p className="text-center text-muted-foreground py-4">No quizzes to display.</p>
      )}
    </>
  );
}
