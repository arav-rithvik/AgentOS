-- AgentOS demo computer. Paste this whole file into the Supabase SQL editor and run it.
-- Safe to run again: it drops and rebuilds everything.

drop view if exists jobs, flights, salon_slots, concerts;
drop table if exists action_log, runs, docs, events, jobs_seed, bookings, flights_seed, salon_slots_seed, concerts_seed cascade;
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

-- ================================================================ More apps
-- Flights, a hair salon, and concerts. Same pattern as jobs: the seed stores a day
-- offset and a local time, and a view turns that into a real timestamp for today.

create table flights_seed (
  id text primary key, airline text not null, origin text not null, dest text not null,
  day_offset int not null, dep time not null, dur_min int not null, price int not null, seats_left int not null
);
create view flights with (security_invoker = true) as
  select id, airline, origin, dest, price, seats_left,
    (((now() at time zone 'America/Los_Angeles')::date + day_offset) + dep) at time zone 'America/Los_Angeles' as departs_at,
    (((now() at time zone 'America/Los_Angeles')::date + day_offset) + dep) at time zone 'America/Los_Angeles' + make_interval(mins => dur_min) as arrives_at
  from flights_seed;

create table salon_slots_seed (
  id text primary key, salon text not null, stylist text not null, service text not null,
  day_offset int not null, slot_time time not null, duration_min int not null, price int not null
);
create view salon_slots with (security_invoker = true) as
  select id, salon, stylist, service, duration_min, price,
    (((now() at time zone 'America/Los_Angeles')::date + day_offset) + slot_time) at time zone 'America/Los_Angeles' as starts_at
  from salon_slots_seed;

create table concerts_seed (
  id text primary key, artist text not null, genre text not null, venue text not null, city text not null,
  day_offset int not null, show_time time not null, duration_min int not null default 150, price int not null, tickets_left int not null
);
create view concerts with (security_invoker = true) as
  select id, artist, genre, venue, city, duration_min, price, tickets_left,
    (((now() at time zone 'America/Los_Angeles')::date + day_offset) + show_time) at time zone 'America/Los_Angeles' as starts_at
  from concerts_seed;

-- One table for everything the agent books, in any app.
create table bookings (
  id uuid primary key default gen_random_uuid(),
  run_id uuid,
  app text not null,                -- flights | salon | concerts
  item_id text not null,
  title text not null,
  details jsonb not null default '{}'::jsonb,
  price int not null default 0,
  confirmation text not null default upper(substr(md5(random()::text), 1, 6)),
  created_at timestamptz not null default now()
);
create index on bookings (run_id);

alter table flights_seed     enable row level security;
alter table salon_slots_seed enable row level security;
alter table concerts_seed    enable row level security;
alter table bookings         enable row level security;
create policy read_all on flights_seed     for select to anon, authenticated using (true);
create policy read_all on salon_slots_seed for select to anon, authenticated using (true);
create policy read_all on concerts_seed    for select to anon, authenticated using (true);
create policy read_all on bookings         for select to anon, authenticated using (true);
grant select on flights, salon_slots, concerts to anon, authenticated;

alter table bookings replica identity full;
do $$ begin
  alter publication supabase_realtime add table bookings;
exception when duplicate_object then null; end $$;

-- Flights: 4 routes x 3 days x 6 departures = 72 rows. Price moves with the hour and the day.
insert into flights_seed (id, airline, origin, dest, day_offset, dep, dur_min, price, seats_left)
select
  lower(r.origin) || '-' || lower(r.dest) || '-' || d || '-' || t.n,
  (array['Cascade Air','Pacific Loop','Sunline','Altair'])[1 + (t.n + d + r.k) % 4],
  r.origin, r.dest, d, t.dep, r.dur,
  r.base + ((t.n * 37 + d * 23 + r.k * 11) % 90) - (case when t.n >= 5 then 25 else 0 end),
  1 + (t.n * 5 + d * 3 + r.k) % 9
from (values ('SFO','LAX',85,69,0), ('LAX','SFO',85,72,1), ('SFO','SEA',125,98,2), ('SFO','JFK',330,219,3)) as r(origin, dest, dur, base, k),
     generate_series(1, 3) as d,
     (values (1, time '06:15'), (2, time '09:40'), (3, time '13:05'), (4, time '16:20'), (5, time '18:45'), (6, time '21:10')) as t(n, dep);

-- Salon: 3 salons x 3 days x 8 slots = 72 rows.
insert into salon_slots_seed (id, salon, stylist, service, day_offset, slot_time, duration_min, price)
select
  s.code || '-' || d || '-' || t.n,
  s.salon,
  (array['Dani','Marcus','Yuki','Renee','Theo'])[1 + (t.n + d + s.k) % 5],
  (array['Haircut','Haircut','Haircut + beard trim','Haircut + wash'])[1 + (t.n + s.k) % 4],
  d, t.slot_time,
  case when (t.n + s.k) % 4 >= 2 then 45 else 30 end,
  s.base + case when (t.n + s.k) % 4 >= 2 then 12 else 0 end
from (values ('ss','Fade & Co.', 24, 0), ('nb','North Beach Barbers', 38, 1), ('sa','Shear Avenue', 52, 2)) as s(code, salon, base, k),
     generate_series(1, 3) as d,
     (values (1, time '09:00'), (2, time '09:45'), (3, time '10:30'), (4, time '11:15'), (5, time '13:00'), (6, time '14:30'), (7, time '16:00'), (8, time '17:30')) as t(n, slot_time);

-- Concerts: 20 shows in 3 cities over the next 3 days.
insert into concerts_seed (id, artist, genre, venue, city, day_offset, show_time, price, tickets_left) values
('con-01','Glass Harbor','indie rock','The Fillmore','San Francisco',1,'19:00',58,40),
('con-02','Neon Tundra','electronic','The Independent','San Francisco',1,'20:30',45,12),
('con-03','Mara Voss','singer-songwriter','Great American Music Hall','San Francisco',1,'21:00',72,6),
('con-04','Low Orbit Choir','ambient','Grace Cathedral','San Francisco',1,'17:30',35,80),
('con-05','Saint Juniper','folk','Bottom of the Hill','San Francisco',1,'20:00',28,25),
('con-06','Velvet Static','shoegaze','The Chapel','San Francisco',1,'21:30',39,3),
('con-07','DJ Halftone','house','Public Works','San Francisco',1,'22:00',95,150),
('con-08','The Understudies','indie pop','Fox Theater','Oakland',1,'20:00',64,60),
('con-09','Glass Harbor','indie rock','The Fillmore','San Francisco',2,'19:00',58,22),
('con-10','Kite Season','indie pop','The Independent','San Francisco',2,'20:30',42,48),
('con-11','Marrow & Pine','americana','Great American Music Hall','San Francisco',2,'20:00',49,30),
('con-12','Ostinato Quartet','classical','Davies Symphony Hall','San Francisco',2,'19:30',88,110),
('con-13','Paper Lantern Club','jazz','SFJAZZ Center','San Francisco',2,'21:00',55,18),
('con-14','Neon Tundra','electronic','The Wiltern','Los Angeles',2,'20:00',52,75),
('con-15','Mara Voss','singer-songwriter','The Troubadour','Los Angeles',3,'20:30',68,9),
('con-16','Cinder Avenue','punk','The Echo','Los Angeles',3,'21:00',31,44),
('con-17','Low Orbit Choir','ambient','Walt Disney Concert Hall','Los Angeles',3,'19:00',79,35),
('con-18','Saint Juniper','folk','Freight & Salvage','Berkeley',3,'19:30',34,52),
('con-19','Velvet Static','shoegaze','The Chapel','San Francisco',3,'21:00',39,27),
('con-20','DJ Halftone','house','1015 Folsom','San Francisco',3,'22:30',85,200);
