
'use server';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
  type WriteBatch,
} from 'firebase/firestore';
import type { Quiz, QuizFormData, Lecture, Lesson } from '@/types';

const quizzesCollection = collection(db, 'quizzes');
const lecturesCollection = collection(db, 'lectures');
const lessonsCollection = collection(db, 'lessons');


export async function getQuizById(id: string): Promise<Quiz | null> {
  const docRef = doc(db, 'quizzes', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const quiz = docSnap.data() as Quiz;
    // Ensure questions always have an options array
    quiz.questions = quiz.questions.map(q => ({ ...q, options: q.options || [] }));
    return { ...quiz, id: docSnap.id };
  }
  return null;
}

export async function getQuizByLessonId(lessonId: string): Promise<Quiz | null> {
  const q = query(quizzesCollection, where('lessonId', '==', lessonId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    const quiz = docSnap.data() as Quiz;
    quiz.questions = quiz.questions.map(q => ({ ...q, options: q.options || [] }));
    return { ...quiz, id: docSnap.id };
  }
  return null;
}

export async function getQuizByLectureId(lectureId: string): Promise<Quiz | null> {
  const q = query(quizzesCollection, where('lectureId', '==', lectureId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    const quiz = docSnap.data() as Quiz;
    quiz.questions = quiz.questions.map(q => ({ ...q, options: q.options || [] }));
    return { ...quiz, id: docSnap.id };
  }
  return null;
}

export interface EnrichedQuiz extends Omit<Quiz, 'questions'> {
  questionsCount: number;
  associatedTitle?: string;
  associatedType?: 'Lesson' | 'Lecture' | 'N/A';
}

export async function getAllQuizzesEnriched(): Promise<EnrichedQuiz[]> {
  const q = query(quizzesCollection, orderBy('title'));
  const snapshot = await getDocs(q);
  const quizzes: EnrichedQuiz[] = [];

  const lecturesCache: Record<string, string> = {};
  const lessonsCache: Record<string, string> = {};

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as Quiz;
    let associatedTitle: string | undefined;
    let associatedType: 'Lesson' | 'Lecture' | 'N/A' = 'N/A';

    if (data.lessonId) {
      associatedType = 'Lesson';
      if (lessonsCache[data.lessonId]) {
        associatedTitle = lessonsCache[data.lessonId];
      } else {
        const lessonRef = doc(db, 'lessons', data.lessonId);
        const lessonSnap = await getDoc(lessonRef);
        if (lessonSnap.exists()) {
          associatedTitle = (lessonSnap.data() as Lesson).title;
          lessonsCache[data.lessonId] = associatedTitle as string;
        }
      }
    } else if (data.lectureId) {
      associatedType = 'Lecture';
       if (lecturesCache[data.lectureId]) {
        associatedTitle = lecturesCache[data.lectureId];
      } else {
        const lectureRef = doc(db, 'lectures', data.lectureId);
        const lectureSnap = await getDoc(lectureRef);
        if (lectureSnap.exists()) {
          associatedTitle = (lectureSnap.data() as Lecture).title;
          lecturesCache[data.lectureId] = associatedTitle as string;
        }
      }
    }
    
    const { questions, ...rest } = data;
    quizzes.push({
      ...rest,
      id: docSnap.id,
      questionsCount: questions.length,
      associatedWithTitle: associatedTitle || 'Not Associated',
      associatedType,
    });
  }
  return quizzes;
}

export async function addQuiz(data: QuizFormData): Promise<string> {
  const quizDataToSave: Omit<Quiz, 'id'> = {
    title: data.title,
    description: data.description,
    lessonId: data.associationType === "lesson" ? data.associatedId : undefined,
    lectureId: data.associationType === "lecture" ? data.associatedId : undefined,
    questions: data.questions.map(q => ({...q, options: q.options || []})), // Ensure options array
    // durationMinutes is not in QuizFormData, assuming it might be added later or is optional
  };

  const docRef = await addDoc(quizzesCollection, {
    ...quizDataToSave,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateQuiz(id: string, data: QuizFormData): Promise<void> {
  const quizDataToSave: Partial<Omit<Quiz, 'id'>> = {
    title: data.title,
    description: data.description,
    lessonId: data.associationType === "lesson" ? data.associatedId : undefined,
    lectureId: data.associationType === "lecture" ? data.associatedId : undefined,
    questions: data.questions.map(q => ({...q, options: q.options || []})),
  };
  const docRef = doc(db, 'quizzes', id);
  await updateDoc(docRef, {
    ...quizDataToSave,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteQuiz(quizId: string, existingBatch?: WriteBatch): Promise<void> {
  const batch = existingBatch || writeBatch(db);
  const quizRef = doc(db, 'quizzes', quizId);
  batch.delete(quizRef);
  if (!existingBatch) {
    await batch.commit();
  }
}

// For cascading deletes
export async function deleteQuizzesByLessonId(lessonId: string, existingBatch: WriteBatch): Promise<void> {
  const quizzesQuery = query(quizzesCollection, where('lessonId', '==', lessonId));
  const quizzesSnapshot = await getDocs(quizzesQuery);
  quizzesSnapshot.forEach(quizDoc => {
    existingBatch.delete(quizDoc.ref);
  });
}

export async function deleteQuizzesByLectureId(lectureId: string, existingBatch: WriteBatch): Promise<void> {
  const quizzesQuery = query(quizzesCollection, where('lectureId', '==', lectureId));
  const quizzesSnapshot = await getDocs(quizzesQuery);
  quizzesSnapshot.forEach(quizDoc => {
    existingBatch.delete(quizDoc.ref);
  });
}

export async function getLessonsForSelect(): Promise<Pick<Lesson, 'id' | 'title' | 'lectureId' | 'content'>[]> {
  const q = query(lessonsCollection, orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      title: data.title as string,
      lectureId: data.lectureId as string,
      content: data.content as Lesson['content'] // Ensure content is included
    };
  });
}
