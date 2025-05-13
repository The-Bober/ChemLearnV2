
"use client";

import type { Question, QuestionOption } from "@/types";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { QuizFormData } from "./quiz-form"; // Assuming QuizFormData is defined in quiz-form

interface QuestionFormProps {
  questionIndex: number;
  removeQuestion: (index: number) => void;
}

export function QuestionForm({ questionIndex, removeQuestion }: QuestionFormProps) {
  const { control, watch, setValue } = useFormContext<QuizFormData>(); // Use QuizFormData type

  const questionType = watch(`questions.${questionIndex}.type`);

  const { fields: optionsFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const handleQuestionTypeChange = (value: "true_false" | "multiple_choice") => {
    setValue(`questions.${questionIndex}.type`, value);
    if (value === "true_false") {
      setValue(`questions.${questionIndex}.options`, []); // Clear options for true/false
      setValue(`questions.${questionIndex}.correctAnswer`, 'true'); // Default for true/false
    } else {
      // For multiple_choice, ensure at least two options exist, set first as correct by default
      const currentOptions = watch(`questions.${questionIndex}.options`);
      if (!currentOptions || currentOptions.length < 2) {
        const newOptions = [
            { id: uuidv4(), text: "" },
            { id: uuidv4(), text: "" }
        ];
        setValue(`questions.${questionIndex}.options`, newOptions);
        setValue(`questions.${questionIndex}.correctAnswer`, newOptions[0].id);
      } else {
         setValue(`questions.${questionIndex}.correctAnswer`, currentOptions[0].id);
      }
    }
  };
  
  const currentOptions = watch(`questions.${questionIndex}.options`);

  return (
    <Card className="mb-4 p-4 border border-border">
      <CardHeader className="p-2 mb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          Question {questionIndex + 1}
          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(questionIndex)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-2">
        <FormField
          control={control}
          name={`questions.${questionIndex}.text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Text</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter the question text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`questions.${questionIndex}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Type</FormLabel>
              <Select onValueChange={(value: "true_false" | "multiple_choice") => handleQuestionTypeChange(value)} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {questionType === "multiple_choice" && (
          <div className="space-y-3">
            <FormLabel>Options</FormLabel>
            {optionsFields.map((optionField, optionIndex) => (
              <div key={optionField.id} className="flex items-center gap-2 p-2 border rounded-md">
                <Controller
                  name={`questions.${questionIndex}.correctAnswer`}
                  control={control}
                  render={({ field: radioField }) => (
                    <RadioGroupItem 
                      value={optionField.id} 
                      id={`${questionIndex}-opt-${optionField.id}`} 
                      checked={radioField.value === optionField.id}
                      onClick={() => radioField.onChange(optionField.id)}
                      className="mr-2"
                      aria-label={`Set option ${optionIndex + 1} as correct`}
                    />
                  )}
                />
                <FormField
                  control={control}
                  name={`questions.${questionIndex}.options.${optionIndex}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                       <FormControl>
                        <Input placeholder={`Option ${optionIndex + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optionIndex)} disabled={optionsFields.length <= 2}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendOption({ id: uuidv4(), text: "" })}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Option
            </Button>
             {currentOptions && currentOptions.length > 0 && !watch(`questions.${questionIndex}.correctAnswer`) && (
                <p className="text-sm text-destructive">Please select a correct answer.</p>
            )}
          </div>
        )}

        {questionType === "true_false" && (
          <FormField
            control={control}
            name={`questions.${questionIndex}.correctAnswer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value || "true"}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="true" id={`${questionIndex}-true`} />
                      </FormControl>
                      <FormLabel htmlFor={`${questionIndex}-true`} className="font-normal">True</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="false" id={`${questionIndex}-false`} />
                      </FormControl>
                      <FormLabel htmlFor={`${questionIndex}-false`} className="font-normal">False</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name={`questions.${questionIndex}.explanation`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Explanation (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Explain why the answer is correct" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
