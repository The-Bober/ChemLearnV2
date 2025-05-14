
"use client";

import type { Lesson, Lecture, LessonContentBlock, LessonFormData as LessonFormDataType } from "@/types";
import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Trash2, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { addLesson, updateLesson } from "@/services/lessonService"; 

const lessonContentBlockSchema = z.object({
  id: z.string().default(() => uuidv4()),
  type: z.enum(["text", "formula", "image", "video"]),
  value: z.string().min(1, "Content value cannot be empty."),
  altText: z.string().optional(),
});

const lessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  lectureId: z.string().min(1, "Lecture association is required"),
  order: z.coerce.number().min(1, "Order must be a positive number"),
  estimatedTimeMinutes: z.coerce.number().optional(),
  content: z.array(lessonContentBlockSchema).min(1, "Lesson must have at least one content block."),
});

export type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonFormProps {
  initialData?: Lesson | null; 
  lectures: Pick<Lecture, 'id' | 'title'>[];
  lessonId?: string; 
}

export function LessonForm({ initialData, lectures, lessonId }: LessonFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title || "",
      lectureId: initialData?.lectureId || (lectures.length > 0 ? lectures[0].id : ""),
      order: initialData?.order || 1,
      estimatedTimeMinutes: initialData?.estimatedTimeMinutes || undefined,
      content: initialData?.content && initialData.content.length > 0 
        ? initialData.content.map(c => ({...c, id: c.id || uuidv4()})) 
        : [{ id: uuidv4(), type: "text", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "content",
  });

  const {formState: {isSubmitting}} = form;

  const handleSubmit: SubmitHandler<LessonFormData> = async (data) => {
    try {
      if (lessonId && initialData) {
        await updateLesson(lessonId, data);
         toast({
          title: "Lesson Updated",
          description: `Lesson "${data.title}" has been successfully updated.`,
        });
      } else {
        await addLesson(data);
        toast({
          title: "Lesson Created",
          description: `Lesson "${data.title}" has been successfully created.`,
        });
      }
      router.push("/admin/lessons");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${lessonId ? 'update' : 'create'} lesson. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Introduction to Acids and Bases" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lectureId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Lecture</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lecture" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {lectures.map((lecture) => (
                    <SelectItem key={lecture.id} value={lecture.id}>
                      {lecture.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="estimatedTimeMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Time (minutes, Optional)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="15" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Content Blocks</FormLabel>
          <div className="space-y-4 mt-2">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name={`content.${index}.type`}
                    render={({ field: typeField }) => (
                      <FormItem>
                        <FormLabel>Block Type</FormLabel>
                        <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select block type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">Text (Markdown)</SelectItem>
                            <SelectItem value="image">Image URL</SelectItem>
                            <SelectItem value="video">Video URL (Embed)</SelectItem>
                            <SelectItem value="formula">Chemical Formula</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`content.${index}.value`}
                    render={({ field: valueField }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          {form.watch(`content.${index}.type`) === 'text' ? (
                            <Textarea placeholder="Enter text content (Markdown supported)..." {...valueField} rows={8}/>
                          ) : (
                            <Input placeholder="Enter URL or formula..." {...valueField} />
                          )}
                        </FormControl>
                         {form.watch(`content.${index}.type`) === 'text' && (
                            <FormDescription>
                                Markdown is supported, including tables, lists, bold, italics, etc. Single newlines will create line breaks.
                            </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {form.watch(`content.${index}.type`) === 'image' && (
                   <FormField
                    control={form.control}
                    name={`content.${index}.altText`}
                    render={({ field: altTextField }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Image Alt Text (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Descriptive text for the image" {...altTextField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove Block
                </Button>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ id: uuidv4(), type: "text", value: "" })}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Content Block
            </Button>
          </div>
           {form.formState.errors.content && typeof form.formState.errors.content === 'object' && !Array.isArray(form.formState.errors.content) && (
            <p className="text-sm font-medium text-destructive mt-2">{(form.formState.errors.content as any).message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Lesson" : "Create Lesson")}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
