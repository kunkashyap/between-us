-- ==============================================================================
-- BETWEEN US: Development Seed Data
-- Duo: Kunal × Friend
-- ==============================================================================

-- Note: In local development or testing, replace demo user IDs with your actual Supabase auth user IDs.
DO $$
DECLARE
  v_user_kunal UUID := '00000000-0000-0000-0000-000000000001';
  v_user_friend UUID := '00000000-0000-0000-0000-000000000002';
  v_duo_id UUID := '11111111-1111-1111-1111-111111111111';
  v_mem1_id UUID := '22222222-2222-2222-2222-222222222201';
  v_mem2_id UUID := '22222222-2222-2222-2222-222222222202';
  v_mem3_id UUID := '22222222-2222-2222-2222-222222222203';
  v_mem_otd UUID := '22222222-2222-2222-2222-222222222204';
  v_q1_id UUID := '55555555-5555-5555-5555-555555555501';
BEGIN
  -- Duo Space
  INSERT INTO public.duo_spaces (id, name, invite_code, created_by, created_at)
  VALUES (v_duo_id, 'Kunal × Friend', 'BETWEEN2', v_user_kunal, '2025-01-01 10:00:00+00')
  ON CONFLICT (id) DO NOTHING;

  -- Memories
  INSERT INTO public.memories (id, duo_id, created_by, title, story, memory_date, location_name, latitude, longitude, created_at, updated_at)
  VALUES
  (
    v_mem1_id,
    v_duo_id,
    v_user_kunal,
    'THE DAY WE GOT LOST',
    'We were supposed to go home. Instead we somehow ended up walking around for another three hours in the drizzling rain talking about how fast time moves.',
    '2026-09-14',
    'Hauz Khas Village, Delhi',
    28.5535,
    77.1944,
    '2026-09-14 18:30:00+00',
    '2026-09-14 18:30:00+00'
  ),
  (
    v_mem2_id,
    v_duo_id,
    v_user_friend,
    'THAT CONVERSATION',
    'Some memories don''t need much explanation. Just sitting on the balcony watching the sky turn indigo, realizing some friendships are built for the long haul.',
    '2026-08-28',
    'Vasant Kunj, Delhi',
    28.5293,
    77.1537,
    '2026-08-28 21:00:00+00',
    '2026-08-28 21:00:00+00'
  ),
  (
    v_mem3_id,
    v_duo_id,
    v_user_kunal,
    'MOVIE NIGHT THAT WASN''T A MOVIE',
    'We spent 45 minutes picking what to watch, 10 minutes actually watching, and 2 hours discussing alternate universe theories and making microwave popcorn.',
    '2026-08-12',
    'Home',
    NULL,
    NULL,
    '2026-08-12 22:15:00+00',
    '2026-08-12 22:15:00+00'
  ),
  (
    v_mem_otd,
    v_duo_id,
    v_user_kunal,
    'FIRST 4 AM CHAI RUN',
    'We had no idea this would become a memory. Freezing wind, burning hot paper cups, and laughter that woke up the entire street.',
    '2025-09-17',
    'India Gate, Delhi',
    28.6129,
    77.2295,
    '2025-09-17 04:30:00+00',
    '2025-09-17 04:30:00+00'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Memory Media
  INSERT INTO public.memory_media (memory_id, media_type, storage_path, caption, sort_order)
  VALUES
  (v_mem1_id, 'image', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&q=80', 'Under the neon arch', 0),
  (v_mem1_id, 'image', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80', 'The rain starts', 1),
  (v_mem2_id, 'image', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80', 'Dusk over the city', 0),
  (v_mem3_id, 'image', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&q=80', 'Popcorn burnt on one side', 0),
  (v_mem3_id, 'image', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80', 'Menu screen paused for 2 hours', 1),
  (v_mem_otd, 'image', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=80', 'The steam rising in the cold', 0)
  ON CONFLICT DO NOTHING;

  -- Places
  INSERT INTO public.places (duo_id, name, latitude, longitude, visited_date, notes, created_by)
  VALUES
  (v_duo_id, 'Hauz Khas Village', 28.5535, 77.1944, '2026-09-14', 'Where we spent hours walking through the ruins.', v_user_kunal),
  (v_duo_id, 'Vasant Kunj', 28.5293, 77.1537, '2026-08-28', 'Balcony sessions watching the storms roll in.', v_user_friend),
  (v_duo_id, 'India Gate', 28.6129, 77.2295, '2026-08-01', 'Late night walks and cutting chai.', v_user_kunal)
  ON CONFLICT DO NOTHING;

  -- Little Things
  INSERT INTO public.little_things (duo_id, type, title, content, origin_date, created_by)
  VALUES
  (v_duo_id, 'inside_joke', 'The 10-minute rule', '“Bro what was that?”', '2026-09-14', v_user_kunal),
  (v_duo_id, 'quote', 'Optimism at 7 PM', '“We''ll leave in 10 minutes.” (They did not leave in 10 minutes)', '2026-08-20', v_user_friend),
  (v_duo_id, 'random_moment', 'Late Night Feast', 'Ordering 4 desserts right after loudly declaring we were completely full and couldn''t eat another bite.', '2026-07-15', v_user_kunal)
  ON CONFLICT DO NOTHING;

  -- Plans
  INSERT INTO public.plans (duo_id, title, description, planned_date, status, created_by)
  VALUES
  (v_duo_id, 'Take a weekend road trip to the hills', 'Rent a car, pack zero itinerary, stop at every roadside dhaba.', '2026-11-15', 'pending', v_user_kunal),
  (v_duo_id, 'Watch the midnight rerun of Interstellar', 'In IMAX if possible.', '2026-10-10', 'pending', v_user_friend),
  (v_duo_id, 'Try that hidden ramen spot', 'The one with only 6 counter seats.', '2026-10-01', 'pending', v_user_kunal),
  (v_duo_id, 'Build something ridiculous together', 'A secret project just for us.', '2026-12-01', 'pending', v_user_friend)
  ON CONFLICT DO NOTHING;

  -- Time Capsules
  INSERT INTO public.time_capsules (duo_id, title, message, unlock_at, created_by)
  VALUES
  (
    v_duo_id,
    'Open this when 2027 arrives',
    'Hey. If you are reading this, another year has gone by. Remember the late nights in September when we had no idea how things would turn out? You made it through. Here''s to many more unscripted chapters.',
    '2027-01-01 00:00:00+00',
    v_user_kunal
  )
  ON CONFLICT DO NOTHING;

  -- Questions
  INSERT INTO public.questions (id, duo_id, question, question_date)
  VALUES (v_q1_id, v_duo_id, 'What is one memory between us you never want to forget?', '2026-09-17')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.question_answers (question_id, user_id, answer)
  VALUES
  (v_q1_id, v_user_kunal, 'That random night we couldn''t stop laughing in the car while it was pouring outside.'),
  (v_q1_id, v_user_friend, 'When we got lost in Hauz Khas and decided to just keep walking.')
  ON CONFLICT DO NOTHING;

END $$;
