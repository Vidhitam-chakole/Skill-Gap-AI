-- ==============================================================================
-- SkillGap AI - Supabase Production Schema & Migrations
-- Covers all respected tables:
-- 1. user_profiles
-- 2. linkedin_results
-- 3. github_results
-- 4. roadmap_results (Dynamic Career Roadmaps)
-- 5. chat_messages (Local AI Career Agent History)
-- 6. quiz_evaluations (Anti-AI Code Authenticity Results)
-- 7. quiz_sessions (Active Quiz Questions & Verification)
-- 8. app_data (Universal Fallback / Key-Value Store)
-- ==============================================================================

-- Enable pgcrypto for UUID generation
create extension if not exists pgcrypto;

-- Helper function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------------------------
-- 1. USER PROFILES TABLE
-- ------------------------------------------------------------------------------
create table if not exists user_profiles (
  id text primary key,
  name text not null,
  email text,
  github_username text,
  linkedin_url text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_email on user_profiles (email);
create index if not exists idx_user_profiles_github on user_profiles (github_username);

drop trigger if exists set_user_profiles_updated_at on user_profiles;
create trigger set_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 2. LINKEDIN ANALYSIS RESULTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists linkedin_results (
  id text primary key,
  profile_url text not null default '',
  name text not null default '',
  headline text not null default '',
  overall_score integer not null default 0,
  skill_gaps jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  market_demand jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_linkedin_results_name on linkedin_results (name);
create index if not exists idx_linkedin_results_score on linkedin_results (overall_score);

drop trigger if exists set_linkedin_results_updated_at on linkedin_results;
create trigger set_linkedin_results_updated_at
  before update on linkedin_results
  for each row execute function update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. GITHUB ANALYSIS RESULTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists github_results (
  id text primary key,
  username text not null default '',
  name text not null default '',
  overall_score integer not null default 0,
  stats jsonb not null default '{}'::jsonb,
  top_languages jsonb not null default '[]'::jsonb,
  skill_gaps jsonb not null default '[]'::jsonb,
  pinned_repos jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_github_results_username on github_results (username);
create index if not exists idx_github_results_score on github_results (overall_score);

drop trigger if exists set_github_results_updated_at on github_results;
create trigger set_github_results_updated_at
  before update on github_results
  for each row execute function update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. DYNAMIC ROADMAP RESULTS TABLE (Dynamic Milestones & Sprints)
-- ------------------------------------------------------------------------------
create table if not exists roadmap_results (
  id text primary key,
  combined_score integer not null default 0,
  summary text not null default '',
  strong_languages jsonb not null default '[]'::jsonb,
  primary_language text not null default '',
  total_milestones integer not null default 0,
  estimated_total_duration text not null default '',
  priorities jsonb not null default '[]'::jsonb,
  weeks jsonb not null default '[]'::jsonb,
  next_actions jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_roadmap_results_score on roadmap_results (combined_score);
create index if not exists idx_roadmap_results_primary_lang on roadmap_results (primary_language);

drop trigger if exists set_roadmap_results_updated_at on roadmap_results;
create trigger set_roadmap_results_updated_at
  before update on roadmap_results
  for each row execute function update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. CHAT MESSAGES TABLE (AI Career Agent Conversation History)
-- ------------------------------------------------------------------------------
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  role text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_conversation on chat_messages (conversation_id, created_at);

-- ------------------------------------------------------------------------------
-- 6. QUIZ EVALUATIONS TABLE (Code Authenticity & Anti-AI Verification)
-- ------------------------------------------------------------------------------
create table if not exists quiz_evaluations (
  id text primary key,
  language text not null default '',
  score integer not null default 0,
  total_questions integer not null default 0,
  percentage integer not null default 0,
  authenticity_status text not null default '',
  authenticity_label text not null default '',
  badge text not null default '',
  summary text not null default '',
  ai_detection_insight text not null default '',
  concept_breakdown jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  detailed_review jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quiz_evaluations_lang on quiz_evaluations (language);
create index if not exists idx_quiz_evaluations_status on quiz_evaluations (authenticity_status);

drop trigger if exists set_quiz_evaluations_updated_at on quiz_evaluations;
create trigger set_quiz_evaluations_updated_at
  before update on quiz_evaluations
  for each row execute function update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. QUIZ SESSIONS TABLE (Active Generated Questions)
-- ------------------------------------------------------------------------------
create table if not exists quiz_sessions (
  id text primary key,
  language text not null default '',
  github_analysis_id text,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_quiz_sessions_lang on quiz_sessions (language);

-- ------------------------------------------------------------------------------
-- 8. UNIVERSAL FALLBACK / APP DATA TABLE
-- ------------------------------------------------------------------------------
create table if not exists app_data (
  id text primary key,
  table_name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_data_table_name on app_data (table_name);

drop trigger if exists set_app_data_updated_at on app_data;
create trigger set_app_data_updated_at
  before update on app_data
  for each row execute function update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- Ensures open, secure read/write access for application clients & service role
-- ==============================================================================

alter table user_profiles enable row level security;
alter table linkedin_results enable row level security;
alter table github_results enable row level security;
alter table roadmap_results enable row level security;
alter table chat_messages enable row level security;
alter table quiz_evaluations enable row level security;
alter table quiz_sessions enable row level security;
alter table app_data enable row level security;

-- Drop existing policies if any to allow clean re-runs
drop policy if exists "Allow all on user_profiles" on user_profiles;
drop policy if exists "Allow all on linkedin_results" on linkedin_results;
drop policy if exists "Allow all on github_results" on github_results;
drop policy if exists "Allow all on roadmap_results" on roadmap_results;
drop policy if exists "Allow all on chat_messages" on chat_messages;
drop policy if exists "Allow all on quiz_evaluations" on quiz_evaluations;
drop policy if exists "Allow all on quiz_sessions" on quiz_sessions;
drop policy if exists "Allow all on app_data" on app_data;

-- Create permissive policies for public / anon / authenticated / service_role
create policy "Allow all on user_profiles" on user_profiles for all to public using (true) with check (true);
create policy "Allow all on linkedin_results" on linkedin_results for all to public using (true) with check (true);
create policy "Allow all on github_results" on github_results for all to public using (true) with check (true);
create policy "Allow all on roadmap_results" on roadmap_results for all to public using (true) with check (true);
create policy "Allow all on chat_messages" on chat_messages for all to public using (true) with check (true);
create policy "Allow all on quiz_evaluations" on quiz_evaluations for all to public using (true) with check (true);
create policy "Allow all on quiz_sessions" on quiz_sessions for all to public using (true) with check (true);
create policy "Allow all on app_data" on app_data for all to public using (true) with check (true);

-- Grant privileges to anon, authenticated, service_role, and postgres
grant all on all tables in schema public to anon, authenticated, service_role, postgres;
grant all on all sequences in schema public to anon, authenticated, service_role, postgres;
