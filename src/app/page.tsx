
'use client';

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Logo iconSize={32} textSize="text-2xl" />
        {/* Login/Signup buttons are now part of UserNav or main content based on auth state */}
      </header>

      <main className="text-center flex flex-col items-center space-y-8">
        <div className="relative w-48 h-48 md:w-64 md:h-64">
          <Image
            src="https://placehold.co/512x512.png"
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
          {loading ? (
            <>
              <Skeleton className="h-11 w-40" />
              <Skeleton className="h-11 w-32" />
            </>
          ) : user ? (
            <>
              <Button asChild size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/50 transition-shadow">
                <Link href="/learn">Start Learning Now</Link>
              </Button>
              {/* Admin Panel button only shown if user is admin - Handled by UserNav or specific admin links */}
            </>
          ) : (
            <>
              <Button asChild size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/50 transition-shadow">
                <Link href="/login">Login to Learn</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ChemLearn. All rights reserved.
      </footer>
    </div>
  );
}
