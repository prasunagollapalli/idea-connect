import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: always stop loading after 2 seconds no matter what
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2000);

    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (mounted) {
          if (error) throw error;
          setUser(data?.session?.user ?? null);
        }
      } catch (error) {
        console.error('Auth Error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      if (data?.subscription) data.subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    const { data: { user: updatedUser } } = await supabase.auth.getUser();
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, refreshUser }}>
      {/* Render children even if loading takes too long */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
