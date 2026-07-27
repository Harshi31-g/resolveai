/*
# Fix: read role from raw_user_meta_data instead of raw_app_meta_data

The Supabase JS client signUp() puts custom data in user_metadata (not
app_metadata, which requires the service-role key). Update the trigger
function to read the role from raw_user_meta_data.
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'investigator')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
