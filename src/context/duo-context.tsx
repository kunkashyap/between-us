import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth-context';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Memory,
  Place,
  LittleThing,
  Plan,
  PlanStatus,
  TimeCapsule,
  Question,
  MemoryMedia,
} from '../types';
import {
  INITIAL_MEMORIES,
  INITIAL_PLACES,
  INITIAL_LITTLE_THINGS,
  INITIAL_PLANS,
  INITIAL_CAPSULES,
  INITIAL_QUESTIONS,
} from '../constants/mock-data';
import { uploadMediaFile } from '../lib/storage';

interface DuoContextType {
  memories: Memory[];
  places: Place[];
  littleThings: LittleThing[];
  plans: Plan[];
  capsules: TimeCapsule[];
  questions: Question[];
  onThisDayMemories: Memory[];
  isLoading: boolean;
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
  addMemory: (
    data: {
      title: string;
      story: string;
      memory_date: string;
      location_name?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      audio_url?: string | null;
      audio_duration_seconds?: number | null;
      song_title?: string | null;
      song_artist?: string | null;
    },
    localMediaFiles: { uri: string; caption?: string }[]
  ) => Promise<{ success: boolean; memoryId?: string; error?: string }>;
  updateMemory: (
    id: string,
    updates: Partial<Memory>,
    newLocalMedia?: { uri: string; caption?: string }[]
  ) => Promise<{ success: boolean; error?: string }>;
  deleteMemory: (id: string) => Promise<{ success: boolean; error?: string }>;
  addPlace: (data: {
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    visited_date?: string | null;
    notes?: string | null;
  }) => Promise<{ success: boolean }>;
  addLittleThing: (data: {
    type: LittleThing['type'];
    title: string;
    content: string;
    origin_date?: string;
  }) => Promise<{ success: boolean }>;
  deleteLittleThing: (id: string) => Promise<{ success: boolean }>;
  addPlan: (data: {
    title: string;
    description?: string;
    planned_date?: string;
  }) => Promise<{ success: boolean }>;
  togglePlanStatus: (id: string) => Promise<{ success: boolean }>;
  deletePlan: (id: string) => Promise<{ success: boolean }>;
  addCapsule: (data: {
    title: string;
    message: string;
    unlock_at: string;
    media_urls?: string[];
  }) => Promise<{ success: boolean }>;
  answerQuestion: (questionId: string, answerText: string) => Promise<{ success: boolean }>;
  resetToDemoData: () => Promise<void>;
}

const DuoContext = createContext<DuoContextType | undefined>(undefined);

const MEMORIES_STORE_KEY = '@between_us_memories_cache';
const PLACES_STORE_KEY = '@between_us_places_cache';
const LITTLE_THINGS_KEY = '@between_us_little_things_cache';
const PLANS_KEY = '@between_us_plans_cache';
const CAPSULES_KEY = '@between_us_capsules_cache';
const QUESTIONS_KEY = '@between_us_questions_cache';

export const DuoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, duo, isDemoMode } = useAuth();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [littleThings, setLittleThings] = useState<LittleThing[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadDuoData();
  }, [duo?.id, isDemoMode]);

  // Realtime subscription setup
  useEffect(() => {
    if (!duo?.id || !isSupabaseConfigured() || isDemoMode) return;

    const channel = supabase
      .channel(`duo-realtime-${duo.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories', filter: `duo_id=eq.${duo.id}` },
        () => {
          loadDuoData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'plans', filter: `duo_id=eq.${duo.id}` },
        () => {
          loadDuoData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'little_things', filter: `duo_id=eq.${duo.id}` },
        () => {
          loadDuoData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [duo?.id, isDemoMode]);

  const loadDuoData = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        // Load from local storage or defaults
        const storedMem = await AsyncStorage.getItem(MEMORIES_STORE_KEY);
        const storedPlaces = await AsyncStorage.getItem(PLACES_STORE_KEY);
        const storedLT = await AsyncStorage.getItem(LITTLE_THINGS_KEY);
        const storedPlans = await AsyncStorage.getItem(PLANS_KEY);
        const storedCapsules = await AsyncStorage.getItem(CAPSULES_KEY);
        const storedQ = await AsyncStorage.getItem(QUESTIONS_KEY);

        setMemories(storedMem ? JSON.parse(storedMem) : INITIAL_MEMORIES);
        setPlaces(storedPlaces ? JSON.parse(storedPlaces) : INITIAL_PLACES);
        setLittleThings(storedLT ? JSON.parse(storedLT) : INITIAL_LITTLE_THINGS);
        setPlans(storedPlans ? JSON.parse(storedPlans) : INITIAL_PLANS);
        setCapsules(storedCapsules ? JSON.parse(storedCapsules) : INITIAL_CAPSULES);
        setQuestions(storedQ ? JSON.parse(storedQ) : INITIAL_QUESTIONS);
      } else if (duo?.id) {
        // Fetch from Supabase
        const [
          memRes,
          placesRes,
          ltRes,
          plansRes,
          capsulesRes,
          questionsRes,
        ] = await Promise.all([
          supabase
            .from('memories')
            .select('*, memory_media(*)')
            .eq('duo_id', duo.id)
            .order('memory_date', { ascending: false }),
          supabase
            .from('places')
            .select('*')
            .eq('duo_id', duo.id)
            .order('visited_date', { ascending: false }),
          supabase
            .from('little_things')
            .select('*')
            .eq('duo_id', duo.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('plans')
            .select('*')
            .eq('duo_id', duo.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('time_capsules')
            .select('*, capsule_media(*)')
            .eq('duo_id', duo.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('questions')
            .select('*, question_answers(*)')
            .eq('duo_id', duo.id)
            .order('question_date', { ascending: false }),
        ]);

        if (memRes.data) {
          const formattedMemories: Memory[] = memRes.data.map((m: any) => ({
            ...m,
            media: (m.memory_media || []).sort(
              (a: MemoryMedia, b: MemoryMedia) => a.sort_order - b.sort_order
            ),
          }));
          setMemories(formattedMemories);
        }

        if (placesRes.data) setPlaces(placesRes.data as Place[]);
        if (ltRes.data) setLittleThings(ltRes.data as LittleThing[]);
        if (plansRes.data) setPlans(plansRes.data as Plan[]);
        if (capsulesRes.data) setCapsules(capsulesRes.data as TimeCapsule[]);
        if (questionsRes.data) setQuestions(questionsRes.data as Question[]);
      }
    } catch (err) {
      console.warn('Failed to load duo data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadDuoData();
    setIsRefreshing(false);
  };

  const resetToDemoData = async () => {
    setMemories(INITIAL_MEMORIES);
    setPlaces(INITIAL_PLACES);
    setLittleThings(INITIAL_LITTLE_THINGS);
    setPlans(INITIAL_PLANS);
    setCapsules(INITIAL_CAPSULES);
    setQuestions(INITIAL_QUESTIONS);

    await AsyncStorage.setItem(MEMORIES_STORE_KEY, JSON.stringify(INITIAL_MEMORIES));
    await AsyncStorage.setItem(PLACES_STORE_KEY, JSON.stringify(INITIAL_PLACES));
    await AsyncStorage.setItem(LITTLE_THINGS_KEY, JSON.stringify(INITIAL_LITTLE_THINGS));
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(INITIAL_PLANS));
    await AsyncStorage.setItem(CAPSULES_KEY, JSON.stringify(INITIAL_CAPSULES));
    await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
  };

  // Section 24: "On This Day" calculation
  // Every day, query previous memories with the same month and day
  const onThisDayMemories = useMemo(() => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // 1-indexed
    const todayDay = today.getDate();

    return memories.filter((m) => {
      const parts = m.memory_date.split('-');
      if (parts.length < 3) return false;
      const memYear = parseInt(parts[0], 10);
      const memMonth = parseInt(parts[1], 10);
      const memDay = parseInt(parts[2], 10);

      // Must be a past year and same month/day
      return (
        memYear < today.getFullYear() &&
        memMonth === todayMonth &&
        memDay === todayDay
      );
    });
  }, [memories]);

  const addMemory = async (
    data: {
      title: string;
      story: string;
      memory_date: string;
      location_name?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      audio_url?: string | null;
      audio_duration_seconds?: number | null;
      song_title?: string | null;
      song_artist?: string | null;
    },
    localMediaFiles: { uri: string; caption?: string }[]
  ): Promise<{ success: boolean; memoryId?: string; error?: string }> => {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const duoId = duo?.id || 'demo_duo';
    const userId = user?.id || 'demo_user';
    const authorName = user?.display_name || 'You';

    try {
      // 1. Process and upload media
      const mediaItems: MemoryMedia[] = [];
      for (let i = 0; i < localMediaFiles.length; i++) {
        const item = localMediaFiles[i];
        const uploadedUrl = await uploadMediaFile({
          bucket: 'memories',
          duoId,
          entityId: memoryId,
          fileUri: item.uri,
        });

        mediaItems.push({
          id: `med_${Date.now()}_${i}`,
          memory_id: memoryId,
          media_type: 'image',
          storage_path: uploadedUrl,
          caption: item.caption || null,
          sort_order: i,
          created_at: new Date().toISOString(),
        });
      }

      // Audio upload if local recording
      let finalAudioUrl = data.audio_url;
      if (data.audio_url && !data.audio_url.startsWith('http')) {
        finalAudioUrl = await uploadMediaFile({
          bucket: 'memories',
          duoId,
          entityId: memoryId,
          fileUri: data.audio_url,
          fileName: `voice_${Date.now()}.m4a`,
        });
      }

      const newMemory: Memory = {
        id: memoryId,
        duo_id: duoId,
        created_by: userId,
        title: data.title.trim().toUpperCase(),
        story: data.story.trim(),
        memory_date: data.memory_date,
        location_name: data.location_name || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        audio_url: finalAudioUrl || null,
        audio_duration_seconds: data.audio_duration_seconds || null,
        song_title: data.song_title || null,
        song_artist: data.song_artist || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: authorName,
        media: mediaItems,
      };

      if (!isSupabaseConfigured() || isDemoMode) {
        // Local mode
        const updatedList = [newMemory, ...memories].sort(
          (a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime()
        );
        setMemories(updatedList);
        await AsyncStorage.setItem(MEMORIES_STORE_KEY, JSON.stringify(updatedList));

        // Also add to places if location_name exists
        if (data.location_name) {
          await addPlace({
            name: data.location_name,
            latitude: data.latitude,
            longitude: data.longitude,
            visited_date: data.memory_date,
            notes: `Associated with "${newMemory.title}"`,
          });
        }

        return { success: true, memoryId };
      }

      // Supabase live insertion
      const { data: createdMem, error: memErr } = await supabase
        .from('memories')
        .insert({
          id: memoryId,
          duo_id: duoId,
          created_by: userId,
          title: newMemory.title,
          story: newMemory.story,
          memory_date: newMemory.memory_date,
          location_name: newMemory.location_name,
          latitude: newMemory.latitude,
          longitude: newMemory.longitude,
          audio_url: newMemory.audio_url,
          audio_duration_seconds: newMemory.audio_duration_seconds,
          song_title: newMemory.song_title,
          song_artist: newMemory.song_artist,
        })
        .select()
        .single();

      if (memErr) throw memErr;

      if (mediaItems.length > 0) {
        await supabase.from('memory_media').insert(
          mediaItems.map((m) => ({
            memory_id: memoryId,
            media_type: m.media_type,
            storage_path: m.storage_path,
            caption: m.caption,
            sort_order: m.sort_order,
          }))
        );
      }

      if (data.location_name) {
        await supabase.from('places').insert({
          duo_id: duoId,
          name: data.location_name,
          latitude: data.latitude,
          longitude: data.longitude,
          visited_date: data.memory_date,
          notes: `Associated with "${newMemory.title}"`,
          created_by: userId,
        });
      }

      await loadDuoData();
      return { success: true, memoryId };
    } catch (err: any) {
      console.warn('Error adding memory:', err);
      return { success: false, error: err?.message || 'Failed to save memory' };
    }
  };

  const updateMemory = async (
    id: string,
    updates: Partial<Memory>,
    newLocalMedia?: { uri: string; caption?: string }[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const duoId = duo?.id || 'demo_duo';
      let addedMedia: MemoryMedia[] = [];

      if (newLocalMedia && newLocalMedia.length > 0) {
        for (let i = 0; i < newLocalMedia.length; i++) {
          const item = newLocalMedia[i];
          const uploadedUrl = await uploadMediaFile({
            bucket: 'memories',
            duoId,
            entityId: id,
            fileUri: item.uri,
          });

          addedMedia.push({
            id: `med_upd_${Date.now()}_${i}`,
            memory_id: id,
            media_type: 'image',
            storage_path: uploadedUrl,
            caption: item.caption || null,
            sort_order: (updates.media?.length || 0) + i,
            created_at: new Date().toISOString(),
          });
        }
      }

      const mergedMedia = [...(updates.media || []), ...addedMedia];

      if (!isSupabaseConfigured() || isDemoMode) {
        const updatedList = memories.map((m) => {
          if (m.id === id) {
            return {
              ...m,
              ...updates,
              media: mergedMedia.length > 0 ? mergedMedia : m.media,
              updated_at: new Date().toISOString(),
            };
          }
          return m;
        });

        setMemories(updatedList);
        await AsyncStorage.setItem(MEMORIES_STORE_KEY, JSON.stringify(updatedList));
        return { success: true };
      }

      const { error } = await supabase
        .from('memories')
        .update({
          title: updates.title,
          story: updates.story,
          memory_date: updates.memory_date,
          location_name: updates.location_name,
          latitude: updates.latitude,
          longitude: updates.longitude,
          song_title: updates.song_title,
          song_artist: updates.song_artist,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      if (addedMedia.length > 0) {
        await supabase.from('memory_media').insert(
          addedMedia.map((m) => ({
            memory_id: id,
            media_type: m.media_type,
            storage_path: m.storage_path,
            caption: m.caption,
            sort_order: m.sort_order,
          }))
        );
      }

      await loadDuoData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update memory' };
    }
  };

  const deleteMemory = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isSupabaseConfigured() || isDemoMode) {
        const updated = memories.filter((m) => m.id !== id);
        setMemories(updated);
        await AsyncStorage.setItem(MEMORIES_STORE_KEY, JSON.stringify(updated));
        return { success: true };
      }

      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;

      await loadDuoData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete memory' };
    }
  };

  const addPlace = async (data: {
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    visited_date?: string | null;
    notes?: string | null;
  }): Promise<{ success: boolean }> => {
    const newPlace: Place = {
      id: `place_${Date.now()}`,
      duo_id: duo?.id || 'demo_duo',
      name: data.name,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      visited_date: data.visited_date || new Date().toISOString().split('T')[0],
      notes: data.notes || null,
      created_by: user?.id || 'demo_user',
      created_at: new Date().toISOString(),
      memories_count: 1,
    };

    if (!isSupabaseConfigured() || isDemoMode) {
      const existing = places.find((p) => p.name.toLowerCase() === data.name.toLowerCase());
      let updated: Place[];
      if (existing) {
        updated = places.map((p) =>
          p.id === existing.id ? { ...p, memories_count: (p.memories_count || 1) + 1 } : p
        );
      } else {
        updated = [newPlace, ...places];
      }
      setPlaces(updated);
      await AsyncStorage.setItem(PLACES_STORE_KEY, JSON.stringify(updated));
      return { success: true };
    }

    try {
      await supabase.from('places').insert({
        duo_id: duo?.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        visited_date: data.visited_date,
        notes: data.notes,
        created_by: user?.id,
      });
      await loadDuoData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const addLittleThing = async (data: {
    type: LittleThing['type'];
    title: string;
    content: string;
    origin_date?: string;
  }): Promise<{ success: boolean }> => {
    const newLT: LittleThing = {
      id: `lt_${Date.now()}`,
      duo_id: duo?.id || 'demo_duo',
      type: data.type,
      title: data.title,
      content: data.content,
      origin_date: data.origin_date || new Date().toISOString().split('T')[0],
      created_by: user?.id || 'demo_user',
      created_at: new Date().toISOString(),
      author_name: user?.display_name || 'You',
    };

    if (!isSupabaseConfigured() || isDemoMode) {
      const updated = [newLT, ...littleThings];
      setLittleThings(updated);
      await AsyncStorage.setItem(LITTLE_THINGS_KEY, JSON.stringify(updated));
      return { success: true };
    }

    try {
      await supabase.from('little_things').insert({
        duo_id: duo?.id,
        type: data.type,
        title: data.title,
        content: data.content,
        origin_date: data.origin_date || new Date().toISOString().split('T')[0],
        created_by: user?.id,
      });
      await loadDuoData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const deleteLittleThing = async (id: string): Promise<{ success: boolean }> => {
    if (!isSupabaseConfigured() || isDemoMode) {
      const updated = littleThings.filter((l) => l.id !== id);
      setLittleThings(updated);
      await AsyncStorage.setItem(LITTLE_THINGS_KEY, JSON.stringify(updated));
      return { success: true };
    }

    try {
      await supabase.from('little_things').delete().eq('id', id);
      await loadDuoData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const addPlan = async (data: {
    title: string;
    description?: string;
    planned_date?: string;
  }): Promise<{ success: boolean }> => {
    const newPlan: Plan = {
      id: `plan_${Date.now()}`,
      duo_id: duo?.id || 'demo_duo',
      created_by: user?.id || 'demo_user',
      title: data.title,
      description: data.description || null,
      planned_date: data.planned_date || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      author_name: user?.display_name || 'You',
    };

    if (!isSupabaseConfigured() || isDemoMode) {
      const updated = [newPlan, ...plans];
      setPlans(updated);
      await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(updated));
      return { success: true };
    }

    try {
      await supabase.from('plans').insert({
        duo_id: duo?.id,
        created_by: user?.id,
        title: data.title,
        description: data.description,
        planned_date: data.planned_date,
        status: 'pending',
      });
      await loadDuoData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const togglePlanStatus = async (id: string): Promise<{ success: boolean }> => {
    const target = plans.find((p) => p.id === id);
    if (!target) return { success: false };

    const newStatus: PlanStatus = target.status === 'completed' ? 'pending' : 'completed';

    if (!isSupabaseConfigured() || isDemoMode) {
      const updated: Plan[] = plans.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
      setPlans(updated);
      await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(updated));
      return { success: true };
    }

    try {
      await supabase.from('plans').update({ status: newStatus }).eq('id', id);
      await loadDuoData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const deletePlan = async (id: string): Promise<{ success: boolean }> => {
    if (!isSupabaseConfigured() || isDemoMode) {
      const updated = plans.filter((p) => p.id !== id);
      setPlans(updated);
      await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(updated));
      return { success: true };
    }

    try {
      await supabase.from('plans').delete().eq('id', id);
      await loadDuoData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const addCapsule = async (data: {
    title: string;
    message: string;
    unlock_at: string;
    media_urls?: string[];
  }): Promise<{ success: boolean }> => {
    const newCap: TimeCapsule = {
      id: `cap_${Date.now()}`,
      duo_id: duo?.id || 'demo_duo',
      created_by: user?.id || 'demo_user',
      title: data.title,
      message: data.message,
      unlock_at: data.unlock_at,
      created_at: new Date().toISOString(),
      is_unlocked: new Date(data.unlock_at).getTime() <= Date.now(),
      media_urls: data.media_urls || [],
      author_name: user?.display_name || 'You',
    };

    if (!isSupabaseConfigured() || isDemoMode) {
      const updated = [newCap, ...capsules];
      setCapsules(updated);
      await AsyncStorage.setItem(CAPSULES_KEY, JSON.stringify(updated));
      return { success: true };
    }

    try {
      const { data: created, error } = await supabase
        .from('time_capsules')
        .insert({
          duo_id: duo?.id,
          created_by: user?.id,
          title: data.title,
          message: data.message,
          unlock_at: data.unlock_at,
        })
        .select()
        .single();

      if (error) throw error;

      if (data.media_urls && data.media_urls.length > 0 && created) {
        await supabase.from('capsule_media').insert(
          data.media_urls.map((path) => ({
            capsule_id: created.id,
            storage_path: path,
          }))
        );
      }

      await loadDuoData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const answerQuestion = async (
    questionId: string,
    answerText: string
  ): Promise<{ success: boolean }> => {
    if (!isSupabaseConfigured() || isDemoMode) {
      const updated = questions.map((q) => {
        if (q.id === questionId) {
          const answers = q.answers || [];
          const existing = answers.find((a) => a.user_id === user?.id);
          const newAns = {
            id: `ans_${Date.now()}`,
            question_id: questionId,
            user_id: user?.id || 'demo_user',
            answer: answerText,
            created_at: new Date().toISOString(),
            author_name: user?.display_name || 'You',
          };
          const updatedAnswers = existing
            ? answers.map((a) => (a.user_id === user?.id ? newAns : a))
            : [...answers, newAns];
          return {
            ...q,
            answers: updatedAnswers,
            both_answered: updatedAnswers.length >= 2,
          };
        }
        return q;
      });
      setQuestions(updated);
      await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
      return { success: true };
    }

    try {
      await supabase.from('question_answers').upsert({
        question_id: questionId,
        user_id: user?.id,
        answer: answerText,
      });
      await loadDuoData();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  return (
    <DuoContext.Provider
      value={{
        memories,
        places,
        littleThings,
        plans,
        capsules,
        questions,
        onThisDayMemories,
        isLoading,
        isRefreshing,
        refreshData,
        addMemory,
        updateMemory,
        deleteMemory,
        addPlace,
        addLittleThing,
        deleteLittleThing,
        addPlan,
        togglePlanStatus,
        deletePlan,
        addCapsule,
        answerQuestion,
        resetToDemoData,
      }}
    >
      {children}
    </DuoContext.Provider>
  );
};

export const useDuo = () => {
  const ctx = useContext(DuoContext);
  if (!ctx) throw new Error('useDuo must be used within a DuoProvider');
  return ctx;
};
