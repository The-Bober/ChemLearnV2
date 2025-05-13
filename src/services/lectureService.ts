
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
  orderBy,
  writeBatch,
  where,
  Timestamp,
} from 'firebase/firestore';
import type { Lecture, LectureFormData } from '@/types'; // Assuming LectureFormData exists or is similar to Lecture input
import { getLessonsByLectureId, deleteLessonsByLectureId } from './lessonService'; // For cascading deletes/counts
import { deleteQuizzesByLectureId } from './quizService';

const lecturesCollection = collection(db, 'lectures');

export async function getAllLectures(): Promise<Lecture[]> {
  const q = query(lecturesCollection, orderBy('order'));
  const snapshot = await getDocs(q);
  const lectures: Lecture[] = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as Omit<Lecture, 'id' | 'lessonsCount'>;
    const lessons = await getLessonsByLectureId(docSnap.id);
    lectures.push({ ...data, id: docSnap.id, lessonsCount: lessons.length });
  }
  return lectures;
}

export async function getLectureById(id: string): Promise<Lecture | null> {
  const docRef = doc(db, 'lectures', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data() as Omit<Lecture, 'id' | 'lessonsCount'>;
    const lessons = await getLessonsByLectureId(id);
    return { ...data, id: docSnap.id, lessonsCount: lessons.length };
  }
  return null;
}

export async function addLecture(data: LectureFormData): Promise<string> {
  const docRef = await addDoc(lecturesCollection, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateLecture(id: string, data: Partial<LectureFormData>): Promise<void> {
  const docRef = doc(db, 'lectures', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteLecture(lectureId: string): Promise<void> {
  const batch = writeBatch(db);

  // Delete the lecture itself
  const lectureRef = doc(db, 'lectures', lectureId);
  batch.delete(lectureRef);

  // Delete associated lessons (and their quizzes)
  await deleteLessonsByLectureId(lectureId, batch);
  
  // Delete quizzes associated directly with the lecture
  await deleteQuizzesByLectureId(lectureId, batch);

  await batch.commit();
}
