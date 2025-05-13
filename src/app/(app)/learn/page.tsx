
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Atom, FlaskConical } from "lucide-react";
import { getAllLectures } from "@/services/lectureService";
import type { Lecture } from "@/types";

export default async function LearnPage() {
  const lectures: Lecture[] = await getAllLectures();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome to Your Learning Journey!</h1>
        <p className="text-muted-foreground text-lg">
          Explore lectures, dive into lessons, and test your knowledge with quizzes.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Featured Lectures</h2>
        {lectures.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lectures.map((lecture) => (
              <Card key={lecture.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Image 
                    src={lecture.imageUrl || `https://picsum.photos/600/400?random=${lecture.id}`} 
                    alt={lecture.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-48"
                    data-ai-hint={lecture.title.toLowerCase().split(" ").slice(0,2).join(" ") || "chemistry abstract"}
                  />
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <CardTitle className="text-xl">{lecture.title}</CardTitle>
                  <CardDescription>{lecture.description}</CardDescription>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{lecture.lessonsCount || 0} Lessons</span>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <Button asChild className="w-full mt-2">
                    <Link href={`/learn/lectures/${lecture.id}`}>
                      Start Lecture <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No lectures available yet. Check back soon!</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:bg-secondary/50 transition-colors">
            <Atom className="h-12 w-12 text-primary mb-2" />
            <h3 className="text-lg font-medium">Periodic Table</h3>
            <p className="text-sm text-muted-foreground mb-3">Explore the elements.</p>
            <Button variant="outline" size="sm" disabled>View Table</Button> {/* Disabled for now */}
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:bg-secondary/50 transition-colors">
            <FlaskConical className="h-12 w-12 text-accent mb-2" />
            <h3 className="text-lg font-medium">Glossary</h3>
            <p className="text-sm text-muted-foreground mb-3">Chemistry terms explained.</p>
            <Button variant="outline" size="sm" disabled>Open Glossary</Button> {/* Disabled for now */}
          </Card>
        </div>
      </section>
    </div>
  );
}
