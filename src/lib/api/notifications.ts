import { 
  collection, doc, getDocs, updateDoc, query, where, limit as limitConstraint, onSnapshot, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Notification } from '../../types/database';

export type { Notification };

export async function getNotifications(userId: string) {
  const q = query(
    collection(db, 'notifications'),
    where('user_id', '==', userId),
    limitConstraint(50)
  );
  const snap = await getDocs(q);

  const notifications = snap.docs.map(d => {
    const data = d.data() as Notification;
    return {
      ...data,
      id: d.id,
      title: data.title || data.titre || '',
      read: data.read ?? data.lu ?? false,
      created_at: data.created_at || data.createdAt || new Date().toISOString(),
    };
  });

  return notifications.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
}

export async function markAsRead(notificationId: string) {
  const ref = doc(db, 'notifications', notificationId);
  await updateDoc(ref, { read: true, lu: true });
}

export async function markAllAsRead(userId: string) {
  const q = query(
    collection(db, 'notifications'),
    where('user_id', '==', userId),
    where('read', '==', false)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { read: true, lu: true }));
  await batch.commit();
}

export function subscribeToNotifications(userId: string, callback: (payload: any) => void) {
  const q = query(
    collection(db, 'notifications'),
    where('user_id', '==', userId)
  );

  return onSnapshot(q, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        callback({ ...data, id: change.doc.id });
      }
    });
  });
}
