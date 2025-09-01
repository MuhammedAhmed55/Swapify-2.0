DO $$ 
BEGIN
    -- Check if the migration '20250503_create_media_table.sql' has already been executed successfully
    IF NOT EXISTS (
        SELECT 1
        FROM public.migration_logs
        WHERE migration_name = '20250503_create_media_table.sql'
        AND status = 'success'
    ) THEN
        -- Create media table
        CREATE TABLE IF NOT EXISTS public.media (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
            file_name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size BIGINT NOT NULL,
            file_path TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            is_public BOOLEAN DEFAULT false,
            metadata JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
        CREATE INDEX IF NOT EXISTS idx_media_file_path ON public.media(file_path);

        -- Enable Row Level Security
        ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Public media is viewable by everyone" 
            ON public.media FOR SELECT 
            USING (is_public = true);

        CREATE POLICY "Users can view their own media" 
            ON public.media FOR SELECT 
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own media" 
            ON public.media FOR INSERT 
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own media" 
            ON public.media FOR UPDATE 
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own media" 
            ON public.media FOR DELETE 
            USING (auth.uid() = user_id);

        CREATE POLICY "Admins can manage all media" 
            ON public.media FOR ALL 
            USING (EXISTS (
                SELECT 1 FROM public.user_profile 
                WHERE user_profile.id = auth.uid() 
                AND user_profile.role_id = 'a0eeb1f4-6b6e-4d1a-b1f7-72e1bb78c8d4'
            ));

        -- Log the successful migration
        INSERT INTO public.migration_logs (migration_name, status, message)
        VALUES ('20250503_create_media_table.sql', 'success', 'Media table migration ran successfully.');
    END IF;
END $$; 