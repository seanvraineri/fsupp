-- Migration: create product_scans table to store permanent scan history

create table if not exists public.product_scans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  verdict jsonb not null,
  created_at timestamptz default now()
);

alter table public.product_scans enable row level security;

drop policy if exists "Users can read own scans" on public.product_scans;
create policy "Users can read own scans" on public.product_scans
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own scans" on public.product_scans;
create policy "Users can insert own scans" on public.product_scans
  for insert with check (auth.uid() = user_id); 