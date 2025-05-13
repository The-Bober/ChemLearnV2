
"use client";

import type { Quiz, Question, QuestionOption } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Timer, ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import { logQuizCompletion } from "@/services/quizService"; // Import quiz service
import { useToast } from "@/hooks/use-toast";

interface QuizTakerProps {
  quiz: Quiz;
}

interface Answer {
  questionId: string;
  selectedOptionId?: string; // For multiple_choice
  selectedBoolean?: "true" | "false"; // For true_false
}

interface Result extends Question {
  userAnswer?: string; // ID of selected option or "true"/"false"
  isCorrect: boolean;
  selectedOptionText?: string; // For MCQs
  correctOptionText?: string; // For MCQs
}

export function QuizTaker({ quiz }: QuizTakerProps) {
  const { user, refreshCompletedQuizzesCount } = useAuth(); // Get user and refresh function
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOptionId or "true"/"false"
  const [timeLeft, setTimeLeft] = useState<number>((quiz.durationMinutes || 10) * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [results, setResults] = useState<Result[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0); // Renamed from score to currentScore
  const [showInfo, setShowInfo] = useState<boolean>(true);


  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true);
    let correctAnswers = 0;
    const detailedResults = quiz.questions.map(q => {
      const userAnswerValue = answers[q.id];
      let isCorrect = false;
      let selectedOptionText: string | undefined;
      let correctOptionText: string | undefined;

      if (q.type === "multiple_choice") {
        isCorrect = userAnswerValue === q.correctAnswer;
        selectedOptionText = q.options.find(opt => opt.id === userAnswerValue)?.text;
        correctOptionText = q.options.find(opt => opt.id === q.correctAnswer)?.text;
      } else if (q.type === "true_false") {
        isCorrect = userAnswerValue === q.correctAnswer;
      }
      
      if (isCorrect) {
        correctAnswers++;
      }
      return { ...q, userAnswer: userAnswerValue, isCorrect, selectedOptionText, correctOptionText };
    });
    setResults(detailedResults);
    const calculatedScore = (correctAnswers / quiz.questions.length) * 100;
    setCurrentScore(calculatedScore);
    setTimeLeft(0); // Stop timer

    if (user) {
      try {
        await logQuizCompletion(user.uid, quiz.id, calculatedScore);
        await refreshCompletedQuizzesCount(); // Refresh count in AuthContext
        toast({
          title: "Quiz Submitted",
          description: "Your results have been recorded.",
        });
      } catch (error) {
        console.error("Failed to log quiz completion:", error);
        toast({
          title: "Submission Error",
          description: "Could not record your quiz completion. Please try again later.",
          variant: "destructive",
        });
      }
    }
  }, [answers, quiz, user, refreshCompletedQuizzesCount, toast]);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0 || !showInfo) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft, handleSubmit, showInfo]);

  const handleAnswerChange = (questionId: string, value: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  if(showInfo) {
    return (
        <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
                <CardTitle className="text-3xl text-primary">{quiz.title}</CardTitle>
                <CardDescription className="text-lg">{quiz.description || "Prepare to test your knowledge."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Quiz Instructions</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>This quiz has <strong>{quiz.questions.length} questions</strong>.</li>
                            <li>You have <strong>{quiz.durationMinutes || 10} minutes</strong> to complete it.</li>
                            <li>Your answers will be submitted automatically when the time runs out.</li>
                            <li>Once submitted, you cannot change your answers.</li>
                        </ul>
                    </AlertDescription>
                </Alert>
                 <Button onClick={() => setShowInfo(false)} className="w-full" size="lg">
                    Start Quiz
                </Button>
                 <Button variant="outline" asChild className="w-full mt-2">
                    <Link href={quiz.lessonId ? `/learn/lessons/${quiz.lessonId}` : (quiz.lectureId ? `/learn/lectures/${quiz.lectureId}`: "/quizzes")}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Learning
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
  }


  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary">Quiz Results: {quiz.title}</CardTitle>
          <CardDescription className="text-xl">
            Your Score: <span className={`font-bold ${currentScore >= 70 ? 'text-green-500' : 'text-red-500'}`}>{currentScore.toFixed(2)}%</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.map((res, index) => (
            <Card key={res.id} className={res.isCorrect ? "border-green-500" : "border-red-500"}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  {res.isCorrect ? <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : <XCircle className="h-5 w-5 mr-2 text-red-500" />}
                  Question {index + 1}: {res.text}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {res.type === "multiple_choice" ? (
                    <>
                        <p>Your answer: <span className={res.isCorrect ? "text-green-600" : "text-red-600"}>{res.selectedOptionText || "Not answered"}</span></p>
                        {!res.isCorrect && <p>Correct answer: <span className="text-green-600">{res.correctOptionText}</span></p>}
                    </>
                ) : ( // true_false
                    <>
                        <p>Your answer: <span className={res.isCorrect ? "text-green-600" : "text-red-600"}>{res.userAnswer || "Not answered"}</span></p>
                        {!res.isCorrect && <p>Correct answer: <span className="text-green-600">{res.correctAnswer}</span></p>}
                    </>
                )}
                {res.explanation && <p className="text-muted-foreground mt-1 pt-1 border-t">Explanation: {res.explanation}</p>}
              </CardContent>
            </Card>
          ))}
          <Button asChild className="w-full mt-6">
            <Link href="/quizzes">Back to Quizzes</Link>
          </Button>
           {quiz.lessonId && (
            <Button variant="outline" asChild className="w-full mt-2">
              <Link href={`/learn/lessons/${quiz.lessonId}`}>Back to Lesson</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressValue = (timeLeft / ((quiz.durationMinutes || 10) * 60)) * 100;

  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl text-primary">{quiz.title}</CardTitle>
        {quiz.description && <CardDescription className="text-md">{quiz.description}</CardDescription>}
        <div className="pt-2">
            <div className="flex justify-between items-center mb-1 text-sm text-muted-foreground">
                <span>Time Remaining:</span>
                <span className={`font-semibold ${timeLeft < 60 ? 'text-destructive' : 'text-primary'}`}>
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </span>
            </div>
            <Progress value={progressValue} aria-label="Time remaining" className="h-2" />
        </div>
      </CardHeader>
      <Separator/>
      <CardContent className="py-6 space-y-8">
        {quiz.questions.map((q, index) => (
          <div key={q.id} className="space-y-3 p-4 border rounded-lg shadow-sm bg-card">
            <Label htmlFor={`q-${q.id}`} className="text-lg font-semibold block">
              Question {index + 1}: {q.text}
            </Label>
            <RadioGroup
              id={`q-${q.id}`}
              value={answers[q.id]}
              onValueChange={(value) => handleAnswerChange(q.id, value)}
              className="space-y-2"
              aria-label={`Question ${index + 1}: ${q.text}`}
            >
              {q.type === "multiple_choice" ? (
                q.options.map(opt => (
                  <div key={opt.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={opt.id} id={`q-${q.id}-opt-${opt.id}`} />
                    <Label htmlFor={`q-${q.id}-opt-${opt.id}`} className="font-normal cursor-pointer flex-1">{opt.text}</Label>
                  </div>
                ))
              ) : ( // true_false
                <>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="true" id={`q-${q.id}-true`} />
                    <Label htmlFor={`q-${q.id}-true`} className="font-normal cursor-pointer flex-1">True</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="false" id={`q-${q.id}-false`} />
                    <Label htmlFor={`q-${q.id}-false`} className="font-normal cursor-pointer flex-1">False</Label>
                  </div>
                </>
              )}
            </RadioGroup>
          </div>
        ))}
        <Button onClick={handleSubmit} disabled={isSubmitted} className="w-full text-lg py-6">
          {isSubmitted ? "Submitted" : "Submit Quiz"}
        </Button>
      </CardContent>
    </Card>
  );
}
