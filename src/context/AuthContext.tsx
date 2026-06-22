import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseEnabled } from '../firebase';
import { audio } from '../utils/audio';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  xp: number;
  unlockedLevels: number;
  achievements: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebase: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProgress: (xpToAdd: number, levelToUnlock?: number, achievementId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to load guest data from localStorage
  const getGuestProfile = (): UserProfile => {
    const saved = localStorage.getItem('bonding_sandbox_guest');
    if (saved) return JSON.parse(saved);
    const newGuest: UserProfile = {
      uid: 'guest',
      name: 'სტუმარი',
      email: 'guest@local.com',
      xp: 0,
      unlockedLevels: 1,
      achievements: []
    };
    localStorage.setItem('bonding_sandbox_guest', JSON.stringify(newGuest));
    return newGuest;
  };

  // Helper to save guest data to localStorage
  const saveGuestProfile = (profile: UserProfile) => {
    localStorage.setItem('bonding_sandbox_guest', JSON.stringify(profile));
  };

  // Helper to load mock accounts registry
  const getMockAccounts = () => {
    const saved = localStorage.getItem('bonding_sandbox_mock_users');
    return saved ? JSON.parse(saved) : {};
  };

  // Helper to save mock accounts registry
  const saveMockAccounts = (accounts: any) => {
    localStorage.setItem('bonding_sandbox_mock_users', JSON.stringify(accounts));
  };

  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      // Real Firebase listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        setLoading(true);
        if (firebaseUser) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              setUser(userDocSnap.data() as UserProfile);
            } else {
              // Document doesn't exist, create it (e.g. if created outside the app)
              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'მოსწავლე',
                email: firebaseUser.email || '',
                xp: 0,
                unlockedLevels: 1,
                achievements: []
              };
              await setDoc(userDocRef, newProfile);
              setUser(newProfile);
            }
          } catch (error) {
            console.error('Error fetching user data from Firestore:', error);
            // Fallback to local profile on error
            setUser(getGuestProfile());
          }
        } else {
          // No user logged in, use guest profile
          setUser(getGuestProfile());
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local Mock Mode - Load current local user session or guest profile
      const localSession = localStorage.getItem('bonding_sandbox_current_session');
      if (localSession) {
        setUser(JSON.parse(localSession));
      } else {
        setUser(getGuestProfile());
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    audio.playClick();
    if (isFirebaseEnabled && auth) {
      // Real Firebase Sign In
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      // Local Mock Sign In
      const accounts = getMockAccounts();
      const userAccount = accounts[email.toLowerCase()];
      if (!userAccount || userAccount.password !== password) {
        throw new Error('არასწორი ელ-ფოსტა ან პაროლი');
      }
      
      const profile: UserProfile = {
        uid: userAccount.uid,
        name: userAccount.name,
        email: userAccount.email,
        xp: userAccount.xp,
        unlockedLevels: userAccount.unlockedLevels,
        achievements: userAccount.achievements
      };
      
      localStorage.setItem('bonding_sandbox_current_session', JSON.stringify(profile));
      setUser(profile);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    audio.playClick();
    
    // Check if there is guest progress to carry over
    const guestProfile = getGuestProfile();
    const carryOverXp = guestProfile.xp;
    const carryOverLevels = guestProfile.unlockedLevels;
    const carryOverAchievements = guestProfile.achievements;

    if (isFirebaseEnabled && auth && db) {
      // Real Firebase Sign Up
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      const newProfile: UserProfile = {
        uid,
        name,
        email,
        xp: carryOverXp, // Carry over guest progress
        unlockedLevels: carryOverLevels,
        achievements: carryOverAchievements
      };
      
      await setDoc(doc(db, 'users', uid), newProfile);
      setUser(newProfile);
    } else {
      // Local Mock Sign Up
      const accounts = getMockAccounts();
      if (accounts[email.toLowerCase()]) {
        throw new Error('ეს ელ-ფოსტა უკვე დარეგისტრირებულია');
      }
      
      const uid = 'mock_' + Math.random().toString(36).substr(2, 9);
      const newAccount = {
        uid,
        name,
        email: email.toLowerCase(),
        password,
        xp: carryOverXp,
        unlockedLevels: carryOverLevels,
        achievements: carryOverAchievements
      };
      
      accounts[email.toLowerCase()] = newAccount;
      saveMockAccounts(accounts);
      
      const profile: UserProfile = {
        uid,
        name,
        email: email.toLowerCase(),
        xp: carryOverXp,
        unlockedLevels: carryOverLevels,
        achievements: carryOverAchievements
      };
      
      localStorage.setItem('bonding_sandbox_current_session', JSON.stringify(profile));
      setUser(profile);
      
      // Reset guest progress after registration
      localStorage.removeItem('bonding_sandbox_guest');
    }
  };

  const signOut = async () => {
    audio.playClick();
    if (isFirebaseEnabled && auth) {
      // Real Firebase Sign Out
      await firebaseSignOut(auth);
    } else {
      // Local Mock Sign Out
      localStorage.removeItem('bonding_sandbox_current_session');
      setUser(getGuestProfile());
    }
  };

  const updateProgress = async (xpToAdd: number, levelToUnlock?: number, achievementId?: string) => {
    if (!user) return;

    const currentAchievements = [...user.achievements];
    if (achievementId && !currentAchievements.includes(achievementId)) {
      currentAchievements.push(achievementId);
      audio.playAchievement();
    }

    const newXp = user.xp + xpToAdd;
    const newLevels = levelToUnlock && levelToUnlock > user.unlockedLevels 
      ? Math.min(5, levelToUnlock) 
      : user.unlockedLevels;

    const updatedProfile: UserProfile = {
      ...user,
      xp: newXp,
      unlockedLevels: newLevels,
      achievements: currentAchievements
    };

    if (user.uid === 'guest') {
      // Save locally for guest
      saveGuestProfile(updatedProfile);
      setUser(updatedProfile);
    } else if (isFirebaseEnabled && db) {
      // Real Firebase Update
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          xp: newXp,
          unlockedLevels: newLevels,
          achievements: currentAchievements
        });
        setUser(updatedProfile);
      } catch (error) {
        console.error('Firestore progress update failed:', error);
      }
    } else {
      // Local Mock Session Update
      localStorage.setItem('bonding_sandbox_current_session', JSON.stringify(updatedProfile));
      
      // Update in registry
      const accounts = getMockAccounts();
      const emailKey = user.email.toLowerCase();
      if (accounts[emailKey]) {
        accounts[emailKey].xp = newXp;
        accounts[emailKey].unlockedLevels = newLevels;
        accounts[emailKey].achievements = currentAchievements;
        saveMockAccounts(accounts);
      }
      
      setUser(updatedProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isFirebase: isFirebaseEnabled, signIn, signUp, signOut, updateProgress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
