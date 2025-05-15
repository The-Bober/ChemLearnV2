
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
import { useLanguage } from "@/contexts/language-context";

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
  const { t } = useLanguage();
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
    const calculatedScore = (quiz.questions.length > 0 ? (correctAnswers / quiz.questions.length) : 0) * 100;
    setCurrentScore(calculatedScore);
    setTimeLeft(0); // Stop timer

    if (user) {
      try {
        await logQuizCompletion(user.uid, quiz.id, calculatedScore);
        await refreshCompletedQuizzesCount(); // Refresh count in AuthContext
        toast({
          title: t('quiz.toastSubmittedTitle'),
          description: t('quiz.toastSubmittedDescription'),
        });
      } catch (error) {
        console.error("Failed to log quiz completion:", error);
        toast({
          title: t('quiz.toastErrorTitle'),
          description: t('quiz.toastErrorDescription'),
          variant: "destructive",
        });
      }
    }
  }, [answers, quiz, user, refreshCompletedQuizzesCount, toast, t]);

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
                <CardDescription className="text-lg">{quiz.description || t('quiz.infoCardDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t('quiz.infoCardTitle')}</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1">
                            <li dangerouslySetInnerHTML={{ __html: t('quiz.instructionNumQuestions').replace('{count}', quiz.questions.length.toString()) }} />
                            <li dangerouslySetInnerHTML={{ __html: t('quiz.instructionDuration').replace('{duration}', (quiz.durationMinutes || 10).toString()) }} />
                            <li>{t('quiz.instructionAutoSubmit')}</li>
                            <li>{t('quiz.instructionNoChange')}</li>
                        </ul>
                    </AlertDescription>
                </Alert>
                 <Button onClick={() => setShowInfo(false)} className="w-full" size="lg">
                    {t('quiz.startQuiz')}
                </Button>
                 <Button variant="outline" asChild className="w-full mt-2">
                    <Link href={quiz.lessonId ? `/learn/lessons/${quiz.lessonId}` : (quiz.lectureId ? `/learn/lectures/${quiz.lectureId}`: "/quizzes")}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> {t('quiz.backToLearning')}
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
          <CardTitle className="text-3xl text-primary">{t('quiz.resultsTitle').replace('{quizTitle}', quiz.title)}</CardTitle>
          <CardDescription className="text-xl">
            {t('quiz.yourScore')} <span className={`font-bold ${currentScore >= 70 ? 'text-green-500' : 'text-red-500'}`}>{currentScore.toFixed(2)}%</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.map((res, index) => (
            <Card key={res.id} className={res.isCorrect ? "border-green-500" : "border-red-500"}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  {res.isCorrect ? <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : <XCircle className="h-5 w-5 mr-2 text-red-500" />}
                  {t('quiz.question')} {index + 1}: {res.text}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {res.type === "multiple_choice" ? (
                    <>
                        <p>{t('quiz.yourAnswer')} <span className={res.isCorrect ? "text-green-600" : "text-red-600"}>{res.selectedOptionText || t('quiz.notAnswered')}</span></p>
                        {!res.isCorrect && <p>{t('quiz.correctAnswer')} <span className="text-green-600">{res.correctOptionText}</span></p>}
                    </>
                ) : ( // true_false
                    <>
                        <p>{t('quiz.yourAnswer')} <span className={res.isCorrect ? "text-green-600" : "text-red-600"}>{res.userAnswer || t('quiz.notAnswered')}</span></p>
                        {!res.isCorrect && <p>{t('quiz.correctAnswer')} <span className="text-green-600">{res.correctAnswer}</span></p>}
                    </>
                )}
                {res.explanation && <p className="text-muted-foreground mt-1 pt-1 border-t">{t('quiz.explanation')} {res.explanation}</p>}
              </CardContent>
            </Card>
          ))}
          <Button asChild className="w-full mt-6">
            <Link href="/quizzes">{t('quiz.backToQuizzes')}</Link>
          </Button>
           {quiz.lessonId && (
            <Button variant="outline" asChild className="w-full mt-2">
              <Link href={`/learn/lessons/${quiz.lessonId}`}>{t('quiz.backToLesson')}</Link>
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
                <span>{t('quiz.timeRemaining')}</span>
                <span className={`font-semibold ${timeLeft < 60 ? 'text-destructive' : 'text-primary'}`}>
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </span>
            </div>
            <Progress value={progressValue} aria-label={t('quiz.timeRemaining')} className="h-2" />
        </div>
      </CardHeader>
      <Separator/>
      <CardContent className="py-6 space-y-8">
        {quiz.questions.map((q, index) => (
          <div key={q.id} className="space-y-3 p-4 border rounded-lg shadow-sm bg-card">
            <Label htmlFor={`q-${q.id}`} className="text-lg font-semibold block">
              {t('quiz.question')} {index + 1}: {q.text}
            </Label>
            <RadioGroup
              id={`q-${q.id}`}
              value={answers[q.id]}
              onValueChange={(value) => handleAnswerChange(q.id, value)}
              className="space-y-2"
              aria-label={`${t('quiz.question')} ${index + 1}: ${q.text}`}
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
          {isSubmitted ? t('quiz.submitted') : t('quiz.submitQuiz')}
        </Button>
      </CardContent>
    </Card>
  );
}
