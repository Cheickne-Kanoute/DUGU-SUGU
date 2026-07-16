import { supabase } from '../supabase';

export const uploadProductImages = async (files: FileList | File[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Erreur lors du téléchargement de l'image : ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    if (data && data.publicUrl) {
      uploadedUrls.push(data.publicUrl);
    }
  }

  return uploadedUrls;
};
