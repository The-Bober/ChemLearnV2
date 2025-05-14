
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { getAllLectures } from "@/services/lectureService";
import type { Lecture } from "@/types";

export default async function AllLecturesPage() {
  const lectures: Lecture[] = await getAllLectures();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">All Lectures</h1>
        <p className="text-muted-foreground text-lg">
          Browse through all available chemistry lectures.
        </p>
      </header>

      {lectures.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lectures.map((lecture) => (
            <Card key={lecture.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0">
                <Image 
                  src={lecture.imageUrl || `https://placehold.co/600x400.png`} 
                  alt={lecture.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-48"
                  data-ai-hint={lecture.title.toLowerCase().split(" ").slice(0,2).join(" ") || "chemistry education"}
                />
              </CardHeader>
              <CardContent className="p-6 space-y-3 flex-grow">
                <CardTitle className="text-xl">{lecture.title}</CardTitle>
                <CardDescription className="line-clamp-3">{lecture.description}</CardDescription>
                <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
                  <span>{lecture.lessonsCount || 0} Lessons</span>
                  <BookOpen className="h-4 w-4" />
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button asChild className="w-full mt-2">
                  <Link href={`/learn/lectures/${lecture.id}`}>
                    View Lecture <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold">No Lectures Available Yet</p>
            <p className="text-muted-foreground">Please check back later for new content!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
