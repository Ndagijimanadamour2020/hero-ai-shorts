create extension if not exists pgcrypto;
create table if not exists public.video_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  topic text not null,
  status text not null default 'queued' check (status in ('queued','generating_script','generating_audio','generating_visuals','rendering','completed','failed')),
  progress integer not null default 0 check (progress between 0 and 100),
  plan jsonb,
  output_path text,
  output_url text,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
create index if not exists video_jobs_status_created_idx on public.video_jobs(status, created_at);
alter table public.video_jobs enable row level security;
create policy "public can create jobs" on public.video_jobs for insert to anon, authenticated with check (true);
create policy "public can read jobs" on public.video_jobs for select to anon, authenticated using (true);
create policy "service can update jobs" on public.video_jobs for update to service_role using (true) with check (true);
create or replace function public.claim_next_video_job()
returns setof public.video_jobs
language plpgsql
security invoker
as $$
declare claimed public.video_jobs;
begin
  update public.video_jobs set status='generating_script', started_at=now(), progress=5
  where id = (select id from public.video_jobs where status='queued' order by created_at for update skip locked limit 1)
  returning * into claimed;
  if claimed.id is not null then return next claimed; end if;
  return;
end;
$$;
grant execute on function public.claim_next_video_job() to service_role;

create table if not exists public.youtube_tokens (
  id text primary key,
  encrypted_refresh_token text not null,
  updated_at timestamptz not null default now()
);
alter table public.youtube_tokens enable row level security;
revoke all on public.youtube_tokens from anon, authenticated;
grant all on public.youtube_tokens to service_role;
