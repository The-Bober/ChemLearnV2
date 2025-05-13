
"use client";

import type { Lecture } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

interface LecturesTableProps {
  initialLectures: Lecture[];
}

export function LecturesTable({ initialLectures }: LecturesTableProps) {
  const [lectures, setLectures] = useState<Lecture[]>(initialLectures);
  const router = useRouter();
  const { toast } = useToast();

  // Simulate delete action
  const handleDeleteLecture = async (lectureId: string) => {
    // In a real app, this would be an API call
    // For now, filter out from local state
    setLectures((prevLectures) => prevLectures.filter((lecture) => lecture.id !== lectureId));
    toast({
      title: "Lecture Deleted",
      description: `Lecture with ID ${lectureId} has been deleted. (Mocked)`,
    });
    // router.refresh(); // If data was server-fetched
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="hidden md:table-cell">Lessons</TableHead>
            <TableHead className="hidden md:table-cell">Order</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lectures.map((lecture) => (
            <TableRow key={lecture.id}>
              <TableCell className="hidden sm:table-cell">
                {lecture.imageUrl ? (
                  <Image
                    alt={lecture.title}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={lecture.imageUrl}
                    width="64"
                    data-ai-hint="lecture image"
                  />
                ) : (
                  <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{lecture.title}</TableCell>
              <TableCell className="max-w-xs truncate">{lecture.description}</TableCell>
              <TableCell className="hidden md:table-cell">{lecture.lessonsCount || 0}</TableCell>
              <TableCell className="hidden md:table-cell">{lecture.order}</TableCell>
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
                        <Link href={`/admin/lectures/${lecture.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Link>
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
                        lecture &quot;{lecture.title}&quot; and its associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteLecture(lecture.id)}
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
      {lectures.length === 0 && (
        <p className="text-center text-muted-foreground py-4">No lectures to display.</p>
      )}
    </>
  );
}
