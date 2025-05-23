
"use client";

import type { Quiz, Question, Lecture, Lesson, QuizFormShape } from "@/types";
import { useForm, type SubmitHandler, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { QuestionForm } from "./question-form";
import { v4 as uuidv4 } from "uuid";
import { PlusCircle, Bot } from "lucide-react";
import { generateQuizQuestions, type GenerateQuizQuestionsInput } from "@/ai/flows/generate-quiz-questions";
import { addQuiz, updateQuiz } from "@/services/quizService";
import { useState } from "react";


const questionOptionSchema = z.object({
  id: z.string().default(() => uuidv4()),
  text: z.string().min(1, "Option text cannot be empty"),
});

const questionSchema = z.object({
  id: z.string().default(() => uuidv4()),
  text: z.string().min(5, "Question text must be at least 5 characters."),
  type: z.enum(["true_false", "multiple_choice"]),
  options: z.array(questionOptionSchema),
  correctAnswer: z.string({ 
    required_error: "A correct answer selection is required.",
    invalid_type_error: "Correct answer must be a string." 
  }).min(1, { message: "A correct answer must be selected." }), // Ensures it's not an empty string
  explanation: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.type === "multiple_choice") {
    if (data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 2,
        type: "array",
        inclusive: true,
        message: "Multiple choice questions require at least two options.",
        path: ["options"],
      });
      return; // Stop further checks for this question if options are insufficient
    }
    
    let allOptionsHaveText = true;
    data.options.forEach((option, index) => {
      if (!option.text || option.text.trim() === "") { // Check for null, undefined, or empty string
        allOptionsHaveText = false;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Option text cannot be empty.",
          path: [`options`, index, "text"],
        });
      }
    });

    if (!allOptionsHaveText) {
      return; // Stop further checks if option texts are invalid
    }
    
    // The .min(1) on `correctAnswer` string schema now handles the "nothing selected" (empty string) case.
    // No specific check for `!data.correctAnswer` is needed here for emptiness.
    // We still might want to check if the ID is valid among options IF that was a requirement, but it was removed.

  } else if (data.type === "true_false") {
    if (data.correctAnswer !== "true" && data.correctAnswer !== "false") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "For True/False questions, the answer must be 'true' or 'false'.",
        path: ["correctAnswer"],
      });
    }
  }
});


// This is for form validation
const quizFormValidationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().or(z.literal('')),
  associationType: z.enum(["lesson", "lecture", "none"]).default("none"),
  associatedId: z.string().optional(),
  questions: z.array(questionSchema).min(1, "A quiz must have at least one question."),
  durationMinutes: z.coerce.number().optional(),
});

export type QuizFormData = z.infer<typeof quizFormValidationSchema>;

interface QuizFormProps {
  initialData?: Quiz | null;
  lectures: Pick<Lecture, 'id' | 'title'>[];
  lessons: Pick<Lesson, 'id' | 'title' | 'lectureId' | 'content'>[];
  quizId?: string;
}

const createDefaultQuestion = (): Question => {
  const defaultFirstOptionId = uuidv4();
  return {
    id: uuidv4(),
    text: "",
    type: "multiple_choice",
    options: [
      { id: defaultFirstOptionId, text: "" },
      { id: uuidv4(), text: "" }
    ],
    correctAnswer: defaultFirstOptionId, // Default to first option's ID
    explanation: "",
  };
};

export function QuizForm({ initialData, lectures, lessons, quizId }: QuizFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultAssociationType = initialData?.lessonId ? "lesson" : initialData?.lectureId ? "lecture" : "none";
  const defaultAssociatedId = initialData?.lessonId || initialData?.lectureId || undefined;

  const methods = useForm<QuizFormData>({ 
    resolver: zodResolver(quizFormValidationSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      associationType: defaultAssociationType,
      associatedId: defaultAssociatedId,
      questions: initialData?.questions && initialData.questions.length > 0 
        ? initialData.questions.map(q => {
            let mappedCorrectAnswer = q.correctAnswer;
            let mappedOptions = (q.options || []).map(opt => ({
                id: opt.id || uuidv4(),
                text: opt.text || ""
            }));

            if (q.type === "multiple_choice") {
                while (mappedOptions.length < 2) {
                    mappedOptions.push({ id: uuidv4(), text: "" });
                }
                if (!mappedCorrectAnswer || !mappedOptions.some(opt => opt.id === mappedCorrectAnswer) ) {
                    mappedCorrectAnswer = mappedOptions.length > 0 ? mappedOptions[0].id : ""; 
                }
            } else if (q.type === "true_false") {
                if (mappedCorrectAnswer !== "true" && mappedCorrectAnswer !== "false") {
                    mappedCorrectAnswer = "true";
                }
            }
            
            return {
              id: q.id || uuidv4(),
              text: q.text || "",
              type: q.type,
              options: mappedOptions,
              correctAnswer: mappedCorrectAnswer,
              explanation: q.explanation || "",
            };
          })
        : [createDefaultQuestion()],
      durationMinutes: initialData?.durationMinutes || undefined,
    },
  });
  
  const { control, handleSubmit: handleFormSubmit, formState: {isSubmitting, errors}, watch, setValue } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const associationType = watch("associationType");
  const associatedId = watch("associatedId");

  const handleActualSubmit: SubmitHandler<QuizFormData> = async (data) => {
    try {
      if (quizId && initialData) {
        await updateQuiz(quizId, data);
        toast({
          title: "Quiz Updated",
          description: `Quiz "${data.title}" has been successfully updated.`,
        });
      } else {
        await addQuiz(data); 
        toast({
          title: "Quiz Created",
          description: `Quiz "${data.title}" has been successfully created.`,
        });
      }
      router.push("/admin/quizzes");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${quizId ? 'update' : 'create'} quiz. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
    }
  };
  
  const [isGeneratingAIQuestions, setIsGeneratingAIQuestions] = useState(false);

  const handleAIGenerateQuestions = async () => {
    if (associationType !== 'lesson' || !associatedId) {
        toast({ title: "Cannot Generate", description: "Please associate the quiz with a lesson to generate AI questions.", variant: "destructive"});
        return;
    }
    const lesson = lessons.find(l => l.id === associatedId);
    if (!lesson || !lesson.content || lesson.content.length === 0) {
        toast({ title: "Cannot Generate", description: "The associated lesson has no content.", variant: "destructive"});
        return;
    }

    const lessonTextContent = lesson.content.filter(c => c.type === 'text').map(c => c.value).join("\n\n");
    if (!lessonTextContent.trim()) {
        toast({ title: "Cannot Generate", description: "The associated lesson has no text content.", variant: "destructive"});
        return;
    }

    setIsGeneratingAIQuestions(true);
    try {
        const input: GenerateQuizQuestionsInput = {
            lessonContent: lessonTextContent,
            numberOfQuestions: 3, 
        };
        const output = await generateQuizQuestions(input);
        
        const newAIQuestions: Question[] = output.questions.map(aiQ => {
            const optionsWithIds: {id: string, text: string}[] = aiQ.options.map(optText => ({id: uuidv4(), text: optText }));
            const correctOption = optionsWithIds.find(opt => opt.text === aiQ.correctAnswer);
            
            return {
                id: uuidv4(),
                text: aiQ.question,
                type: "multiple_choice",
                options: optionsWithIds,
                correctAnswer: correctOption ? correctOption.id : (optionsWithIds.length > 0 ? optionsWithIds[0].id : ""),
                explanation: `AI Generated: Correct answer is ${aiQ.correctAnswer}`,
            };
        });

        const currentQuestions = watch("questions");
        setValue("questions", [...currentQuestions, ...newAIQuestions]);
        toast({ title: "AI Questions Generated", description: `${newAIQuestions.length} questions added to the quiz.` });

    } catch(err) {
        console.error("AI Question Generation Error:", err);
        toast({ title: "AI Generation Failed", description: err instanceof Error ? err.message : "Could not generate questions.", variant: "destructive" });
    } finally {
        setIsGeneratingAIQuestions(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={handleFormSubmit(handleActualSubmit)} className="space-y-8">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Acids and Bases - Chapter Quiz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="A brief summary of what this quiz covers." {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes, Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    {...field} 
                    value={field.value ?? ''}
                    onChange={e => {
                      const stringValue = e.target.value;
                      if (stringValue === '') {
                        field.onChange(undefined);
                      } else {
                        const num = parseInt(stringValue, 10);
                        field.onChange(isNaN(num) ? undefined : num);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="associationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associate With</FormLabel>
                  <Select onValueChange={(value) => {field.onChange(value); setValue("associatedId", undefined);}} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select association type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="lecture">Lecture</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {associationType !== "none" && (
              <FormField
                control={control}
                name="associatedId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{associationType === "lesson" ? "Select Lesson" : "Select Lecture"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select a ${associationType}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(associationType === "lesson" ? lessons : lectures).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Questions</h3>
                 <Button
                    type="button"
                    variant="outline"
                    onClick={handleAIGenerateQuestions}
                    disabled={isGeneratingAIQuestions || associationType !== 'lesson' || !associatedId}
                    className="ml-auto"
                 >
                    <Bot className="mr-2 h-4 w-4" /> {isGeneratingAIQuestions ? "Generating..." : "Generate with AI"}
                 </Button>
            </div>
            {fields.map((field, index) => (
              <QuestionForm key={field.id} questionIndex={index} removeQuestion={remove} />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append(createDefaultQuestion())}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Question
            </Button>
             {errors.questions && typeof errors.questions === 'object' && !Array.isArray(errors.questions) && (errors.questions as any).message && (
                <p className="text-sm font-medium text-destructive mt-2">{(errors.questions as any).message}</p>
            )}
            {errors.questions && Array.isArray(errors.questions) && errors.questions.length > 0 && (
                 <p className="text-sm font-medium text-destructive mt-2">One or more questions have errors. Please review them.</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || isGeneratingAIQuestions}>
              {isSubmitting ? (quizId ? "Updating..." : "Creating...") : (quizId ? "Update Quiz" : "Create Quiz")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting || isGeneratingAIQuestions}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

