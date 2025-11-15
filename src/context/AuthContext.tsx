/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import type { Profile } from "../types/database";

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials extends SignInCredentials {
  name: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalMessage: string | null;
  signInWithPassword: (credentials: SignInCredentials) => Promise<void>;
  signUpWithPassword: (credentials: SignUpCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error, status } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error && status !== 406) {
    console.error("Failed to load profile", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return data as Profile;
}

async function ensureProfile(user: User) {
  const email =
    user.email ?? (user.user_metadata?.email as string | undefined) ?? null;
  const name =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    null;
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email,
      name,
      avatar_url: avatarUrl,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Failed to ensure profile", error);
  }
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Try to get session without blocking - use a short timeout
    const getInitialSession = async () => {
      try {
        // Use a very short timeout to avoid hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>(
          (resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 100)
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]);
        if (mounted && result.data.session) {
          setSession(result.data.session);
          if (result.data.session.user) {
            try {
              let userProfile = await fetchProfile(result.data.session.user.id);
              if (!userProfile) {
                await ensureProfile(result.data.session.user);
                userProfile = await fetchProfile(result.data.session.user.id);
              }
              if (mounted) setProfile(userProfile);
            } catch (profileError) {
              console.error("[Auth] Error fetching profile:", profileError);
            }
          }
        }
      } catch (error) {
        console.error("[Auth] Error getting initial session:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(
          "[Auth] onAuthStateChange fired, event:",
          event,
          "hasSession:",
          !!newSession
        );
        if (mounted) {
          setSession(newSession);
          setLoading(false);

          if (newSession?.user) {
            try {
              let userProfile = await fetchProfile(newSession.user.id);
              if (!userProfile) {
                await ensureProfile(newSession.user);
                userProfile = await fetchProfile(newSession.user.id);
              }
              if (mounted) setProfile(userProfile);
            } catch (profileError) {
              console.error(
                "[Auth] Error fetching profile in onAuthStateChange:",
                profileError
              );
              if (mounted) setProfile(null);
            }
          } else {
            // User signed out - clear profile
            console.log("[Auth] User signed out, clearing profile");
            setProfile(null);
          }

          if (event === "SIGNED_IN") {
            setAuthModalOpen(false);
          } else if (event === "SIGNED_OUT") {
            console.log("[Auth] SIGNED_OUT event received");
            // Ensure state is cleared on sign out
            setSession(null);
            setProfile(null);
          }
        }
      }
    );

    // Try to get initial session (non-blocking)
    void getInitialSession();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const updated = await fetchProfile(session.user.id);
    setProfile(updated);
  }, [session?.user]);

  const signInWithPassword = useCallback(
    async ({ email, password }: SignInCredentials) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    },
    []
  );

  const signUpWithPassword = useCallback(
    async ({ email, password, name }: SignUpCredentials) => {
      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (user) {
        await ensureProfile({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            name,
            email,
          },
        } as User);
        await refreshProfile();
      }
    },
    [refreshProfile]
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log("[Auth] signOut called");

    // Clear local state immediately
    setSession(null);
    setProfile(null);

    try {
      // Try to sign out with timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise<{ error: null }>((resolve) =>
        setTimeout(() => {
          console.log("[Auth] signOut timeout - forcing state clear");
          resolve({ error: null });
        }, 1000)
      );

      const result = await Promise.race([signOutPromise, timeoutPromise]);

      if (result.error) {
        console.error("[Auth] signOut error:", result.error);
        // State already cleared above, so just log the error
      } else {
        console.log("[Auth] signOut successful");
      }
    } catch (error) {
      console.error("[Auth] signOut failed:", error);
      // State already cleared above
    }
  }, []);

  const openAuthModal = useCallback((message?: string) => {
    setAuthModalMessage(message ?? "Please log in to continue.");
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalMessage(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      refreshProfile,
      authModalOpen,
      authModalMessage,
      openAuthModal,
      closeAuthModal,
    }),
    [
      session,
      profile,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      refreshProfile,
      authModalOpen,
      authModalMessage,
      openAuthModal,
      closeAuthModal,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
