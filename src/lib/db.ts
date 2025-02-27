import { db } from './firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { Capsule } from '@/types';

const CAPSULES_COLLECTION = 'capsules';

export const createCapsule = async (capsuleData: Omit<Capsule, 'id' | 'createdAt'>) => {
    try {
        const docRef = await addDoc(collection(db, CAPSULES_COLLECTION), {
            ...capsuleData,
            createdAt: serverTimestamp(),
            lockUntil: Timestamp.fromDate(new Date(capsuleData.lockUntil)),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating capsule:', error);
        throw error;
    }
};

export const getCapsule = async (id: string) => {
    try {
        const docRef = doc(db, CAPSULES_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt.toDate(),
                lockUntil: data.lockUntil.toDate()
            } as Capsule;
        }
        return null;
    } catch (error) {
        console.error('Error getting capsule:', error);
        throw error;
    }
};

export const getUserCapsules = async (userId: string) => {
    try {
        const q = query(collection(db, CAPSULES_COLLECTION), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate(),
                lockUntil: data.lockUntil.toDate()
            } as Capsule;
        });
    } catch (error) {
        console.error('Error getting user capsules:', error);
        throw error;
    }
};

export const updateCapsule = async (id: string, data: Partial<Capsule>) => {
    try {
        const capsuleRef = doc(db, CAPSULES_COLLECTION, id);

        // If lockUntil is provided as a Date object, convert to Timestamp
        const updateData = { ...data };
        if (updateData.lockUntil instanceof Date) {
            updateData.lockUntil = Timestamp.fromDate(updateData.lockUntil);
        }

        await updateDoc(capsuleRef, updateData);
        return true;
    } catch (error) {
        console.error('Error updating capsule:', error);
        throw error;
    }
};

export const deleteCapsule = async (id: string) => {
    try {
        await deleteDoc(doc(db, CAPSULES_COLLECTION, id));
        return true;
    } catch (error) {
        console.error('Error deleting capsule:', error);
        throw error;
    }
};