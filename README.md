# 💰 App Financeiro

Aplicativo de controle financeiro pessoal desenvolvido com **React Native (Expo)** e **TypeScript**, utilizando **Clean Architecture** e **Supabase** como backend.

## 📱 Funcionalidades

- **Autenticação Segura**: Login e Cadastro via e-mail e senha (Supabase Auth).
- **Gestão de Transações**:
  - Adicionar receitas e despesas.
  - Listagem mensal com saldo consolidado.
  - Exclusão de lançamentos.
- **Orçamento Mensal**:
  - Definição de metas de gastos por categoria.
  - Acompanhamento visual (Orçado vs. Realizado).
- **Contas a Pagar**:
  - Cadastro de boletos e contas futuras.
  - **Notificações automáticas** no dia do vencimento (às 09:00).
  - Máscara automática de data para facilitar entrada.
- **Proteções**:
  - Limite de 200 transações mensais (regra de negócio).
  - Prevenção de duplicatas.

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, React Navigation.
- **Linguagem**: TypeScript.
- **Backend/Database**: Supabase (PostgreSQL + Auth).
- **Arquitetura**: MVVM + Clean Architecture.
- **Testes**: Jest, React Native Testing Library.
- **Notificações**: Expo Notifications.

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture** para garantir testabilidade e manutenibilidade:

```
src/
├── model/        # Entidades de domínio (Transaction, Budget, Payable)
├── infra/        # Implementações externas (Repositórios Supabase, Services)
├── usecase/      # Regras de negócio puras (AddTransaction, SignIn, etc.)
├── viewmodel/    # Gerenciamento de estado da UI (MVVM)
├── view/         # Componentes React (Screens, Styles)
└── __tests__/    # Testes automatizados (Unitários, Integração e UI)
```

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado.
- Conta no [Supabase](https://supabase.com/).

### 1. Instalação
Clone o repositório e instale as dependências:

```bash
git clone <seu-repo>
cd app-finaceiro
npm install
```

### 2. Configuração do Supabase
Crie um projeto no Supabase e configure as variáveis de ambiente.
Crie um arquivo `.env` (ou altere diretamente em `src/infra/supabase/client.ts` se não estiver usando env vars):

```typescript
const SUPABASE_URL = 'SUA_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_KEY_AQUI';
```

Execute o script SQL disponível em `supabase_schema.sql` no Editor SQL do Supabase para criar as tabelas e políticas de segurança (RLS).

### 3. Executando
Inicie o servidor de desenvolvimento do Expo:

```bash
npm start
```
Pressione `a` para Android (emulador/USB) ou `i` para iOS (macOS).

## 🧪 Testes

O projeto possui uma suíte de testes robusta cobrindo Regras de Negócio, ViewModels e Navegação.

Para rodar os testes:
```bash
npm test
```
Para ver detalhes da estratégia de testes, consulte o arquivo [TESTES.md](./TESTES.md).

## 🔒 Segurança (RLS)

O banco de dados utiliza **Row Level Security (RLS)** do PostgreSQL. Isso garante que cada usuário só possa acessar e modificar seus próprios dados, mesmo que tenha acesso à chave pública do cliente.

## 📝 Licença

Este projeto é de uso pessoal e educativo.
