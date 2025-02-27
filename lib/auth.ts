import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { auth } from "./firebase";

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Function to get the authenticated session
export const getAuthSession = async () => {
    // Return user from auth if available
    if (auth.currentUser) {
        return {
            user: {
                id: auth.currentUser.uid,
                name: auth.currentUser.displayName,
                email: auth.currentUser.email,
                image: auth.currentUser.photoURL
            }
        };
    }

    return null;
};