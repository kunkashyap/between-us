import { supabase, isSupabaseConfigured } from './supabase';
import * as FileSystem from 'expo-file-system';

export async function uploadMediaFile({
  bucket,
  duoId,
  entityId,
  fileUri,
  fileName,
}: {
  bucket: 'memories' | 'capsules';
  duoId: string;
  entityId: string;
  fileUri: string;
  fileName?: string;
}): Promise<string> {
  // If in demo mode without live Supabase, keep the local/remote URI directly
  if (!isSupabaseConfigured()) {
    return fileUri;
  }

  try {
    const ext = fileUri.split('.').pop() || 'jpg';
    const name = fileName || `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storagePath = `${duoId}/${entityId}/${name}`;

    // Read file as base64 for reliable React Native binary upload
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const contentType =
      ext === 'mp4' ? 'video/mp4' : ext === 'm4a' || ext === 'caf' ? 'audio/m4a' : 'image/jpeg';

    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, byteArray, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn('Storage upload error:', error.message);
      return fileUri;
    }

    // Generate signed URL (expires in 1 year for private media)
    const { data: signedData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (signedData?.signedUrl) {
      return signedData.signedUrl;
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return publicData.publicUrl || fileUri;
  } catch (err) {
    console.warn('Error uploading media:', err);
    return fileUri;
  }
}
