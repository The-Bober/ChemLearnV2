import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Logo iconSize={32} textSize="text-2xl" />
        {/* Future: Add login/signup buttons here if needed */}
      </header>

      <main className="text-center flex flex-col items-center space-y-8">
        <div className="relative w-48 h-48 md:w-64 md:h-64">
          <Image
            src="https://picsum.photos/512/512?random=1"
            alt="Abstract Chemistry"
            layout="fill"
            objectFit="cover"
            className="rounded-full shadow-2xl"
            data-ai-hint="chemistry lab"
          />
           <div className="absolute inset-0 bg-primary/30 rounded-full mix-blend-multiply"></div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Welcome to <span className="text-primary">ChemLearn</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Unlock the fascinating world of chemistry with engaging lessons, interactive quizzes, and a personalized learning experience.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/50 transition-shadow">
            <Link href="/learn">Start Learning Now</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/admin">Admin Panel</Link>
          </Button>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ChemLearn. All rights reserved.
      </footer>
    </div>
  );
}
