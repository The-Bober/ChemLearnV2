
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Atom, FlaskConical } from "lucide-react";
import { getAllLectures } from "@/services/lectureService";
import type { Lecture } from "@/types";
// For proper server-side i18n, you'd typically pass locale and translations from layout/page props
// or use a dedicated i18n library configured for server components.
import { translationsStore, type Locale } from "@/lib/translations"; // Import from new location

// Helper to get translations on the server for a specific locale
// In a real app, this would be more robust, likely involving loading JSON files.
const getTranslationsForServer = (locale: string = 'en') => {
  return translationsStore[locale as Locale] || translationsStore['en'];
};


export default async function LearnPage() {
  // Assuming 'en' as default locale for server rendering. 
  // For dynamic locales, this needs to be passed down from layout/middleware.
  const t = getTranslationsForServer('en'); // Or pass locale if available

  const lectures: Lecture[] = await getAllLectures();
  const featuredLectures = lectures.slice(0, 3); 

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t['learn.welcome']}</h1>
        <p className="text-muted-foreground text-lg">
          {t['learn.explore']}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t['learn.featuredLectures']}</h2>
        {featuredLectures.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredLectures.map((lecture) => (
              <Card key={lecture.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Image 
                    src={lecture.imageUrl || `https://placehold.co/600x400.png`} 
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
                    <span>{lecture.lessonsCount || 0} {t['learn.lessonsUnit']}</span>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <Button asChild className="w-full mt-2">
                    <Link href={`/learn/lectures/${lecture.id}`}>
                      {t['learn.startLecture']} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t['learn.noLectures']}</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t['learn.quickActions']}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:bg-secondary/50 transition-colors">
            <Atom className="h-12 w-12 text-primary mb-2" />
            <h3 className="text-lg font-medium">{t['learn.periodicTable']}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t['learn.exploreElements']}</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://ptable.com/?lang=en#Properties" target="_blank" rel="noopener noreferrer">
                {t['learn.viewTable']}
              </Link>
            </Button>
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:bg-secondary/50 transition-colors">
            <FlaskConical className="h-12 w-12 text-accent mb-2" />
            <h3 className="text-lg font-medium">{t['learn.glossary']}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t['learn.chemistryTerms']}</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://en.wikipedia.org/wiki/Glossary_of_chemistry_terms" target="_blank" rel="noopener noreferrer">
                {t['learn.openGlossary']}
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
