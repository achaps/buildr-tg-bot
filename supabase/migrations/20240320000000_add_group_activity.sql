-- Create group_activity table
create table if not exists public.group_activity (
  telegram_id text references public."tg-users" (telegram_id),
  topic_id integer,
  first_message_at timestamp with time zone,
  message_count integer default 1,
  primary key (telegram_id, topic_id)
);

-- Add RLS policies
alter table public.group_activity enable row level security;

create policy "Enable read access for all users"
  on public.group_activity for select
  using (true);

create policy "Enable insert for authenticated users only"
  on public.group_activity for insert
  with check (true);

create policy "Enable update for authenticated users only"
  on public.group_activity for update
  using (true);

-- Add indexes
create index if not exists idx_group_activity_telegram_id
  on public.group_activity (telegram_id);

create index if not exists idx_group_activity_topic_id
  on public.group_activity (topic_id); 