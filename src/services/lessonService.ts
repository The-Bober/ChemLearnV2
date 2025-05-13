
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
import type { Lesson, LessonFormData, Lecture } from '@/types';
import { deleteQuizzesByLessonId } from './quizService';
import { logActivity } from './activityService'; // Import activity logger

const lessonsCollection = collection(db, 'lessons');
const lecturesCollection = collection(db, 'lectures');


export async function getLessonsByLectureId(lectureId: string): Promise<Lesson[]> {
  const q = query(lessonsCollection, where('lectureId', '==', lectureId), orderBy('order'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as Lesson));
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const docRef = doc(db, 'lessons', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as Lesson) : null;
}

export async function addLesson(data: LessonFormData): Promise<string> {
  const docRef = await addDoc(lessonsCollection, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  await logActivity('lesson_created', `Lesson "${data.title}" was created.`, docRef.id);
  return docRef.id;
}

export async function updateLesson(id: string, data: Partial<LessonFormData>): Promise<void> {
  const docRef = doc(db, 'lessons', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
  const title = data.title || (await getLessonById(id))?.title || 'Unknown Lesson';
  await logActivity('lesson_updated', `Lesson "${title}" was updated.`, id);
}

export async function deleteLesson(lessonId: string, existingBatch?: WriteBatch): Promise<void> {
  const lesson = await getLessonById(lessonId);
  const title = lesson?.title || 'Unknown Lesson';

  const batch = existingBatch || writeBatch(db);
  const lessonRef = doc(db, 'lessons', lessonId);
  batch.delete(lessonRef);

  await deleteQuizzesByLessonId(lessonId, batch);

  if (!existingBatch) {
    await batch.commit();
  }
  // Log only if not part of a larger batch operation (like deleting a lecture)
  // to avoid duplicate/confusing logs. The lecture deletion will log the overall action.
  if (!existingBatch) {
    await logActivity('lesson_deleted', `Lesson "${title}" and its quizzes were deleted.`, lessonId);
  }
}

export async function deleteLessonsByLectureId(lectureId: string, existingBatch?: WriteBatch): Promise<void> {
  const batch = existingBatch || writeBatch(db);
  const lessonsQuery = query(lessonsCollection, where('lectureId', '==', lectureId));
  const lessonsSnapshot = await getDocs(lessonsQuery);
  
  const deletePromises: Promise<void>[] = [];
  lessonsSnapshot.forEach(lessonDoc => {
    batch.delete(lessonDoc.ref);
    deletePromises.push(deleteQuizzesByLessonId(lessonDoc.id, batch));
    // Individual lesson deletion logs are skipped here; covered by deleteLecture log.
  });
  await Promise.all(deletePromises);

  if (!existingBatch) {
    await batch.commit();
  }
}

export async function getAllLessonsEnriched(): Promise<(Lesson & { lectureTitle?: string })[]> {
    const q = query(lessonsCollection, orderBy('lectureId'), orderBy('order'));
    const lessonSnapshot = await getDocs(q);
    const lessons: (Lesson & { lectureTitle?: string })[] = [];
    const lectureTitlesCache: Record<string, string> = {};

    for (const lessonDoc of lessonSnapshot.docs) {
        const lessonData = lessonDoc.data() as Lesson;
        let lectureTitle = 'N/A';
        if (lessonData.lectureId) {
            if (lectureTitlesCache[lessonData.lectureId]) {
                lectureTitle = lectureTitlesCache[lessonData.lectureId];
            } else {
                const lectureRef = doc(db, 'lectures', lessonData.lectureId);
                const lectureSnap = await getDoc(lectureRef);
                if (lectureSnap.exists()) {
                    lectureTitle = (lectureSnap.data() as Lecture).title;
                    lectureTitlesCache[lessonData.lectureId] = lectureTitle;
                }
            }
        }
        lessons.push({ ...lessonData, id: lessonDoc.id, lectureTitle });
    }
    return lessons;
}

export async function getLecturesForSelect(): Promise<Pick<Lecture, 'id' | 'title'>[]> {
  const q = query(lecturesCollection, orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, title: docSnap.data().title as string }));
}
