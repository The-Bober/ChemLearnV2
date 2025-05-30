
import type { Timestamp } from 'firebase/firestore';

export interface Lecture {
  id: string;
  title: string;
  description: string;
  order: number; 
  imageUrl?: string;
  lessonsCount?: number; 
  createdAt?: string; // Changed from Timestamp
  updatedAt?: string; // Changed from Timestamp
}

// Used for forms, omits id and calculated fields
export interface LectureFormData extends Omit<Lecture, 'id' | 'lessonsCount' | 'createdAt' | 'updatedAt'> {}


export type LessonContentType = "text" | "formula" | "image" | "video";

export interface LessonContentBlock {
  id: string; 
  type: LessonContentType;
  value: string;
  altText?: string;
}

export interface Lesson {
  id:string;
  lectureId: string; 
  title: string;
  order: number; 
  content: LessonContentBlock[];
  estimatedTimeMinutes?: number;
  createdAt?: string; // Changed from Timestamp
  updatedAt?: string; // Changed from Timestamp
}

export interface LessonFormData extends Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'> {}


export type QuestionType = "true_false" | "multiple_choice";

export interface QuestionOption {
  id: string; 
  text: string;
}

export interface Question {
  id: string; 
  quizId?: string; 
  lessonId?: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[]; 
  correctAnswer: string; // For true_false: "true" or "false". For MC: id of the correct QuestionOption.
  explanation?: string;
}

export interface Quiz {
  id: string;
  lessonId?: string;
  lectureId?: string;
  title: string;
  description?: string;
  questions: Question[]; 
  durationMinutes?: number; 
  createdAt?: string; // Changed from Timestamp
  updatedAt?: string; // Changed from Timestamp
}

// For AI Quiz Generation
export interface AIQuestion extends Omit<Question, 'id' | 'quizId' | 'lessonId' | 'options' | 'correctAnswer'> {
  options: string[]; // Raw strings from AI
  correctAnswer: string; // Raw string from AI, needs to be matched to an option
}

export interface AIQuizOutput {
  questions: AIQuestion[];
}

// For QuizForm
export interface QuizFormDataCore {
  title: string;
  description?: string;
  associationType: "lesson" | "lecture" | "none";
  associatedId?: string;
  questions: Question[]; // Should be Question[], not the Zod schema version for internal form state
  durationMinutes?: number;
}

// This is what QuizForm will work with internally and submit
// It matches the Quiz schema more closely for saving, but has form-specific fields.
export interface QuizFormShape extends Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'questions'> {
  associationType: "lesson" | "lecture" | "none"; // Helper for form logic
  associatedId?: string; // Helper for form logic
  questions: Question[]; // Use the actual Question type
}

export type ActivityType = 
  | "lecture_created" 
  | "lecture_updated" 
  | "lecture_deleted"
  | "lesson_created"
  | "lesson_updated"
  | "lesson_deleted"
  | "quiz_created"
  | "quiz_updated"
  | "quiz_deleted"
  | "user_registered"
  | "quiz_taken";

export interface Activity {
  id: string;
  type: ActivityType;
  message: string; // e.g., "Lecture 'Introduction to Chemistry' created."
  timestamp: string; // Changed from Timestamp
  relatedId?: string; // ID of the lecture, lesson, quiz, or user
  userId?: string; // ID of the user performing the action (if applicable)
}

export interface UserQuizCompletion {
  id?: string; // Document ID from Firestore
  userId: string;
  quizId: string;
  score: number; // Percentage score
  completedAt: string; // Changed from Timestamp
}

