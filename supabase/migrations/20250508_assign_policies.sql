DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.migration_logs
        WHERE migration_name = '20250507_add_column_logo_horizontal_url_in_settings_table.sql'
        AND status = 'success'
    ) THEN

        ALTER TABLE public.settings ADD COLUMN logo_horizontal_url TEXT;

       
        INSERT INTO public.migration_logs (migration_name, status, message)
        VALUES ('20250507_add_column_logo_horizontal_url_in_settings_table.sql', 'success', 'logo_horizontal_url table migration ran successfully.');
    END IF;
END $$; 

-- Add "Allow All" policy to all tables
DO $$
BEGIN
    -- Add policy to settings table
    DROP POLICY IF EXISTS "Allow All" ON public.settings;
    CREATE POLICY "Allow All" ON public.settings AS PERMISSIVE FOR ALL TO public USING (true);
    
    -- Add policy to media table
    DROP POLICY IF EXISTS "Allow All" ON public.media;
    CREATE POLICY "Allow All" ON public.media AS PERMISSIVE FOR ALL TO public USING (true);
    
    -- Add policy to migration_logs table
    DROP POLICY IF EXISTS "Allow All" ON public.migration_logs;
    CREATE POLICY "Allow All" ON public.migration_logs AS PERMISSIVE FOR ALL TO public USING (true);
    
    -- Add policy to roles table
    DROP POLICY IF EXISTS "Allow All" ON public.roles;
    CREATE POLICY "Allow All" ON public.roles AS PERMISSIVE FOR ALL TO public USING (true);
    
    -- Add policy to role_access table
    DROP POLICY IF EXISTS "Allow All" ON public.role_access;
    CREATE POLICY "Allow All" ON public.role_access AS PERMISSIVE FOR ALL TO public USING (true);
    
    -- Add policy to user_profile table
    DROP POLICY IF EXISTS "Allow All" ON public.user_profile;
    CREATE POLICY "Allow All" ON public.user_profile AS PERMISSIVE FOR ALL TO public USING (true);
    
    -- Record the migration
    INSERT INTO public.migration_logs (migration_name, status, message)
    VALUES ('20250508_assign_policies.sql', 'success', 'Added "Allow All" policy to all tables');
END $$; 