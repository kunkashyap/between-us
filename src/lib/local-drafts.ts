import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftMemory } from '../types';

const MEMORY_DRAFT_KEY = '@between_us_memory_draft';

export async function saveMemoryDraft(draft: DraftMemory): Promise<void> {
  try {
    await AsyncStorage.setItem(MEMORY_DRAFT_KEY, JSON.stringify(draft));
  } catch (err) {
    console.warn('Failed to save memory draft locally:', err);
  }
}

export async function getMemoryDraft(): Promise<DraftMemory | null> {
  try {
    const raw = await AsyncStorage.getItem(MEMORY_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftMemory;
  } catch (err) {
    console.warn('Failed to read memory draft:', err);
    return null;
  }
}

export async function clearMemoryDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(MEMORY_DRAFT_KEY);
  } catch (err) {
    console.warn('Failed to clear memory draft:', err);
  }
}
