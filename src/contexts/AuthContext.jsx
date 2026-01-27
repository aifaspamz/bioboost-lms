import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  // const [user, setUser] = useState(null);
  // const [username, setUsername] = useState(null);
  const [teacher_verified, setTeacherVerified] = useState(false);

  // const user = session?.user ?? null;
  // const username = user?.user_metadata?.username ?? null;

  const user = useMemo(() => session?.user ?? null, [session]);

  const username = useMemo(() => 
    user?.user_metadata?.username ?? "student", 
  [user]);

  const startedRef = useRef(false);
  const channelRef = useRef(null);

  const removeChannel = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  // Fetch user profile from public.profiles table
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, teacher_verified")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setRole(null);
        setTeacherVerified(false);
        return;
      }

      setRole(data?.role ?? null);
      setTeacherVerified(data?.teacher_verified ?? false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setRole(null);
      setTeacherVerified(false);
    }
  };

  // COMBINED CODE NI AIFA AT NI LUAN (AKO), PINAGSAMA KO NA
  useEffect(() => {
    // 1. Prevent double-execution in Strict Mode
    if (startedRef.current) return;
    startedRef.current = true;

    let authSubscription = null;

    const initializeAuth = async () => {
      setLoading(true);
      try {
        // 2. Get initial session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data?.session ?? null;
        setSession(session);
        // setUser(session?.user ?? null);
        
        const userId = session?.user?.id;
        if (userId) {
          // Use your loadProfile/fetchUserProfile logic
          await fetchUserProfile(userId); 
          subscribeProfile(userId); // Keep your real-time profile sync
        } else {
          setRole(null);
          setTeacherVerified(false);
        }
      } catch (e) {
        console.warn("[AuthContext] Initialization error:", e.message);
      } finally {
        setLoading(false);
      }

      // 3. Listen for Auth Changes (Login/Logout/Password recovery)
      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        // We wrap this in an async IIFE so we can use 'await' safely
        (async () => {
          setLoading(true);
          try {
            setSession(newSession ?? null);
            const u = newSession?.user ?? null;
            setUser(u);

            if (u?.id) {
              await fetchUserProfile(u.id);
              subscribeProfile(u.id);
            } else {
              setRole(null);
              setTeacherVerified(false);
              removeChannel(); // Clean up real-time
            }
          } catch (e) {
            console.warn("[AuthContext] Auth change error:", e.message);
          } finally {
            setLoading(false);
          }
        })().catch(e => console.warn("[AuthContext] Auth listener crashed:", e));
      });

      authSubscription = sub.subscription;
    };

    // Run the boot sequence
    initializeAuth();

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
      removeChannel();
    };
  }, []);

  const register = async ({ email, password, username, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, 
      },
    });

    if (error) return { ok: false, message: error.message };
    return { ok: true, data };
  };

  const login = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, message: error.message };
      return { ok: true, data };
    } catch (e) {
      return { ok: false, message: e?.message || "Login failed" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setTeacherVerified(false);
  };

  const value = useMemo(
    () => ({
      session,
      user,
      role,
      teacher_verified,
      role,
      loading,
      displayName: username || "Set username",
      register,
      login,
      logout,
    }),
    [session, user, role, teacher_verified, username, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
