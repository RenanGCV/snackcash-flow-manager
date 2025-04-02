
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change event:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Session found' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error checking session:', error);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting to sign up with:', email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;
      toast.success('Conta criada com sucesso! Verifique seu email.');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Você saiu da sua conta');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Erro ao sair');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
