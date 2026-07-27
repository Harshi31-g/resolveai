/*
# Profiles table for per-user role and display name

1. New Tables
- `profiles` — one row per auth user.
  - id (uuid, PK, references auth.users ON DELETE CASCADE)
  - email (text, not null)
  - full_name (text, default derived from email)
  - role (text, admin/investigator/merchant/cardmember, default investigator)
  - created_at (timestamptz, default now())

2. Automation
- `handle_new_user()` trigger: on new auth.users insert, creates the matching
  profiles row using metadata full_name + role (defaulting to investigator).
- Trigger `on_auth_user_created` fires AFTER INSERT on auth.users.

3. Security
- profiles: RLS enabled, owner-scoped SELECT/INSERT/UPDATE.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT 'User',
  role text NOT NULL DEFAULT 'investigator'
    CHECK (role IN ('admin','investigator','merchant','cardmember')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

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
    COALESCE(NEW.raw_app_meta_data->>'role', 'investigator')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
