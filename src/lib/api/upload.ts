import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Upload des images du produit.
 * Utilise Firebase Storage si configuré, ou convertit immédiatement 
 * en DataURL (Base64) pour garantie de fonctionnement en mode démo / test.
 */
export async function uploadProductImages(files: File[], sellerId: string): Promise<string[]> {
  const uploadPromises = files.map(async (file, index) => {
    // 1. Préparation du fallback DataURL (Base64)
    const base64Promise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string || '');
      reader.readAsDataURL(file);
    });

    try {
      // 2. Vérification si Firebase Storage est configuré avec un bucket valide
      const bucket = storage?.app?.options?.storageBucket;
      if (!bucket || bucket.includes('votre_projet') || bucket.includes('YourApiKey')) {
        return await base64Promise;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${sellerId || 'general'}/${Date.now()}_${index}_${safeName}`;
      const storageRef = ref(storage, `products/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.warn('Erreur Firebase Storage (Fallback DataURL activé):', err);
      return await base64Promise;
    }
  });

  return Promise.all(uploadPromises);
}
