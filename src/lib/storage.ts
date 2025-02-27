// src/lib/storage.ts
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadMediaToStorage = async (file: File, userId: string) => {
    try {
        // Create a unique file path
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `capsules/${userId}/${fileName}`;

        // Create a reference to the file location
        const storageRef = ref(storage, filePath);

        // Upload the file
        await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        return {
            url: downloadURL,
            name: file.name,
            type: getMediaType(file.type)
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

const getMediaType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
};