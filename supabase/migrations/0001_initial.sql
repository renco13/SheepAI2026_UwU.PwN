create extension if not exists "pgcrypto";
create extension if not exists "postgis";

do $$ begin
  create type user_role as enum ('citizen', 'organization', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type organization_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_category as enum ('trash', 'green_area', 'beach', 'road_damage', 'public_equipment', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'in_review', 'accepted', 'converted_to_event', 'forwarded_to_city', 'resolved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('draft', 'published', 'rescheduled', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type participant_status as enum ('joined', 'cancelled', 'attended');
exception when duplicate_object then null; end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  display_name text not null,
  role user_role not null default 'citizen',
  organization_oib text,
  organization_status organization_status,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_oib_format check (organization_oib is null or organization_oib ~ '^\d{11}$')
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_id_idx on sessions(user_id);

create table if not exists neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  geojson jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category report_category not null,
  status report_status not null default 'open',
  created_by_id uuid not null references users(id) on delete cascade,
  neighborhood_id uuid references neighborhoods(id) on delete set null,
  location_description text,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  image_url text,
  min_people_needed integer not null default 5,
  vote_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reports_status_idx on reports(status);
create index if not exists reports_neighborhood_id_idx on reports(neighborhood_id);
create index if not exists reports_category_idx on reports(category);

create table if not exists report_votes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  value integer not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_votes_report_user_unique unique (report_id, user_id)
);
create index if not exists report_votes_report_id_idx on report_votes(report_id);
create index if not exists report_votes_user_id_idx on report_votes(user_id);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete set null,
  organizer_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text not null,
  category report_category not null,
  status event_status not null default 'published',
  location_text text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  max_participants integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_time_valid check (ends_at > starts_at)
);
create index if not exists events_organizer_id_idx on events(organizer_id);
create index if not exists events_status_idx on events(status);

create table if not exists event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  status participant_status not null default 'joined',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_participants_event_user_unique unique (event_id, user_id)
);
create index if not exists event_participants_event_id_idx on event_participants(event_id);
create index if not exists event_participants_user_id_idx on event_participants(user_id);

create or replace function refresh_report_vote_score()
returns trigger as $$
begin
  update reports
  set vote_score = coalesce((select sum(value)::int from report_votes where report_id = coalesce(new.report_id, old.report_id)), 0),
      updated_at = now()
  where id = coalesce(new.report_id, old.report_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists report_vote_score_insert on report_votes;
create trigger report_vote_score_insert after insert on report_votes for each row execute function refresh_report_vote_score();

drop trigger if exists report_vote_score_update on report_votes;
create trigger report_vote_score_update after update on report_votes for each row execute function refresh_report_vote_score();

drop trigger if exists report_vote_score_delete on report_votes;
create trigger report_vote_score_delete after delete on report_votes for each row execute function refresh_report_vote_score();
