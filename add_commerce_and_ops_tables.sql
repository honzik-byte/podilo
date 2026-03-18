create table if not exists public.listing_promotions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  stripe_event_id text,
  promotion_type text not null check (promotion_type in ('top', 'highlighted', 'combo')),
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'failed', 'refunded', 'chargeback')),
  amount_czk integer,
  currency text default 'czk',
  starts_at timestamptz,
  ends_at timestamptz,
  paid_at timestamptz,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_listing_promotions_listing_id on public.listing_promotions(listing_id);
create index if not exists idx_listing_promotions_status on public.listing_promotions(status);
create index if not exists idx_listing_promotions_ends_at on public.listing_promotions(ends_at);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  object_id text,
  listing_id uuid references public.listings(id) on delete set null,
  promotion_id uuid references public.listing_promotions(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_payment_events_listing_id on public.payment_events(listing_id);
create index if not exists idx_payment_events_event_type on public.payment_events(event_type);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  user_id uuid references auth.users(id) on delete set null,
  listing_id uuid references public.listings(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0,
  last_error text,
  send_at timestamptz not null default timezone('utc'::text, now()),
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_notification_jobs_status_send_at on public.notification_jobs(status, send_at);

create table if not exists public.listing_leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_listing_leads_listing_id on public.listing_leads(listing_id, created_at desc);

create table if not exists public.listing_favorites (
  listing_id uuid not null references public.listings(id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (listing_id, visitor_id)
);

create index if not exists idx_listing_favorites_listing_id on public.listing_favorites(listing_id);

create table if not exists public.listing_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  event_type text not null check (event_type in ('detail_view', 'phone_click', 'share_click', 'lead_submit')),
  visitor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_listing_events_listing_id on public.listing_events(listing_id, created_at desc);
create index if not exists idx_listing_events_event_type on public.listing_events(event_type);

create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  severity text not null default 'error' check (severity in ('warning', 'error', 'critical')),
  message text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_error_reports_source on public.error_reports(source);
create index if not exists idx_error_reports_created_at on public.error_reports(created_at desc);
