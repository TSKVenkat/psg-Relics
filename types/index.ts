export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
}

// Add this to your types.ts file

export interface Capsule {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    unlockDate: Date;
    ownerUid: string;
    ownerName?: string;
    ownerEmail?: string;
    files?: CapsuleFile[];
    notificationSent?: boolean;
    sharedWith?: string[]; // New field to track who the capsule is shared with
}

export interface CapsuleFile {
    id: string;
    name: string;
    type: 'image' | 'video' | 'document';
    url: string;
    thumbnailUrl?: string;
    size: number;
    uploadedAt: Date;
}

export interface CreateCapsuleFormData {
    name: string;
    description: string;
    unlockDate: Date;
    files: File[];
}

export interface ShareCapsuleFormData {
    email: string;
    message: string;
}


export interface CreateCapsuleFormData {
    name: string;
    description: string;
    unlockDate: Date;
    files: File[];
    sharedWith?: string[];
}

interface CapsuleViewProps {
    capsule: Capsule;
    isOwner: boolean;
    userId: string;
    userEmail: string;
}