import { supabase } from './supabase';

const BUCKET = 'listing-photos';
const MAX_SIZE_MB = 8;

export async function uploadingListingPhoto(file, userId) {
    if (!userId) throw new Error('You need to be logged in to upload photos.');
    if (file.size > MAX_SIZE_MB * 1024 * 1024 ) {
        throw new Error('Photo is too large - keep it uder ${MAX_SIZE_MB}MB.');

    }

    const ext = file.name.split( '.').pop();
    const path =`${userId}/${Date.now()}=${Math.random().toString(36).slice(2, 8)}.${ext}`;


    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        catchControl: '3600',
        upset: false,

    });
    if ( error ) throw new Error(error.message);

    const { data } =supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };


}
export async function deleteListingPhoto(path) {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(error.message);
}