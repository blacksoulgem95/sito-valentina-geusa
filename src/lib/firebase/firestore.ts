import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

export type FirestoreEntity = {
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: Timestamp | null;
  updatedAt: Timestamp;
  featuredImage?: string;
  categories?: string[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  [key: string]: any;
};

// Generic CRUD operations
export const getDocument = async <T = FirestoreEntity>(
  collectionName: string,
  slug: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, slug);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

export const getDocuments = async <T = FirestoreEntity>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

export const createDocument = async <T = Partial<FirestoreEntity>>(
  collectionName: string,
  data: T & { slug: string }
): Promise<string> => {
  const { slug, ...docData } = data;
  const docRef = doc(db, collectionName, slug);
  const now = Timestamp.now();
  await setDoc(docRef, {
    ...docData,
    updatedAt: now,
    publishedAt: (docData as any).published ? now : null,
  } as any);
  return slug;
};

export const updateDocument = async <T = Partial<FirestoreEntity>>(
  collectionName: string,
  slug: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, slug);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  } as any);
};

export const deleteDocument = async (
  collectionName: string,
  slug: string
): Promise<void> => {
  const docRef = doc(db, collectionName, slug);
  await deleteDoc(docRef);
};

export const checkSlugExists = async (
  collectionName: string,
  slug: string,
  excludeSlug?: string
): Promise<boolean> => {
  // Check if document with this slug (as ID) exists
  const docRef = doc(db, collectionName, slug);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    // If updating, exclude the current document
    if (excludeSlug && docSnap.id === excludeSlug) {
      return false;
    }
    return true;
  }
  return false;
};

// Collection-specific helpers
export const portfolioCollection = 'portfolio';
export const blogCollection = 'blog';
export const blogCategoriesCollection = 'blog_categories';
export const pagesCollection = 'pages';

// Re-export Timestamp for convenience
export { Timestamp };
