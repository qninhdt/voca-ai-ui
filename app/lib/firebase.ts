// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import type { User } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  where,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_dVmiYVUpBRwXhAoU2SKFngpvd6sl3qA",
  authDomain: "voca-ai-8ad2c.firebaseapp.com",
  projectId: "voca-ai-8ad2c",
  storageBucket: "voca-ai-8ad2c.firebasestorage.app",
  messagingSenderId: "193291369068",
  appId: "1:193291369068:web:8f2f47f7767572be45f649",
  measurementId: "G-08WB20G2EG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Auth functions
export const signInWithGoogle = async () => {
  if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
    // Use Capacitor plugin for native
    const result = await FirebaseAuthentication.signInWithGoogle();
    const credential = GoogleAuthProvider.credential(
      result.credential?.idToken,
      result.credential?.accessToken
    );
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } else {
    // Use web popup for browser
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  }
};

export const logout = async () => {
  if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
    await FirebaseAuthentication.signOut();
  }
  await signOut(auth);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  // For both web and native, rely on Firebase's onAuthStateChanged
  return onAuthStateChanged(auth, callback);
};

export interface Card {
  id: string;
  term: string;
  definition: string;
  mastery?: number;
  lastLearned?: { seconds: number };
  nextReview?: { seconds: number };
}

interface Deck {
  id: string;
  title?: string;
  description?: string;
  cards?: Card[];
  updatedAt?: { seconds: number };
  createdAt?: { seconds: number };
  author?: string;
  authorImage?: string;
  folder?: string;
  userId: string;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  deckIds: string[];
  userId: string;
  updatedAt?: { seconds: number };
  createdAt?: { seconds: number };
}

export interface SessionTrack {
  id?: string;
  deckId: string;
  timestamp: number;
  avgMastery: number;
  masteredCount: number;
}

export interface LearnedWord {
  id: string;
  word: string;
  meaning: string;
  mastery: number;
  lastLearned: { seconds: number };
  deckId: string;
  deckTitle: string;
}

// Deck CRUD operations
export const createDeck = async (deck: Omit<Deck, "id">, userId: string) => {
  const colRef = collection(db, "decks");
  const docRef = await addDoc(colRef, {
    ...deck,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateDeck = async (id: string, deck: Partial<Deck>) => {
  const docRef = doc(db, "decks", id);
  await updateDoc(docRef, {
    ...deck,
    updatedAt: serverTimestamp(),
  });
};

export const getDeck = async (id: string): Promise<Deck | null> => {
  const docRef = doc(db, "decks", id);
  const snap = await getDoc(docRef);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Deck) : null;
};

export const getUserDecks = async (userId: string): Promise<Deck[]> => {
  const colRef = collection(db, "decks");
  const q = query(colRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deck));
};

export const getAllDecks = async (): Promise<Deck[]> => {
  const colRef = collection(db, "decks");
  const snap = await getDocs(colRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deck));
};

export async function updateCardMastery(
  deckId: string,
  cardId: string,
  mastery: number
) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in");

  const deckRef = doc(db, "decks", deckId);
  const deck = await getDoc(deckRef);

  if (!deck.exists()) {
    throw new Error("Deck not found");
  }

  const deckData = deck.data();
  if (deckData.userId !== user.uid) {
    throw new Error("Unauthorized");
  }

  const cards = deckData.cards || [];
  const cardIndex = cards.findIndex((c: Card) => c.id === cardId);

  if (cardIndex === -1) {
    throw new Error("Card not found");
  }

  // Calculate next review time based on mastery level
  const now = new Date();
  let nextReviewDays = 1; // Default to 1 day

  switch (mastery) {
    case 0: // New card
      nextReviewDays = 1;
      break;
    case 1: // Learning
      nextReviewDays = 2;
      break;
    case 2: // Familiar
      nextReviewDays = 4;
      break;
    case 3: // Good
      nextReviewDays = 7;
      break;
    case 4: // Mastered
      nextReviewDays = 14;
      break;
    case 5: // Expert
      nextReviewDays = 30;
      break;
  }

  const nextReview = new Date(
    now.getTime() + nextReviewDays * 24 * 60 * 60 * 1000
  );

  // Update the card
  cards[cardIndex] = {
    ...cards[cardIndex],
    mastery,
    lastLearned: { seconds: Math.floor(now.getTime() / 1000) },
    nextReview: { seconds: Math.floor(nextReview.getTime() / 1000) },
  };

  await updateDoc(deckRef, { cards });
  return cards[cardIndex];
}

export async function getCardsForReview(deckId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in");

  const deckRef = doc(db, "decks", deckId);
  const deck = await getDoc(deckRef);

  if (!deck.exists()) {
    throw new Error("Deck not found");
  }

  const deckData = deck.data();
  if (deckData.userId !== user.uid) {
    throw new Error("Unauthorized");
  }

  const cards = deckData.cards || [];

  // Sort cards by nextReview (undefined or oldest first)
  return cards.slice().sort((a: Card, b: Card) => {
    const aTime = a.nextReview?.seconds || 0;
    const bTime = b.nextReview?.seconds || 0;
    return aTime - bTime;
  });
}

// Folder CRUD operations
export const createFolder = async (folder: Omit<Folder, "id">) => {
  const colRef = collection(db, "folders");
  const docRef = await addDoc(colRef, {
    ...folder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateFolder = async (id: string, folder: Partial<Folder>) => {
  const docRef = doc(db, "folders", id);
  await updateDoc(docRef, {
    ...folder,
    updatedAt: serverTimestamp(),
  });
};

export const getFolder = async (id: string): Promise<Folder | null> => {
  const docRef = doc(db, "folders", id);
  const snap = await getDoc(docRef);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Folder) : null;
};

export const getUserFolders = async (userId: string): Promise<Folder[]> => {
  const colRef = collection(db, "folders");
  const q = query(colRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Folder));
};

export const addDeckToFolder = async (folderId: string, deckId: string) => {
  const folder = await getFolder(folderId);
  if (!folder) return;

  const updatedDeckIds = [...new Set([...folder.deckIds, deckId])];
  await updateFolder(folderId, { deckIds: updatedDeckIds });
};

export const removeDeckFromFolder = async (
  folderId: string,
  deckId: string
) => {
  const folder = await getFolder(folderId);
  if (!folder) return;

  const updatedDeckIds = folder.deckIds.filter((id) => id !== deckId);
  await updateFolder(folderId, { deckIds: updatedDeckIds });
};

export const deleteDeck = async (deckId: string) => {
  const docRef = doc(db, "decks", deckId);
  await deleteDoc(docRef);
};

export const saveSessionTrack = async (
  deckId: string,
  avgMastery: number,
  masteredCount: number
) => {
  const colRef = collection(db, "sessionTracks");
  await addDoc(colRef, {
    deckId,
    timestamp: Date.now(),
    avgMastery,
    masteredCount,
  });
};

export const getSessionTracks = async (
  deckId: string
): Promise<SessionTrack[]> => {
  const colRef = collection(db, "sessionTracks");
  const q = query(colRef, where("deckId", "==", deckId));
  const snap = await getDocs(q);
  return snap.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as SessionTrack)
  );
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  username: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  // Save user profile in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    email,
    username,
    avatar: "",
  });
  return userCredential.user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

export const getRecentlyLearnedWords = async (
  userId: string,
  limit: number = 10
): Promise<LearnedWord[]> => {
  const decks = await getUserDecks(userId);
  const learnedWords: LearnedWord[] = [];

  // Collect all cards from all decks
  for (const deck of decks) {
    if (!deck.cards) continue;

    for (const card of deck.cards) {
      if (card.mastery && card.mastery > 0) {
        learnedWords.push({
          id: card.id,
          word: card.term,
          meaning: card.definition,
          mastery: card.mastery,
          lastLearned: card.lastLearned || { seconds: 0 },
          deckId: deck.id,
          deckTitle: deck.title || "Untitled Deck",
        });
      }
    }
  }

  // Sort by last learned date (most recent first) and limit the results
  return learnedWords
    .sort((a, b) => b.lastLearned.seconds - a.lastLearned.seconds)
    .slice(0, limit);
};
