
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
  Timestamp,
} from 'firebase/firestore';
import type { Lecture, LectureFormData } from '@/types';
import { getLessonsByLectureId, deleteLessonsByLectureId } from './lessonService';
import { deleteQuizzesByLectureId } from './quizService';
import { logActivity } from './activityService'; // Import activity logger

const lecturesCollection = collection(db, 'lectures');

// Helper to convert Firestore data with Timestamps to serializable Lecture
function toSerializableLecture(docSnap: any, lessonsCount: number): Lecture {
  const data = docSnap.data() as Omit<Lecture, 'id' | 'lessonsCount' | 'createdAt' | 'updatedAt'> & { createdAt?: Timestamp, updatedAt?: Timestamp };
  return {
    ...data,
    id: docSnap.id,
    lessonsCount,
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
  };
}

export async function getAllLectures(): Promise<Lecture[]> {
  const q = query(lecturesCollection, orderBy('order'));
  const snapshot = await getDocs(q);
  const lectures: Lecture[] = [];
  for (const docSnap of snapshot.docs) {
    const lessons = await getLessonsByLectureId(docSnap.id);
    lectures.push(toSerializableLecture(docSnap, lessons.length));
  }
  return lectures;
}

export async function getLectureById(id: string): Promise<Lecture | null> {
  const docRef = doc(db, 'lectures', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const lessons = await getLessonsByLectureId(id);
    return toSerializableLecture(docSnap, lessons.length);
  }
  return null;
}

export async function addLecture(data: LectureFormData): Promise<string> {
  const docRef = await addDoc(lecturesCollection, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  await logActivity('lecture_created', `Lecture "${data.title}" was created.`, docRef.id);
  return docRef.id;
}

export async function updateLecture(id: string, data: Partial<LectureFormData>): Promise<void> {
  const docRef = doc(db, 'lectures', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
  // Fetch the lecture title if not in data, or use a placeholder.
  const lectureAfterUpdate = await getDoc(docRef);
  const title = data.title || (lectureAfterUpdate.exists() ? (lectureAfterUpdate.data() as Lecture).title : 'Unknown Lecture');
  await logActivity('lecture_updated', `Lecture "${title}" was updated.`, id);
}

export async function deleteLecture(lectureId: string): Promise<void> {
  const lectureDoc = await getDoc(doc(db, 'lectures', lectureId));
  const title = lectureDoc.exists() ? (lectureDoc.data() as Lecture).title : 'Unknown Lecture';

  const batch = writeBatch(db);
  const lectureRef = doc(db, 'lectures', lectureId);
  batch.delete(lectureRef);
  await deleteLessonsByLectureId(lectureId, batch);
  await deleteQuizzesByLectureId(lectureId, batch);
  await batch.commit();

  await logActivity('lecture_deleted', `Lecture "${title}" and its associated content were deleted.`, lectureId);
}

