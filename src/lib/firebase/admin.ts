// Firebase Admin SDK configuration
// Uses Application Default Credentials (ADC) when running on App Hosting
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App | undefined;
let adminAuth: ReturnType<typeof getAuth> | undefined;
let adminDb: ReturnType<typeof getFirestore> | undefined;
let adminStorage: ReturnType<typeof getStorage> | undefined;

// Initialize Firebase Admin
if (!getApps().length) {
  // On App Hosting, use Application Default Credentials (ADC)
  // For local development, you can use a service account key
  // or set GOOGLE_APPLICATION_CREDENTIALS environment variable
  
  try {
    // Try to initialize with ADC (works on App Hosting and GCP)
    adminApp = initializeApp({
      // ADC will be used automatically
    });
  } catch (error) {
    // Fallback: if ADC fails, try with explicit credentials
    // This is useful for local development
    const projectId = process.env.FIREBASE_PROJECT_ID || import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;
    
    if (projectId) {
      adminApp = initializeApp({
        projectId,
      });
    } else {
      console.error('Firebase Admin initialization failed:', error);
      throw error;
    }
  }
} else {
  adminApp = getApps()[0];
}

// Initialize services
adminAuth = getAuth(adminApp);
adminDb = getFirestore(adminApp);
adminStorage = getStorage(adminApp);

export { adminAuth, adminDb, adminStorage };
export default adminApp;
