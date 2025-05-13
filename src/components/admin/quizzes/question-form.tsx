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
import type { QuizFormData } from "./quiz-form"; 

interface QuestionFormProps {
  questionIndex: number;
  removeQuestion: (index: number) => void;
}

export function QuestionForm({ questionIndex, removeQuestion }: QuestionFormProps) {
  const { control, watch, setValue } = useFormContext<QuizFormData>(); 

  const questionType = watch(`questions.${questionIndex}.type`);

  const { fields: optionsFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const handleQuestionTypeChange = (value: "true_false" | "multiple_choice") => {
    setValue(`questions.${questionIndex}.type`, value);
    const currentOptions = watch(`questions.${questionIndex}.options`);
    
    if (value === "true_false") {
      // For True/False, options are implicitly True and False, clear custom options.
      setValue(`questions.${questionIndex}.options`, []); 
      setValue(`questions.${questionIndex}.correctAnswer`, 'true'); // Default correct answer
    } else { // multiple_choice
      // Ensure at least two options exist for multiple choice
      if (!currentOptions || currentOptions.length < 2) {
        const newOptions = [
            { id: uuidv4(), text: "" },
            { id: uuidv4(), text: "" }
        ];
        setValue(`questions.${questionIndex}.options`, newOptions);
        setValue(`questions.${questionIndex}.correctAnswer`, newOptions[0].id); // Default to first option
      } else {
        // If options exist, ensure a correct answer is set (or default to first if none)
        const correctAnswer = watch(`questions.${questionIndex}.correctAnswer`);
        if (!correctAnswer || !currentOptions.some(opt => opt.id === correctAnswer)) {
            setValue(`questions.${questionIndex}.correctAnswer`, currentOptions[0].id);
        }
      }
    }
  };
  

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
              <Select onValueChange={(value: "true_false" | "multiple_choice") => { field.onChange(value); handleQuestionTypeChange(value); }} defaultValue={field.value}>
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
            <FormLabel>Options (Select Correct Answer)</FormLabel>
            <Controller
              name={`questions.${questionIndex}.correctAnswer`}
              control={control}
              render={({ field: radioGroupField }) => (
                <RadioGroup
                  value={radioGroupField.value}
                  onValueChange={radioGroupField.onChange}
                  className="space-y-2"
                >
                  {optionsFields.map((optionField, optionIndex) => (
                    <FormItem key={optionField.id} className="flex items-center gap-2 p-2 border rounded-md">
                      <FormControl>
                        <RadioGroupItem
                          value={optionField.id}
                          id={`q-${questionIndex}-opt-${optionField.id}`}
                        />
                      </FormControl>
                      <Label htmlFor={`q-${questionIndex}-opt-${optionField.id}`} className="flex-grow cursor-pointer">
                        <FormField
                          control={control}
                          name={`questions.${questionIndex}.options.${optionIndex}.text`}
                          render={({ field: inputField }) => (
                            // No nested FormItem needed here for simplicity, FormMessage will be picked up by RHF
                            <>
                              <FormControl>
                                <Input placeholder={`Option ${optionIndex + 1}`} {...inputField} />
                              </FormControl>
                              <FormMessage /> 
                            </>
                          )}
                        />
                      </Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optionIndex)} disabled={optionsFields.length <= 2}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </FormItem>
                  ))}
                </RadioGroup>
              )}
            />
            {/* Display validation message for the correctAnswer field itself */}
             <FormField
              control={control}
              name={`questions.${questionIndex}.correctAnswer`}
              render={({ fieldState }) => <FormMessage>{fieldState.error?.message}</FormMessage>}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendOption({ id: uuidv4(), text: "" })}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Option
            </Button>
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
                    value={field.value || "true"} // Ensure value is controlled
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="true" id={`q-${questionIndex}-true`} />
                      </FormControl>
                      <FormLabel htmlFor={`q-${questionIndex}-true`} className="font-normal">True</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="false" id={`q-${questionIndex}-false`} />
                      </FormControl>
                      <FormLabel htmlFor={`q-${questionIndex}-false`} className="font-normal">False</FormLabel>
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