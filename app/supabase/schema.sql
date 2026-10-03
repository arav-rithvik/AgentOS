-- AgentOS demo computer. Paste this whole file into the Supabase SQL editor and run it.
-- Safe to run again: it drops and rebuilds everything.

drop view if exists jobs;
drop table if exists action_log, runs, docs, events, jobs_seed cascade;
drop function if exists ensure_fresh_events();

-- ---------------------------------------------------------------- JobBoard
-- The seed stores how long ago each job was posted. The `jobs` view turns that
-- into a real timestamp, so "posted today" is still true on any day a judge looks.
create table jobs_seed (
  id text primary key,
  board text not null check (board in ('a','b','c','d','e')),
  title text not null,
  company text not null,
  location text not null,
  tags text not null default '',
  days_ago int not null default 0,
  mins_ago int not null default 0
);

create view jobs with (security_invoker = true) as
  select id, board, title, company, location, tags,
         '/apps/jobboard?board=' || board || '#' || id as url,
         now() - make_interval(days => days_ago, mins => mins_ago) as posted_at
  from jobs_seed;

-- ---------------------------------------------------------------- Docs
create table docs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid,                      -- null = seeded, else the run that wrote it
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- Calendar
create table events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid,                      -- null = seeded, else the run that wrote it
  title text not null,
  starts_at timestamptz not null,
  duration_min int not null default 60,
  kind text not null default 'event' check (kind in ('event','deadline','block')),
  seeded_on date
);

-- ---------------------------------------------------------------- Runs and the action log
create table runs (
  id uuid primary key default gen_random_uuid(),
  preset text not null,
  prompt text not null,
  status text not null default 'running' check (status in ('running','done','error')),
  summary text,
  steps int not null default 0,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  ms int not null default 0,
  created_at timestamptz not null default now()
);

create table action_log (
  id bigint generated always as identity primary key,
  run_id uuid not null references runs(id) on delete cascade,
  ts timestamptz not null default now(),
  app text not null,                -- jobboard | docs | calendar
  action text not null,             -- e.g. jobboard.jobs.list
  args jsonb not null default '{}'::jsonb,
  receipt jsonb not null default '{}'::jsonb,
  tokens int,
  latency_ms int
);
create index on action_log (run_id, id);
create index on docs (run_id);
create index on events (run_id);

-- ---------------------------------------------------------------- Security
-- The browser key can only read. Only the server (service role) writes.
alter table jobs_seed  enable row level security;
alter table docs       enable row level security;
alter table events     enable row level security;
alter table runs       enable row level security;
alter table action_log enable row level security;

create policy read_all on jobs_seed  for select to anon, authenticated using (true);
create policy read_all on docs       for select to anon, authenticated using (true);
create policy read_all on events     for select to anon, authenticated using (true);
create policy read_all on runs       for select to anon, authenticated using (true);
create policy read_all on action_log for select to anon, authenticated using (true);
grant select on jobs to anon, authenticated;

-- ---------------------------------------------------------------- Realtime
alter table docs       replica identity full;
alter table events     replica identity full;
alter table runs       replica identity full;
alter table action_log replica identity full;
do $$
declare t text;
begin
  foreach t in array array['docs','events','runs','action_log'] loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- ---------------------------------------------------------------- Seed: jobs
-- 27 postings on 5 boards. 16 ML roles posted today (10 unique after dedupe),
-- 2 non-ML roles posted today (the query must filter them out), 9 older.
insert into jobs_seed (id, board, title, company, location, tags, days_ago, mins_ago) values
('a-01','a','ML Research Intern','Halcyon Labs','San Francisco, CA','ml machine learning research ai internship',0,40),
('a-02','a','Machine Learning Engineer Intern','Meridian AI','Remote (US)','ml machine learning engineering ai internship',0,95),
('a-03','a','Perception ML Intern','Northbeam Robotics','Pittsburgh, PA','ml machine learning robotics vision internship',0,180),
('a-04','a','Applied Scientist Intern, NLP','Tessellate','New York, NY','ml machine learning nlp ai internship',3,0),
('a-05','a','Data Science Intern','Osprey Data','Austin, TX','data science analytics internship',6,0),

('b-01','b','ML Research Intern','Halcyon Labs','San Francisco, CA','ml machine learning research ai internship',0,55),
('b-02','b','ML Intern, Clinical Models','Quanta Health','Boston, MA','ml machine learning health ai internship',0,120),
('b-03','b','Forecasting ML Intern','Lumen Grid','Seattle, WA','ml machine learning energy forecasting internship',0,200),
('b-04','b','Machine Learning Engineer Intern','Meridian AI','Remote (US)','ml machine learning engineering ai internship',0,30),
('b-05','b','ML Intern, Threat Detection','Corvid Security','Remote (US)','ml machine learning security internship',2,0),
('b-06','b','Autonomy ML Intern','Parallax Motors','Palo Alto, CA','ml machine learning autonomy vehicles internship',9,0),

('c-01','c','ML Intern, Protein Design','Fathom Bio','South San Francisco, CA','ml machine learning biology ai internship',0,75),
('c-02','c','ML Infrastructure Intern','Arclight Systems','San Francisco, CA','ml machine learning infrastructure platform internship',0,240),
('c-03','c','ML Intern, Clinical Models','Quanta Health','Boston, MA','ml machine learning health ai internship',0,150),
('c-04','c','Research Intern, Climate ML','Kestrel Climate','Boulder, CO','ml machine learning climate research internship',4,0),
('c-05','c','Applied Scientist Intern, NLP','Tessellate','New York, NY','ml machine learning nlp ai internship',3,0),

('d-01','d','Speech ML Intern','Vireo Voice','Remote (US)','ml machine learning speech audio internship',0,20),
('d-02','d','Perception ML Intern','Northbeam Robotics','Pittsburgh, PA','ml machine learning robotics vision internship',0,210),
('d-03','d','ML Systems Intern','Stratus Compute','Seattle, WA','ml machine learning systems gpu internship',0,300),
('d-04','d','Data Science Intern','Osprey Data','Austin, TX','data science analytics internship',6,0),
('d-05','d','Frontend Engineer Intern','Halcyon Labs','San Francisco, CA','frontend web react internship',0,60),

('e-01','e','ML Infrastructure Intern','Arclight Systems','San Francisco, CA','ml machine learning infrastructure platform internship',0,110),
('e-02','e','ML Intern, Remote Sensing','Kestrel Climate','Boulder, CO','ml machine learning climate satellite internship',0,260),
('e-03','e','ML Intern, Protein Design','Fathom Bio','South San Francisco, CA','ml machine learning biology ai internship',0,90),
('e-04','e','Product Design Intern','Lumen Grid','Seattle, WA','design product ux internship',0,45),
('e-05','e','Autonomy ML Intern','Parallax Motors','Palo Alto, CA','ml machine learning autonomy vehicles internship',9,0),
('e-06','e','ML Intern, Threat Detection','Corvid Security','Remote (US)','ml machine learning security internship',1,30);

-- ---------------------------------------------------------------- Seed: calendar
-- Seeded events are dated relative to today. The server calls this at the start of
-- each run, so "due this week" is always true. It only rewrites rows once per day.
create or replace function ensure_fresh_events()
returns void language plpgsql security definer set search_path = public as $$
declare
  tz constant text := 'America/Los_Angeles';
  today date := (now() at time zone tz)::date;
begin
  if exists (select 1 from events where run_id is null and seeded_on = today) then
    return;
  end if;
  delete from events where run_id is null;
  insert into events (title, starts_at, duration_min, kind, seeded_on) values
    ('Bio lab report due',        ((today + 1) + time '08:00') at time zone tz, 30, 'deadline', today),
    ('Calc problem set 5 due',    ((today + 2) + time '09:00') at time zone tz, 30, 'deadline', today),
    ('History essay draft due',   ((today + 3) + time '08:00') at time zone tz, 30, 'deadline', today),
    ('CS project milestone due',  ((today + 5) + time '12:00') at time zone tz, 30, 'deadline', today),
    ('Robotics club',             ((today + 1) + time '18:00') at time zone tz, 120, 'event',   today),
    ('Dentist',                   ((today + 2) + time '16:00') at time zone tz, 60, 'event',    today);
end $$;

select ensure_fresh_events();
