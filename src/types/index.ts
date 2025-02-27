export interface Capsule {
    id?: string;
    userId: string;
    title: string;
    description: string;
    createdAt: Date;
    lockUntil: Date;
    isLocked: boolean;
    mediaUrls: Media[];
}

export interface Media {
    type: 'image' | 'video' | 'document';
    url: string;
    name: string;
}
