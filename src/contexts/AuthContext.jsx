import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    signInAnonymously,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Sign up with email/password
    const signUp = async (email, password, displayName) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName) {
                await updateProfile(result.user, { displayName });
            }
            return result.user;
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Sign in with email/password
    const signIn = async (email, password) => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Sign in as guest (anonymous)
    const signInAsGuest = async () => {
        try {
            setError(null);
            const result = await signInAnonymously(auth);
            return result.user;
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Sign out
    const logOut = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Clear error
    const clearError = () => setError(null);

    // Helper to get user-friendly error messages
    const getErrorMessage = (code) => {
        const messages = {
            'auth/email-already-in-use': 'This email is already registered. Try signing in!',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed.',
            'auth/network-request-failed': 'Network error. Check your connection.'
        };
        return messages[code] || 'Something went wrong. Please try again.';
    };

    const value = {
        user,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signInAsGuest,
        logOut,
        clearError,
        isAuthenticated: !!user,
        isGuest: user?.isAnonymous || false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
