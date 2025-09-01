-- Create table for linking contacts with users
CREATE TABLE IF NOT EXISTS user_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add a unique constraint to prevent duplicate links
  UNIQUE(contact_id, user_id)
);

-- Add RLS policies
ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;

-- Policy to allow select for authenticated users
CREATE POLICY "Allow select for authenticated users" 
  ON user_contacts 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy to allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" 
  ON user_contacts 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Policy to allow update for authenticated users
CREATE POLICY "Allow update for authenticated users" 
  ON user_contacts 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Policy to allow delete for authenticated users
CREATE POLICY "Allow delete for authenticated users" 
  ON user_contacts 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_user_contacts_contact_id ON user_contacts(contact_id);
CREATE INDEX idx_user_contacts_user_id ON user_contacts(user_id);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_user_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_contacts_updated_at
BEFORE UPDATE ON user_contacts
FOR EACH ROW
EXECUTE FUNCTION update_user_contacts_updated_at(); 