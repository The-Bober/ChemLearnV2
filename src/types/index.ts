export interface Lecture {
  id: string;
  title: string;
  description: string;
  order: number;
  imageUrl?: string; // Optional image for the lecture card
  lessonsCount?: number; // To display on lecture card
}

export type LessonContentType = "text" | "formula" | "image" | "video";

export interface LessonContentBlock {
  type: LessonContentType;
  value: string; // Text content, formula string, image URL, or video embed URL/ID
  altText?: string; // For images
}

export interface Lesson {
  id:string;
  lectureId: string;
  title: string;
  order: number;
  content: LessonContentBlock[]; // Structured content
  estimatedTimeMinutes?: number; // Optional: estimated time to complete lesson
}

export type QuestionType = "true_false" | "multiple_choice";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  quizId?: string; // A question might belong to a quiz directly
  lessonId?: string; // Or be associated with a lesson for ad-hoc practice
  text: string;
  type: QuestionType;
  options: QuestionOption[]; // For multiple_choice, empty for true_false
  correctAnswer: string; // For true_false, "true" or "false". For MC, the id of the correct QuestionOption.
  explanation?: string; // Optional explanation for the answer
}

export interface Quiz {
  id: string;
  lessonId?: string; // Quiz associated with a lesson
  lectureId?: string; // Quiz associated with a lecture (e.g., end-of-lecture quiz)
  title: string;
  description?: string;
  questions: Question[]; // Embedded questions or array of question IDs
}

// For AI Quiz Generation
export interface AIQuestion extends Omit<Question, 'id' | 'quizId' | 'lessonId' | 'options' | 'correctAnswer'> {
  options: string[]; // Raw strings from AI
  correctAnswer: string; // Raw string from AI, needs to be matched to an option
}

export interface AIQuizOutput {
  questions: AIQuestion[];
}
