export type LittleThingType =
  | 'inside_joke'
  | 'quote'
  | 'random_moment'
  | 'screenshot'
  | 'song'
  | 'note';

export type PlanStatus = 'pending' | 'completed';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface DuoSpace {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  partner_name?: string;
}

export interface DuoMember {
  id: string;
  duo_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile;
}

export interface MemoryMedia {
  id: string;
  memory_id: string;
  media_type: 'image' | 'video' | 'audio';
  storage_path: string; // URL or local path or storage ref
  caption?: string | null;
  sort_order: number;
  created_at: string;
}

export interface Memory {
  id: string;
  duo_id: string;
  created_by: string;
  title: string;
  story: string;
  memory_date: string; // YYYY-MM-DD
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  audio_url?: string | null;
  audio_duration_seconds?: number | null;
  song_title?: string | null;
  song_artist?: string | null;
  created_at: string;
  updated_at: string;
  media?: MemoryMedia[];
  author_name?: string;
}

export interface Place {
  id: string;
  duo_id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  visited_date?: string | null;
  notes?: string | null;
  created_by: string;
  created_at: string;
  memories_count?: number;
  sample_media?: string[];
}

export interface LittleThing {
  id: string;
  duo_id: string;
  type: LittleThingType;
  title: string;
  content: string;
  origin_date?: string | null;
  created_by: string;
  created_at: string;
  author_name?: string;
}

export interface Plan {
  id: string;
  duo_id: string;
  created_by: string;
  title: string;
  description?: string | null;
  planned_date?: string | null;
  status: PlanStatus;
  created_at: string;
  author_name?: string;
}

export interface TimeCapsule {
  id: string;
  duo_id: string;
  created_by: string;
  title: string;
  message: string;
  unlock_at: string; // ISO timestamp
  created_at: string;
  is_unlocked?: boolean;
  media_urls?: string[];
  author_name?: string;
}

export interface Question {
  id: string;
  duo_id: string;
  question: string;
  question_date: string;
  created_at: string;
  answers?: QuestionAnswer[];
  both_answered?: boolean;
}

export interface QuestionAnswer {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  created_at: string;
  author_name?: string;
}

export interface DraftMemory {
  title: string;
  story: string;
  memory_date: string;
  location_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  local_images: string[];
  local_audio?: string | null;
  audio_duration_seconds?: number;
  song_title?: string;
  song_artist?: string;
}
