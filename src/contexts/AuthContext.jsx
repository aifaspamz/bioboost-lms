import { createContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

 
  const user = session?.user ?? null;
  const role = user?.user_metadata?.role ?? null;
  const username = user?.user_metadata?.username ?? null;

  useEffect(() => {
    
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const register = async ({ email, password, username, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, role }, 
      },
    });

    if (error) return { ok: false, message: error.message };
    return { ok: true, data };
  };

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { ok: false, message: error.message };
    return { ok: true, data };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      session,
      user,
      role,
      username,
      loading,
      register,
      login,
      logout,
    }),
    [session, user, role, username, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
