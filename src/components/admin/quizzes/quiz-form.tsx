
"use client";

import type { Quiz, Question, Lecture, Lesson } from "@/types";
import { useForm, type SubmitHandler, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { QuestionForm } from "./question-form";
import { v4 as uuidv4 } from "uuid";
import { PlusCircle, Bot } from "lucide-react";
import { generateQuizQuestions, type GenerateQuizQuestionsInput } from "@/ai/flows/generate-quiz-questions";

const questionOptionSchema = z.object({
  id: z.string().default(() => uuidv4()),
  text: z.string().min(1, "Option text cannot be empty"),
});

const questionSchema = z.object({
  id: z.string().default(() => uuidv4()),
  text: z.string().min(5, "Question text must be at least 5 characters"),
  type: z.enum(["true_false", "multiple_choice"]),
  options: z.array(questionOptionSchema),
  correctAnswer: z.string().min(1, "A correct answer must be selected/provided"),
  explanation: z.string().optional(),
}).refine(data => {
    if (data.type === "multiple_choice") {
        return data.options.length >= 2 && data.options.some(opt => opt.id === data.correctAnswer);
    }
    return true;
}, {
    message: "Multiple choice questions must have at least 2 options and a selected correct answer.",
    path: ["options"],
});


const quizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  associationType: z.enum(["lesson", "lecture", "none"]).default("none"),
  associatedId: z.string().optional(),
  questions: z.array(questionSchema).min(1, "A quiz must have at least one question."),
});

export type QuizFormData = z.infer<typeof quizSchema>;

interface QuizFormProps {
  initialData?: Quiz | null;
  lectures: Pick<Lecture, 'id' | 'title'>[];
  lessons: Pick<Lesson, 'id' | 'title' | 'lectureId' | 'content'>[]; // Include content for AI generation
  onSubmit: (data: QuizFormData) => Promise<void>;
}

export function QuizForm({ initialData, lectures, lessons, onSubmit }: QuizFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultAssociationType = initialData?.lessonId ? "lesson" : initialData?.lectureId ? "lecture" : "none";
  const defaultAssociatedId = initialData?.lessonId || initialData?.lectureId || undefined;

  const methods = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      associationType: defaultAssociationType,
      associatedId: defaultAssociatedId,
      questions: initialData?.questions && initialData.questions.length > 0 
        ? initialData.questions.map(q => ({...q, options: q.options || []})) // Ensure options is always an array
        : [{ id: uuidv4(), text: "", type: "multiple_choice", options: [{id: uuidv4(), text:""}, {id:uuidv4(), text:""}], correctAnswer: "" }],
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
      await onSubmit(data);
      toast({
        title: initialData ? "Quiz Updated" : "Quiz Created",
        description: `Quiz "${data.title}" has been successfully ${initialData ? 'updated' : 'created'}.`,
      });
      router.push("/admin/quizzes");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${initialData ? 'update' : 'create'} quiz. ${error instanceof Error ? error.message : ''}`,
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
            numberOfQuestions: 3, // Or make this configurable
        };
        const output = await generateQuizQuestions(input);
        
        const newAIQuestions: Question[] = output.questions.map(aiQ => {
            const options: {id: string, text: string}[] = aiQ.options.map(optText => ({id: uuidv4(), text: optText }));
            const correctOption = options.find(opt => opt.text === aiQ.correctAnswer);
            return {
                id: uuidv4(),
                text: aiQ.question,
                type: "multiple_choice", // Assuming AI generates MCQs
                options: options,
                correctAnswer: correctOption ? correctOption.id : (options.length > 0 ? options[0].id : ""), // Fallback
                explanation: `AI Generated: Correct answer is ${aiQ.correctAnswer}`,
            };
        });

        setValue("questions", [...watch("questions"), ...newAIQuestions]);
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
                  <Textarea placeholder="A brief summary of what this quiz covers." {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              onClick={() => append({ id: uuidv4(), text: "", type: "multiple_choice", options: [{id: uuidv4(), text:""}, {id:uuidv4(), text:""}], correctAnswer: "" })}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Question
            </Button>
             {errors.questions && typeof errors.questions === 'object' && !Array.isArray(errors.questions) && (
                <p className="text-sm font-medium text-destructive mt-2">{(errors.questions as any).message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || isGeneratingAIQuestions}>
              {isSubmitting ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Quiz" : "Create Quiz")}
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
