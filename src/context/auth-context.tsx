import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, DuoSpace } from '../types';
import { DEMO_USER_CURRENT, DEMO_DUO_SPACE } from '../constants/mock-data';

interface AuthContextType {
  user: Profile | null;
  duo: DuoSpace | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, displayName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  enterDemoSpace: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  joinDuoWithCode: (code: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@between_us_auth_user';
const DUO_STORAGE_KEY = '@between_us_active_duo';
const DEMO_MODE_KEY = '@between_us_is_demo';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [duo, setDuo] = useState<DuoSpace | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const savedDemo = await AsyncStorage.getItem(DEMO_MODE_KEY);
      const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const savedDuo = await AsyncStorage.getItem(DUO_STORAGE_KEY);

      if (savedDemo === 'true' || !isSupabaseConfigured()) {
        // In demo or fallback mode
        setUser(savedUser ? JSON.parse(savedUser) : DEMO_USER_CURRENT);
        setDuo(savedDuo ? JSON.parse(savedDuo) : DEMO_DUO_SPACE);
        setIsDemoMode(true);
      } else {
        // Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
            // Fetch duo
            const { data: member } = await supabase
              .from('duo_members')
              .select('duo_id, duo_spaces(*)')
              .eq('user_id', session.user.id)
              .single();

            if (member?.duo_spaces) {
              setDuo(member.duo_spaces as unknown as DuoSpace);
            }
          }
          setIsDemoMode(false);
        }
      }
    } catch (err) {
      console.warn('Error restoring session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const enterDemoSpace = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER_CURRENT));
      await AsyncStorage.setItem(DUO_STORAGE_KEY, JSON.stringify(DEMO_DUO_SPACE));
      setUser(DEMO_USER_CURRENT);
      setDuo(DEMO_DUO_SPACE);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      await enterDemoSpace();
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) return { error: error.message };

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUser(profile);
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        }

        const { data: member } = await supabase
          .from('duo_members')
          .select('duo_id, duo_spaces(*)')
          .eq('user_id', data.user.id)
          .single();

        if (member?.duo_spaces) {
          const loadedDuo = member.duo_spaces as unknown as DuoSpace;
          setDuo(loadedDuo);
          await AsyncStorage.setItem(DUO_STORAGE_KEY, JSON.stringify(loadedDuo));
        }

        await AsyncStorage.setItem(DEMO_MODE_KEY, 'false');
        setIsDemoMode(false);
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign in' };
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    displayName: string
  ): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      const customUser: Profile = {
        ...DEMO_USER_CURRENT,
        display_name: displayName || 'Kunal',
      };
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
      setUser(customUser);
      setDuo(DEMO_DUO_SPACE);
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (error) return { error: error.message };

      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          display_name: displayName,
          created_at: new Date().toISOString(),
        };

        await supabase.from('profiles').insert(newProfile);
        setUser(newProfile);

        // Auto create a duo space for them
        const { data: newDuo } = await supabase
          .from('duo_spaces')
          .insert({
            name: `${displayName} & Friend`,
            created_by: data.user.id,
          })
          .select()
          .single();

        if (newDuo) {
          await supabase.from('duo_members').insert({
            duo_id: newDuo.id,
            user_id: data.user.id,
          });
          setDuo(newDuo as unknown as DuoSpace);
        }

        await AsyncStorage.setItem(DEMO_MODE_KEY, 'false');
        setIsDemoMode(false);
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign up' };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured() && !isDemoMode) {
        await supabase.auth.signOut();
      }
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(DUO_STORAGE_KEY);
      await AsyncStorage.removeItem(DEMO_MODE_KEY);
      setUser(null);
      setDuo(null);
      setIsDemoMode(false);
    } catch (err) {
      console.warn('Error signing out:', err);
    }
  };

  const updateProfile = async (name: string) => {
    if (!user) return;
    const updated = { ...user, display_name: name };
    setUser(updated);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured() && !isDemoMode) {
      await supabase.from('profiles').update({ display_name: name }).eq('id', user.id);
    }
  };

  const joinDuoWithCode = async (code: string): Promise<{ success: boolean; message?: string }> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return { success: false, message: 'Please enter a valid invite code' };

    if (!isSupabaseConfigured() || isDemoMode) {
      const updatedDuo: DuoSpace = {
        ...DEMO_DUO_SPACE,
        invite_code: trimmed,
      };
      setDuo(updatedDuo);
      await AsyncStorage.setItem(DUO_STORAGE_KEY, JSON.stringify(updatedDuo));
      return { success: true };
    }

    try {
      const { data: space, error } = await supabase
        .from('duo_spaces')
        .select('*')
        .eq('invite_code', trimmed)
        .single();

      if (error || !space) {
        return { success: false, message: 'Invite code not found' };
      }

      // Check member count
      const { data: members } = await supabase
        .from('duo_members')
        .select('id')
        .eq('duo_id', space.id);

      if (members && members.length >= 2) {
        return { success: false, message: 'This duo space already has 2 members' };
      }

      if (user) {
        await supabase.from('duo_members').insert({
          duo_id: space.id,
          user_id: user.id,
        });
      }

      setDuo(space as unknown as DuoSpace);
      await AsyncStorage.setItem(DUO_STORAGE_KEY, JSON.stringify(space));
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to join space' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        duo,
        isLoading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        enterDemoSpace,
        updateProfile,
        joinDuoWithCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
