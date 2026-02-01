# 📄 Documentação de Testes - App Financeiro

Este documento descreve a estratégia de testes automatizados implementada no projeto React Native + Expo + TypeScript.

## 🎯 Visão Geral

A suíte de testes utiliza **Jest** como runner principal, com **React Native Testing Library** para testes de componentes/integração e mocks manuais para isolar dependências externas como Supabase e Navegação.

## 🧪 O que é testado

### 1. Regras de Negócio (UseCases)
Focamos nas regras críticas de negócio, isoladas da UI e de frameworks externos.
- **AddTransaction**:
  - Validação de campos obrigatórios.
  - Conversão e normalização de dados.
  - Verificação de limite mensal de transações (200/mês).

### 2. ViewModels (Lógica de Apresentação)
Testamos a camada que conecta a View aos UseCases.
- **AuthViewModel**: Fluxo de Login, Logout e validações.
- **CategoryViewModel**: Lógica de CRUD de categorias e integração com Supabase.
- **CardViewModel**: Sugestão de limite e cálculo de faturas.

### 3. Navegação (Integração)
Testamos o fluxo de decisão de rotas baseado no estado de autenticação.
- **RootNavigator**:
  - Renderização da tela de **Login** quando não autenticado.
  - Renderização da tela **Home** quando autenticado.
  - Transição de estados (Loading -> Tela).

### 4. Interface de Usuário (UI)
Testamos interações críticas do usuário.
- **Confirmação de Exclusão**:
  - Verifica se o `Alert.alert` é exibido ao clicar em excluir.
  - Verifica se a ação de exclusão só ocorre após confirmação positiva.

## 🚫 O que NÃO é testado
- **Supabase Real**: Todas as chamadas ao Supabase são mockadas (`jest.mock`). Não testamos a conexão real nem o banco de dados.
- **Navegação Nativa**: Mockamos `react-navigation` para testar apenas a lógica de decisão, não a transição de animação nativa.
- **Estilização**: Não utilizamos testes de snapshot para estilos visuais (foco em funcionalidade).

## 🚀 Como rodar os testes

Certifique-se de ter as dependências instaladas (`npm install`).

### Rodar todos os testes
```bash
npm test
```

### Rodar em modo "Watch" (desenvolvimento)
```bash
npm test -- --watch
```

### Rodar um arquivo específico
```bash
npm test RootNavigator
```

## 📂 Estrutura de Testes

Os testes estão localizados na pasta `src/__tests__/`, espelhando a estrutura ou agrupados por funcionalidade.

```
src/
  __tests__/
    ├── AddTransaction.usecase.test.ts
    ├── AuthViewModel.test.ts
    └── CategoryViewModel.test.ts
```

## 📝 Exemplos do que os testes garantem

- **Segurança**: Se um dev remover a validação de limite mensal, o teste `AddTransaction` falhará.
- **UX**: Se o botão de excluir deletar direto sem perguntar, o teste `DeleteConfirm` falhará.
- **Fluxo**: Se a lógica de sessão quebrar, o usuário pode ficar preso na tela de Loading ou ir para Home sem logar; o teste `RootNavigator` pegará isso.

## ⚠️ Observações Importantes

1.  **Mocks Globais**:
    - O arquivo `jest.setup.js` contém mocks para bibliotecas nativas (`expo-font`, `react-native-safe-area-context`, `@supabase/supabase-js`).
    - Se adicionar uma nova lib nativa, provavelmente precisará mocká-la aqui.

2.  **Isolamento**:
    - Cada teste limpa seus mocks (`jest.clearAllMocks()`) antes de rodar para evitar interferência entre testes.

3.  **Supabase**:
    - O client do Supabase é totalmente mockado. Se a API do Supabase mudar (ex: método `.select()` mudar de nome), os testes precisarão ser atualizados para refletir o mock correto.
