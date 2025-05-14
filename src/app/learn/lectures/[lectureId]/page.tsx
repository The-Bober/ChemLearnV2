
import { getLectureById } from "@/services/lectureService";
import { getLessonsByLectureId } from "@/services/lessonService";
import type { Lecture, Lesson } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, ListChecks, Timer } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface LecturePageProps {
  params: {
    lectureId: string;
  };
}

async function getLectureDetails(lectureId: string): Promise<{ lecture: Lecture | null; lessons: Lesson[] }> {
  const lecture = await getLectureById(lectureId);
  if (!lecture) {
    return { lecture: null, lessons: [] };
  }
  const lessons = await getLessonsByLectureId(lectureId);
  return { lecture, lessons };
}

export default async function LecturePage({ params }: LecturePageProps) {
  const { lecture, lessons } = await getLectureDetails(params.lectureId);

  if (!lecture) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* New Lecture Header Layout */}
      <div className="flex flex-col md:flex-row items-start gap-6 p-4 md:p-6 rounded-lg border bg-card shadow-sm">
        {/* Left: Title & Description */}
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">{lecture.title}</h1>
          <p className="text-md lg:text-lg text-muted-foreground">
            {lecture.description}
          </p>
        </div>
        {/* Right: Small Square Image */}
        <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 relative overflow-hidden rounded-md shadow-md flex-shrink-0 self-center md:self-start">
          <Image
            src={lecture.imageUrl || `https://placehold.co/200x200.png`}
            alt={lecture.title}
            fill
            className="object-cover"
            data-ai-hint={lecture.title.toLowerCase().split(" ").slice(0,2).join(" ") || "lecture topic"}
            sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
          />
        </div>
      </div>

      <section className="space-y-6 px-2 sm:px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-primary flex items-center">
          <ListChecks className="mr-3 h-7 w-7 md:h-8 md:w-8" />
          Lessons in this Lecture
        </h2>
        {lessons.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">{lesson.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4 pt-1">
                     <Badge variant="outline">Lesson {index + 1}</Badge>
                    {lesson.estimatedTimeMinutes && (
                        <div className="flex items-center">
                            <Timer className="mr-1 h-4 w-4" />
                            <span>{lesson.estimatedTimeMinutes} min read</span>
                        </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-3">
                    {lesson.content.find(c => c.type === 'text')?.value.substring(0, 150) || "No description available."}
                    {(lesson.content.find(c => c.type === 'text')?.value.length || 0) > 150 && "..."}
                  </p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button asChild className="w-full">
                    <Link href={`/learn/lessons/${lesson.id}`}>
                      Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">No lessons available for this lecture yet.</p>
              <p>Check back soon for new content!</p>
            </CardContent>
          </Card>
        )}
      </section>
       <div className="mt-8 text-center">
            <Button variant="outline" asChild>
                <Link href="/learn/lectures">
                    Back to All Lectures
                </Link>
            </Button>
        </div>
    </div>
  );
}
