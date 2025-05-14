
"use client";

import type { Lesson } from "@/types"; // Assuming EnrichedLesson is similar or Lesson has lectureTitle
import { getAllLessonsEnriched } from "@/services/lessonService";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, BookOpen, Library } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// Define EnrichedLesson type locally if not directly importable with lectureTitle
interface EnrichedLessonSearchResult extends Lesson {
  lectureTitle?: string;
}

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [results, setResults] = useState<EnrichedLessonSearchResult[]>([]);
  const [allLessons, setAllLessons] = useState<EnrichedLessonSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLessons, setIsFetchingLessons] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce hook logic
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    async function fetchLessons() {
      setIsFetchingLessons(true);
      try {
        // Assuming getAllLessonsEnriched returns the structure needed, or adapt this
        const lessonsFromService = await getAllLessonsEnriched();
        setAllLessons(lessonsFromService as EnrichedLessonSearchResult[]);
      } catch (error) {
        console.error("Failed to fetch lessons for search:", error);
      } finally {
        setIsFetchingLessons(false);
      }
    }
    fetchLessons();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setResults([]);
      // Do not automatically close popover if input is still focused
      if (!inputRef.current || document.activeElement !== inputRef.current) {
        setIsPopoverOpen(false);
      }
      return;
    }

    if (allLessons.length === 0 && !isFetchingLessons) return;

    setIsLoading(true);
    const filteredResults = allLessons.filter(lesson =>
      lesson.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (lesson.lectureTitle && lesson.lectureTitle.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
    setResults(filteredResults);
    setIsLoading(false);
    
    // Open popover if there are results or if there's a search term (to show "no results")
    // and input is focused.
    if (document.activeElement === inputRef.current && debouncedSearchTerm.trim() !== '') {
      setIsPopoverOpen(true);
    }

  }, [debouncedSearchTerm, allLessons, isFetchingLessons]);

  const handleResultClick = () => {
    setIsPopoverOpen(false);
    setSearchTerm(''); 
  };
  
  const handleInputFocus = () => {
    if (searchTerm.trim() !== '' || results.length > 0) {
        setIsPopoverOpen(true);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search lessons..."
            className="w-full pl-10 pr-4 py-2 h-10 rounded-md border"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim() !== '') {
                setIsPopoverOpen(true);
              } else {
                setIsPopoverOpen(false); // Close if search term is cleared
              }
            }}
            onFocus={handleInputFocus}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 mt-1" align="start">
        {isFetchingLessons && searchTerm.length > 0 && ( // Show loading only if actively searching
          <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading lessons...
          </div>
        )}
        {!isFetchingLessons && isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
          </div>
        )}
        {!isFetchingLessons && !isLoading && results.length > 0 && (
          <ScrollArea className="max-h-[300px]">
            <div className="p-2 space-y-1">
              {results.map(lesson => (
                <Link
                  key={lesson.id}
                  href={`/learn/lessons/${lesson.id}`}
                  onClick={handleResultClick}
                  className="block p-2 rounded-md hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
                >
                  <div className="font-medium text-sm text-foreground flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                    {lesson.title}
                  </div>
                  {lesson.lectureTitle && (
                    <div className="text-xs text-muted-foreground ml-6 flex items-center">
                      <Library className="mr-1.5 h-3 w-3 flex-shrink-0 text-accent" />
                      In Lecture: {lesson.lectureTitle}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
        {!isFetchingLessons && !isLoading && results.length === 0 && debouncedSearchTerm.trim() !== '' && (
          <p className="p-4 text-center text-sm text-muted-foreground">No lessons found matching &quot;{debouncedSearchTerm}&quot;.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
