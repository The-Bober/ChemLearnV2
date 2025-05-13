
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
  getCountFromServer,
} from 'firebase/firestore';
import type { Quiz, QuizFormData, Lecture, Lesson, UserQuizCompletion } from '@/types';
import { logActivity } from './activityService'; // Import activity logger

const quizzesCollection = collection(db, 'quizzes');
const lecturesCollection = collection(db, 'lectures');
const lessonsCollection = collection(db, 'lessons');
const userQuizCompletionsCollection = collection(db, 'userQuizCompletions');

// Helper to convert Firestore data with Timestamps to serializable Quiz
function toSerializableQuiz(docSnap: any): Quiz {
  const data = docSnap.data() as Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: Timestamp, updatedAt?: Timestamp };
  const questions = data.questions.map(q => ({ ...q, options: q.options || [] }));
  return {
    ...data,
    id: docSnap.id,
    questions,
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
  };
}


export async function getQuizById(id: string): Promise<Quiz | null> {
  const docRef = doc(db, 'quizzes', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return toSerializableQuiz(docSnap);
  }
  return null;
}

export async function getQuizByLessonId(lessonId: string): Promise<Quiz | null> {
  const q = query(quizzesCollection, where('lessonId', '==', lessonId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return toSerializableQuiz(docSnap);
  }
  return null;
}

export async function getQuizByLectureId(lectureId: string): Promise<Quiz | null> {
  const q = query(quizzesCollection, where('lectureId', '==', lectureId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return toSerializableQuiz(docSnap);
  }
  return null;
}

export interface EnrichedQuiz extends Omit<Quiz, 'questions' | 'createdAt' | 'updatedAt'> {
  questionsCount: number;
  associatedTitle?: string;
  associatedType?: 'Lesson' | 'Lecture' | 'N/A';
  associatedWithTitle?: string; // Added for consistency with quizzes-table
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllQuizzesEnriched(): Promise<EnrichedQuiz[]> {
  const q = query(quizzesCollection, orderBy('title'));
  const snapshot = await getDocs(q);
  const quizzes: EnrichedQuiz[] = [];

  const lecturesCache: Record<string, string> = {};
  const lessonsCache: Record<string, string> = {};

  for (const docSnap of snapshot.docs) {
    const data = toSerializableQuiz(docSnap); // Use helper for base quiz data
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
      associatedWithTitle: associatedTitle || 'Not Associated', // Ensure this is always set
      associatedTitle: associatedTitle,
      associatedType,
    });
  }
  return quizzes;
}

export async function addQuiz(data: QuizFormData): Promise<string> {
  const quizDataToSave: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'> = { 
    title: data.title,
    description: data.description,
    lessonId: data.associationType === "lesson" ? data.associatedId : undefined,
    lectureId: data.associationType === "lecture" ? data.associatedId : undefined,
    questions: data.questions.map(q => ({...q, options: q.options || []})),
    durationMinutes: data.durationMinutes,
  };

  const docRef = await addDoc(quizzesCollection, {
    ...quizDataToSave,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  await logActivity('quiz_created', `Quiz "${data.title}" was created.`, docRef.id);
  return docRef.id;
}

export async function updateQuiz(id: string, data: QuizFormData): Promise<void> {
  const quizDataToSave: Partial<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>> = {
    title: data.title,
    description: data.description,
    lessonId: data.associationType === "lesson" ? data.associatedId : undefined,
    lectureId: data.associationType === "lecture" ? data.associatedId : undefined,
    questions: data.questions.map(q => ({...q, options: q.options || []})),
    durationMinutes: data.durationMinutes,
  };
  const docRef = doc(db, 'quizzes', id);
  await updateDoc(docRef, {
    ...quizDataToSave,
    updatedAt: Timestamp.now(),
  });
  const quizAfterUpdate = await getDoc(docRef);
  const title = data.title || (quizAfterUpdate.exists() ? (quizAfterUpdate.data() as Quiz).title : 'Unknown Quiz');
  await logActivity('quiz_updated', `Quiz "${title}" was updated.`, id);
}

export async function deleteQuiz(quizId: string, existingBatch?: WriteBatch): Promise<void> {
  const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
  const title = quizDoc.exists() ? (quizDoc.data()as Quiz).title : 'Unknown Quiz';

  const batch = existingBatch || writeBatch(db);
  const quizRef = doc(db, 'quizzes', quizId);
  batch.delete(quizRef);
  if (!existingBatch) {
    await batch.commit();
  }
  // Log only if not part of a larger batch operation.
  if (!existingBatch) {
     await logActivity('quiz_deleted', `Quiz "${title}" was deleted.`, quizId);
  }
}

export async function deleteQuizzesByLessonId(lessonId: string, existingBatch: WriteBatch): Promise<void> {
  const quizzesQuery = query(quizzesCollection, where('lessonId', '==', lessonId));
  const quizzesSnapshot = await getDocs(quizzesQuery);
  quizzesSnapshot.forEach(quizDoc => {
    existingBatch.delete(quizDoc.ref);
    // Individual quiz deletion logs are skipped here.
  });
}

export async function deleteQuizzesByLectureId(lectureId: string, existingBatch: WriteBatch): Promise<void> {
  const quizzesQuery = query(quizzesCollection, where('lectureId', '==', lectureId));
  const quizzesSnapshot = await getDocs(quizzesQuery);
  quizzesSnapshot.forEach(quizDoc => {
    existingBatch.delete(quizDoc.ref);
    // Individual quiz deletion logs are skipped here.
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
      content: data.content as Lesson['content'] // Assuming content is stored and needed
    };
  });
}

export async function logQuizCompletion(userId: string, quizId: string, score: number): Promise<string> {
  const completionData: Omit<UserQuizCompletion, 'id' | 'completedAt'> & { completedAt: Timestamp } = {
    userId,
    quizId,
    score,
    completedAt: Timestamp.now(),
  };
  const docRef = await addDoc(userQuizCompletionsCollection, completionData);
  
  const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
  const quizTitle = quizDoc.exists() ? (quizDoc.data() as Quiz).title : 'Unknown Quiz';
  await logActivity('quiz_taken', `User completed quiz "${quizTitle}" with score ${score.toFixed(0)}%.`, quizId, userId);
  
  return docRef.id;
}

export async function getUserCompletedQuizzesCount(userId: string): Promise<number> {
  try {
    const q = query(userQuizCompletionsCollection, where('userId', '==', userId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching user completed quizzes count:", error);
    return 0;
  }
}

