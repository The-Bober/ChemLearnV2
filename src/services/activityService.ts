
'use server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import type { Activity, ActivityType } from '@/types';

const activitiesCollection = collection(db, 'activities');

// Helper to convert Firestore data with Timestamps to serializable Activity
function toSerializableActivity(docSnap: any): Activity {
  const data = docSnap.data() as Omit<Activity, 'id' | 'timestamp'> & { timestamp: Timestamp };
  return {
    ...data,
    id: docSnap.id,
    timestamp: data.timestamp.toDate().toISOString(),
  };
}

export async function logActivity(
  type: ActivityType,
  message: string,
  relatedId?: string,
  userId?: string
): Promise<void> {
  try {
    await addDoc(activitiesCollection, {
      type,
      message,
      relatedId: relatedId || null,
      userId: userId || null,
      timestamp: Timestamp.now(), // Store as Timestamp
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    // Depending on requirements, you might want to re-throw or handle differently
  }
}

export async function getRecentActivities(count: number = 5): Promise<Activity[]> {
  try {
    const q = query(activitiesCollection, orderBy('timestamp', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => toSerializableActivity(docSnap));
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return [];
  }
}

