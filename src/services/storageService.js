import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { saveDocumentRecord, deleteDocumentRecord } from './firestoreService';

/**
 * Uploads a document file to Firebase Storage under `documents/{timestamp}_{cleanFileName}`
 * and records its metadata in Cloud Firestore.
 */
export async function uploadDocumentFile(file, category = 'General', clientName = '') {
  if (!file) throw new Error('No file provided for upload.');

  // Validate size (max 20MB)
  const maxSizeBytes = 20 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error('File exceeds maximum upload size of 20MB.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `documents/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        category,
        clientName: clientName || 'Studio Internal'
      }
    });

    const downloadUrl = await getDownloadURL(uploadResult.ref);

    const docId = await saveDocumentRecord({
      name: file.name,
      storagePath,
      downloadUrl,
      category,
      clientName: clientName || 'Studio Internal',
      sizeBytes: file.size,
      contentType: file.type || 'application/octet-stream'
    });

    return {
      id: docId,
      name: file.name,
      downloadUrl,
      storagePath
    };
  } catch (err) {
    console.error('[Firebase Storage Upload Error]:', err);
    if (err.code === 'storage/unauthorized') {
      throw new Error('Permission denied by Storage Security Rules.');
    }
    if (err.code === 'storage/bucket-not-found') {
      throw new Error('Storage bucket not found or billing not configured in Firebase Console.');
    }
    throw new Error(err.message || 'Failed to upload document to Firebase Storage.');
  }
}

/**
 * Deletes a document from Firebase Storage and removes its Firestore record.
 */
export async function removeDocumentFile(docRecord) {
  try {
    if (docRecord.storagePath) {
      const storageRef = ref(storage, docRecord.storagePath);
      await deleteObject(storageRef).catch((e) => console.warn('Storage file deletion note:', e.message));
    }
    if (docRecord.id) {
      await deleteDocumentRecord(docRecord.id);
    }
  } catch (err) {
    console.error('[Document Deletion Error]:', err);
    throw err;
  }
}
