-- Add source column to contacts table
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS source text;

-- Create index on contact_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_contact_number ON public.contacts (contact_number);

-- Add source column to conversations table
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS source text; 