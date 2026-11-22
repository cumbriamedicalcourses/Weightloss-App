"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { firebaseAuth, firebaseEnabled } from "./firebase";

export interface SessionUser {
  uid: string;
  email: string | null;
  name: string | null;
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  /** True when Firebase is not configured and the journal lives in this browser. */
  preview: boolean;
  /** ID token for calls to our own API. Null in preview mode. */
  getToken(): Promise<string | null>;
  signInEmail(email: string, password: string): Promise<void>;
  signUpEmail(name: string, email: string, password: string): Promise<void>;
  signInGoogle(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  signOut(): Promise<void>;
}

const PREVIEW_USER: SessionUser = { uid: "preview", email: null, name: null };
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseEnabled) {
      // Preview mode has one local user, set after mount so server and
      // browser render the same first frame.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(PREVIEW_USER);
      setLoading(false);
      return;
    }
    return onAuthStateChanged(firebaseAuth(), (u) => {
      setUser(u ? { uid: u.uid, email: u.email, name: u.displayName } : null);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      preview: !firebaseEnabled,
      async getToken() {
        if (!firebaseEnabled) return null;
        return (await firebaseAuth().currentUser?.getIdToken()) ?? null;
      },
      async signInEmail(email, password) {
        await signInWithEmailAndPassword(firebaseAuth(), email, password);
      },
      async signUpEmail(name, email, password) {
        const cred = await createUserWithEmailAndPassword(firebaseAuth(), email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
      },
      async signInGoogle() {
        await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
      },
      async resetPassword(email) {
        await sendPasswordResetEmail(firebaseAuth(), email);
      },
      async signOut() {
        if (firebaseEnabled) await fbSignOut(firebaseAuth());
      },
    }),
    [user, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

/** Turns Firebase error codes into sentences a person can act on. */
export function authMessage(err: unknown) {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password don't match. Check them and try again.";
    case "auth/email-already-in-use":
      return "There is already an account with that email. Try signing in instead.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like an email address.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    case "auth/network-request-failed":
      return "No connection. Check your internet and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    default:
      return "Something went wrong signing you in. Please try again.";
  }
}
