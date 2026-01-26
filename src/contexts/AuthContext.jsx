import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [teacher_verified, setTeacherVerified] = useState(false);

  const user = session?.user ?? null;
  const username = user?.user_metadata?.username ?? null;

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

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      if (data.session?.user?.id) {
        await fetchUserProfile(data.session.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession ?? null);
      if (newSession?.user?.id) {
        await fetchUserProfile(newSession.user.id);
      } else {
        setRole(null);
        setTeacherVerified(false);
      }
      setLoading(false);
    });

    return () => {
      if (unsub) unsub();
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
      username,
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
