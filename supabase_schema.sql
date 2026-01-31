-- Criação da tabela de transações
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount numeric not null,
  description text,
  type text check (type in ('income', 'expense')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilita Row Level Security (RLS) para segurança
alter table public.transactions enable row level security;

-- Política para permitir que usuários vejam apenas suas próprias transações
create policy "Usuários podem ver suas próprias transações"
on public.transactions for select
using (auth.uid() = user_id);

-- Política para permitir que usuários insiram suas próprias transações
create policy "Usuários podem inserir suas próprias transações"
on public.transactions for insert
with check (auth.uid() = user_id);

-- Política para permitir que usuários deletem suas próprias transações (opcional)
create policy "Usuários podem deletar suas próprias transações"
on public.transactions for delete
using (auth.uid() = user_id);
