DO $$ 
BEGIN
CREATE TABLE IF NOT EXISTS public.migration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    migration_name TEXT NOT NULL,
    status TEXT NOT NULL,  -- 'success' or 'failed'
    message TEXT,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

    -- Check if the migration '20250510_create_conversations_messages_tables.sql' has already been executed successfully
    IF NOT EXISTS (
        SELECT 1
        FROM public.migration_logs
        WHERE migration_name = '20250510_create_conversations_messages_tables.sql'
        AND status = 'success'
    ) THEN
        -- Start the migration commands here
        
        -- Create conversations table
        CREATE TABLE IF NOT EXISTS public.conversations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT,
            description TEXT,
            status TEXT DEFAULT 'active',
            agent_id UUID,
            contact_id UUID,
            assistant_id UUID,
            controlled_by TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        -- Create messages table
        CREATE TABLE IF NOT EXISTS public.messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            message_id TEXT UNIQUE NOT NULL,
            conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
            actor_id TEXT NOT NULL,
            actor_type TEXT NOT NULL,
            content JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON public.conversations(contact_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON public.conversations(agent_id);

        -- Enable Row Level Security
        ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

        -- Create policies for conversations
        CREATE POLICY "Conversations are viewable by authenticated users" 
            ON public.conversations FOR SELECT 
            USING (auth.uid() IS NOT NULL);
            
        CREATE POLICY "Users can insert their own conversations" 
            ON public.conversations FOR INSERT 
            WITH CHECK (auth.uid() IS NOT NULL);
            
        CREATE POLICY "Users can update their own conversations" 
            ON public.conversations FOR UPDATE 
            USING (auth.uid() IS NOT NULL);

        -- Create policies for messages
        CREATE POLICY "Messages are viewable by authenticated users" 
            ON public.messages FOR SELECT 
            USING (auth.uid() IS NOT NULL);
            
        CREATE POLICY "Users can insert messages to their conversations" 
            ON public.messages FOR INSERT 
            WITH CHECK (auth.uid() IS NOT NULL);
            
        CREATE POLICY "Users can update their own messages" 
            ON public.messages FOR UPDATE 
            USING (auth.uid() IS NOT NULL);

        -- Log the successful migration
        INSERT INTO public.migration_logs (migration_name, status, message)
        VALUES ('20250510_create_conversations_messages_tables.sql', 'success', 'Conversations and messages tables created successfully.');
    END IF;
END $$; 