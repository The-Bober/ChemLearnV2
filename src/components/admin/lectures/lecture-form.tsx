
"use client";

import type { Lecture, LectureFormData as LectureFormDataType } from "@/types"; // Use LectureFormDataType
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { addLecture, updateLecture } from "@/services/lectureService"; // Import services

const lectureSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  order: z.coerce.number().min(1, "Order must be a positive number"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

// This type is inferred from the schema and matches LectureFormDataType structure
type SchemaInferedLectureFormData = z.infer<typeof lectureSchema>;


interface LectureFormProps {
  initialData?: Lecture | null; // Lecture includes ID, form data does not
  onSubmitProp?: (data: SchemaInferedLectureFormData) => Promise<void>; // Renamed to avoid conflict
  lectureId?: string; // Pass ID for updates
}

export function LectureForm({ initialData, lectureId }: LectureFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<SchemaInferedLectureFormData>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      order: initialData?.order || 1,
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const {formState: {isSubmitting}} = form;

  const handleSubmit: SubmitHandler<SchemaInferedLectureFormData> = async (data) => {
    try {
      if (lectureId && initialData) { // Editing existing lecture
        await updateLecture(lectureId, data);
        toast({
          title: "Lecture Updated",
          description: `Lecture "${data.title}" has been successfully updated.`,
        });
      } else { // Creating new lecture
        await addLecture(data);
        toast({
          title: "Lecture Created",
          description: `Lecture "${data.title}" has been successfully created.`,
        });
      }
      router.push("/admin/lectures"); 
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${lectureId ? 'update' : 'create'} lecture. ${error instanceof Error ? error.message : ''}`,
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
                <Input placeholder="e.g., Introduction to Organic Chemistry" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief overview of the lecture content..." {...field} />
              </FormControl>
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Lecture" : "Create Lecture")}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
