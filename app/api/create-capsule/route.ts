import { NextRequest, NextResponse } from 'next/server';
import { db, storage } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        // Extract user information from form data instead of trying to use Firebase Auth directly
        const userId = formData.get('userId') as string;
        const userEmail = formData.get('userEmail') as string;
        const userName = formData.get('userName') as string;
        
        // Validate user data is present
        if (!userId) {
            console.error("Authentication failed: No user ID provided");
            return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
        }
        
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const unlockDate = formData.get('unlockDate') as string;
        const files = formData.getAll('files') as File[];

        if (!name || !unlockDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upload files to Firebase Storage
        const fileUrls = [];
        const fileDetails = [];

        for (const file of files) {
            if (file.size > 0) {
                // Use the provided user ID for storage path
                const storageRef = ref(storage, `capsules/${userId}/${Date.now()}_${file.name}`);
                const uploadResult = await uploadBytes(storageRef, await file.arrayBuffer());
                const downloadUrl = await getDownloadURL(uploadResult.ref);

                fileUrls.push(downloadUrl);
                fileDetails.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: downloadUrl
                });
            }
        }

        // Create capsule document in Firestore
        const capsuleData = {
            name: name,
            description,
            unlockDate: new Date(unlockDate),
            createdAt: serverTimestamp(),
            // Use the provided user information
            userId: userId,
            ownerEmail: userEmail || "anonymous",
            ownerName: userName || "Anonymous User",
            files: fileDetails,
            isLocked: true,
            notificationSent: false,
            sharedWith: []
        };

        console.log("Attempting to create capsule with data:", {
            ...capsuleData,
            files: `${fileDetails.length} files`
        });

        const docRef = await addDoc(collection(db, 'capsules'), capsuleData);
        
        console.log("Capsule created successfully with ID:", docRef.id);

        return NextResponse.json({
            success: true,
            capsuleId: docRef.id
        });

    } catch (error) {
        console.error('Error creating capsule:', error);
        return NextResponse.json({ 
            error: 'Failed to create capsule', 
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}