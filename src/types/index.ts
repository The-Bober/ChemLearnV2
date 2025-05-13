
export interface Lecture {
  id: string;
  title: string;
  description: string;
  order: number; // Added for ordering lectures
  imageUrl?: string;
  lessonsCount?: number; // Calculated or maintained
}

export type LessonContentType = "text" | "formula" | "image" | "video";

export interface LessonContentBlock {
  id: string; // Added for keying in UI if dynamic
  type: LessonContentType;
  value: string;
  altText?: string;
}

export interface Lesson {
  id:string;
  lectureId: string; // To associate with a lecture
  title: string;
  order: number; // Added for ordering lessons within a lecture
  content: LessonContentBlock[];
  estimatedTimeMinutes?: number;
}

export type QuestionType = "true_false" | "multiple_choice";

export interface QuestionOption {
  id: string; // e.g., "opt1", "opt2"
  text: string;
}

export interface Question {
  id: string; // e.g., "q1", "q2"
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
  questions: Question[]; // Embedded questions
}

// For AI Quiz Generation
export interface AIQuestion extends Omit<Question, 'id' | 'quizId' | 'lessonId' | 'options' | 'correctAnswer'> {
  options: string[]; // Raw strings from AI
  correctAnswer: string; // Raw string from AI, needs to be matched to an option
}

export interface AIQuizOutput {
  questions: AIQuestion[];
}

