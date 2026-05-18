import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { Video, VideoList } from '../types/models';

const normalizeTimestamp = (ts: any): number => {
  if (typeof ts === 'number') return ts;
  if (ts?.toMillis) return ts.toMillis();
  if (ts?.seconds) return ts.seconds * 1000;
  return Date.now();
};

export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    displayName,
    phone: '',
    createdAt: Date.now()
  });
  return cred.user;
};

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export const fetchLists = async (uid: string): Promise<VideoList[]> => {
  const [ownedSnap, memberSnap] = await Promise.all([
    getDocs(query(collection(db, 'lists'), where('ownerUid', '==', uid))),
    getDocs(query(collection(db, 'lists'), where('memberUids', 'array-contains', uid)))
  ]);
  const all = new Map<string, VideoList>();
  [...ownedSnap.docs, ...memberSnap.docs].forEach(d => {
    if (!all.has(d.id)) {
      const data = d.data() as Omit<VideoList, 'id'>;
      all.set(d.id, {
        ...data,
        id: d.id,
        createdAt: normalizeTimestamp(data.createdAt)
      });
    }
  });
  return Array.from(all.values()).sort((a, b) => b.createdAt - a.createdAt);
};

export const fetchListById = async (listId: string): Promise<VideoList | null> => {
  const snap = await getDoc(doc(db, 'lists', listId));
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<VideoList, 'id'>;
  return { ...data, id: snap.id, createdAt: normalizeTimestamp(data.createdAt) };
};

export const joinListById = async (listId: string, uid: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'lists', listId));
  if (!snap.exists()) return false;
  await updateDoc(doc(db, 'lists', listId), { memberUids: arrayUnion(uid) });
  return true;
};

export const fetchVideosByList = async (listId: string) => {
  const q = query(collection(db, 'videos'), where('listIds', 'array-contains', listId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Omit<Video, 'id'>;
    return { ...data, id: d.id, createdAt: normalizeTimestamp(data.createdAt) };
  });
};

export const createList = async (list: Omit<VideoList, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'lists'), {
    ...list,
    memberUids: [list.ownerUid],
    createdAt: Date.now()
  });
};

export const toggleFavoriteList = async (listId: string, isFavorite: boolean) => {
  return updateDoc(doc(db, 'lists', listId), { isFavorite });
};

export const createVideo = async (video: Omit<Video, 'id'>) => {
  return addDoc(collection(db, 'videos'), {
    ...video,
    createdAt: Date.now()
  });
};

export const fetchUserVideos = async (uid: string): Promise<Video[]> => {
  const q = query(collection(db, 'videos'), where('ownerUid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data() as Omit<Video, 'id'>;
      return { ...data, id: d.id, createdAt: normalizeTimestamp(data.createdAt) };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const fetchVideoById = async (videoId: string): Promise<Video | null> => {
  const snap = await getDoc(doc(db, 'videos', videoId));
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<Video, 'id'>;
  return { ...data, id: snap.id, createdAt: normalizeTimestamp(data.createdAt) };
};

export const addVideoToList = async (listId: string, videoId: string) => {
  await updateDoc(doc(db, 'lists', listId), { videoIds: arrayUnion(videoId) });
  await updateDoc(doc(db, 'videos', videoId), { listIds: arrayUnion(listId) });
};

export const updateList = async (listId: string, data: { title: string; description: string }) => {
  return updateDoc(doc(db, 'lists', listId), data);
};

export const currentFirebaseUser = (): User | null => auth.currentUser;
