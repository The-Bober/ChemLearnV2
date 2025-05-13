
"use client";

import type { Lecture } from "@/types";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const lectureSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  order: z.coerce.number().min(1, "Order must be a positive number"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type LectureFormData = z.infer<typeof lectureSchema>;

interface LectureFormProps {
  initialData?: Lecture | null;
  onSubmit: (data: LectureFormData) => Promise<void>; // Simulate async submission
}

export function LectureForm({ initialData, onSubmit }: LectureFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<LectureFormData>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      order: initialData?.order || 1,
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const {formState: {isSubmitting}} = form;

  const handleSubmit: SubmitHandler<LectureFormData> = async (data) => {
    try {
      await onSubmit(data);
      toast({
        title: initialData ? "Lecture Updated" : "Lecture Created",
        description: `Lecture "${data.title}" has been successfully ${initialData ? 'updated' : 'created'}.`,
      });
      router.push("/admin/lectures"); // Redirect to lectures list
      router.refresh(); // Refresh server components
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${initialData ? 'update' : 'create'} lecture. ${error instanceof Error ? error.message : ''}`,
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
