create extension if not exists pgcrypto;
alter table public.video_jobs add column if not exists publish_at timestamptz;
alter table public.video_jobs add column if not exists auto_publish boolean not null default false;
alter table public.video_jobs add column if not exists template_id uuid;
alter table public.video_jobs add column if not exists published_at timestamptz;
alter table public.video_jobs add column if not exists youtube_video_id text;
-- Existing V3 installations may have nullable user_id. V4 requires auth ownership.
create table if not exists public.brand_settings (
 user_id uuid primary key references auth.users(id) on delete cascade,
 name text not null default 'Hero AI Shorts', primary text not null default '#0b1f3a', accent text not null default '#f5c542', font text not null default 'Inter', logo_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.video_templates (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null, config jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.schedules (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null, topic_template text not null, cron text not null, timezone text not null default 'Africa/Kigali', enabled boolean not null default true,
 auto_publish boolean not null default false, template_id uuid references public.video_templates(id) on delete set null,
 next_run_at timestamptz not null, last_run_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.youtube_tokens (
 user_id uuid primary key references auth.users(id) on delete cascade, encrypted_refresh_token text not null, updated_at timestamptz not null default now()
);
create table if not exists public.youtube_publications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 job_id uuid not null references public.video_jobs(id) on delete cascade, youtube_video_id text not null,
 privacy_status text not null default 'private', published_at timestamptz not null default now()
);
create index if not exists video_jobs_user_created_idx on public.video_jobs(user_id,created_at desc);
create index if not exists schedules_due_idx on public.schedules(enabled,next_run_at);
-- Replace unsafe V3 public policies with owner-only access. Service role remains server-only and bypasses RLS.
alter table public.video_jobs enable row level security;
drop policy if exists "public can create jobs" on public.video_jobs;
drop policy if exists "public can read jobs" on public.video_jobs;
create policy "users read own jobs" on public.video_jobs for select to authenticated using ((select auth.uid())=user_id);
create policy "users create own jobs" on public.video_jobs for insert to authenticated with check ((select auth.uid())=user_id);
create policy "users update own jobs" on public.video_jobs for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.video_jobs from anon;
grant select,insert,update on public.video_jobs to authenticated;

alter table public.brand_settings enable row level security;
create policy "users manage own brand" on public.brand_settings for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.brand_settings from anon;
grant select,insert,update,delete on public.brand_settings to authenticated;

alter table public.video_templates enable row level security;
create policy "users manage own templates" on public.video_templates for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.video_templates from anon;
grant select,insert,update,delete on public.video_templates to authenticated;

alter table public.schedules enable row level security;
create policy "users manage own schedules" on public.schedules for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.schedules from anon;
grant select,insert,update,delete on public.schedules to authenticated;

alter table public.youtube_tokens enable row level security;
revoke all on public.youtube_tokens from anon,authenticated;
grant all on public.youtube_tokens to service_role;

alter table public.youtube_publications enable row level security;
create policy "users read own publications" on public.youtube_publications for select to authenticated using ((select auth.uid())=user_id);
revoke all on public.youtube_publications from anon;
grant select on public.youtube_publications to authenticated;

create or replace function public.claim_next_video_job()
returns setof public.video_jobs language plpgsql security definer set search_path=public as $$
declare claimed public.video_jobs;
begin
 update public.video_jobs set status='generating_script',started_at=coalesce(started_at,now()),progress=5
 where id=(select id from public.video_jobs where status='queued' and (publish_at is null or publish_at<=now()) order by created_at for update skip locked limit 1)
 returning * into claimed;
 if claimed.id is not null then return next claimed; end if; return;
end; $$;
revoke all on function public.claim_next_video_job() from public;
grant execute on function public.claim_next_video_job() to service_role;

-- Storage policies for private buckets: users own a folder named by auth.uid().
insert into storage.buckets(id,name,public) values ('videos','videos',false) on conflict (id) do nothing;
insert into storage.buckets(id,name,public) values ('assets','assets',false) on conflict (id) do nothing;
create policy "video owner read" on storage.objects for select to authenticated using (bucket_id='videos' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy "asset owner read" on storage.objects for select to authenticated using (bucket_id='assets' and (storage.foldername(name))[1]=(select auth.uid()::text));
