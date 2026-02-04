-- 1. Tabela de Transações (Transactions)
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount numeric not null,
  description text,
  type text check (type in ('income', 'expense')) not null,
  category text,
  is_recurring boolean default false,
  payment_method text check (payment_method in ('cash', 'credit_card')) default 'cash',
  card_id uuid, -- Referência opcional se houver tabela de cartões
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilita RLS
alter table public.transactions enable row level security;

-- Políticas de Segurança (Transactions)
create policy "Usuários podem ver suas próprias transações"
on public.transactions for select
using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias transações"
on public.transactions for insert
with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias transações"
on public.transactions for update
using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias transações"
on public.transactions for delete
using (auth.uid() = user_id);


-- 2. Tabela de Orçamentos (Budgets)
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category text not null,
  amount numeric not null,
  month text not null, -- Formato: 'YYYY-MM'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category, month) -- Garante apenas um orçamento por categoria/mês
);

-- Habilita RLS
alter table public.budgets enable row level security;

-- Políticas de Segurança (Budgets)
create policy "Usuários podem ver seus próprios orçamentos"
on public.budgets for select
using (auth.uid() = user_id);

create policy "Usuários podem inserir e atualizar seus próprios orçamentos"
on public.budgets for all
using (auth.uid() = user_id);


-- 3. Tabela de Contas a Pagar (Payables)
create table if not exists public.payables (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  due_date timestamp with time zone not null,
  status text check (status in ('pending', 'paid')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilita RLS
alter table public.payables enable row level security;

-- Políticas de Segurança (Payables)
create policy "Usuários podem ver suas próprias contas"
on public.payables for select
using (auth.uid() = user_id);

create policy "Usuários podem gerenciar suas próprias contas"
on public.payables for all
using (auth.uid() = user_id);


-- 4. Tabela de Categorias (Categories)
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text not null,
  color text not null,
  is_custom boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Usuários podem ver suas próprias categorias" on public.categories for select using (auth.uid() = user_id);
create policy "Usuários podem gerenciar suas próprias categorias" on public.categories for all using (auth.uid() = user_id);


-- 5. Tabela de Cartões (Credit Cards)
create table if not exists public.credit_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  limit_amount numeric not null,
  closing_day int not null,
  due_day int not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.credit_cards enable row level security;

create policy "Usuários podem ver seus próprios cartões" on public.credit_cards for select using (auth.uid() = user_id);
create policy "Usuários podem gerenciar seus próprios cartões" on public.credit_cards for all using (auth.uid() = user_id);
