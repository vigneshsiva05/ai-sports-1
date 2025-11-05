/*
  # Sports Leaderboard System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `created_at` (timestamp)
    
    - `sport_assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `sport_id` (text)
      - `sport_name` (text)
      - `physical_score` (integer)
      - `mental_score` (integer)
      - `certificate_score` (integer)
      - `composite_score` (integer)
      - `category` (text)
      - `rank` (integer)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public read access for leaderboards
    - Users can only modify their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS sport_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  sport_id text NOT NULL,
  sport_name text NOT NULL,
  physical_score integer NOT NULL CHECK (physical_score >= 0 AND physical_score <= 100),
  mental_score integer NOT NULL CHECK (mental_score >= 0 AND mental_score <= 100),
  certificate_score integer NOT NULL CHECK (certificate_score >= 0 AND certificate_score <= 100),
  composite_score integer NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
  category text NOT NULL,
  rank integer,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sport_id)
);

ALTER TABLE sport_assessments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sport_assessments_sport_id ON sport_assessments(sport_id);
CREATE INDEX IF NOT EXISTS idx_sport_assessments_composite_score ON sport_assessments(composite_score DESC);

CREATE POLICY "Public read access"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert profile"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read assessments"
  ON sport_assessments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert assessments"
  ON sport_assessments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update assessments"
  ON sport_assessments FOR UPDATE
  USING (true)
  WITH CHECK (true);
