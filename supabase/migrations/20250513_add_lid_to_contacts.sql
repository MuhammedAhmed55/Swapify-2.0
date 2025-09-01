-- Add lid column to contacts table for handling @lid contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS lid text;

-- Create index on lid for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_lid ON public.contacts (lid);
