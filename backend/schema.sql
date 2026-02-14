-- 1. Create Meetings Table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    audio_url TEXT,
    transcript TEXT,
    summary TEXT,
    status TEXT DEFAULT 'processing',
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on Meetings Table
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for Meetings
-- SELECT: Users can only see their own meetings
CREATE POLICY "Users can view their own meetings" 
ON public.meetings FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT: Users can only insert meetings for themselves
CREATE POLICY "Users can create their own meetings" 
ON public.meetings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own meetings
CREATE POLICY "Users can update their own meetings" 
ON public.meetings FOR UPDATE 
USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own meetings
CREATE POLICY "Users can delete their own meetings" 
ON public.meetings FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);

-- 5. Storage RLS (Bucket: recordings)
-- Note: Run these in the Supabase Dashboard if the bucket doesn't exist.
-- INSERT: Authenticated users can upload to their own folder
CREATE POLICY "Allow authenticated uploads to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

-- SELECT: Authenticated users can view their own files
CREATE POLICY "Allow authenticated views of own folder"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
