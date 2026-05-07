import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async (userId) => {
    if (!userId) { setIsAdmin(false); return; }
    const { data } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .single();
    setIsAdmin(!!data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      checkAdmin(u?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        const u = session?.user ?? null;
        setUser(u);
        checkAdmin(u?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
