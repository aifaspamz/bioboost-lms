import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);

  const startedRef = useRef(false);
  const channelRef = useRef(null);

  const clearProfile = () => {
    setUsername(null);
    setRole(null);
  };

  const removeChannel = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  const subscribeProfile = (uid) => {
    removeChannel();
    if (!uid) return;

    channelRef.current = supabase
      .channel(`profiles:${uid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${uid}`,
        },
        (payload) => {
          setUsername(payload.new?.username ?? null);
          setRole(payload.new?.role ?? null);
        }
      )
      .subscribe();
  };

  const loadProfile = async (uid) => {
    if (!uid) {
      clearProfile();
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", uid)
        .single();

      if (error) {
        // AbortError can appear here; we DO NOT break login for it
        console.warn("[AuthContext] loadProfile error:", error.message);

        // If it was an AbortError, just ignore and keep existing values
        if ((error.message || "").toLowerCase().includes("abort")) return;

        clearProfile();
        return;
      }

      setUsername(data?.username ?? null);
      setRole(data?.role ?? null);
    } catch (e) {
      const msg = (e?.message || String(e)).toLowerCase();
      console.warn("[AuthContext] loadProfile exception:", e?.message || e);

      // ✅ ignore AbortError (do NOT clear profile)
      if (msg.includes("abort")) return;

      clearProfile();
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let unsub = null;

    const boot = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn("[AuthContext] getSession error:", error.message);
          // ignore abort and continue
        }

        const sess = data?.session ?? null;
        setSession(sess);
        setUser(sess?.user ?? null);

        const uid = sess?.user?.id ?? null;
        if (uid) {
          await loadProfile(uid);
          subscribeProfile(uid);
        } else {
          clearProfile();
          removeChannel();
        }
      } catch (e) {
        // ✅ swallow AbortError and ANY other error so it never kills the app
        console.warn("[AuthContext] boot exception:", e?.message || e);
      } finally {
        setLoading(false);
      }

      const { data: sub } = supabase.auth.onAuthStateChange((_evt, newSession) => {
        // IMPORTANT: Supabase doesn't await this callback, so we must not let it reject
        (async () => {
          setLoading(true);
          try {
            setSession(newSession ?? null);
            const u = newSession?.user ?? null;
            setUser(u);

            const uid = u?.id ?? null;
            if (uid) {
              await loadProfile(uid);
              subscribeProfile(uid);
            } else {
              clearProfile();
              removeChannel();
            }
          } catch (e) {
            console.warn("[AuthContext] auth change exception:", e?.message || e);
          } finally {
            setLoading(false);
          }
        })().catch((e) => {
          // ✅ last safety net so nothing becomes "Uncaught (in promise)"
          console.warn("[AuthContext] auth change uncaught:", e?.message || e);
        });
      });

      unsub = () => sub.subscription.unsubscribe();
    };

    // ✅ run boot and catch any rejection (prevents Uncaught in promise)
    boot().catch((e) => {
      console.warn("[AuthContext] boot uncaught:", e?.message || e);
      setLoading(false);
    });

    return () => {
      if (unsub) unsub();
      removeChannel();
    };
  }, []);

  const register = async ({ email, password, username, role }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, role } },
      });
      if (error) return { ok: false, message: error.message };
      return { ok: true, data };
    } catch (e) {
      return { ok: false, message: e?.message || "Registration failed" };
    }
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
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("[AuthContext] logout error:", e?.message || e);
    }
  };

  const value = useMemo(
    () => ({
      session,
      user,
      username,
      role,
      loading,
      displayName: username || "Set username",
      register,
      login,
      logout,
    }),
    [session, user, username, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
