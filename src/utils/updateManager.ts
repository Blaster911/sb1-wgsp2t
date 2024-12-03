import { db, storage } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  mandatory?: boolean;
  changes: string[];
  minVersion?: string;
  downloadUrl?: string;
}

export async function uploadUpdateFile(file: File, version: string): Promise<string> {
  try {
    // Créer une référence dans Firebase Storage
    const storageRef = ref(storage, `updates/${version}/${file.name}`);
    
    // Upload du fichier
    await uploadBytes(storageRef, file);
    
    // Récupérer l'URL de téléchargement
    const downloadUrl = await getDownloadURL(storageRef);
    
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading update file:', error);
    throw new Error('Erreur lors du téléchargement du fichier de mise à jour');
  }
}

export async function publishUpdate(updateInfo: UpdateInfo) {
  try {
    // Valider la version
    if (!/^\d+\.\d+\.\d+$/.test(updateInfo.version)) {
      throw new Error('Format de version invalide. Utilisez le format semver (ex: 1.0.0)');
    }

    // Préparer les données de mise à jour
    const updateData = {
      version: updateInfo.version,
      releaseDate: updateInfo.releaseDate || new Date().toISOString(),
      mandatory: updateInfo.mandatory || false,
      changes: updateInfo.changes,
      minVersion: updateInfo.minVersion || updateInfo.version,
      downloadUrl: updateInfo.downloadUrl
    };

    // Publier la mise à jour
    await setDoc(doc(db, 'system', 'version'), updateData);

    console.log('Mise à jour publiée avec succès:', updateData);
    return updateData;
  } catch (error) {
    console.error('Erreur lors de la publication de la mise à jour:', error);
    throw error;
  }
}