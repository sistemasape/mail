-- ============================================================
--  Email App — Schema Supabase (PostgreSQL)
-- ============================================================

-- Extensão para UUID
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------
-- Tabela de perfis de usuário (espelho do auth.users)
-- -------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  updated_at  timestamptz default now()
);

-- -------------------------------------------------------
-- Tabela de e-mails
-- -------------------------------------------------------
create type email_folder as enum ('inbox', 'sent', 'drafts', 'trash', 'spam');

create table public.emails (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  folder      email_folder not null default 'inbox',
  sender_id   uuid references auth.users(id),
  sender_name text,
  sender_addr text not null,
  recipients  text[] not null,
  subject     text not null default '',
  body        text not null default '',
  is_read     boolean not null default false,
  is_starred  boolean not null default false,
  labels      text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Índices para performance
create index idx_emails_user_folder on public.emails(user_id, folder);
create index idx_emails_created     on public.emails(created_at desc);
create index idx_emails_read        on public.emails(user_id, is_read);

-- Busca full-text em português
alter table public.emails
  add column fts tsvector
    generated always as (
      to_tsvector('portuguese', coalesce(subject, '') || ' ' || coalesce(body, '') || ' ' || coalesce(sender_name, ''))
    ) stored;
create index idx_emails_fts on public.emails using gin(fts);

-- -------------------------------------------------------
-- Tabela de anexos
-- -------------------------------------------------------
create table public.attachments (
  id          uuid primary key default uuid_generate_v4(),
  email_id    uuid not null references public.emails(id) on delete cascade,
  file_name   text not null,
  file_size   bigint,
  mime_type   text,
  storage_path text not null,
  created_at  timestamptz default now()
);

-- -------------------------------------------------------
-- Row Level Security (RLS)
-- -------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.emails     enable row level security;
alter table public.attachments enable row level security;

-- Profiles: cada usuário vê apenas o seu
create policy "Próprio perfil" on public.profiles
  for all using (auth.uid() = id);

-- Emails: cada usuário vê apenas os seus
create policy "Próprios e-mails" on public.emails
  for all using (auth.uid() = user_id);

-- Attachments: via e-mail do usuário
create policy "Próprios anexos" on public.attachments
  for all using (
    exists (
      select 1 from public.emails e
      where e.id = email_id and e.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- Trigger: criar perfil automaticamente ao cadastrar
-- -------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------
-- Trigger: atualizar updated_at automaticamente
-- -------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger emails_updated_at
  before update on public.emails
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------
-- Exemplos de busca full-text
-- -------------------------------------------------------
-- select * from emails
--   where fts @@ plainto_tsquery('portuguese', 'reunião projeto')
--   order by ts_rank(fts, plainto_tsquery('portuguese', 'reunião projeto')) desc;
